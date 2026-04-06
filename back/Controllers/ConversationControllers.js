import {
  getOrCreateConversationService,
  getConversationsByUserService,
  getConversationByIdService
} from '../Models/ConversationModel.js';
import {
  createMessageService,
  getMessagesByConversationService
} from '../Models/MessageModel.js';
import { getUserByIdService, getUsersByIdsService } from '../Models/AuthModel.js';

export const getOrCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId requis" });
    }

    if (userId === targetUserId) {
      return res.status(400).json({ message: "Impossible de créer une conversation avec soi-même" });
    }

    const conversation = await getOrCreateConversationService(userId, targetUserId);

    res.status(200).json({
      message: "Conversation récupérée",
      data: conversation
    });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await getConversationsByUserService(userId);

    // Enrich with participant info
    const enriched = await Promise.all(conversations.map(async (conv) => {
      const otherUserId = conv.participants.find(p => p !== userId);
      const otherUser = otherUserId ? await getUserByIdService(otherUserId) : null;

      return {
        _id: conv._id,
        participants: conv.participants,
        otherUser: otherUser ? {
          id: otherUser.id,
          name: otherUser.name,
          first_name: otherUser.first_name
        } : null,
        updatedAt: conv.updatedAt
      };
    }));

    res.status(200).json({
      message: "Conversations récupérées",
      data: enriched
    });
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is part of conversation
    const conv = await getConversationByIdService(conversationId);
    if (!conv || !conv.participants.includes(userId)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const messages = await getMessagesByConversationService(conversationId);

    const userIds = [...new Set(messages.map(m => m.userId))];
    const users = await getUsersByIdsService(userIds);
    const avatarMap = {};
    for (const u of users) {
      avatarMap[u.id] = u.avatar || null;
    }

    res.status(200).json({
      message: "Messages récupérés",
      data: messages.map(m => ({
        _id: m._id,
        conversationId: m.conversationId,
        content: m.content,
        sender: m.senderName,
        userId: m.userId,
        avatar: avatarMap[m.userId] || null,
        edited: m.edited || false,
        reactions: m.reactions || [],
        replyTo: m.replyTo || null,
        createdAt: m.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const sendDirectMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const senderName = req.user.first_name || req.user.name || `Utilisateur-${userId.slice(0, 5)}`;

    // Verify user is part of conversation
    const conv = await getConversationByIdService(conversationId);
    if (!conv || !conv.participants.includes(userId)) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const message = await createMessageService(userId, senderName, null, content, conversationId);

    res.status(201).json({
      message: "Message envoyé",
      data: message
    });
  } catch (error) {
    next(error);
  }
};
