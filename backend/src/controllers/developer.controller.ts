import { Request, Response } from 'express';
import databaseService from '../services/database.service';
import syncService from '../services/sync.service';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';

const prisma = databaseService.getClient();

/**
 * Get all developers
 */
export const getAllDevelopers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const developers = await prisma.developer.findMany({
    include: {
      tasks: {
        where: {
          dateClosed: null, // Only open tasks
        },
      },
      _count: {
        select: {
          tasks: true,
          timeEntries: true,
        },
      },
    },
    orderBy: {
      totalPoints: 'asc', // Sort by lowest points first
    },
  });

  logger.info(`Fetched ${developers.length} developers`);

  res.json({
    success: true,
    data: developers,
    count: developers.length,
  });
});

/**
 * Get developer by ID
 */
export const getDeveloperById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const developer = await prisma.developer.findUnique({
    where: { id },
    include: {
      tasks: {
        include: {
          tags: true,
        },
      },
      timeEntries: {
        include: {
          task: true,
        },
        orderBy: {
          date: 'desc',
        },
      },
    },
  });

  if (!developer) {
    throw new AppError('Developer not found', 404);
  }

  logger.info(`Fetched developer: ${developer.username}`);

  res.json({
    success: true,
    data: developer,
  });
});

/**
 * Get developer with lowest points (for auto-assignment)
 */
export const getDeveloperWithLowestPoints = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const developer = await syncService.getDeveloperWithLowestPoints();

  if (!developer) {
    throw new AppError('No developers found', 404);
  }

  logger.info(`Developer with lowest points: ${developer.username} (${developer.totalPoints} points)`);

  res.json({
    success: true,
    data: developer,
  });
});

/**
 * Get weekly hours report for all developers
 */
export const getWeeklyReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { week, year } = req.query;

  const currentDate = new Date();
  const currentWeek = getWeekNumber(currentDate);
  const currentYear = currentDate.getFullYear();

  const targetWeek = week ? parseInt(week as string) : currentWeek;
  const targetYear = year ? parseInt(year as string) : currentYear;

  const timeEntries = await prisma.timeEntry.findMany({
    where: {
      week: targetWeek,
      year: targetYear,
    },
    include: {
      developer: true,
      task: true,
    },
  });

  // Group by developer
  const reportByDeveloper = timeEntries.reduce((acc: any, entry) => {
    const devId = entry.developer.id;

    if (!acc[devId]) {
      acc[devId] = {
        developer: entry.developer,
        totalHours: 0,
        tasks: [],
      };
    }

    acc[devId].totalHours += entry.hours;
    acc[devId].tasks.push({
      taskId: entry.task.id,
      taskName: entry.task.name,
      hours: entry.hours,
      date: entry.date,
    });

    return acc;
  }, {});

  const report = Object.values(reportByDeveloper);

  logger.info(`Generated weekly report for week ${targetWeek}/${targetYear}: ${report.length} developers`);

  res.json({
    success: true,
    data: {
      week: targetWeek,
      year: targetYear,
      developers: report,
    },
  });
});

/**
 * Add time entry for a developer
 */
export const addTimeEntry = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { taskId, developerId, hours, date, description } = req.body;

  // Validate task exists
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Validate developer exists
  const developer = await prisma.developer.findUnique({ where: { id: developerId } });
  if (!developer) {
    throw new AppError('Developer not found', 404);
  }

  const entryDate = date ? new Date(date) : new Date();
  const week = getWeekNumber(entryDate);
  const year = entryDate.getFullYear();

  const timeEntry = await prisma.timeEntry.create({
    data: {
      taskId,
      developerId,
      hours: parseFloat(hours),
      date: entryDate,
      week,
      year,
      description,
    },
    include: {
      task: true,
      developer: true,
    },
  });

  logger.info(`Time entry added: ${hours}h for task ${task.name} by ${developer.username}`);

  res.json({
    success: true,
    data: timeEntry,
    message: 'Time entry added successfully',
  });
});

/**
 * Helper function to get week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
