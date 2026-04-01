import { Router } from 'express';
import {
  cancelReservation,
  checkIn,
  checkOut,
  createReservation,
  getReservationByCode,
  listReservations,
  updateReservation
} from '../controllers/reservation.controller.js';
import { authenticate, authenticateOptional, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';

const router = Router();

router.post('/', authenticateOptional, createReservation);
router.get('/:code', getReservationByCode);
router.patch('/:id/cancel', authenticateOptional, cancelReservation);

router.use(authenticate, tenantGuard);
router.get('/', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), listReservations);
router.put('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), updateReservation);
router.patch('/:id/check-in', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), checkIn);
router.patch('/:id/check-out', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), checkOut);

export default router;
