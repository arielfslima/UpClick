import { useState, useEffect } from 'react';
import { getWeeklyReport } from '../services/api';
import type { WeeklyReport } from '../types';
import { getWeekNumber } from '../utils/helpers';

export default function ReportsPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const { week: currentWeek, year: currentYear } = getWeekNumber();
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    fetchReport();
  }, [selectedWeek, selectedYear]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await getWeeklyReport(selectedWeek, selectedYear);
      setReport(response.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalHours = () => {
    if (!report) return 0;
    return report.developers.reduce((sum, dev) => sum + dev.totalHours, 0);
  };

  const handlePreviousWeek = () => {
    if (selectedWeek === 1) {
      setSelectedWeek(52);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek === 52) {
      setSelectedWeek(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;

    const headers = ['Developer', 'Email', 'Total Hours', 'Task ID', 'Task Name', 'Hours', 'Date'];
    const rows = report.developers.flatMap((dev) =>
      dev.tasks.map((task) => [
        dev.developer.username,
        dev.developer.email,
        dev.totalHours,
        task.taskId,
        task.taskName,
        task.hours,
        task.date,
      ])
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-report-w${selectedWeek}-${selectedYear}.csv`;
    a.click();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weekly Report</h1>
          <p className="text-gray-500 mt-1">Hours tracked and payout calculation</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={!report || report.developers.length === 0}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          📥 Export CSV
        </button>
      </div>

      {/* Week Selector */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            ← Previous Week
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600">Week</p>
            <p className="text-2xl font-bold text-gray-900">
              {selectedWeek} / {selectedYear}
            </p>
          </div>

          <button
            onClick={handleNextWeek}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Total Hours</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{calculateTotalHours().toFixed(2)}h</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Team Members</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {report?.developers.length || 0}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600">Tasks Worked</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {report?.developers.reduce((sum, dev) => sum + dev.tasks.length, 0) || 0}
          </p>
        </div>
      </div>

      {/* Developer Reports */}
      {!report || report.developers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No time entries for this week</p>
          <p className="text-sm text-gray-400 mt-2">
            Add time entries for tasks to see them in the report
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {report.developers.map((devReport) => (
            <div
              key={devReport.developer.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Developer Header */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: devReport.developer.color || '#6366f1' }}
                  >
                    {devReport.developer.initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {devReport.developer.username}
                    </h3>
                    <p className="text-sm text-gray-500">{devReport.developer.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Hours</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {devReport.totalHours.toFixed(2)}h
                  </p>
                </div>
              </div>

              {/* Tasks Table */}
              <div className="p-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                      <th className="pb-3 font-medium">Task</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {devReport.tasks.map((task, idx) => (
                      <tr key={idx} className="text-sm">
                        <td className="py-3 text-gray-900">{task.taskName}</td>
                        <td className="py-3 text-gray-600">
                          {new Date(task.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-gray-900 font-medium text-right">
                          {task.hours.toFixed(2)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
