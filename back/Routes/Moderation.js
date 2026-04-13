import express from "express";
import {
  kickUser,
  banUser,
  tempBanUser,
  unbanUser,
  getServerBans
} from "../Controllers/ModerationControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";
import { checkRole } from "../middleware/CheckRole.js";

const router = express.Router();

/**
 * @swagger
 * /moderation/{serverId}/kick/{userId}:
 *   delete:
 *     summary: Expulser un membre du serveur (il peut revenir)
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur expulsé
 *       403:
 *         description: Rôle owner ou admin requis
 *       404:
 *         description: Utilisateur non trouvé dans ce serveur
 */
router.delete("/:serverId/kick/:userId", authenticate, checkRole(["owner", "admin"]), kickUser);

/**
 * @swagger
 * /moderation/{serverId}/ban/{userId}:
 *   post:
 *     summary: Bannir un membre de manière permanente
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Spam répété
 *     responses:
 *       200:
 *         description: Utilisateur banni définitivement
 *       403:
 *         description: Rôle owner ou admin requis
 */
router.post("/:serverId/ban/:userId", authenticate, checkRole(["owner", "admin"]), banUser);

/**
 * @swagger
 * /moderation/{serverId}/tempban/{userId}:
 *   post:
 *     summary: Bannir un membre temporairement
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [duration]
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Comportement toxique
 *               duration:
 *                 type: integer
 *                 description: Durée du ban en minutes
 *                 example: 60
 *     responses:
 *       200:
 *         description: Utilisateur banni temporairement
 *       400:
 *         description: Durée manquante ou invalide
 *       403:
 *         description: Rôle owner ou admin requis
 */
router.post("/:serverId/tempban/:userId", authenticate, checkRole(["owner", "admin"]), tempBanUser);

/**
 * @swagger
 * /moderation/{serverId}/unban/{userId}:
 *   delete:
 *     summary: Débannir un utilisateur
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur débanni
 *       404:
 *         description: Ban non trouvé
 */
router.delete("/:serverId/unban/:userId", authenticate, checkRole(["owner", "admin"]), unbanUser);

/**
 * @swagger
 * /moderation/{serverId}/bans:
 *   get:
 *     summary: Lister tous les utilisateurs bannis d'un serveur
 *     tags: [Moderation]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des bans (permanent et temporaire)
 *       403:
 *         description: Rôle owner ou admin requis
 */
router.get("/:serverId/bans", authenticate, checkRole(["owner", "admin"]), getServerBans);

export default router;
