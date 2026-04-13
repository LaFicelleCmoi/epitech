import express from "express";
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendship,
  getFriends,
  getPendingRequests,
  getSentRequests
} from "../Controllers/FriendControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";

const router = express.Router();

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Récupérer la liste de mes amis (acceptés)
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des amis avec nom, email, avatar
 */
router.get("/", authenticate, getFriends);

/**
 * @swagger
 * /friends/pending:
 *   get:
 *     summary: Récupérer les demandes d'amis reçues (en attente)
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes en attente
 */
router.get("/pending", authenticate, getPendingRequests);

/**
 * @swagger
 * /friends/sent:
 *   get:
 *     summary: Récupérer les demandes d'amis envoyées
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des demandes envoyées
 */
router.get("/sent", authenticate, getSentRequests);

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Envoyer une demande d'ami (par email ou userId)
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mail:
 *                 type: string
 *                 description: Email de l'utilisateur cible
 *                 example: alice@mail.com
 *               targetUserId:
 *                 type: string
 *                 description: UUID de l'utilisateur cible (alternatif à mail)
 *     responses:
 *       201:
 *         description: Demande d'ami envoyée
 *       400:
 *         description: Paramètre manquant ou ajout de soi-même
 *       404:
 *         description: Utilisateur introuvable
 *       409:
 *         description: Demande déjà existante ou déjà amis
 */
router.post("/request", authenticate, sendFriendRequest);

/**
 * @swagger
 * /friends/accept/{friendshipId}:
 *   post:
 *     summary: Accepter une demande d'ami
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la relation d'amitié
 *     responses:
 *       200:
 *         description: Demande acceptée
 *       404:
 *         description: Demande non trouvée
 */
router.post("/accept/:friendshipId", authenticate, acceptFriendRequest);

/**
 * @swagger
 * /friends/{friendshipId}:
 *   delete:
 *     summary: Supprimer un ami ou refuser/annuler une demande
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendshipId
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID de la relation d'amitié
 *     responses:
 *       200:
 *         description: Relation supprimée
 *       404:
 *         description: Relation non trouvée
 */
router.delete("/:friendshipId", authenticate, removeFriendship);

export default router;
