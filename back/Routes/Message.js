import express from 'express';
import {
  createMessage,
  getMessagesByChannel,
  deleteMessage,
  updateMessage,
  addReaction,
  removeReaction
} from '../Controllers/MessageControllers.js';
import { authenticate } from '../middleware/authentificationJwt.js';

const router = express.Router();

router.post('/', authenticate, createMessage);

router.get('/channel/:channelId', authenticate, getMessagesByChannel);

router.delete('/:messageId', authenticate, deleteMessage);

router.put('/:messageId', authenticate, updateMessage);

router.post('/:messageId/reactions', authenticate, addReaction);

router.delete('/:messageId/reactions', authenticate, removeReaction);

export default router;
