import cron from 'node-cron';
import prisma from '../config/db.js';
import { sendReservationReminderEmail } from './email.service.js';

const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'CHECKED_IN'];
const CLEANED_TASK_STATUSES = ['COMPLETED', 'DONE'];

const dayBounds = (baseDate = new Date()) => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const generateDailyReports = async () => {
  const hotels = await prisma.hotel.findMany({ select: { id: true } });
  const { start, end } = dayBounds();

  for (const hotel of hotels) {
    const [totalBookings, dailyRevenue, roomsOccupied, roomsAvailable, roomsCleaned, checkInsToday, checkOutsToday, totalRooms] = await Promise.all([
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          createdAt: { gte: start, lt: end }
        }
      }),
      prisma.payment.aggregate({
        where: {
          hotelId: hotel.id,
          paidAt: { gte: start, lt: end }
        },
        _sum: { amount: true }
      }),
      prisma.room.count({
        where: {
          hotelId: hotel.id,
          status: 'OCCUPIED'
        }
      }),
      prisma.room.count({
        where: {
          hotelId: hotel.id,
          status: 'AVAILABLE'
        }
      }),
      prisma.housekeepingTask.count({
        where: {
          hotelId: hotel.id,
          taskType: { contains: 'CLEANING' },
          status: { in: CLEANED_TASK_STATUSES },
          updatedAt: { gte: start, lt: end }
        }
      }),
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          checkInDate: { gte: start, lt: end }
        }
      }),
      prisma.reservation.count({
        where: {
          hotelId: hotel.id,
          checkOutDate: { gte: start, lt: end }
        }
      }),
      prisma.room.count({ where: { hotelId: hotel.id } })
    ]);
    const occupancyRate = totalRooms > 0 ? Number(((roomsOccupied / totalRooms) * 100).toFixed(2)) : 0;

    await prisma.dailyReport.upsert({
      where: {
        hotelId_reportDate: {
          hotelId: hotel.id,
          reportDate: start
        }
      },
      update: {
        occupancyRate,
        totalBookings,
        totalRevenue: dailyRevenue._sum.amount || 0,
        checkInsToday,
        checkOutsToday,
        roomsOccupied,
        roomsAvailable,
        roomsCleaned
      },
      create: {
        hotelId: hotel.id,
        reportDate: start,
        occupancyRate,
        totalBookings,
        totalRevenue: dailyRevenue._sum.amount || 0,
        checkInsToday,
        checkOutsToday,
        roomsOccupied,
        roomsAvailable,
        roomsCleaned
      }
    });
  }

  console.log(`[automation] Daily reports generated for ${hotels.length} hotels`);
};

const expirePendingReservations = async () => {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const expiringReservations = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      paymentStatus: 'PENDING',
      paidAmount: { lte: 0 },
      createdAt: { lte: cutoff }
    },
    select: {
      id: true,
      roomId: true
    }
  });

  for (const reservation of expiringReservations) {
    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'CANCELLED', paymentStatus: 'PENDING' }
      });

      const room = await tx.room.findUnique({
        where: { id: reservation.roomId },
        select: { status: true }
      });

      if (room?.status === 'RESERVED') {
        const activeReservation = await tx.reservation.findFirst({
          where: {
            roomId: reservation.roomId,
            status: { in: ACTIVE_STATUSES }
          }
        });

        if (!activeReservation) {
          await tx.room.update({
            where: { id: reservation.roomId },
            data: { status: 'AVAILABLE' }
          });
        }
      }
    });
  }

  if (expiringReservations.length > 0) {
    console.log(`[automation] Expired ${expiringReservations.length} pending reservations`);
  }
};

const sendCheckInReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { start, end } = dayBounds(tomorrow);

  const reservations = await prisma.reservation.findMany({
    where: {
      status: { in: ['PENDING', 'CONFIRMED'] },
      checkInDate: { gte: start, lt: end },
      guest: { email: { not: null } }
    },
    include: {
      guest: true,
      room: { include: { roomType: true } },
      hotel: true
    }
  });

  let sentCount = 0;
  for (const reservation of reservations) {
    await sendReservationReminderEmail({
      to: reservation.guest.email,
      guestName: `${reservation.guest.firstName} ${reservation.guest.lastName}`.trim(),
      hotelName: reservation.hotel.name,
      checkInDate: reservation.checkInDate,
      roomName: reservation.room.roomType?.name || `Room ${reservation.room.roomNumber}`
    });
    sentCount += 1;
  }

  if (sentCount > 0) {
    console.log(`[automation] Sent ${sentCount} check-in reminder emails`);
  }
};

const runJob = async (jobName, fn) => {
  try {
    await fn();
  } catch (error) {
    console.error(`[automation] ${jobName} failed`, error);
  }
};

export const startAutomationScheduler = () => {
  cron.schedule('0 0 * * *', () => runJob('daily-report', generateDailyReports));
  cron.schedule('0 * * * *', () => runJob('pending-expiry', expirePendingReservations));
  cron.schedule('0 8 * * *', () => runJob('check-in-reminder', sendCheckInReminders));

  console.log('[automation] Scheduler started');
};
