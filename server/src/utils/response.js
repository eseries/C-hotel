export const successResponse = (res, data, message = 'Success', status = 200) =>
  res.status(status).json({ success: true, message, data });

export const errorResponse = (res, message = 'Something went wrong', status = 500, errors = null) =>
  res.status(status).json({ success: false, message, errors });
