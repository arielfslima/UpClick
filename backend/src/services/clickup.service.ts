import axios, { AxiosInstance } from 'axios';
import { ClickUpTask, ClickUpList, ClickUpSpace } from '../types/clickup.types';

class ClickUpService {
  private client: AxiosInstance;
  private apiToken: string;
  private workspaceId: string;
  private spaceId: string;

  constructor() {
    this.apiToken = process.env.CLICKUP_API_TOKEN || '';
    this.workspaceId = process.env.CLICKUP_WORKSPACE_ID || '';
    this.spaceId = process.env.CLICKUP_SPACE_ID || '';

    if (!this.apiToken) {
      throw new Error('CLICKUP_API_TOKEN is not set in environment variables');
    }

    this.client = axios.create({
      baseURL: 'https://api.clickup.com/api/v2',
      headers: {
        Authorization: this.apiToken,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    // Add response interceptor for rate limiting
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 429) {
          console.error('⚠️ ClickUp API rate limit exceeded');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get space information
   */
  async getSpace(): Promise<ClickUpSpace> {
    try {
      const response = await this.client.get(`/space/${this.spaceId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching space:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all lists in the space
   */
  async getLists(): Promise<ClickUpList[]> {
    try {
      const response = await this.client.get(`/space/${this.spaceId}/list`, {
        params: {
          archived: false,
        },
      });
      return response.data.lists || [];
    } catch (error: any) {
      console.error('Error fetching lists:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get tasks from a specific list
   */
  async getTasksFromList(listId: string, includeArchived = false): Promise<ClickUpTask[]> {
    try {
      const response = await this.client.get(`/list/${listId}/task`, {
        params: {
          archived: includeArchived,
          include_closed: true,
          page: 0,
          order_by: 'created',
          reverse: false,
          subtasks: true,
          include_markdown_description: false,
        },
      });
      return response.data.tasks || [];
    } catch (error: any) {
      console.error(`Error fetching tasks from list ${listId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all tasks from all lists in the space
   */
  async getAllTasks(): Promise<ClickUpTask[]> {
    try {
      console.log('📥 Fetching all lists...');
      const lists = await this.getLists();
      console.log(`✅ Found ${lists.length} lists`);

      const allTasks: ClickUpTask[] = [];

      for (const list of lists) {
        console.log(`📥 Fetching tasks from list: ${list.name}`);
        const tasks = await this.getTasksFromList(list.id);
        allTasks.push(...tasks);
        console.log(`✅ Found ${tasks.length} tasks in ${list.name}`);

        // Add small delay to avoid rate limiting
        await this.delay(100);
      }

      console.log(`✅ Total tasks fetched: ${allTasks.length}`);
      return allTasks;
    } catch (error: any) {
      console.error('Error fetching all tasks:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(taskId: string): Promise<ClickUpTask> {
    try {
      const response = await this.client.get(`/task/${taskId}`, {
        params: {
          include_subtasks: true,
          include_markdown_description: false,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching task ${taskId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Create a webhook for the space
   */
  async createWebhook(webhookUrl: string, events: string[]): Promise<any> {
    try {
      const response = await this.client.post(`/webhook`, {
        endpoint: webhookUrl,
        events,
        space_id: this.spaceId,
      });
      console.log('✅ Webhook created successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error creating webhook:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get all webhooks for the workspace
   */
  async getWebhooks(): Promise<any[]> {
    try {
      const response = await this.client.get(`/team/${this.workspaceId}/webhook`);
      return response.data.webhooks || [];
    } catch (error: any) {
      console.error('Error fetching webhooks:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    try {
      await this.client.delete(`/webhook/${webhookId}`);
      console.log(`✅ Webhook ${webhookId} deleted successfully`);
    } catch (error: any) {
      console.error(`Error deleting webhook ${webhookId}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Update task time estimate
   */
  async updateTaskTimeEstimate(taskId: string, timeEstimateMs: number): Promise<void> {
    try {
      await this.client.put(`/task/${taskId}`, {
        time_estimate: timeEstimateMs,
      });
      console.log(`✅ Updated time estimate for task ${taskId}`);
    } catch (error: any) {
      console.error(`Error updating task time estimate:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Assign task to a user
   */
  async assignTask(taskId: string, userId: number, operation: 'add' | 'rem' = 'add'): Promise<void> {
    try {
      const endpoint = operation === 'add'
        ? `/task/${taskId}/assignee/${userId}`
        : `/task/${taskId}/assignee/${userId}`;

      if (operation === 'add') {
        await this.client.post(endpoint);
      } else {
        await this.client.delete(endpoint);
      }
      console.log(`✅ ${operation === 'add' ? 'Assigned' : 'Unassigned'} user ${userId} to task ${taskId}`);
    } catch (error: any) {
      console.error(`Error assigning task:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Utility to add delay (for rate limiting)
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convert milliseconds to hours
   */
  static msToHours(ms: number | null): number {
    if (!ms) return 0;
    return Math.round((ms / 3600000) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Convert hours to milliseconds
   */
  static hoursToMs(hours: number): number {
    return hours * 3600000;
  }
}

export default new ClickUpService();
