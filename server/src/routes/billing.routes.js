import { Router } from 'express';
import { body } from 'express-validator';
import { createPayment, getInvoices, listPayments, getBillingSummary } from '../controllers/billing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);
router.get('/summary', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), getBillingSummary);
router.get('/invoices', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), getInvoices);
router.get('/payments', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), listPayments);
router.post(
  '/payments',
  authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'),
  [body('hotelId').notEmpty(), body('amount').isFloat({ min: 0.01 }), body('method').notEmpty()],
  validate,
  createPayment
);

export default router;
