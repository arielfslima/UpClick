import { Request, Response } from 'express';
import clickupService from '../services/clickup.service';
import syncService from '../services/sync.service';
import { ClickUpWebhookEvent } from '../types/clickup.types';

/**
 * Handle ClickUp webhook events
 */
export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const event: ClickUpWebhookEvent = req.body;

    console.log(`📨 Received webhook event: ${event.event} for task ${event.task_id}`);

    // Acknowledge receipt immediately
    res.status(200).json({ received: true });

    // Process the event asynchronously
    processWebhookEvent(event).catch((error) => {
      console.error('Error processing webhook event:', error.message);
    });
  } catch (error: any) {
    console.error('Error handling webhook:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Process webhook event
 */
async function processWebhookEvent(event: ClickUpWebhookEvent): Promise<void> {
  try {
    const { event: eventType, task_id } = event;

    // Fetch the updated task from ClickUp
    const task = await clickupService.getTask(task_id);

    // Sync the task to database
    await syncService.syncTask(task);

    // Update developer points if assignees changed
    if (
      eventType === 'taskAssigneeUpdated' ||
      eventType === 'taskCreated' ||
      eventType === 'taskDeleted'
    ) {
      await syncService.updateAllDeveloperPoints();
    }

    console.log(`✅ Webhook event ${eventType} processed for task ${task_id}`);
  } catch (error: any) {
    console.error('Error processing webhook event:', error.message);
    throw error;
  }
}

/**
 * Register webhook with ClickUp
 */
export const registerWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:3001/api/webhooks/clickup';

    const events = [
      'taskCreated',
      'taskUpdated',
      'taskDeleted',
      'taskAssigneeUpdated',
      'taskStatusUpdated',
      'taskTimeEstimateUpdated',
      'taskPriorityUpdated',
    ];

    const webhook = await clickupService.createWebhook(webhookUrl, events);

    res.json({
      success: true,
      data: webhook,
      message: 'Webhook registered successfully',
    });
  } catch (error: any) {
    console.error('Error registering webhook:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all webhooks
 */
export const getWebhooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhooks = await clickupService.getWebhooks();

    res.json({
      success: true,
      data: webhooks,
      count: webhooks.length,
    });
  } catch (error: any) {
    console.error('Error fetching webhooks:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a webhook
 */
export const deleteWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await clickupService.deleteWebhook(id);

    res.json({
      success: true,
      message: 'Webhook deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting webhook:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
