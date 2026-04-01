import prisma from '../config/db.js';
import { errorResponse, successResponse } from '../utils/response.js';
import { MIN_ROOM_PRICE_NGN } from '../utils/constants.js';

const getPublicHotelId = async (req) => {
  if (req.query.hotelId) return req.query.hotelId;
  if (req.query.hotelSlug) {
    const hotel = await prisma.hotel.findUnique({
      where: { slug: req.query.hotelSlug },
      select: { id: true }
    });
    return hotel?.id || null;
  }

  const hotel = await prisma.hotel.findFirst({
    orderBy: { createdAt: 'asc' },
    select: { id: true }
  });
  return hotel?.id || null;
};

const buildAvailabilityFilter = (req, hotelId) => {
  const guests = Number(req.query.guests || 1);
  const checkIn = req.query.checkIn ? new Date(req.query.checkIn) : null;
  const checkOut = req.query.checkOut ? new Date(req.query.checkOut) : null;

  const where = {
    hotelId,
    roomType: guests > 0 ? { capacity: { gte: guests } } : undefined
  };

  if (checkIn && checkOut && checkIn < checkOut) {
    where.reservations = {
      none: {
        status: { notIn: ['CANCELLED', 'CHECKED_OUT', 'NO_SHOW'] },
        checkInDate: { lt: checkOut },
        checkOutDate: { gt: checkIn }
      }
    };
  }

  return where;
};

export const createRoomType = async (req, res, next) => {
  try {
    const basePrice = Number(req.body.basePrice);
    if (basePrice < MIN_ROOM_PRICE_NGN) {
      return errorResponse(res, 'Minimum room price is ₦20,000', 400);
    }

    const roomType = await prisma.roomType.create({ data: req.body });
    return successResponse(res, roomType, 'Room type created', 201);
  } catch (error) {
    return next(error);
  }
};

export const updateRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingRoomType = await prisma.roomType.findUnique({
      where: { id },
      select: { id: true, hotelId: true }
    });
    if (!existingRoomType) return errorResponse(res, 'Room type not found', 404);
    if (req.user?.role !== 'SUPER_ADMIN' && existingRoomType.hotelId !== req.user?.hotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }

    if (req.body.basePrice !== undefined) {
      const basePrice = Number(req.body.basePrice);
      if (basePrice < MIN_ROOM_PRICE_NGN) {
        return errorResponse(res, 'Minimum room price is ₦20,000', 400);
      }
    }

    const roomType = await prisma.roomType.update({
      where: { id },
      data: req.body
    });
    return successResponse(res, roomType, 'Room type updated');
  } catch (error) {
    return next(error);
  }
};

export const listRoomTypes = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const roomTypes = await prisma.roomType.findMany({ where: { hotelId }, orderBy: { createdAt: 'desc' } });
    return successResponse(res, roomTypes);
  } catch (error) {
    return next(error);
  }
};

export const createRoom = async (req, res, next) => {
  try {
    const room = await prisma.room.create({ data: req.body });
    return successResponse(res, room, 'Room created', 201);
  } catch (error) {
    return next(error);
  }
};

export const listRooms = async (req, res, next) => {
  try {
    const hotelId = req.user ? req.query.hotelId || req.tenantHotelId : await getPublicHotelId(req);
    if (!hotelId) return errorResponse(res, 'Hotel not found', 404);

    const rooms = await prisma.room.findMany({
      where: buildAvailabilityFilter(req, hotelId),
      include: {
        roomType: true,
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            currency: true
          }
        }
      },
      orderBy: { roomNumber: 'asc' }
    });
    return successResponse(res, rooms);
  } catch (error) {
    return next(error);
  }
};

export const getRoomDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            country: true,
            currency: true
          }
        }
      }
    });

    if (!room) return errorResponse(res, 'Room not found', 404);
    return successResponse(res, room);
  } catch (error) {
    return next(error);
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.update({ where: { id }, data: req.body });
    return successResponse(res, room, 'Room updated');
  } catch (error) {
    return next(error);
  }
};
