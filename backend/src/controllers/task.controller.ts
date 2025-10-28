import { Request, Response } from 'express';
import databaseService from '../services/database.service';
import syncService from '../services/sync.service';

const prisma = databaseService.getClient();

/**
 * Get all tasks
 */
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, developerId } = req.query;

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    if (developerId) {
      where.developers = {
        some: {
          id: developerId as string,
        },
      };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        developers: true,
        tags: true,
        customFields: true,
      },
      orderBy: {
        dateCreated: 'desc',
      },
    });

    res.json({
      success: true,
      data: tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error('Error fetching tasks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get single task by ID
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        developers: true,
        tags: true,
        customFields: true,
        timeEntries: {
          include: {
            developer: true,
          },
        },
      },
    });

    if (!task) {
      res.status(404).json({
        success: false,
        error: 'Task not found',
      });
      return;
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    console.error('Error fetching task:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Sync all tasks from ClickUp
 */
export const syncTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await syncService.syncAllTasks();

    if (result.success) {
      // Update all developer points after sync
      await syncService.updateAllDeveloperPoints();

      res.json({
        success: true,
        message: `Successfully synced ${result.tasksCount} tasks`,
        tasksCount: result.tasksCount,
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error syncing tasks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get task statistics
 */
export const getTaskStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalTasks = await prisma.task.count();
    const openTasks = await prisma.task.count({
      where: { dateClosed: null },
    });
    const closedTasks = await prisma.task.count({
      where: { dateClosed: { not: null } },
    });

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalTasks,
        openTasks,
        closedTasks,
        tasksByStatus,
      },
    });
  } catch (error: any) {
    console.error('Error fetching task stats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
