import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getConversationMessages,
  sendDirectMessage
} from "../Controllers/ConversationControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";

const router = express.Router();

// Get all my conversations
router.get("/", authenticate, getMyConversations);

// Create or get a conversation with another user
router.post("/", authenticate, getOrCreateConversation);

// Get messages for a conversation
router.get("/:conversationId/messages", authenticate, getConversationMessages);

// Send a message in a conversation
router.post("/:conversationId/messages", authenticate, sendDirectMessage);

export default router;
