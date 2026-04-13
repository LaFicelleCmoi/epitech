import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getConversationMessages,
  sendDirectMessage
} from "../Controllers/ConversationControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";

const router = express.Router();

/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Récupérer toutes mes conversations privées
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations avec info sur l'autre participant
 */
router.get("/", authenticate, getMyConversations);

/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Créer ou récupérer une conversation avec un utilisateur
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [targetUserId]
 *             properties:
 *               targetUserId:
 *                 type: string
 *                 description: UUID de l'utilisateur cible
 *     responses:
 *       200:
 *         description: Conversation récupérée ou créée
 *       400:
 *         description: targetUserId manquant ou conversation avec soi-même
 */
router.post("/", authenticate, getOrCreateConversation);

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   get:
 *     summary: Récupérer les messages d'une conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages avec sender, avatar, réactions, replyTo
 *       403:
 *         description: Accès refusé (pas participant)
 */
router.get("/:conversationId/messages", authenticate, getConversationMessages);

/**
 * @swagger
 * /conversations/{conversationId}/messages:
 *   post:
 *     summary: Envoyer un message dans une conversation (via REST)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message envoyé
 *       403:
 *         description: Accès refusé
 */
router.post("/:conversationId/messages", authenticate, sendDirectMessage);

export default router;
