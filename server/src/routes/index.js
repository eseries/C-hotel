import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import authRoutes from './auth.routes.js';
import billingRoutes from './billing.routes.js';
import guestRoutes from './guest.routes.js';
import hotelRoutes from './hotel.routes.js';
import housekeepingRoutes from './housekeeping.routes.js';
import reportRoutes from './report.routes.js';
import reservationRoutes from './reservation.routes.js';
import roomRoutes from './room.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ success: true, message: 'Server healthy' }));
router.use('/auth', authRoutes);
router.use('/hotels', hotelRoutes);
router.use('/rooms', roomRoutes);
router.use('/reservations', reservationRoutes);
router.use('/guests', guestRoutes);
router.use('/housekeeping', housekeepingRoutes);
router.use('/billing', billingRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
