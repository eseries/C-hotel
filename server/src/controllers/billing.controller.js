import prisma from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const createPayment = async (req, res, next) => {
  try {
    const payment = await prisma.payment.create({ data: req.body });

    if (req.body.reservationId) {
      const reservation = await prisma.reservation.findUnique({ where: { id: req.body.reservationId } });
      if (!reservation) return errorResponse(res, 'Reservation not found', 404);
      const paidAmount = reservation.paidAmount + req.body.amount;
      const paymentStatus = paidAmount <= 0 ? 'PENDING' : paidAmount >= reservation.totalAmount ? 'PAID' : 'PARTIAL';

      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paidAmount, paymentStatus }
      });
    }

    return successResponse(res, payment, 'Payment recorded', 201);
  } catch (error) {
    return next(error);
  }
};

export const listPayments = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const payments = await prisma.payment.findMany({
      where: { hotelId },
      include: { reservation: true },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, payments);
  } catch (error) {
    return next(error);
  }
};

export const getInvoices = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const invoices = await prisma.reservation.findMany({
      where: { hotelId },
      include: { guest: true, room: true, payments: true },
      orderBy: { createdAt: 'desc' }
    });

    const mapped = invoices.map((reservation) => ({
      reservationId: reservation.id,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`,
      roomNumber: reservation.room.roomNumber,
      totalAmount: reservation.totalAmount,
      paidAmount: reservation.paidAmount,
      dueAmount: reservation.totalAmount - reservation.paidAmount,
      status: reservation.status,
      paymentStatus: reservation.paymentStatus,
      issuedAt: reservation.createdAt
    }));

    return successResponse(res, mapped);
  } catch (error) {
    return next(error);
  }
};

export const getBillingSummary = async (req, res, next) => {
  try {
    const hotelId = req.query.hotelId || req.tenantHotelId;
    const reservations = await prisma.reservation.findMany({
      where: { hotelId },
      select: {
        totalAmount: true,
        paidAmount: true
      }
    });

    const summary = reservations.reduce((acc, curr) => {
      acc.totalReceivables += curr.totalAmount;
      acc.totalPaid += curr.paidAmount;
      acc.totalDue += (curr.totalAmount - curr.paidAmount);
      return acc;
    }, { totalReceivables: 0, totalPaid: 0, totalDue: 0 });

    return successResponse(res, summary);
  } catch (error) {
    return next(error);
  }
};
