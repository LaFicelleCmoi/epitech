import mongoose from 'mongoose';

const { Schema } = mongoose;

const conversationSchema = new Schema({
  participants: [{
    type: String,
    required: true,
  }],
}, {
  timestamps: true,
});

const Conversation = mongoose.model('Conversation', conversationSchema);

export const getOrCreateConversationService = async (userId1, userId2) => {
  // Find existing conversation between these two users
  let conversation = await Conversation.findOne({
    participants: { $all: [userId1, userId2] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [userId1, userId2],
    });
  }

  return conversation;
};

export const getConversationsByUserService = async (userId) => {
  const conversations = await Conversation.find({
    participants: userId,
  }).sort({ updatedAt: -1 });

  return conversations;
};

export const getConversationByIdService = async (conversationId) => {
  return Conversation.findById(conversationId);
};
