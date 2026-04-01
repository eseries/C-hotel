import prisma from '../config/db.js';
import { successResponse } from '../utils/response.js';

const getDateRanges = () => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return { now, startOfDay, startOfMonth };
};

export const getDashboardStats = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const { startOfDay } = getDateRanges();
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const [rooms, occupied, todayCheckIns, todayCheckOuts, todayRevenue, totalRevenue, roomsNeedingCleaning, pendingReservations] = await Promise.all([
      prisma.room.count({ where: { hotelId } }),
      prisma.room.count({ where: { hotelId, status: 'OCCUPIED' } }),
      prisma.reservation.count({ where: { hotelId, checkInDate: { gte: startOfDay, lt: endOfDay } } }),
      prisma.reservation.count({ where: { hotelId, checkOutDate: { gte: startOfDay, lt: endOfDay } } }),
      prisma.payment.aggregate({ where: { hotelId, paidAt: { gte: startOfDay, lt: endOfDay } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { hotelId }, _sum: { amount: true } }),
      prisma.room.count({ where: { hotelId, status: { in: ['DIRTY', 'CLEANING'] } } }),
      prisma.reservation.count({ where: { hotelId, status: 'PENDING' } })
    ]);

    const occupancyRate = rooms > 0 ? Number(((occupied / rooms) * 100).toFixed(2)) : 0;

    return successResponse(res, {
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
      occupancyRate,
      todayCheckIns,
      todayCheckOuts,
      todayArrivals: todayCheckIns,
      todayDepartures: todayCheckOuts,
      availableRooms: rooms - occupied,
      roomsNeedingCleaning,
      pendingReservations
    });
  } catch (error) {
    return next(error);
  }
};

export const getRevenueChartData = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const payments = await prisma.payment.findMany({
      where: {
        hotelId,
        paidAt: { gte: thirtyDaysAgo }
      },
      select: {
        amount: true,
        paidAt: true
      },
      orderBy: { paidAt: 'asc' }
    });

    const dailyRevenue = payments.reduce((acc, curr) => {
      const date = curr.paidAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + curr.amount;
      return acc;
    }, {});

    const chartData = Object.entries(dailyRevenue).map(([date, amount]) => ({
      date,
      amount
    }));

    return successResponse(res, chartData);
  } catch (error) {
    return next(error);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const { startOfMonth } = getDateRanges();

    const [daily, monthly] = await Promise.all([
      prisma.payment.aggregate({ where: { hotelId }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { hotelId, paidAt: { gte: startOfMonth } }, _sum: { amount: true } })
    ]);

    return successResponse(res, {
      dailySales: daily._sum.amount || 0,
      monthlySales: monthly._sum.amount || 0
    });
  } catch (error) {
    return next(error);
  }
};
