import express from "express";
import {
  deleteServerById,
  createChannelByServerId,
  deleteUserFromServer,
  createServer,
  getAllServer,
  getServer,
  getServerInviteCode,
  joinServerWithInviteCode,
  getAllMembersByServer,
  getAllChannelByServerId,
  getAllUsersByServer,
  updateServer,
  updateMemberRole,
  getMyRoleInServer
} from "../Controllers/ServerControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";
import { checkRole } from "../middleware/CheckRole.js";

const router = express.Router();

/**
 * @swagger
 * /servers:
 *   get:
 *     summary: Récupérer tous les serveurs
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de tous les serveurs
 */
router.get("/", authenticate, getAllServer);

/**
 * @swagger
 * /servers/members:
 *   get:
 *     summary: Récupérer les serveurs dont l'utilisateur est membre
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des serveurs de l'utilisateur
 */
router.get("/members", authenticate, getAllMembersByServer);

/**
 * @swagger
 * /servers/{id}:
 *   get:
 *     summary: Récupérer un serveur par son ID
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID du serveur
 *     responses:
 *       200:
 *         description: Détails du serveur
 *       404:
 *         description: Serveur introuvable
 */
router.get("/:id", authenticate, getServer);

/**
 * @swagger
 * /servers/{serverId}/users:
 *   get:
 *     summary: Récupérer tous les utilisateurs d'un serveur
 *     tags: [Servers]
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
 *         description: Liste des utilisateurs avec leur rôle
 */
router.get("/:serverId/users", authenticate, getAllUsersByServer);

/**
 * @swagger
 * /servers/{serverId}/channels:
 *   get:
 *     summary: Récupérer tous les channels d'un serveur
 *     tags: [Servers]
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
 *         description: Liste des channels
 */
router.get("/:serverId/channels", authenticate, getAllChannelByServerId);

/**
 * @swagger
 * /servers/{serverId}/me:
 *   get:
 *     summary: Récupérer mon rôle dans un serveur
 *     tags: [Servers]
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
 *         description: Rôle de l'utilisateur (owner, admin, member)
 *       404:
 *         description: Non membre du serveur
 */
router.get("/:serverId/me", authenticate, getMyRoleInServer);

/**
 * @swagger
 * /servers/{id}/inviteCode:
 *   get:
 *     summary: Récupérer le code d'invitation d'un serveur
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Code d'invitation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inviteCode:
 *                   type: string
 */
router.get("/:id/inviteCode", authenticate, getServerInviteCode);

/**
 * @swagger
 * /servers:
 *   post:
 *     summary: Créer un nouveau serveur
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
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
 *                 example: Mon Serveur
 *     responses:
 *       201:
 *         description: Serveur créé avec succès
 */
router.post("/", authenticate, createServer);

/**
 * @swagger
 * /servers/join:
 *   post:
 *     summary: Rejoindre un serveur avec un code d'invitation
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [inviteCode]
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: a1b2c3d4e5f6
 *     responses:
 *       200:
 *         description: Serveur rejoint avec succès
 *       403:
 *         description: Utilisateur banni de ce serveur
 *       404:
 *         description: Code d'invitation invalide
 */
router.post("/join", authenticate, joinServerWithInviteCode);

/**
 * @swagger
 * /servers/{serverId}/channels:
 *   post:
 *     summary: Créer un channel dans un serveur
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
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
 *                 example: général
 *     responses:
 *       200:
 *         description: Channel créé
 *       403:
 *         description: Rôle insuffisant (owner ou admin requis)
 */
router.post("/:serverId/channels", authenticate, checkRole(["owner", "admin"]), createChannelByServerId);

/**
 * @swagger
 * /servers/{serverId}:
 *   put:
 *     summary: Modifier le nom d'un serveur
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serverId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Serveur modifié
 *       403:
 *         description: Rôle owner requis
 */
router.put("/:serverId", authenticate, checkRole(["owner"]), updateServer);

/**
 * @swagger
 * /servers/{serverId}/members/{userId}:
 *   put:
 *     summary: Changer le rôle d'un membre
 *     tags: [Servers]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [member, admin]
 *     responses:
 *       200:
 *         description: Rôle mis à jour
 *       403:
 *         description: Rôle owner requis
 */
router.put("/:serverId/members/:userId", authenticate, checkRole(["owner"]), updateMemberRole);

/**
 * @swagger
 * /servers/{serverId}:
 *   delete:
 *     summary: Supprimer un serveur
 *     tags: [Servers]
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
 *         description: Serveur supprimé
 *       403:
 *         description: Rôle owner requis
 */
router.delete("/:serverId", authenticate, checkRole(["owner"]), deleteServerById);

/**
 * @swagger
 * /servers/{serverId}/leave:
 *   delete:
 *     summary: Quitter un serveur
 *     tags: [Servers]
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
 *         description: Serveur quitté
 *       403:
 *         description: Le owner ne peut pas quitter son serveur
 */
router.delete("/:serverId/leave", authenticate, checkRole(["member", "admin"]), deleteUserFromServer);

export default router;
