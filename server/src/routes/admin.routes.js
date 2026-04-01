import { Router } from 'express';
import {
  createSubscription,
  getPlatformAnalytics,
  listPlatformHotels,
  listPlatformUsers,
  listSubscriptions
} from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN'));
router.get('/analytics', getPlatformAnalytics);
router.get('/hotels', listPlatformHotels);
router.get('/users', listPlatformUsers);
router.get('/subscriptions', listSubscriptions);
router.post('/subscriptions', createSubscription);

export default router;
