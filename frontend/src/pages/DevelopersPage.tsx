import { useState, useEffect } from 'react';
import { getAllDevelopers } from '../services/api';
import { Developer } from '../types';
import DeveloperCard from '../components/DeveloperCard';
import { useNavigate } from 'react-router-dom';

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const response = await getAllDevelopers();
      setDevelopers(response.data);
    } catch (error) {
      console.error('Error fetching developers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500 mt-1">View all developers and their assigned points</p>
      </div>

      {/* Points Legend */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">💡 Tip:</span> Developers are sorted by lowest points first.
          Assign new tasks to developers with fewer points to balance the workload.
        </p>
      </div>

      {/* Developers Grid */}
      {developers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No developers found</p>
          <p className="text-sm text-gray-400 mt-2">
            Sync tasks from ClickUp to populate team members
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {developers.map((dev) => (
            <DeveloperCard
              key={dev.id}
              developer={dev}
              onClick={() => navigate(`/developers/${dev.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
