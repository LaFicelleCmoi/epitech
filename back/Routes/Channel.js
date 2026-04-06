import express from "express";
import {
    deleteChannelById,
    getChannelById,
    updateChannelById
} from "../Controllers/ChannelControllers.js";
import { authenticate } from "../middleware/authentificationJwt.js";
import { checkRole } from "../middleware/CheckRole.js";

const router = express.Router();

router.get ("/:channelId", authenticate, getChannelById);

router.delete ("/:channelId", authenticate, checkRole(["owner", "admin"]), deleteChannelById);

router.put ("/:channelId", authenticate, checkRole(["owner", "admin"]), updateChannelById)

export default router;