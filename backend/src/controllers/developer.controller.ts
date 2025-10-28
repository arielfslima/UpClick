import { Request, Response } from 'express';
import databaseService from '../services/database.service';
import syncService from '../services/sync.service';

const prisma = databaseService.getClient();

/**
 * Get all developers
 */
export const getAllDevelopers = async (req: Request, res: Response): Promise<void> => {
  try {
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

    res.json({
      success: true,
      data: developers,
      count: developers.length,
    });
  } catch (error: any) {
    console.error('Error fetching developers:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get developer by ID
 */
export const getDeveloperById = async (req: Request, res: Response): Promise<void> => {
  try {
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
      res.status(404).json({
        success: false,
        error: 'Developer not found',
      });
      return;
    }

    res.json({
      success: true,
      data: developer,
    });
  } catch (error: any) {
    console.error('Error fetching developer:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get developer with lowest points (for auto-assignment)
 */
export const getDeveloperWithLowestPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const developer = await syncService.getDeveloperWithLowestPoints();

    if (!developer) {
      res.status(404).json({
        success: false,
        error: 'No developers found',
      });
      return;
    }

    res.json({
      success: true,
      data: developer,
    });
  } catch (error: any) {
    console.error('Error fetching developer with lowest points:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get weekly hours report for all developers
 */
export const getWeeklyReport = async (req: Request, res: Response): Promise<void> => {
  try {
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

    res.json({
      success: true,
      data: {
        week: targetWeek,
        year: targetYear,
        developers: report,
      },
    });
  } catch (error: any) {
    console.error('Error generating weekly report:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Add time entry for a developer
 */
export const addTimeEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { taskId, developerId, hours, date, description } = req.body;

    if (!taskId || !developerId || !hours) {
      res.status(400).json({
        success: false,
        error: 'taskId, developerId, and hours are required',
      });
      return;
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

    res.json({
      success: true,
      data: timeEntry,
      message: 'Time entry added successfully',
    });
  } catch (error: any) {
    console.error('Error adding time entry:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

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
