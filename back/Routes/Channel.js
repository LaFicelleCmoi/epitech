import express from "express";
import {
    deleteChannelById,
    getChannelById,
    updateChannelById
} from "../Controllers/ChannelControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";
import { checkRole } from "../middleware/CheckRole.js";

const router = express.Router();

/**
 * @swagger
 * /channels/{channelId}:
 *   get:
 *     summary: Récupérer un channel par son ID
 *     tags: [Channels]
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
 *         description: Détails du channel
 *       404:
 *         description: Channel introuvable
 */
router.get("/:channelId", authenticate, getChannelById);

/**
 * @swagger
 * /channels/{channelId}:
 *   put:
 *     summary: Modifier le nom d'un channel
 *     tags: [Channels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: nouveau-nom
 *     responses:
 *       200:
 *         description: Channel modifié
 *       403:
 *         description: Rôle owner ou admin requis
 */
router.put("/:channelId", authenticate, checkRole(["owner", "admin"]), updateChannelById);

/**
 * @swagger
 * /channels/{channelId}:
 *   delete:
 *     summary: Supprimer un channel
 *     tags: [Channels]
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
 *         description: Channel supprimé
 *       403:
 *         description: Rôle owner ou admin requis
 */
router.delete("/:channelId", authenticate, checkRole(["owner", "admin"]), deleteChannelById);

export default router;
