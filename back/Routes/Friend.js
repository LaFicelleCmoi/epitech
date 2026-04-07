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

router.get("/", authenticate, getFriends);
router.get("/pending", authenticate, getPendingRequests);
router.get("/sent", authenticate, getSentRequests);

router.post("/request", authenticate, sendFriendRequest);
router.post("/accept/:friendshipId", authenticate, acceptFriendRequest);
router.delete("/:friendshipId", authenticate, removeFriendship);

export default router;
