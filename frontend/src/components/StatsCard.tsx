interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor?: string;
  valueColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-indigo-100',
  valueColor = 'text-gray-900',
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${valueColor} mt-1`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center text-2xl`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
