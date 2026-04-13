import express from 'express';
import {
  createMessage,
  getMessagesByChannel,
  deleteMessage,
  updateMessage,
  addReaction,
  removeReaction
} from '../Controllers/MessageControllers.js';
import { authenticate } from '../middleware/authentificationJwt.js';

const router = express.Router();

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Créer un message dans un channel (via REST)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [channelId, content]
 *             properties:
 *               channelId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message créé
 */
router.post('/', authenticate, createMessage);

/**
 * @swagger
 * /message/channel/{channelId}:
 *   get:
 *     summary: Récupérer tous les messages d'un channel
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des messages avec sender, avatar, réactions, replyTo
 */
router.get('/channel/:channelId', authenticate, getMessagesByChannel);

/**
 * @swagger
 * /message/{messageId}:
 *   put:
 *     summary: Modifier un message (uniquement le sien)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
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
 *       200:
 *         description: Message modifié
 *       403:
 *         description: Pas autorisé (message d'un autre utilisateur)
 */
router.put('/:messageId', authenticate, updateMessage);

/**
 * @swagger
 * /message/{messageId}:
 *   delete:
 *     summary: Supprimer un message (le sien, ou n'importe quel si owner/admin)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message supprimé
 *       403:
 *         description: Pas autorisé
 *       404:
 *         description: Message introuvable
 */
router.delete('/:messageId', authenticate, deleteMessage);

/**
 * @swagger
 * /message/{messageId}/reactions:
 *   post:
 *     summary: Ajouter une réaction emoji à un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emoji]
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Réaction ajoutée
 */
router.post('/:messageId/reactions', authenticate, addReaction);

/**
 * @swagger
 * /message/{messageId}/reactions:
 *   delete:
 *     summary: Retirer une réaction emoji d'un message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emoji]
 *             properties:
 *               emoji:
 *                 type: string
 *                 example: "👍"
 *     responses:
 *       200:
 *         description: Réaction retirée
 */
router.delete('/:messageId/reactions', authenticate, removeReaction);

export default router;
