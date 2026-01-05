import React from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import MultiSelect from './MultiSelect';

interface FiltersProps {
  cities: string[];
  selectedCities: string[];
  onCityChange: (cities: string[]) => void;
  timeRangeType: string;
  onTimeRangeChange: (type: string, range: { start: string; end: string }) => void;
  onApply: () => void;
  onReset: () => void;
  loading: boolean;
}

export default function DashboardFilters({
  cities,
  selectedCities,
  onCityChange,
  timeRangeType,
  onTimeRangeChange,
  onApply,
  onReset,
  loading
}: FiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        {/* City Filter */}
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cities</label>
          <MultiSelect 
            options={cities}
            selected={selectedCities}
            onChange={onCityChange}
            placeholder="Select specific cities"
          />
          <p className="text-xs text-gray-500 mt-1">Select one or more cities to compare</p>
        </div>

        {/* Date Range - Simplified for MVP */}
        <div className="w-full md:w-auto">
           <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
           <div className="relative">
               <select 
                 className="w-full md:w-48 border rounded-md p-2 pl-9 text-sm h-[42px] appearance-none bg-white"
                 value={timeRangeType} 
                 onChange={(e) => {
                     const val = e.target.value;
                     const now = new Date();
                     let start = "";
                     if(val === 'today') {
                         start = new Date(now.setDate(now.getDate() - 1)).toISOString();
                     } else if (val === 'week') {
                         start = new Date(now.setDate(now.getDate() - 7)).toISOString();
                     } else {
                         start = ""; // All time
                     }
                     onTimeRangeChange(val, { start, end: new Date().toISOString() });
                 }}
               >
                   <option value="all">All Time</option>
                   <option value="today">Last 24 Hours</option>
                   <option value="week">Last 7 Days</option>
               </select>
               <Calendar size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
           </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={onApply}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors h-[42px] shadow-sm"
          >
            <Filter size={16} />
            {loading ? 'Loading...' : 'Apply'}
          </button>
          <button
            onClick={onReset}
            disabled={loading}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-50 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 border border-gray-200 transition-colors h-[42px]"
          >
            <X size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
