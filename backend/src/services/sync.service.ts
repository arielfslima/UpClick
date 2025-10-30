import clickupService from './clickup.service';
import databaseService from './database.service';
import { ClickUpTask } from '../types/clickup.types';
import logger from '../utils/logger';

class SyncService {
  private prisma = databaseService.getClient();

  /**
   * Sync all tasks from ClickUp to database
   */
  async syncAllTasks(): Promise<{ success: boolean; tasksCount: number; error?: string }> {
    try {
      logger.info('🔄 Starting full sync from ClickUp...');

      // Fetch all lists first so we can get list names
      const lists = await clickupService.getLists();
      logger.info(`📦 Found ${lists.length} lists`);

      let syncedCount = 0;

      // Process each list and its tasks
      for (const list of lists) {
        logger.info(`📥 Processing tasks from list: ${list.name}`);
        const tasks = await clickupService.getTasksFromList(list.id);

        for (const clickupTask of tasks) {
          await this.syncTask(clickupTask, list.id, list.name);
          syncedCount++;

          if (syncedCount % 10 === 0) {
            logger.info(`✅ Synced ${syncedCount} tasks`);
          }
        }
      }

      // Log the sync
      await this.prisma.syncLog.create({
        data: {
          type: 'full_sync',
          status: 'success',
          tasksCount: syncedCount,
        },
      });

      logger.info(`✅ Sync completed! ${syncedCount} tasks synced.`);

      return { success: true, tasksCount: syncedCount };
    } catch (error: any) {
      logger.error('❌ Sync failed:', error.message);

      // Log the error
      await this.prisma.syncLog.create({
        data: {
          type: 'full_sync',
          status: 'error',
          errorMessage: error.message,
        },
      });

      return { success: false, tasksCount: 0, error: error.message };
    }
  }

  /**
   * Sync a single task
   */
  async syncTask(clickupTask: ClickUpTask, listId?: string, listName?: string): Promise<void> {
    try {
      // Sync developers (assignees)
      for (const assignee of clickupTask.assignees) {
        await this.prisma.developer.upsert({
          where: { clickupId: assignee.id },
          update: {
            username: assignee.username,
            email: assignee.email,
            initials: assignee.initials,
            color: assignee.color,
            profilePicture: assignee.profilePicture || null,
          },
          create: {
            clickupId: assignee.id,
            username: assignee.username,
            email: assignee.email,
            initials: assignee.initials,
            color: assignee.color,
            profilePicture: assignee.profilePicture || null,
          },
        });
      }

      // Extract points from custom fields
      let points: number | null = null;
      if (clickupTask.custom_fields) {
        const pointsField = clickupTask.custom_fields.find(
          (field) => field.name.toLowerCase() === 'points' || field.name.toLowerCase() === 'story points'
        );
        if (pointsField && pointsField.value !== null) {
          points = typeof pointsField.value === 'number'
            ? pointsField.value
            : parseFloat(pointsField.value);
          logger.debug(`✅ Found points field for task "${clickupTask.name}": ${points}`);
        } else {
          logger.debug(`⚠️ No points field found for task "${clickupTask.name}"`);
        }
      }

      // Use provided list info or default values
      const taskListId = listId || 'unknown';
      const taskListName = listName || 'Unknown List';

      // Upsert the task
      const task = await this.prisma.task.upsert({
        where: { id: clickupTask.id },
        update: {
          name: clickupTask.name,
          description: clickupTask.description || null,
          status: clickupTask.status.status,
          statusColor: clickupTask.status.color,
          priority: clickupTask.priority?.priority || null,
          priorityColor: clickupTask.priority?.color || null,
          url: clickupTask.url,
          timeEstimate: clickupTask.time_estimate,
          timeSpent: clickupTask.time_spent,
          points,
          dueDate: clickupTask.due_date ? new Date(parseInt(clickupTask.due_date)) : null,
          dateUpdated: new Date(parseInt(clickupTask.date_updated)),
          dateClosed: clickupTask.date_closed ? new Date(parseInt(clickupTask.date_closed)) : null,
        },
        create: {
          id: clickupTask.id,
          name: clickupTask.name,
          description: clickupTask.description || null,
          status: clickupTask.status.status,
          statusColor: clickupTask.status.color,
          priority: clickupTask.priority?.priority || null,
          priorityColor: clickupTask.priority?.color || null,
          url: clickupTask.url,
          timeEstimate: clickupTask.time_estimate,
          timeSpent: clickupTask.time_spent,
          points,
          dueDate: clickupTask.due_date ? new Date(parseInt(clickupTask.due_date)) : null,
          dateCreated: new Date(parseInt(clickupTask.date_created)),
          dateUpdated: new Date(parseInt(clickupTask.date_updated)),
          dateClosed: clickupTask.date_closed ? new Date(parseInt(clickupTask.date_closed)) : null,
          creatorId: clickupTask.creator.id,
          creatorUsername: clickupTask.creator.username,
          creatorEmail: clickupTask.creator.email,
          listId: taskListId,
          listName: taskListName,
          spaceId: clickupTask.space.id,
        },
      });

      // Sync assignees (many-to-many relationship)
      const developerIds = await Promise.all(
        clickupTask.assignees.map(async (assignee) => {
          const dev = await this.prisma.developer.findUnique({
            where: { clickupId: assignee.id },
          });
          return dev!.id;
        })
      );

      await this.prisma.task.update({
        where: { id: task.id },
        data: {
          developers: {
            set: developerIds.map((id) => ({ id })),
          },
        },
      });

      // Delete existing tags and custom fields before recreating
      await this.prisma.taskTag.deleteMany({
        where: { taskId: task.id },
      });

      await this.prisma.customField.deleteMany({
        where: { taskId: task.id },
      });

      // Sync tags
      if (clickupTask.tags && clickupTask.tags.length > 0) {
        await this.prisma.taskTag.createMany({
          data: clickupTask.tags.map((tag) => ({
            taskId: task.id,
            name: tag.name,
            fgColor: tag.tag_fg,
            bgColor: tag.tag_bg,
          })),
        });
      }

      // Sync custom fields
      if (clickupTask.custom_fields && clickupTask.custom_fields.length > 0) {
        await this.prisma.customField.createMany({
          data: clickupTask.custom_fields.map((field) => ({
            taskId: task.id,
            fieldId: field.id,
            name: field.name,
            type: field.type,
            value: field.value ? JSON.stringify(field.value) : null,
          })),
        });
      }
    } catch (error: any) {
      logger.error(`Error syncing task ${clickupTask.id}:`, error.message);
      throw error;
    }
  }

  /**
   * Calculate and update developer points
   */
  async updateDeveloperPoints(developerId: string): Promise<void> {
    try {
      // Get all tasks assigned to this developer
      const developer = await this.prisma.developer.findUnique({
        where: { id: developerId },
        include: {
          tasks: {
            where: {
              dateClosed: null, // Only count open tasks
            },
          },
        },
      });

      if (!developer) {
        throw new Error(`Developer ${developerId} not found`);
      }

      // Calculate total points
      const totalPoints = developer.tasks.reduce((sum, task) => {
        return sum + (task.points || 0);
      }, 0);

      // Update the developer's total points
      await this.prisma.developer.update({
        where: { id: developerId },
        data: { totalPoints },
      });

      logger.info(`✅ Updated points for ${developer.username}: ${totalPoints}`);
    } catch (error: any) {
      logger.error(`Error updating developer points:`, error.message);
      throw error;
    }
  }

  /**
   * Update all developer points
   */
  async updateAllDeveloperPoints(): Promise<void> {
    const developers = await this.prisma.developer.findMany();

    for (const developer of developers) {
      await this.updateDeveloperPoints(developer.id);
    }
  }

  /**
   * Get developer with lowest points
   */
  async getDeveloperWithLowestPoints(): Promise<any> {
    return await this.prisma.developer.findFirst({
      orderBy: {
        totalPoints: 'asc',
      },
    });
  }
}

export default new SyncService();
