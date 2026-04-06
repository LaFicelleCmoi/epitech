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


// GET
/**
 * @swagger
 * /api/:
 *   get:
 *     summary: Récupérer tous les serveurs
 *     tags: [Servers]
 *     responses:
 *       200:
 *         description: Liste des serveurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get ("/",authenticate, getAllServer);

/**
 * @swagger
 * /api/members:
 *   get:
 *     summary: Récupérer tous les membres d'un serveur
 *     tags: [Servers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des membres du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get ("/members", authenticate, getAllMembersByServer);

/**
 * @swagger
 * /api/{id}:
 *   get:
 *     summary: Récupérer un serveur par son ID
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du serveur
 *     responses:
 *       200:
 *         description: Détails du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get ("/:id", authenticate, getServer);

router.get("/:serverId/users", authenticate, getAllUsersByServer);

router.get ("/:serverId/channels", authenticate, getAllChannelByServerId);

router.get ("/:serverId/me", authenticate, getMyRoleInServer);

/**
 * @swagger
 * /api/{id}/inviteCode:
 *   get:
 *     summary: Récupérer le code d'invitation d'un serveur
 *     tags: [Servers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du serveur
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
router.get ("/:id/inviteCode", authenticate, getServerInviteCode);


// DELETE
router.delete ("/:serverId", authenticate, checkRole(["owner"]), deleteServerById);

router.delete ("/:serverId/leave", authenticate, checkRole(["member", "admin"]), deleteUserFromServer);


// POST
/**
 * @swagger
 * /api/:
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
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom du serveur
 *     responses:
 *       201:
 *         description: Serveur créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post ("/", authenticate, createServer);

/**
 * @swagger
 * /api/join:
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
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 description: Code d'invitation du serveur
 *     responses:
 *       200:
 *         description: Serveur rejoint avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post ("/join", authenticate, joinServerWithInviteCode);

router.post ("/:serverId/channels", authenticate, checkRole(["owner", "admin"]), createChannelByServerId);


// PUT
router.put ("/:serverId", authenticate, checkRole(["owner"]), updateServer);

router.put ("/:serverId/members/:userId", authenticate, checkRole(["owner"]), updateMemberRole);

export default router ;