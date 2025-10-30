import { z } from 'zod';

// Developer schemas
export const addTimeEntrySchema = z.object({
  body: z.object({
    taskId: z.string().min(1, 'Task ID is required'),
    developerId: z.string().uuid('Invalid developer ID format'),
    hours: z
      .number()
      .positive('Hours must be positive')
      .max(24, 'Hours cannot exceed 24 per entry')
      .refine((val) => Number.isFinite(val), 'Hours must be a valid number'),
    date: z.string().datetime().optional(),
    description: z.string().max(500, 'Description too long').optional(),
  }),
});

export const getDeveloperByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid developer ID format'),
  }),
});

export const weeklyReportSchema = z.object({
  query: z.object({
    week: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => val === undefined || (val >= 1 && val <= 53),
        'Week must be between 1 and 53'
      ),
    year: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : undefined))
      .refine(
        (val) => val === undefined || (val >= 2000 && val <= 2100),
        'Year must be between 2000 and 2100'
      ),
  }),
});

// Task schemas
export const getTasksSchema = z.object({
  query: z.object({
    status: z
      .string()
      .optional()
      .refine(
        (val) =>
          !val ||
          [
            'open',
            'in progress',
            'review',
            'closed',
            'to do',
            'complete',
          ].includes(val.toLowerCase()),
        'Invalid status value'
      ),
    developerId: z.string().uuid('Invalid developer ID format').optional(),
  }),
});

export const getTaskByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Task ID is required'),
  }),
});

// Webhook schemas
export const registerWebhookSchema = z.object({
  body: z.object({
    endpoint: z.string().url('Invalid endpoint URL').optional(),
    events: z
      .array(
        z.enum([
          'taskCreated',
          'taskUpdated',
          'taskDeleted',
          'taskCommentPosted',
          'taskAssigneeUpdated',
          'taskStatusUpdated',
          'taskPriorityUpdated',
          'taskDueDateUpdated',
        ])
      )
      .optional(),
  }),
});

export const clickupWebhookSchema = z.object({
  body: z.object({
    event: z.string(),
    task_id: z.string().optional(),
    webhook_id: z.string().optional(),
    history_items: z.array(z.any()).optional(),
  }),
});

// Settings schemas
export const updateSettingsSchema = z.object({
  body: z.object({
    clickupApiToken: z.string().min(10, 'Invalid API token').optional(),
    clickupWorkspaceId: z.string().min(1, 'Invalid workspace ID').optional(),
    clickupSpaceId: z.string().min(1, 'Invalid space ID').optional(),
    autoSync: z.boolean().optional(),
    syncInterval: z
      .number()
      .int()
      .min(5, 'Sync interval must be at least 5 minutes')
      .max(1440, 'Sync interval cannot exceed 24 hours')
      .optional(),
  }),
});
