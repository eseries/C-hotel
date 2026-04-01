import prisma from '../config/db.js';
import { comparePassword, hashPassword } from '../services/auth.service.js';
import { generateToken } from '../utils/token.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role, hotelId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 'Email already in use', 409);

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role,
        hotelId
      }
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role, hotelId: user.hotelId });
    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          hotelId: user.hotelId
        }
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return errorResponse(res, 'Invalid credentials', 401);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const token = generateToken({ id: user.id, email: user.email, role: user.role, hotelId: user.hotelId });
    return successResponse(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        hotelId: user.hotelId
      }
    }, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res) => successResponse(res, null, 'Logout successful. Remove token on client side.');

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return errorResponse(res, 'User not found', 404);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) return errorResponse(res, 'Current password is incorrect', 400);

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    return next(error);
  }
};
