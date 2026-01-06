import React from 'react';
import { PredictionHorizons } from '../../services/predictionService';
import { Clock, Map as MapIcon, Grid, Search } from 'lucide-react';

interface PredictionFiltersProps {
  horizon: keyof PredictionHorizons;
  setHorizon: (h: keyof PredictionHorizons) => void;
  viewMode: 'map' | 'cards';
  setViewMode: (v: 'map' | 'cards') => void;
  searchTerm: string;
  setSearchTerm: (s: string) => void;
}

const PredictionFilters: React.FC<PredictionFiltersProps> = ({
  horizon,
  setHorizon,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
      
      {/* Search */}
      <div className="w-full md:w-1/3 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search for a city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center w-full md:w-auto justify-end">
        {/* Horizon Filter */}
        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
          <Clock size={16} className="text-gray-400 ml-2" />
          <div className="flex gap-1">
            {(['30m', '60m', '120m'] as const).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  horizon === h
                    ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode */}
        <div className="flex bg-gray-50 p-1.5 rounded-lg border border-gray-100">
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Map View"
          >
            <MapIcon size={18} />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'cards' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            title="Card View"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictionFilters;
