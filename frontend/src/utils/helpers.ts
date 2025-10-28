/**
 * Convert milliseconds to hours
 */
export const msToHours = (ms: number | null | undefined): number => {
  if (!ms) return 0;
  return Math.round((ms / 3600000) * 100) / 100;
};

/**
 * Format hours to readable string
 */
export const formatHours = (hours: number): string => {
  if (hours === 0) return '0h';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours}h`;
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date and time to readable string
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status: string): string => {
  const lowerStatus = status.toLowerCase();

  if (lowerStatus.includes('done') || lowerStatus.includes('complete')) {
    return 'bg-green-100 text-green-800';
  }
  if (lowerStatus.includes('progress') || lowerStatus.includes('active')) {
    return 'bg-blue-100 text-blue-800';
  }
  if (lowerStatus.includes('review')) {
    return 'bg-purple-100 text-purple-800';
  }
  if (lowerStatus.includes('todo') || lowerStatus.includes('open')) {
    return 'bg-gray-100 text-gray-800';
  }
  if (lowerStatus.includes('blocked')) {
    return 'bg-red-100 text-red-800';
  }

  return 'bg-gray-100 text-gray-800';
};

/**
 * Get priority badge color
 */
export const getPriorityBadgeColor = (priority: string): string => {
  const lowerPriority = priority.toLowerCase();

  if (lowerPriority.includes('urgent')) {
    return 'bg-red-100 text-red-800';
  }
  if (lowerPriority.includes('high')) {
    return 'bg-orange-100 text-orange-800';
  }
  if (lowerPriority.includes('normal') || lowerPriority.includes('medium')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  if (lowerPriority.includes('low')) {
    return 'bg-green-100 text-green-800';
  }

  return 'bg-gray-100 text-gray-800';
};

/**
 * Calculate week number
 */
export const getWeekNumber = (date: Date = new Date()): { week: number; year: number } => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};
