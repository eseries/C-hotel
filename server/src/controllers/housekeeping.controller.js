import prisma from '../config/db.js';
import { errorResponse, successResponse } from '../utils/response.js';

const ACTIVE_TASK_STATUSES = ['PENDING', 'IN_PROGRESS'];
const CLEANING_TASK_TYPES = ['CLEANING', 'INSPECTION', 'PREPARE_CHECKED_IN_ROOM'];
const COMPLETED_TASK_STATUSES = ['COMPLETED', 'DONE'];

const getHotelIdFromRequest = (req) => req.query.hotelId || req.body.hotelId || req.tenantHotelId;

const isSameDay = (value, start, end) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  return date >= start && date < end;
};

const getDashboardSummary = ({ tasks, rooms }) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  const roomsToCleanToday = tasks.filter(
    (task) =>
      CLEANING_TASK_TYPES.includes(task.taskType) &&
      ACTIVE_TASK_STATUSES.includes(task.status) &&
      (isSameDay(task.dueDate, startOfToday, endOfToday) || isSameDay(task.createdAt, startOfToday, endOfToday))
  ).length;

  const roomsCleanedToday = tasks.filter(
    (task) =>
      CLEANING_TASK_TYPES.includes(task.taskType) &&
      COMPLETED_TASK_STATUSES.includes(task.status) &&
      isSameDay(task.updatedAt, startOfToday, endOfToday)
  ).length;

  const roomsUnderMaintenance = rooms.filter((room) => room.status === 'MAINTENANCE').length;
  const urgentTasks = tasks.filter(
    (task) => task.priority === 'HIGH' && ACTIVE_TASK_STATUSES.includes(task.status)
  ).length;

  return {
    roomsToCleanToday,
    roomsCleanedToday,
    roomsUnderMaintenance,
    urgentTasks
  };
};

export const createTask = async (req, res, next) => {
  try {
    const hotelId = getHotelIdFromRequest(req);
    if (!hotelId) return errorResponse(res, 'Hotel is required', 400);

    const roomLookup = req.body.roomId
      ? { id: req.body.roomId }
      : req.body.roomNumber
        ? { hotelId_roomNumber: { hotelId, roomNumber: req.body.roomNumber } }
        : null;

    if (!roomLookup) {
      return errorResponse(res, 'Room ID or room number is required', 400);
    }

    const room = await prisma.room.findUnique({ where: roomLookup });
    if (!room) return errorResponse(res, 'Room not found', 404);

    if (req.user.role !== 'SUPER_ADMIN' && room.hotelId !== req.tenantHotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }

    const taskType = req.body.taskType || 'MAINTENANCE';
    const status = req.body.status || 'PENDING';
    const priority = req.body.priority || 'NORMAL';
    const assignedToId = req.body.assignedToId || (req.user.role === 'HOUSEKEEPING' ? req.user.id : null);
    const notes = req.body.notes || req.body.issueDescription || null;

    const task = await prisma.$transaction(async (tx) => {
      if (taskType === 'MAINTENANCE') {
        await tx.room.update({
          where: { id: room.id },
          data: { status: 'MAINTENANCE' }
        });
      }

      return tx.housekeepingTask.create({
        data: {
          hotelId: room.hotelId,
          roomId: room.id,
          assignedToId,
          taskType,
          status,
          priority,
          notes,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null
        },
        include: { room: true }
      });
    });

    return successResponse(res, task, 'Housekeeping task created', 201);
  } catch (error) {
    return next(error);
  }
};

export const listTasks = async (req, res, next) => {
  try {
    const hotelId = getHotelIdFromRequest(req);
    if (!hotelId) return errorResponse(res, 'Hotel is required', 400);

    const taskWhere = {
      hotelId,
      ...(req.user.role === 'HOUSEKEEPING' ? { assignedToId: req.user.id } : {})
    };

    const tasks = await prisma.housekeepingTask.findMany({
      where: taskWhere,
      include: { room: true },
      orderBy: { createdAt: 'desc' }
    });
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: { roomType: true },
      orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }]
    });

    return successResponse(res, {
      summary: getDashboardSummary({ tasks, rooms }),
      tasks,
      rooms
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingTask = await prisma.housekeepingTask.findUnique({
      where: { id },
      include: { room: true }
    });
    if (!existingTask) return errorResponse(res, 'Housekeeping task not found', 404);

    if (req.user.role !== 'SUPER_ADMIN' && existingTask.hotelId !== req.tenantHotelId) {
      return errorResponse(res, 'Cross-tenant access is not allowed', 403);
    }

    if (req.user.role === 'HOUSEKEEPING' && existingTask.assignedToId && existingTask.assignedToId !== req.user.id) {
      return errorResponse(res, 'You cannot update a task assigned to another user', 403);
    }

    const nextStatus = req.body.status || existingTask.status;
    const nextTaskType = req.body.taskType || existingTask.taskType;
    const shouldSetRoomAvailable =
      CLEANING_TASK_TYPES.includes(nextTaskType) && COMPLETED_TASK_STATUSES.includes(nextStatus);
    const shouldSetRoomCleaning =
      CLEANING_TASK_TYPES.includes(nextTaskType) && nextStatus === 'IN_PROGRESS';
    const shouldKeepMaintenance =
      nextTaskType === 'MAINTENANCE' && !COMPLETED_TASK_STATUSES.includes(nextStatus);
    const shouldClearMaintenance =
      nextTaskType === 'MAINTENANCE' && COMPLETED_TASK_STATUSES.includes(nextStatus);

    const task = await prisma.$transaction(async (tx) => {
      const updatedTask = await tx.housekeepingTask.update({
        where: { id },
        data: {
          ...req.body,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : req.body.dueDate
        },
        include: { room: true }
      });

      if (shouldSetRoomAvailable) {
        await tx.room.update({
          where: { id: existingTask.roomId },
          data: { status: 'AVAILABLE' }
        });
      }

      if (shouldSetRoomCleaning) {
        await tx.room.update({
          where: { id: existingTask.roomId },
          data: { status: 'CLEANING' }
        });
      }

      if (shouldKeepMaintenance) {
        await tx.room.update({
          where: { id: existingTask.roomId },
          data: { status: 'MAINTENANCE' }
        });
      }

      if (shouldClearMaintenance) {
        await tx.room.update({
          where: { id: existingTask.roomId },
          data: { status: 'AVAILABLE' }
        });
      }

      return updatedTask;
    });

    return successResponse(res, task, 'Task updated');
  } catch (error) {
    return next(error);
  }
};
