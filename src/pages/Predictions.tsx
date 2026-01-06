import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchLatestPredictions, PredictionRecord, PredictionHorizons } from '../services/predictionService';
import PredictionMap from '../components/predictions/PredictionMap';
import PredictionCards from '../components/predictions/PredictionCards';
import PredictionFilters from '../components/predictions/PredictionFilters';
import { RefreshCw, AlertCircle } from 'lucide-react';
import RichTooltip, { TooltipData } from '../components/common/RichTooltip';

export default function Predictions() {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters State
  const [horizon, setHorizon] = useState<keyof PredictionHorizons>('30m');
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [searchTerm, setSearchTerm] = useState('');

  // Smart Tooltip State
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    data: TooltipData | null;
  }>({ visible: false, x: 0, y: 0, data: null });

  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchLatestPredictions();
      setPredictions(data);
      setFilteredPredictions(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load predictions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = predictions;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.city.toLowerCase().includes(term) || 
        (p.country && p.country.toLowerCase().includes(term))
      );
    }
    
    setFilteredPredictions(result);
  }, [searchTerm, predictions]);

  // Smart Tooltip Logic
  const handleShowTooltip = useCallback((e: React.MouseEvent, data: TooltipData) => {
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    
    // Default position: Top Center of element
    let x = rect.left + rect.width / 2;
    let y = rect.top - 10; // 10px padding

    // Smart positioning logic
    const tooltipWidth = 240; // Approx width
    const tooltipHeight = 150; // Approx height
    
    // Check right edge
    if (x + tooltipWidth / 2 > window.innerWidth - 10) {
        x = window.innerWidth - 10 - tooltipWidth / 2;
    }
    // Check left edge
    if (x - tooltipWidth / 2 < 10) {
        x = 10 + tooltipWidth / 2;
    }
    // Check top edge (flip to bottom if not enough space)
    if (y - tooltipHeight < 10) {
        y = rect.bottom + 10;
    }

    setTooltip({
        visible: true,
        x,
        y,
        data
    });
  }, []);

  const handleHideTooltip = useCallback(() => {
    tooltipTimeoutRef.current = setTimeout(() => {
        setTooltip(prev => ({ ...prev, visible: false }));
    }, 100); // Small delay to prevent flickering
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Global Climate Predictions</h1>
          <p className="text-gray-500 mt-1">
            Real-time XGBoost forecasts for {predictions.length} major cities
          </p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <PredictionFilters
        horizon={horizon}
        setHorizon={setHorizon}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="flex-1">
          {filteredPredictions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              No cities found matching your search.
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                <PredictionMap 
                  predictions={filteredPredictions} 
                  horizon={horizon} 
                />
              ) : (
                <PredictionCards 
                  predictions={filteredPredictions} 
                  horizon={horizon}
                  onShowTooltip={handleShowTooltip}
                  onHideTooltip={handleHideTooltip}
                />
              )}
            </>
          )}
        </div>
      )}
      
      {/* Smart Tooltip Overlay */}
      {tooltip.visible && tooltip.data && (
          <div 
            className="fixed z-50 pointer-events-none transition-all duration-300 ease-in-out"
            style={{ 
                left: tooltip.x, 
                top: tooltip.y, 
                transform: 'translate(-50%, -100%)', // Default anchor bottom-center
                opacity: tooltip.visible ? 1 : 0
            }}
            role="tooltip"
            aria-hidden={!tooltip.visible}
          >
              <div className="mb-2"> {/* Spacer */}
                <RichTooltip data={tooltip.data} />
              </div>
          </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <h4 className="font-bold mb-2">About this Dashboard</h4>
        <p>
          This dashboard visualizes temperature and humidity predictions generated by our XGBoost ensemble models.
          Data is updated hourly. Short-term (30m), medium-term (60m), and long-term (120m) forecasts are available.
        </p>
      </div>
    </div>
  );
}
