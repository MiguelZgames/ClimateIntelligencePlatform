import React, { useEffect, useState } from 'react';
import { Calendar, Filter, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
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
  
  // Debounce effect for auto-apply
  useEffect(() => {
    const timer = setTimeout(() => {
      onApply();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [selectedCities, timeRangeType]); // Re-run when filters change

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-4 text-gray-800 font-bold border-b border-gray-50 pb-2">
        <SlidersHorizontal size={18} className="text-blue-600" />
        <h3>Data Filters</h3>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* City Filter */}
        <div className="flex-1 w-full space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Locations
          </label>
          <MultiSelect 
            options={cities}
            selected={selectedCities}
            onChange={onCityChange}
            placeholder="Select specific cities"
          />
          <p className="text-[10px] text-gray-400 flex items-center gap-1">
             <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block"></span>
             {selectedCities.includes('All') ? 'Showing Global Overview' : 'Comparing selected cities'}
          </p>
        </div>

        {/* Date Range */}
        <div className="w-full md:w-64 space-y-1.5">
           <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
             Time Period
           </label>
           <div className="relative group">
               <select 
                 className="w-full border border-gray-200 rounded-lg p-2.5 pl-10 text-sm h-[44px] appearance-none bg-white hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
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
                   <option value="all">All History</option>
                   <option value="today">Last 24 Hours</option>
                   <option value="week">Last 7 Days</option>
               </select>
               <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none" />
           </div>
        </div>

        {/* Actions (Reset Only, since Apply is auto) */}
        <div className="flex gap-2 w-full md:w-auto mt-auto pt-6">
          <button
            onClick={onReset}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-100 hover:text-red-600 border border-gray-200 transition-all h-[44px] text-sm font-medium w-full md:w-auto"
            title="Reset all filters"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
      
      {loading && (
          <div className="h-1 w-full bg-blue-50 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 animate-progress origin-left w-full"></div>
          </div>
      )}
    </div>
  );
}
