import express from "express";
import { login, updateProfile } from "../Controllers/AuthControllers.js";
import { createUser, getUser } from "../Controllers/AuthControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";

const router = express.Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Créer un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, first_name, mail, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Dupont
 *               first_name:
 *                 type: string
 *                 example: Alice
 *               phone_number:
 *                 type: string
 *                 example: "0612345678"
 *               mail:
 *                 type: string
 *                 example: alice@mail.com
 *               password:
 *                 type: string
 *                 example: myPassword123
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 */
router.post("/signup", createUser);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [mail, password]
 *             properties:
 *               mail:
 *                 type: string
 *                 example: alice@mail.com
 *               password:
 *                 type: string
 *                 example: myPassword123
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne un JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     mail:
 *                       type: string
 *       401:
 *         description: Identifiants invalides
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get("/me", authenticate, getUser);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Mettre à jour le profil (nom, prénom, email, téléphone, avatar)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               first_name:
 *                 type: string
 *               phone_number:
 *                 type: string
 *               mail:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 description: Image en base64 (data URL)
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Rien à mettre à jour
 */
router.put("/me", authenticate, updateProfile);

export default router;
