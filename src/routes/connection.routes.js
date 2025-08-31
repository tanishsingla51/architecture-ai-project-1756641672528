import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getPendingRequests,
  getConnections
} from '../controllers/connection.controller.js';

const router = Router();

router.route('/request/:recipientId').post(protect, sendConnectionRequest);
router.route('/accept/:requestId').put(protect, acceptConnectionRequest);
router.route('/decline/:requestId').put(protect, declineConnectionRequest);
router.route('/remove/:userId').delete(protect, removeConnection);
router.route('/pending').get(protect, getPendingRequests);
router.route('/').get(protect, getConnections);

export default router;
