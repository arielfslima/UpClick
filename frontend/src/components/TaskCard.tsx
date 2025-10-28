import { Task } from '../types';
import { msToHours, formatDate, getStatusBadgeColor, getPriorityBadgeColor } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const hours = msToHours(task.timeEstimate);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <a
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
          >
            {task.name}
          </a>
          <p className="text-sm text-gray-500 mt-1">{task.listName}</p>
        </div>
        {task.points && (
          <div className="ml-4 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold">
            {task.points}
          </div>
        )}
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Status and Priority */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
            task.status
          )}`}
          style={{ backgroundColor: task.statusColor + '20', color: task.statusColor }}
        >
          {task.status}
        </span>
        {task.priority && (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        )}
        {hours > 0 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ⏱ {hours}h
          </span>
        )}
      </div>

      {/* Assignees */}
      {task.developers && task.developers.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500">Assigned to:</span>
          <div className="flex -space-x-2">
            {task.developers.map((dev) => (
              <div
                key={dev.id}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
                style={{ backgroundColor: dev.color || '#6366f1' }}
                title={dev.username}
              >
                {dev.initials}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {task.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs"
              style={{ backgroundColor: tag.bgColor, color: tag.fgColor }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Created {formatDate(task.dateCreated)}</span>
        {task.dueDate && (
          <span className="text-orange-600 font-medium">Due {formatDate(task.dueDate)}</span>
        )}
      </div>
    </div>
  );
}
