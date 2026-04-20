import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import pool from './Config/DataBase.js';
import './Config/MongoConfig.js';

import some_error from './middleware/Error.js';
import authRoutes from './Routes/Authentication.js';
import Servers from './Routes/Server.js';
import Channels from './Routes/Channel.js';
import Message from './Routes/Message.js';
import Moderation from './Routes/Moderation.js';
import Conversation from './Routes/Conversation.js';
import Friend from './Routes/Friend.js';
import { createMessageService, updateMessageService, addReactionService, removeReactionService } from './Models/MessageModel.js';
import { getConversationByIdService } from './Models/ConversationModel.js';
import { ensureBansTable } from './Models/BanModel.js';
import { ensureFriendsTable } from './Models/FriendModel.js';
import { getUserByIdService } from './Models/AuthModel.js';
import setupSwagger from './Config/swagger.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/servers', Servers);
app.use('/channels', Channels);
app.use('/message', Message);
app.use('/moderation', Moderation);
app.use('/conversations', Conversation);
app.use('/friends', Friend);

// Swagger
setupSwagger(app);

// Error middleware
app.use(some_error);

// Export the app so it can be imported by tests without starting a server
export default app;

// Don't start server if in test mode
if (process.env.NODE_ENV === 'test') {
  // No-op for tests
} else {
// Connexion à PostgreSQL
pool.connect()
  .then(async () => {
    console.log('Connecté à PostgreSQL');

    // Ensure bans table exists
    await ensureBansTable();
    console.log('Table bans vérifiée');

    // Ensure friendships table exists
    await ensureFriendsTable();
    console.log('Table friendships vérifiée');

    // Ensure avatar column exists
    try {
      const colCheck = await pool.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'avatar'
      `);
      if (colCheck.rows.length === 0) {
        await pool.query(`ALTER TABLE users ADD COLUMN avatar TEXT`);
        console.log('Colonne avatar ajoutée');
      } else {
        console.log('Colonne avatar déjà présente');
      }
    } catch (err) {
      console.log('Avatar column check error:', err.message);
    }

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: { origin: '*' },
      maxHttpBufferSize: 50e6, // 50MB for audio messages
    });

    // Gestion des utilisateurs en ligne (multi-onglets)
    const onlineUsers = new Map(); // Map<userId, Set<socketId>>

    const emitOnlineUsers = () => {
      const users = Array.from(onlineUsers.entries()).map(([userId, sockets]) => {
        const firstSocketId = Array.from(sockets)[0];
        const socket = io.sockets.sockets.get(firstSocketId);
        return {
          id: userId,
          displayName: socket?.data.displayName || `user-${userId.slice(0, 5)}`
        };
      });
      io.emit('online users', users);
    };

    const updateChannelUsers = async (channelId) => {
      const sockets = await io.in(channelId).fetchSockets();
      const users = sockets.map(s => s.data.displayName).filter(Boolean);
      io.to(channelId).emit('channel users', { channelId, users });
    };

    // Socket.IO
    io.on('connection', async (socket) => {
      let displayName;
      let userAvatar = null;

      try {
        const token = socket.handshake.auth?.token;
        if (!token) return socket.disconnect();

        socket.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetch full user data (for avatar)
        const fullUser = await getUserByIdService(socket.user.id);
        userAvatar = fullUser?.avatar || null;

        // Multi-socket management
        if (!onlineUsers.has(socket.user.id)) {
          onlineUsers.set(socket.user.id, new Set());
        }
        onlineUsers.get(socket.user.id).add(socket.id);

        // Set displayName
        displayName =
          (fullUser?.first_name && String(fullUser.first_name).trim()) ||
          (fullUser?.name && String(fullUser.name).trim()) ||
          (socket.user?.name && String(socket.user.name).trim()) ||
          `user-${socket.id.slice(0, 5)}`;

        socket.data.displayName = displayName;
        socket.data.avatar = userAvatar;

        // Emit online users to everyone
        emitOnlineUsers();

        // Welcome message
        socket.emit('system', `Bienvenue ${displayName} !`);

        // Join personal room for DMs
        socket.join(`user:${socket.user.id}`);

      } catch (err) {
        return socket.disconnect();
      }

      // JOIN CHANNEL
      socket.on('join channel', async (channelId) => {
        const room = String(channelId || '').trim();
        if (!room) return;

        socket.data.channelId = room;
        await socket.join(room);
        socket.to(room).emit('system', `${displayName} a rejoint le channel`);
        await updateChannelUsers(room);
      });

      // LEAVE CHANNEL
      socket.on('leave channel', async (channelId) => {
        const room = String(channelId || '').trim();
        if (!room) return;

        await socket.leave(room);
        if (socket.data.channelId === room) socket.data.channelId = null;

        socket.to(room).emit('system', `${displayName} a quitté le channel`);
        await updateChannelUsers(room);
      });

      // CHANNEL MESSAGE
      socket.on('channel message', async ({ channelId, msg, replyTo }) => {
        try {
          const room = String(channelId || '').trim();
          const message = String(msg || '').trim();
          if (!room || !message) return;

          const userId = socket.user.id;
          const senderName = displayName;

          const savedMessage = await createMessageService(userId, senderName, room, message, null, replyTo || null);

          io.to(room).emit('channel message', {
            _id: savedMessage._id,
            channelId: savedMessage.channelId,
            msg: savedMessage.content,
            sender: savedMessage.senderName,
            userId: savedMessage.userId,
            avatar: userAvatar,
            edited: false,
            reactions: [],
            replyTo: savedMessage.replyTo || null,
            createdAt: savedMessage.createdAt
          });

        } catch (error) {
          console.error("Erreur message socket:", error);
        }
      });

      // EDIT MESSAGE
      socket.on('edit message', async ({ messageId, content, channelId, conversationId }) => {
        try {
          const userId = socket.user.id;
          const updated = await updateMessageService(messageId, userId, content.trim());

          const payload = {
            _id: updated._id,
            content: updated.content,
            edited: true
          };

          if (channelId) {
            io.to(String(channelId)).emit('message edited', payload);
          }
          if (conversationId) {
            // Emit to both participants
            const conv = await getConversationByIdService(conversationId);
            if (conv) {
              conv.participants.forEach(pid => {
                io.to(`user:${pid}`).emit('message edited', { ...payload, conversationId });
              });
            }
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // ADD REACTION
      socket.on('add reaction', async ({ messageId, emoji, channelId, conversationId }) => {
        try {
          const userId = socket.user.id;
          const updated = await addReactionService(messageId, userId, emoji);

          const payload = {
            _id: updated._id,
            reactions: updated.reactions
          };

          if (channelId) {
            io.to(String(channelId)).emit('message reactions updated', payload);
          }
          if (conversationId) {
            const conv = await getConversationByIdService(conversationId);
            if (conv) {
              conv.participants.forEach(pid => {
                io.to(`user:${pid}`).emit('message reactions updated', { ...payload, conversationId });
              });
            }
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // REMOVE REACTION
      socket.on('remove reaction', async ({ messageId, emoji, channelId, conversationId }) => {
        try {
          const userId = socket.user.id;
          const updated = await removeReactionService(messageId, userId, emoji);

          const payload = {
            _id: updated._id,
            reactions: updated.reactions
          };

          if (channelId) {
            io.to(String(channelId)).emit('message reactions updated', payload);
          }
          if (conversationId) {
            const conv = await getConversationByIdService(conversationId);
            if (conv) {
              conv.participants.forEach(pid => {
                io.to(`user:${pid}`).emit('message reactions updated', { ...payload, conversationId });
              });
            }
          }
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });

      // DM - JOIN CONVERSATION
      socket.on('join conversation', (conversationId) => {
        socket.join(`conv:${conversationId}`);
      });

      socket.on('leave conversation', (conversationId) => {
        socket.leave(`conv:${conversationId}`);
      });

      // DM - SEND MESSAGE
      socket.on('direct message', async ({ conversationId, msg, replyTo }) => {
        try {
          const message = String(msg || '').trim();
          if (!message || !conversationId) return;

          const userId = socket.user.id;
          const senderName = displayName;

          const conv = await getConversationByIdService(conversationId);
          if (!conv || !conv.participants.includes(userId)) return;

          const savedMessage = await createMessageService(userId, senderName, null, message, conversationId, replyTo || null);

          const payload = {
            _id: savedMessage._id,
            conversationId: savedMessage.conversationId,
            content: savedMessage.content,
            sender: savedMessage.senderName,
            userId: savedMessage.userId,
            avatar: userAvatar,
            edited: false,
            reactions: [],
            replyTo: savedMessage.replyTo || null,
            createdAt: savedMessage.createdAt
          };

          // Send to all participants
          conv.participants.forEach(pid => {
            io.to(`user:${pid}`).emit('direct message', payload);
          });
        } catch (error) {
          console.error("Erreur DM socket:", error);
        }
      });

      // TYPING
      socket.on('typing', ({ channelId, isTyping }) => {
        const room = String(channelId || '').trim();
        if (!room) return;

        socket.to(room).emit('typing', {
          channelId: room,
          user: displayName,
          isTyping: !!isTyping,
        });
      });

      // DM TYPING
      socket.on('dm typing', ({ conversationId, isTyping }) => {
        if (!conversationId) return;
        socket.to(`conv:${conversationId}`).emit('dm typing', {
          conversationId,
          user: displayName,
          isTyping: !!isTyping,
        });
      });

      // DISCONNECT
      socket.on('disconnect', async () => {
        const userSockets = onlineUsers.get(socket.user.id);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(socket.user.id);
          }
        }
        emitOnlineUsers();

        const room = socket.data.channelId;
        if (room) await updateChannelUsers(room);
      });
    });

    const PORT_BACK = process.env.PORT_BACK || 3001;
    httpServer.listen(PORT_BACK, () => {
      console.log(`Server running on port ${PORT_BACK}`);
    });

  })
  .catch(err => console.error('Erreur de connexion à PostgreSQL :', err));
}

