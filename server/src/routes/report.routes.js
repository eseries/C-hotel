import { Router } from 'express';
import { getDashboardStats, getRevenueReport, getRevenueChartData } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { tenantGuard } from '../middleware/tenant.middleware.js';

const router = Router();

router.use(authenticate, tenantGuard);
router.get('/dashboard', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER', 'RECEPTIONIST'), getDashboardStats);
router.get('/revenue', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'), getRevenueReport);
router.get('/revenue/chart', authorize('SUPER_ADMIN', 'OWNER', 'MANAGER'), getRevenueChartData);

export default router;
