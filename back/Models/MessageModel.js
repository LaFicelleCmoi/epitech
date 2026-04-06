import mongoose from 'mongoose';

const { Schema } = mongoose;

const reactionSchema = new Schema({
  emoji: { type: String, required: true },
  users: [{ type: String }],
}, { _id: false });

const messageSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  channelId: {
    type: String,
    default: null,
  },
  conversationId: {
    type: String,
    default: null,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  edited: {
    type: Boolean,
    default: false,
  },
  replyTo: {
    messageId: { type: String, default: null },
    sender: { type: String, default: null },
    content: { type: String, default: null },
  },
  reactions: {
    type: [reactionSchema],
    default: [],
  },
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);

// --- Services ---

export const createMessageService = async (userId, senderName, channelId, content, conversationId = null, replyTo = null) => {
  const msgData = {
    userId,
    senderName,
    channelId,
    conversationId,
    content,
  };

  if (replyTo && replyTo.messageId) {
    msgData.replyTo = replyTo;
  }

  const newMessage = await Message.create(msgData);
  return newMessage;
};

export const getMessagesByConversationService = async (conversationId) => {
  const messages = await Message
    .find({ conversationId })
    .sort({ createdAt: 1 });

  return messages;
};

export const getMessagesByChannelService = async (channelId) => {
  const messages = await Message
    .find({ channelId })
    .sort({ createdAt: 1 }); // tri par date croissante

  return messages;
};

export const deleteMessageService = async (messageId) => {
  const deletedMessage = await Message.findByIdAndDelete(messageId);

  if (!deletedMessage) throw new Error("Message non trouvé");

  return deletedMessage;
};

export const updateMessageService = async (messageId, userId, content) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message non trouvé");
  if (message.userId !== userId) throw new Error("Non autorisé");

  message.content = content;
  message.edited = true;
  await message.save();
  return message;
};

// --- Reactions ---

export const addReactionService = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message non trouvé");

  const existing = message.reactions.find(r => r.emoji === emoji);
  if (existing) {
    if (!existing.users.includes(userId)) {
      existing.users.push(userId);
    }
  } else {
    message.reactions.push({ emoji, users: [userId] });
  }

  await message.save();
  return message;
};

export const removeReactionService = async (messageId, userId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message non trouvé");

  const existing = message.reactions.find(r => r.emoji === emoji);
  if (existing) {
    existing.users = existing.users.filter(u => u !== userId);
    if (existing.users.length === 0) {
      message.reactions = message.reactions.filter(r => r.emoji !== emoji);
    }
  }

  await message.save();
  return message;
};
