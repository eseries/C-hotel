import { Router } from 'express';
import { body } from 'express-validator';
import { createGuest, getGuestProfile, listGuests, updateGuest } from '../controllers/guest.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);
router.get('/', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), listGuests);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'),
  [body('hotelId').notEmpty(), body('firstName').notEmpty(), body('lastName').notEmpty()],
  validate,
  createGuest
);
router.get('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), getGuestProfile);
router.put('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), updateGuest);

export default router;
