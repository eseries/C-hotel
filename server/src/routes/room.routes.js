import { Router } from 'express';
import { body } from 'express-validator';
import { createRoom, createRoomType, getRoomDetails, listRooms, listRoomTypes, updateRoom, updateRoomType } from '../controllers/room.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { MIN_ROOM_PRICE_NGN } from '../utils/constants.js';

const router = Router();

router.get('/', listRooms);

router.post(
  '/types',
  authenticate,
  tenantGuard,
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'),
  [
    body('hotelId').notEmpty(),
    body('name').notEmpty(),
    body('basePrice').isFloat({ min: MIN_ROOM_PRICE_NGN }).withMessage('Minimum room price is ₦20,000'),
    body('amenities').notEmpty()
  ],
  validate,
  createRoomType
);
router.get('/types', authenticate, tenantGuard, authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), listRoomTypes);
router.put(
  '/types/:id',
  authenticate,
  tenantGuard,
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'),
  [
    body('basePrice')
      .optional()
      .isFloat({ min: MIN_ROOM_PRICE_NGN })
      .withMessage('Minimum room price is ₦20,000')
  ],
  validate,
  updateRoomType
);
router.post(
  '/',
  authenticate,
  tenantGuard,
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'),
  [body('hotelId').notEmpty(), body('roomTypeId').notEmpty(), body('roomNumber').notEmpty()],
  validate,
  createRoom
);
router.put('/:id', authenticate, tenantGuard, authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'), updateRoom);
router.get('/:id', getRoomDetails);

export default router;
