import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeveloperById } from '../services/api';
import type { Developer } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TimeEntryForm from '../components/TimeEntryForm';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/helpers';

export default function DeveloperDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [developer, setDeveloper] = useState<Developer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTimeEntryForm, setShowTimeEntryForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (id) {
      fetchDeveloper();
    }
  }, [id]);

  const fetchDeveloper = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDeveloperById(id!);
      setDeveloper(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load developer');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTime = (taskId: string, taskName: string) => {
    setSelectedTask({ id: taskId, name: taskName });
    setShowTimeEntryForm(true);
  };

  const handleTimeEntrySuccess = () => {
    setShowTimeEntryForm(false);
    setSelectedTask(null);
    fetchDeveloper(); // Refresh data
  };

  if (loading) {
    return <LoadingSpinner message="Loading developer details..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDeveloper} />;
  }

  if (!developer) {
    return <ErrorMessage message="Developer not found" />;
  }

  const activeTasks = developer.tasks?.filter((task) => !task.dateClosed) || [];
  const completedTasks = developer.tasks?.filter((task) => task.dateClosed) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/developers')}
        className="mb-4 text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
      >
        ← Back to Developers
      </button>

      {/* Developer Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
            style={{ backgroundColor: developer.color || '#6366f1' }}
          >
            {developer.initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{developer.username}</h1>
            <p className="text-lg text-gray-600 mt-1">{developer.email}</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-indigo-600 font-medium">Total Points</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{developer.totalPoints}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">Active Tasks</p>
                <p className="text-3xl font-bold text-blue-900 mt-1">{activeTasks.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">Completed Tasks</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{completedTasks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Entry Form */}
      {showTimeEntryForm && selectedTask && (
        <div className="mb-8">
          <TimeEntryForm
            taskId={selectedTask.id}
            taskName={selectedTask.name}
            developerId={developer.id}
            onSuccess={handleTimeEntrySuccess}
            onCancel={() => {
              setShowTimeEntryForm(false);
              setSelectedTask(null);
            }}
          />
        </div>
      )}

      {/* Active Tasks */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Active Tasks</h2>
        {activeTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTasks.map((task) => (
              <div key={task.id} className="relative">
                <TaskCard task={task} />
                <button
                  onClick={() => handleAddTime(task.id, task.name)}
                  className="mt-2 w-full px-3 py-2 bg-indigo-50 text-indigo-700 text-sm rounded-md hover:bg-indigo-100 transition-colors"
                >
                  + Add Time Entry
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📝"
            title="No active tasks"
            description="This developer doesn't have any active tasks at the moment."
          />
        )}
      </div>

      {/* Time Entries */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Time Entries</h2>
        {developer.timeEntries && developer.timeEntries.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {developer.timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(entry.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.task?.name || 'Unknown Task'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                      {entry.hours}h
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {entry.description || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="⏱️"
            title="No time entries"
            description="No time has been logged yet. Add time entries to track work on tasks."
          />
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Completed Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* No Tasks Message */}
      {activeTasks.length === 0 && completedTasks.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-500">No tasks assigned to this developer yet.</p>
        </div>
      )}
    </div>
  );
}
