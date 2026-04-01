import { verifyToken } from '../utils/token.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

export const authenticateOptional = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    req.user = verifyToken(token);
  } catch (_error) {
    req.user = null;
  }

  return next();
};

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Unauthorized', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return errorResponse(res, 'Forbidden: Insufficient permissions', 403);
  }

  return next();
};
