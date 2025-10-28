import axios from 'axios';
import type { Task, Developer, WeeklyReport, TaskStats, TimeEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tasks
export const getAllTasks = async (params?: { status?: string; developerId?: string }) => {
  const response = await api.get<{ success: boolean; data: Task[]; count: number }>('/tasks', {
    params,
  });
  return response.data;
};

export const getTaskById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`);
  return response.data;
};

export const syncTasks = async () => {
  const response = await api.post<{ success: boolean; message: string; tasksCount: number }>(
    '/tasks/sync'
  );
  return response.data;
};

export const getTaskStats = async () => {
  const response = await api.get<{ success: boolean; data: TaskStats }>('/tasks/stats');
  return response.data;
};

// Developers
export const getAllDevelopers = async () => {
  const response = await api.get<{ success: boolean; data: Developer[]; count: number }>(
    '/developers'
  );
  return response.data;
};

export const getDeveloperById = async (id: string) => {
  const response = await api.get<{ success: boolean; data: Developer }>(`/developers/${id}`);
  return response.data;
};

export const getDeveloperWithLowestPoints = async () => {
  const response = await api.get<{ success: boolean; data: Developer }>(
    '/developers/lowest-points'
  );
  return response.data;
};

export const getWeeklyReport = async (week?: number, year?: number) => {
  const response = await api.get<{ success: boolean; data: WeeklyReport }>(
    '/developers/weekly-report',
    {
      params: { week, year },
    }
  );
  return response.data;
};

export const addTimeEntry = async (data: {
  taskId: string;
  developerId: string;
  hours: number;
  date?: string;
  description?: string;
}) => {
  const response = await api.post<{ success: boolean; data: TimeEntry; message: string }>(
    '/developers/time-entry',
    data
  );
  return response.data;
};

// Webhooks
export const registerWebhook = async () => {
  const response = await api.post<{ success: boolean; data: any; message: string }>(
    '/webhooks/register'
  );
  return response.data;
};

export const getWebhooks = async () => {
  const response = await api.get<{ success: boolean; data: any[]; count: number }>('/webhooks');
  return response.data;
};

export const deleteWebhook = async (id: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/webhooks/${id}`);
  return response.data;
};

export default api;
