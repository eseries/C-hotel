import prisma from '../config/db.js';
import { successResponse } from '../utils/response.js';

export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const [hotels, users, subscriptions, payments] = await Promise.all([
      prisma.hotel.count(),
      prisma.user.count(),
      prisma.subscription.count(),
      prisma.payment.aggregate({ _sum: { amount: true } })
    ]);

    return successResponse(res, {
      totalHotels: hotels,
      totalUsers: users,
      totalSubscriptions: subscriptions,
      grossPlatformRevenue: payments._sum.amount || 0
    });
  } catch (error) {
    return next(error);
  }
};

export const listPlatformHotels = async (req, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({
      include: {
        _count: { select: { users: true, rooms: true, reservations: true, subscriptions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, hotels);
  } catch (error) {
    return next(error);
  }
};

export const listPlatformUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({ include: { hotel: true }, orderBy: { createdAt: 'desc' } });
    return successResponse(res, users);
  } catch (error) {
    return next(error);
  }
};

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await prisma.subscription.create({ data: req.body });
    return successResponse(res, subscription, 'Subscription created', 201);
  } catch (error) {
    return next(error);
  }
};

export const listSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({ include: { hotel: true, user: true } });
    return successResponse(res, subscriptions);
  } catch (error) {
    return next(error);
  }
};
