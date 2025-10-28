import { useState, useEffect } from 'react';
import { getAllTasks, getAllDevelopers, getTaskStats, syncTasks } from '../services/api';
import { Task, Developer, TaskStats } from '../types';
import TaskCard from '../components/TaskCard';
import DeveloperCard from '../components/DeveloperCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatsCard from '../components/StatsCard';
import { useToast } from '../components/ToastContainer';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksRes, devsRes, statsRes] = await Promise.all([
        getAllTasks(),
        getAllDevelopers(),
        getTaskStats(),
      ]);

      setTasks(tasksRes.data.slice(0, 6)); // Show only 6 recent tasks
      setDevelopers(devsRes.data.slice(0, 4)); // Show only 4 developers
      setStats(statsRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.error || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncTasks();
      await fetchData();
      showToast(`Successfully synced ${result.tasksCount} tasks from ClickUp!`, 'success');
    } catch (error: any) {
      console.error('Error syncing:', error);
      showToast(error.response?.data?.error || 'Failed to sync tasks', 'error');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">ClickUp Task & Points Management</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {syncing ? 'Syncing...' : '🔄 Sync from ClickUp'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon="📋"
            iconBgColor="bg-indigo-100"
          />
          <StatsCard
            title="Open Tasks"
            value={stats.openTasks}
            icon="🔵"
            iconBgColor="bg-blue-100"
            valueColor="text-blue-600"
          />
          <StatsCard
            title="Completed"
            value={stats.closedTasks}
            icon="✅"
            iconBgColor="bg-green-100"
            valueColor="text-green-600"
          />
        </div>
      )}

      {/* Developers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
          <button
            onClick={() => navigate('/developers')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {developers.map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              onClick={() => navigate(`/developers/${dev.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}
