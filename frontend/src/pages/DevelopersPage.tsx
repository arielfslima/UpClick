import { useState, useEffect } from 'react';
import { getAllDevelopers } from '../services/api';
import type { Developer } from '../types';
import DeveloperCard from '../components/DeveloperCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import SkeletonGrid from '../components/SkeletonGrid';
import { useNavigate } from 'react-router-dom';

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
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

  // Pagination calculations
  const totalPages = Math.ceil(developers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDevelopers = developers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6 animate-pulse">
          <div className="h-4 bg-indigo-200 rounded w-full"></div>
        </div>
        <SkeletonGrid count={12} />
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
        <EmptyState
          icon="👥"
          title="No developers found"
          description="Sync tasks from ClickUp to populate team members automatically."
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedDevelopers.map((dev) => (
              <DeveloperCard
                key={dev.id}
                developer={dev}
                onClick={() => navigate(`/developers/${dev.id}`)}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={developers.length}
          />
        </div>
      )}
    </div>
  );
}
