import { Router } from 'express';
import { body } from 'express-validator';
import { createTask, listTasks, updateTask } from '../controllers/housekeeping.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);
router.get('/', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'HOUSEKEEPING'), listTasks);
router.post(
  '/',
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'HOUSEKEEPING'),
  [
    body('hotelId').notEmpty(),
    body('roomId').optional().notEmpty(),
    body('roomNumber').optional().notEmpty(),
    body('taskType').optional().notEmpty(),
    body().custom((value) => {
      if (!value.roomId && !value.roomNumber) {
        throw new Error('roomId or roomNumber is required');
      }
      return true;
    })
  ],
  validate,
  createTask
);
router.put('/:id', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'HOUSEKEEPING'), updateTask);

export default router;
