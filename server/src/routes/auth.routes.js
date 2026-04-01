import { Router } from 'express';
import { body } from 'express-validator';
import { changePassword, login, logout, register } from '../controllers/auth.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('role').isIn(['SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST', 'HOUSEKEEPING'])
  ],
  validate,
  register
);

router.post('/login', [body('email').isEmail(), body('password').notEmpty()], validate, login);
router.post('/logout', authenticate, logout);
router.patch(
  '/change-password',
  authenticate,
  [body('currentPassword').notEmpty(), body('newPassword').isLength({ min: 8 })],
  validate,
  changePassword
);

export default router;
