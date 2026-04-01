import { errorResponse } from '../utils/response.js';

export const notFound = (req, res) => errorResponse(res, 'Route not found', 404);

export const errorHandler = (err, req, res, next) => {
  // eslint-disable-next-line no-unused-vars
  const _next = next;
  console.error(err);
  return errorResponse(res, err.message || 'Internal server error', err.status || 500);
};
