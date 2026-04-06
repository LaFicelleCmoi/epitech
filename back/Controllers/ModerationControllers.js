import { deleteUserFromServerService } from "../Models/ServerModel.js";
import { createBanService, removeBanService, getBansByServerService } from "../Models/BanModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// KICK: remove user from server (they can rejoin)
export const kickUser = async (req, res, next) => {
  try {
    const { serverId, userId } = req.params;

    const deleted = await deleteUserFromServerService(userId, serverId);
    if (!deleted) return handleResponse(res, 404, "User not found in this server");

    handleResponse(res, 200, "User kicked successfully");
  } catch (error) {
    next(error);
  }
};

// BAN PERMANENT
export const banUser = async (req, res, next) => {
  try {
    const { serverId, userId } = req.params;
    const { reason } = req.body;
    const bannedBy = req.user.id;

    // Remove from server first
    await deleteUserFromServerService(userId, serverId);

    // Create permanent ban
    const ban = await createBanService(userId, serverId, bannedBy, reason || null, true, null);

    handleResponse(res, 200, "User banned permanently", ban);
  } catch (error) {
    next(error);
  }
};

// BAN TEMPORAIRE
export const tempBanUser = async (req, res, next) => {
  try {
    const { serverId, userId } = req.params;
    const { reason, duration } = req.body; // duration in minutes

    if (!duration || duration <= 0) {
      return handleResponse(res, 400, "Duration is required (in minutes)");
    }

    const bannedBy = req.user.id;
    const expiresAt = new Date(Date.now() + duration * 60 * 1000);

    // Remove from server first
    await deleteUserFromServerService(userId, serverId);

    // Create temporary ban
    const ban = await createBanService(userId, serverId, bannedBy, reason || null, false, expiresAt);

    handleResponse(res, 200, "User temporarily banned", ban);
  } catch (error) {
    next(error);
  }
};

// UNBAN
export const unbanUser = async (req, res, next) => {
  try {
    const { serverId, userId } = req.params;

    const removed = await removeBanService(userId, serverId);
    if (!removed) return handleResponse(res, 404, "Ban not found");

    handleResponse(res, 200, "User unbanned successfully");
  } catch (error) {
    next(error);
  }
};

// GET BANS
export const getServerBans = async (req, res, next) => {
  try {
    const { serverId } = req.params;

    const bans = await getBansByServerService(serverId);

    handleResponse(res, 200, "Bans fetched successfully", bans);
  } catch (error) {
    next(error);
  }
};
