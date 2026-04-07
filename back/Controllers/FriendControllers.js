import {
  sendFriendRequestService,
  acceptFriendRequestService,
  removeFriendshipService,
  getFriendsService,
  getPendingRequestsService,
  getSentRequestsService
} from "../Models/FriendModel.js";
import { getUserByMailService, getUserByIdService } from "../Models/AuthModel.js";

const handleResponse = (res, status, message, data = null) => {
  res.status(status).json({ status, message, data });
};

// Send a friend request by mail or by user id
export const sendFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { mail, targetUserId } = req.body;

    let target = null;
    if (targetUserId) {
      target = await getUserByIdService(targetUserId);
    } else if (mail) {
      target = await getUserByMailService(mail);
    } else {
      return handleResponse(res, 400, "mail or targetUserId required");
    }

    if (!target) return handleResponse(res, 404, "User not found");
    if (target.id === requesterId) return handleResponse(res, 400, "Cannot add yourself");

    const result = await sendFriendRequestService(requesterId, target.id);

    if (result.existing) {
      const status = result.existing.status;
      if (status === 'accepted') return handleResponse(res, 409, "Already friends");
      return handleResponse(res, 409, "Request already exists");
    }

    handleResponse(res, 201, "Friend request sent", result.created);
  } catch (error) {
    next(error);
  }
};

export const acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;

    const updated = await acceptFriendRequestService(friendshipId, userId);
    if (!updated) return handleResponse(res, 404, "Request not found");

    handleResponse(res, 200, "Friend request accepted", updated);
  } catch (error) {
    next(error);
  }
};

export const removeFriendship = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { friendshipId } = req.params;

    const removed = await removeFriendshipService(friendshipId, userId);
    if (!removed) return handleResponse(res, 404, "Friendship not found");

    handleResponse(res, 200, "Friendship removed");
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (req, res, next) => {
  try {
    const friends = await getFriendsService(req.user.id);
    handleResponse(res, 200, "Friends fetched", friends);
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (req, res, next) => {
  try {
    const pending = await getPendingRequestsService(req.user.id);
    handleResponse(res, 200, "Pending requests fetched", pending);
  } catch (error) {
    next(error);
  }
};

export const getSentRequests = async (req, res, next) => {
  try {
    const sent = await getSentRequestsService(req.user.id);
    handleResponse(res, 200, "Sent requests fetched", sent);
  } catch (error) {
    next(error);
  }
};
