import { errorResponse } from '../utils/response.js';

export const tenantGuard = (req, res, next) => {
  if (!req.user) return errorResponse(res, 'Unauthorized', 401);

  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
  if (isSuperAdmin) return next();

  const requestedHotelId = req.body.hotelId || req.params.hotelId || req.query.hotelId;
  if (requestedHotelId && requestedHotelId !== req.user.hotelId) {
    return errorResponse(res, 'Cross-tenant access is not allowed', 403);
  }

  req.tenantHotelId = req.user.hotelId;
  return next();
};
