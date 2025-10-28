export interface Developer {
  id: string;
  clickupId: number;
  username: string;
  email: string;
  initials: string;
  color?: string;
  profilePicture?: string;
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  _count?: {
    tasks: number;
    timeEntries: number;
  };
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: string;
  statusColor: string;
  priority?: string;
  priorityColor?: string;
  url: string;
  timeEstimate?: number;
  timeSpent?: number;
  points?: number;
  dueDate?: string;
  dateCreated: string;
  dateUpdated: string;
  dateClosed?: string;
  creatorId: number;
  creatorUsername: string;
  creatorEmail: string;
  listId: string;
  listName: string;
  spaceId: string;
  createdAt: string;
  updatedAt: string;
  developers?: Developer[];
  tags?: TaskTag[];
  customFields?: CustomField[];
  timeEntries?: TimeEntry[];
}

export interface TaskTag {
  id: string;
  taskId: string;
  name: string;
  fgColor: string;
  bgColor: string;
}

export interface CustomField {
  id: string;
  taskId: string;
  fieldId: string;
  name: string;
  type: string;
  value?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  developerId: string;
  hours: number;
  date: string;
  week: number;
  year: number;
  description?: string;
  createdAt: string;
  task?: Task;
  developer?: Developer;
}

export interface WeeklyReport {
  week: number;
  year: number;
  developers: {
    developer: Developer;
    totalHours: number;
    tasks: {
      taskId: string;
      taskName: string;
      hours: number;
      date: string;
    }[];
  }[];
}

export interface TaskStats {
  totalTasks: number;
  openTasks: number;
  closedTasks: number;
  tasksByStatus: {
    status: string;
    _count: number;
  }[];
}
