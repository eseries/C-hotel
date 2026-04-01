import { Router } from 'express';
import { body } from 'express-validator';
import { createHotel, getHotel, getPublicHotel, listHotels, updateHotel, updateHotelSettings } from '../controllers/hotel.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.get('/public', getPublicHotel);

router.use(authenticate);
router.get('/', authorize('SUPER_ADMIN'), listHotels);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'OWNER'),
  [body('name').notEmpty(), body('slug').isSlug()],
  validate,
  createHotel
);
router.get('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'), getHotel);
router.put('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'), updateHotel);
router.patch(
  '/:id/settings',
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'),
  [body('currency').optional().equals('NGN'), body('taxRate').optional().isFloat({ min: 0 })],
  validate,
  updateHotelSettings
);

export default router;
