import {
  createMessageService,
  getMessagesByChannelService,
  getMessageByIdService,
  deleteMessageService,
  updateMessageService,
  addReactionService,
  removeReactionService
} from '../Models/MessageModel.js';
import { getUserRoleInServerService } from '../Models/ServerModel.js';
import pool from '../Config/DataBase.js';

export const createMessage = async (req, res, next) => {
  try {
    const { channelId, content } = req.body;
    const userId = req.user.id;
    const senderName = req.user.first_name || req.user.name || `Utilisateur-${userId.slice(0, 5)}`;

    const newMessage = await createMessageService(userId, senderName, channelId, content);

    res.status(201).json({
      message: "Message créé avec succès",
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const getMessagesByChannel = async (req, res, next) => {
  try {
    const { channelId } = req.params;

    const messages = await getMessagesByChannelService(channelId);

    res.status(200).json({
      message: "Messages récupérés avec succès",
      data: messages.map(m => ({
        _id: m._id,
        channelId: m.channelId,
        conversationId: m.conversationId,
        content: m.content,
        sender: m.senderName,
        userId: m.userId,
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

export const deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await getMessageByIdService(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message non trouvé" });
    }

    // If it's your own message, you can always delete it
    if (message.userId === userId) {
      await deleteMessageService(messageId);
      return res.status(200).json({ message: "Message supprimé avec succès" });
    }

    // Otherwise, check if user is owner/admin of the server (channel messages only)
    if (message.channelId) {
      const channelResult = await pool.query(
        `SELECT server_id FROM channels WHERE id = $1`,
        [message.channelId]
      );

      if (channelResult.rows.length > 0) {
        const serverId = channelResult.rows[0].server_id;
        const roleData = await getUserRoleInServerService(serverId, userId);

        if (roleData && ['owner', 'admin'].includes(roleData.role)) {
          await deleteMessageService(messageId);
          return res.status(200).json({ message: "Message supprimé avec succès" });
        }
      }
    }

    return res.status(403).json({ message: "Vous ne pouvez pas supprimer ce message" });
  } catch (error) {
    next(error);
  }
};

export const updateMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Le contenu ne peut pas être vide" });
    }

    const updated = await updateMessageService(messageId, userId, content.trim());

    res.status(200).json({
      message: "Message modifié avec succès",
      data: updated
    });
  } catch (error) {
    if (error.message === "Non autorisé") {
      return res.status(403).json({ message: "Vous ne pouvez modifier que vos propres messages" });
    }
    next(error);
  }
};

export const addReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) return res.status(400).json({ message: "Emoji requis" });

    const updated = await addReactionService(messageId, userId, emoji);
    res.status(200).json({ message: "Réaction ajoutée", data: updated });
  } catch (error) {
    next(error);
  }
};

export const removeReaction = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) return res.status(400).json({ message: "Emoji requis" });

    const updated = await removeReactionService(messageId, userId, emoji);
    res.status(200).json({ message: "Réaction retirée", data: updated });
  } catch (error) {
    next(error);
  }
};
