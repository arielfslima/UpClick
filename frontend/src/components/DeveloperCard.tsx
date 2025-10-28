import { Developer } from '../types';

interface DeveloperCardProps {
  developer: Developer;
  onClick?: () => void;
}

export default function DeveloperCard({ developer, onClick }: DeveloperCardProps) {
  const taskCount = developer._count?.tasks || developer.tasks?.length || 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 transition-all' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
          style={{ backgroundColor: developer.color || '#6366f1' }}
        >
          {developer.initials}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{developer.username}</h3>
          <p className="text-sm text-gray-500">{developer.email}</p>
        </div>

        {/* Points Badge */}
        <div className="text-right">
          <div className="text-3xl font-bold text-indigo-600">{developer.totalPoints}</div>
          <p className="text-xs text-gray-500">points</p>
        </div>
      </div>

      {/* Task Count */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
        <span className="text-gray-600">Active Tasks</span>
        <span className="font-semibold text-gray-900">{taskCount}</span>
      </div>
    </div>
  );
}
