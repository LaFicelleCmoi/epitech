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

// Kick a user (admin/owner)
router.delete("/:serverId/kick/:userId", authenticate, checkRole(["owner", "admin"]), kickUser);

// Permanent ban (admin/owner)
router.post("/:serverId/ban/:userId", authenticate, checkRole(["owner", "admin"]), banUser);

// Temporary ban (admin/owner)
router.post("/:serverId/tempban/:userId", authenticate, checkRole(["owner", "admin"]), tempBanUser);

// Unban (admin/owner)
router.delete("/:serverId/unban/:userId", authenticate, checkRole(["owner", "admin"]), unbanUser);

// Get all bans for a server (admin/owner)
router.get("/:serverId/bans", authenticate, checkRole(["owner", "admin"]), getServerBans);

export default router;
