import React from 'react';
import { ThermometerSun, ThermometerSnowflake, Droplets, Globe } from 'lucide-react';

interface MetricCardProps {
  title: string;
  icon: React.ReactNode;
  data: { label: string; value: string | number }[];
  colorClass: string;
}

const MetricCard = ({ title, icon, data, colorClass }: MetricCardProps) => (
  <div className={`bg-white p-4 rounded-xl shadow-md border-l-4 ${colorClass}`}>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="font-semibold text-gray-700">{title}</h3>
    </div>
    <div className="space-y-2">
      {data.length > 0 ? (
        data.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-1 last:border-0">
            <span className="font-medium text-gray-600 truncate max-w-[120px]" title={item.label}>{item.label}</span>
            <span className="font-bold text-gray-800">{item.value}</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400">No data available</p>
      )}
    </div>
  </div>
);

interface DashboardMetricsProps {
  stats: {
    maxTemps: { city: string; temperature: number }[];
    minTemps: { city: string; temperature: number }[];
    maxHumidity: { city: string; humidity: number }[];
    minHumidity: { city: string; humidity: number }[];
    totalCountries: number;
    totalCities: number;
  };
}

export default function DashboardMetrics({ stats }: DashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="text-blue-200" size={24} />
            <h3 className="text-lg font-medium text-blue-100">Coverage</h3>
          </div>
          <p className="text-4xl font-bold mt-2">{stats.totalCountries}</p>
          <p className="text-sm text-blue-200">Countries</p>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-500/30 flex justify-between items-center">
            <div>
                <span className="text-2xl font-bold">{stats.totalCities}</span>
                <span className="text-xs text-blue-200 ml-2">Cities</span>
            </div>
        </div>
      </div>

      {/* Max Temp */}
      <MetricCard
        title="Hottest Cities"
        icon={<ThermometerSun className="text-orange-500" size={20} />}
        colorClass="border-orange-500"
        data={stats.maxTemps.map(d => ({ label: d.city, value: `${d.temperature}°C` }))}
      />

      {/* Min Temp */}
      <MetricCard
        title="Coldest Cities"
        icon={<ThermometerSnowflake className="text-cyan-500" size={20} />}
        colorClass="border-cyan-500"
        data={stats.minTemps.map(d => ({ label: d.city, value: `${d.temperature}°C` }))}
      />

      {/* Max Humidity */}
      <MetricCard
        title="High Humidity"
        icon={<Droplets className="text-blue-500" size={20} />}
        colorClass="border-blue-500"
        data={stats.maxHumidity.map(d => ({ label: d.city, value: `${d.humidity}%` }))}
      />

      {/* Min Humidity */}
      <MetricCard
        title="Low Humidity"
        icon={<Droplets className="text-yellow-500" size={20} />}
        colorClass="border-yellow-500"
        data={stats.minHumidity.map(d => ({ label: d.city, value: `${d.humidity}%` }))}
      />
    </div>
  );
}
