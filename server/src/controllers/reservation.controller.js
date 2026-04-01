import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  sendBookingConfirmationEmail,
  sendThankYouEmail,
  sendWelcomeEmail
} from '../services/email.service.js';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN'];

const calculateNights = (checkInDate, checkOutDate) => {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  const diff = end.getTime() - start.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const derivePaymentStatus = (paidAmount, totalAmount) => {
  if (totalAmount <= 0) return 'PENDING';
  if (paidAmount <= 0) return 'PENDING';
  if (paidAmount >= totalAmount) return 'PAID';
  return 'PARTIAL';
};

const isDateRangeConflict = async (roomId, checkInDate, checkOutDate, excludeReservationId = null) => {
  const overlappingReservation = await prisma.reservation.findFirst({
    where: {
      roomId,
      id: excludeReservationId ? { not: excludeReservationId } : undefined,
      status: { in: ACTIVE_STATUSES },
      checkInDate: { lt: checkOutDate },
      checkOutDate: { gt: checkInDate }
    }
  });

  return Boolean(overlappingReservation);
};

const findHousekeepingAssignee = async (hotelId) =>
  prisma.user.findFirst({
    where: {
      hotelId,
      role: 'HOUSEKEEPING',
      isActive: true
    },
    select: { id: true }
  });

const getReservationEmailPayload = async (reservationId) => {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      guest: true,
      hotel: true,
      room: { include: { roomType: true } }
    }
  });
  if (!reservation || !reservation.guest?.email) return null;

  return {
    to: reservation.guest.email,
    guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim(),
    hotelName: reservation.hotel.name,
    checkInDate: reservation.checkInDate,
    checkOutDate: reservation.checkOutDate,
    roomName: reservation.room.roomType?.name || `Room ${reservation.room.roomNumber}`
  };
};

const resolveGuest = async (hotelId, guest) => {
  const filters = [];
  if (guest.email) filters.push({ email: guest.email });
  if (guest.phone) filters.push({ phone: guest.phone });

  const existingGuest =
    filters.length > 0
      ? await prisma.guest.findFirst({
          where: {
            hotelId,
            OR: filters
          }
        })
      : null;

  if (existingGuest) {
    return prisma.guest.update({
      where: { id: existingGuest.id },
      data: {
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone
      }
    });
  }

  return prisma.guest.create({
    data: {
      hotelId,
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone
    }
  });
};

export const createReservation = async (req, res, next) => {
  try {
    if (req.user) {
      const hotelId = req.body.hotelId || req.user.hotelId;
      const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
      if (!isSuperAdmin && hotelId !== req.user.hotelId) {
        return errorResponse(res, 'Cross-tenant access is not allowed', 403);
      }

      const payload = { ...req.body, hotelId, createdById: req.user.id };
      const checkInDate = new Date(payload.checkInDate);
      const checkOutDate = new Date(payload.checkOutDate);
      if (
        Number.isNaN(checkInDate.getTime()) ||
        Number.isNaN(checkOutDate.getTime()) ||
        checkInDate >= checkOutDate
      ) {
        return errorResponse(res, 'Invalid reservation dates', 400);
      }

      const room = await prisma.room.findUnique({
        where: { id: payload.roomId },
        include: { roomType: true }
      });
      if (!room) return errorResponse(res, 'Room not found', 404);

      if (!isSuperAdmin && room.hotelId !== hotelId) {
        return errorResponse(res, 'Cross-tenant access is not allowed', 403);
      }

      if (await isDateRangeConflict(payload.roomId, checkInDate, checkOutDate)) {
        return errorResponse(res, 'Room is already booked for the selected dates', 409);
      }

      const nights = calculateNights(checkInDate, checkOutDate);
      const nightlyRate = room.customPrice || room.roomType?.basePrice || 0;
      const status = payload.status || 'CONFIRMED';
      const totalAmount = payload.totalAmount ?? nightlyRate * nights;
      const paidAmount = Number(payload.paidAmount || 0);
      const reservation = await prisma.reservation.create({
        data: {
          ...payload,
          hotelId: room.hotelId,
          checkInDate,
          checkOutDate,
          status,
          totalAmount,
          paidAmount,
          paymentStatus: payload.paymentStatus || derivePaymentStatus(paidAmount, totalAmount)
        }
      });

      await prisma.room.update({
        where: { id: payload.roomId },
        data: {
          status: status === 'CHECKED_IN' ? 'OCCUPIED' : 'RESERVED'
        }
      });
      const emailPayload = await getReservationEmailPayload(reservation.id);
      if (emailPayload) {
        sendBookingConfirmationEmail(emailPayload).catch((error) => {
          console.error('Booking confirmation email failed', error.message);
        });
      }

      return successResponse(res, reservation, 'Reservation created', 201);
    }

    const { roomId, checkIn, checkOut, guest, numberOfGuests, specialRequests } = req.body;
    if (!roomId || !checkIn || !checkOut || !guest?.firstName || !guest?.lastName) {
      return errorResponse(res, 'Missing required reservation fields', 400);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
      return errorResponse(res, 'Invalid reservation dates', 400);
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true }
    });
    if (!room) return errorResponse(res, 'Room not found', 404);

    if (await isDateRangeConflict(roomId, checkInDate, checkOutDate)) {
      return errorResponse(res, 'Room is not available for the selected dates', 409);
    }

    const guestProfile = await resolveGuest(room.hotelId, guest);
    const nights = calculateNights(checkInDate, checkOutDate);
    const nightlyRate = room.customPrice || room.roomType?.basePrice || 0;
    const reservation = await prisma.reservation.create({
      data: {
        hotelId: room.hotelId,
        guestId: guestProfile.id,
        roomId,
        checkInDate,
        checkOutDate,
        adults: Number(numberOfGuests || 1),
        status: 'CONFIRMED',
        totalAmount: nightlyRate * nights,
        paymentStatus: 'PENDING',
        source: 'PUBLIC_BOOKING',
        notes: specialRequests || null
      },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true,
            hotel: {
              select: { id: true, name: true, slug: true, currency: true }
            }
          }
        }
      }
    });

    await prisma.room.update({ where: { id: roomId }, data: { status: 'RESERVED' } });

    const emailPayload = await getReservationEmailPayload(reservation.id);
    if (emailPayload) {
      sendBookingConfirmationEmail(emailPayload).catch((error) => {
        console.error('Booking confirmation email failed', error.message);
      });
    }

    return successResponse(res, reservation, 'Reservation created', 201);
  } catch (error) {
    return next(error);
  }
};

export const getReservationByCode = async (req, res, next) => {
  try {
    const { code } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id: code },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true,
            hotel: {
              select: { id: true, name: true, slug: true, currency: true }
            }
          }
        },
        payments: true
      }
    });

    if (!reservation) return errorResponse(res, 'Reservation not found', 404);
    return successResponse(res, reservation);
  } catch (error) {
    return next(error);
  }
};

export const listReservations = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId },
      include: { guest: true, room: true, payments: true },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, reservations);
  } catch (error) {
    return next(error);
  }
};

export const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingReservation = await prisma.reservation.findUnique({ where: { id } });
    if (!existingReservation) return errorResponse(res, 'Reservation not found', 404);

    if (req.user.role !== 'SUPER_ADMIN' && existingReservation.hotelId !== req.tenantHotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }

    const nextRoomId = req.body.roomId || existingReservation.roomId;
    const nextCheckInDate = new Date(req.body.checkInDate || existingReservation.checkInDate);
    const nextCheckOutDate = new Date(req.body.checkOutDate || existingReservation.checkOutDate);
    if (
      Number.isNaN(nextCheckInDate.getTime()) ||
      Number.isNaN(nextCheckOutDate.getTime()) ||
      nextCheckInDate >= nextCheckOutDate
    ) {
      return errorResponse(res, 'Invalid reservation dates', 400);
    }

    if (await isDateRangeConflict(nextRoomId, nextCheckInDate, nextCheckOutDate, id)) {
      return errorResponse(res, 'Room already booked for selected dates', 409);
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        ...req.body,
        roomId: nextRoomId,
        checkInDate: nextCheckInDate,
        checkOutDate: nextCheckOutDate,
        paymentStatus:
          req.body.paidAmount !== undefined || req.body.totalAmount !== undefined
            ? derivePaymentStatus(
                Number(req.body.paidAmount ?? existingReservation.paidAmount),
                Number(req.body.totalAmount ?? existingReservation.totalAmount)
              )
            : req.body.paymentStatus
      }
    });

    if (req.body.status === 'CHECKED_IN') {
      await prisma.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' }
      });
    }

    if (req.body.status === 'CHECKED_OUT') {
      const housekeepingAssignee = await findHousekeepingAssignee(reservation.hotelId);
      await prisma.$transaction(async (tx) => {
        await tx.room.update({
          where: { id: reservation.roomId },
          data: { status: 'DIRTY' }
        });

        const existingTask = await tx.housekeepingTask.findFirst({
          where: {
            hotelId: reservation.hotelId,
            roomId: reservation.roomId,
            taskType: 'CLEANING',
            notes: { contains: reservation.id }
          }
        });

        if (!existingTask) {
          await tx.housekeepingTask.create({
            data: {
              hotelId: reservation.hotelId,
              roomId: reservation.roomId,
              taskType: 'CLEANING',
              status: 'PENDING',
              priority: 'NORMAL',
              assignedToId: housekeepingAssignee?.id || null,
              notes: `Auto-created after checkout for reservation ${reservation.id}`
            }
          });
        }

        await tx.guestStayHistory.upsert({
          where: { reservationId: reservation.id },
          update: {
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            amountPaid: reservation.paidAmount
          },
          create: {
            hotelId: reservation.hotelId,
            guestId: reservation.guestId,
            roomId: reservation.roomId,
            reservationId: reservation.id,
            checkInDate: reservation.checkInDate,
            checkOutDate: reservation.checkOutDate,
            amountPaid: reservation.paidAmount
          }
        });
      });
    }

    return successResponse(res, reservation, 'Reservation updated');
  } catch (error) {
    return next(error);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) return errorResponse(res, 'Reservation not found', 404);

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    await prisma.room.update({ where: { id: reservation.roomId }, data: { status: 'AVAILABLE' } });
    return successResponse(res, updated, 'Reservation cancelled');
  } catch (error) {
    return next(error);
  }
};

export const checkIn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notifyHousekeeping = Boolean(req.body?.notifyHousekeeping);
    const requiresPreparation = Boolean(req.body?.requiresPreparation);

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        room: true
      }
    });
    if (!reservation) return errorResponse(res, 'Reservation not found', 404);
    if (req.user.role !== 'SUPER_ADMIN' && reservation.hotelId !== req.tenantHotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }

    if (reservation.status === 'CHECKED_IN') {
      return errorResponse(res, 'Reservation already checked in', 409);
    }

    if (['CHECKED_OUT', 'CANCELLED', 'NO_SHOW'].includes(reservation.status)) {
      return errorResponse(res, `Cannot check in a ${reservation.status.toLowerCase()} reservation`, 409);
    }

    if (reservation.room.status === 'MAINTENANCE') {
      return errorResponse(res, 'Room unavailable: currently under maintenance', 409);
    }

    if (reservation.room.status === 'OCCUPIED') {
      return errorResponse(res, 'Room unavailable: currently occupied', 409);
    }

    const activeOccupancy = await prisma.reservation.findFirst({
      where: {
        id: { not: id },
        roomId: reservation.roomId,
        status: 'CHECKED_IN',
        checkOutDate: { gt: new Date() }
      }
    });

    if (activeOccupancy) {
      return errorResponse(res, 'Room unavailable: already occupied by an active stay', 409);
    }

    const housekeepingAssignee = notifyHousekeeping && requiresPreparation
      ? await findHousekeepingAssignee(reservation.hotelId)
      : null;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: { status: 'CHECKED_IN' },
        include: {
          guest: true,
          room: {
            include: {
              roomType: true
            }
          },
          payments: true
        }
      });

      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'OCCUPIED' }
      });

      if (notifyHousekeeping && requiresPreparation) {
        await tx.housekeepingTask.create({
          data: {
            hotelId: reservation.hotelId,
            roomId: reservation.roomId,
            taskType: 'PREPARE_CHECKED_IN_ROOM',
            status: 'PENDING',
            priority: 'HIGH',
            assignedToId: housekeepingAssignee?.id || null,
            notes: `Preparation requested at check-in for reservation ${reservation.id}`
          }
        });
      }

      return updatedReservation;
    });

    const emailPayload = await getReservationEmailPayload(updated.id);
    if (emailPayload) {
      sendWelcomeEmail(emailPayload).catch((error) => {
        console.error('Welcome email failed', error.message);
      });
    }

    return successResponse(res, updated, 'Guest checked in');
  } catch (error) {
    return next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        guest: true,
        room: true
      }
    });
    if (!reservation) return errorResponse(res, 'Reservation not found', 404);
    if (req.user.role !== 'SUPER_ADMIN' && reservation.hotelId !== req.tenantHotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }
    if (reservation.status === 'CHECKED_OUT') {
      return errorResponse(res, 'Reservation already checked out', 409);
    }
    if (['CANCELLED', 'NO_SHOW'].includes(reservation.status)) {
      return errorResponse(res, `Cannot check out a ${reservation.status.toLowerCase()} reservation`, 409);
    }
    if (reservation.status !== 'CHECKED_IN') {
      return errorResponse(res, 'Only checked-in reservations can be checked out', 409);
    }

    const housekeepingAssignee = await findHousekeepingAssignee(reservation.hotelId);
    const updated = await prisma.$transaction(async (tx) => {
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: 'CHECKED_OUT',
          paymentStatus: derivePaymentStatus(reservation.paidAmount, reservation.totalAmount)
        }
      });

      await tx.room.update({
        where: { id: reservation.roomId },
        data: { status: 'DIRTY' }
      });

      await tx.housekeepingTask.create({
        data: {
          hotelId: reservation.hotelId,
          roomId: reservation.roomId,
          taskType: 'CLEANING',
          status: 'PENDING',
          priority: 'NORMAL',
          assignedToId: housekeepingAssignee?.id || null,
          notes: `Auto-created after checkout for reservation ${reservation.id}`
        }
      });

      await tx.guestStayHistory.upsert({
        where: { reservationId: reservation.id },
        update: {
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          amountPaid: reservation.paidAmount
        },
        create: {
          hotelId: reservation.hotelId,
          guestId: reservation.guestId,
          roomId: reservation.roomId,
          reservationId: reservation.id,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          amountPaid: reservation.paidAmount
        }
      });

      return updatedReservation;
    });

    const emailPayload = await getReservationEmailPayload(updated.id);
    if (emailPayload) {
      sendThankYouEmail(emailPayload).catch((error) => {
        console.error('Thank-you email failed', error.message);
      });
    }

    return successResponse(res, updated, 'Guest checked out');
  } catch (error) {
    return next(error);
  }
};
