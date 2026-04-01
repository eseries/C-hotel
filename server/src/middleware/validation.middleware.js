import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 'Validation failed', 422, errors.array());
  }
  return next();
};
