import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { DEFAULT_CURRENCY } from '../utils/constants.js';

export const createHotel = async (req, res, next) => {
  try {
    const hotel = await prisma.hotel.create({
      data: {
        ...req.body,
        currency: DEFAULT_CURRENCY
      }
    });
    return successResponse(res, hotel, 'Hotel created', 201);
  } catch (error) {
    return next(error);
  }
};

export const getPublicHotel = async (req, res, next) => {
  try {
    const id = req.query.id;
    const slug = req.query.slug;
    const hotel = id
      ? await prisma.hotel.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            country: true,
            currency: true,
            timezone: true,
            checkInTime: true,
            checkOutTime: true
          }
        })
      : slug
      ? await prisma.hotel.findUnique({
          where: { slug },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            country: true,
            currency: true,
            timezone: true,
            checkInTime: true,
            checkOutTime: true
          }
        })
      : await prisma.hotel.findFirst({
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            name: true,
            slug: true,
            city: true,
            country: true,
            currency: true,
            timezone: true,
            checkInTime: true,
            checkOutTime: true
          }
        });

    if (!hotel) return errorResponse(res, 'Hotel not found', 404);
    return successResponse(res, hotel);
  } catch (error) {
    return next(error);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        ...req.body,
        currency: DEFAULT_CURRENCY
      }
    });
    return successResponse(res, hotel, 'Hotel updated');
  } catch (error) {
    return next(error);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hotel = await prisma.hotel.findUnique({
      where: { id },
      include: { roomTypes: true, rooms: true, users: true }
    });
    if (!hotel) return errorResponse(res, 'Hotel not found', 404);
    return successResponse(res, hotel);
  } catch (error) {
    return next(error);
  }
};

export const listHotels = async (req, res, next) => {
  try {
    const hotels = await prisma.hotel.findMany({ orderBy: { createdAt: 'desc' } });
    return successResponse(res, hotels);
  } catch (error) {
    return next(error);
  }
};

export const updateHotelSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { timezone, checkInTime, checkOutTime, taxRate } = req.body;
    const hotel = await prisma.hotel.update({
      where: { id },
      data: { currency: DEFAULT_CURRENCY, timezone, checkInTime, checkOutTime, taxRate }
    });
    return successResponse(res, hotel, 'Hotel settings updated');
  } catch (error) {
    return next(error);
  }
};
