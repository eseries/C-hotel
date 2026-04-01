import prisma from '../config/db.js';
import { successResponse } from '../utils/response.js';

export const createGuest = async (req, res, next) => {
  try {
    const guest = await prisma.guest.create({ data: req.body });
    return successResponse(res, guest, 'Guest profile created', 201);
  } catch (error) {
    return next(error);
  }
};

export const listGuests = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const guests = await prisma.guest.findMany({
      where: { hotelId },
      include: {
        stayHistory: {
          include: {
            room: { include: { roomType: true } }
          },
          orderBy: { checkOutDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = guests.map((guest) => {
      const totalStays = guest.stayHistory.length;
      const totalMoneySpent = guest.stayHistory.reduce((sum, stay) => sum + (stay.amountPaid || 0), 0);
      const roomTypeFrequency = guest.stayHistory.reduce((acc, stay) => {
        const key = stay.room?.roomType?.name || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const preferredRoomType = Object.entries(roomTypeFrequency).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
      const visitHistory = guest.stayHistory.map((stay) => ({
        roomNumber: stay.room?.roomNumber,
        roomType: stay.room?.roomType?.name || null,
        checkInDate: stay.checkInDate,
        checkOutDate: stay.checkOutDate,
        amountPaid: stay.amountPaid
      }));

      return {
        ...guest,
        totalStays,
        totalMoneySpent,
        preferredRoomType,
        visitHistory
      };
    });

    return successResponse(res, enriched);
  } catch (error) {
    return next(error);
  }
};

export const getGuestProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        reservations: {
          include: { room: true, payments: true },
          orderBy: { createdAt: 'desc' }
        },
        stayHistory: {
          include: { room: { include: { roomType: true } } },
          orderBy: { checkOutDate: 'desc' }
        }
      }
    });
    return successResponse(res, guest);
  } catch (error) {
    return next(error);
  }
};

export const updateGuest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const guest = await prisma.guest.update({ where: { id }, data: req.body });
    return successResponse(res, guest, 'Guest updated');
  } catch (error) {
    return next(error);
  }
};
