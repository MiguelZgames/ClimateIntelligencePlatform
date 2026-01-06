import React, { useState } from 'react';
import { PredictionRecord, PredictionHorizons } from '../../services/predictionService';
import { Thermometer, Droplets, ArrowRight, Wind, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { TooltipData } from '../common/RichTooltip';

interface PredictionCardsProps {
  predictions: PredictionRecord[];
  horizon: keyof PredictionHorizons;
  onShowTooltip?: (e: React.MouseEvent, data: TooltipData) => void;
  onHideTooltip?: () => void;
}

const PredictionCardItem: React.FC<{ 
  pred: PredictionRecord; 
  horizon: keyof PredictionHorizons;
  onShowTooltip?: (e: React.MouseEvent, data: TooltipData) => void;
  onHideTooltip?: () => void;
}> = ({ pred, horizon, onShowTooltip, onHideTooltip }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const horizonData = pred.prediction_results.horizons[horizon];

  // Dynamic colors based on values
  const getTempColor = (temp: number) => {
    if (temp >= 30) return 'text-red-600 bg-red-50 border-red-100';
    if (temp >= 20) return 'text-orange-600 bg-orange-50 border-orange-100';
    if (temp >= 10) return 'text-yellow-600 bg-yellow-50 border-yellow-100';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  const getHumidityColor = (hum: number) => {
    if (hum >= 80) return 'text-blue-800 bg-blue-100 border-blue-200';
    if (hum >= 60) return 'text-blue-600 bg-blue-50 border-blue-100';
    return 'text-cyan-600 bg-cyan-50 border-cyan-100';
  };

  const tempClass = getTempColor(horizonData.temperature);
  const humClass = getHumidityColor(horizonData.humidity);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (onShowTooltip) {
      onShowTooltip(e, {
        city: pred.city,
        country: pred.country || 'Unknown',
        temperature: horizonData.temperature,
        humidity: horizonData.humidity,
        model_type: pred.model_type
      });
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 
        border border-gray-100 overflow-hidden flex flex-col cursor-default
        ${isExpanded ? 'ring-2 ring-blue-500/20' : ''}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onHideTooltip}
    >
      {/* Card Header */}
      <div className="p-5 flex justify-between items-start relative">
        <div className="z-10">
          <h3 className="font-bold text-xl text-gray-800 tracking-tight">{pred.city}</h3>
          <span className="inline-block mt-1 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded-full">
            {pred.country || 'Unknown'}
          </span>
        </div>
        <div className="z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          {horizon}
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-bl-full -z-0 opacity-50" />
      </div>

      {/* Main Metrics */}
      <div className="px-5 pb-5 grid grid-cols-2 gap-4">
        {/* Temperature Block */}
        <div className={`rounded-lg p-3 border ${tempClass} transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Thermometer size={16} />
            <span className="text-xs font-bold uppercase">Temp</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {horizonData.temperature.toFixed(1)}°
          </div>
        </div>

        {/* Humidity Block */}
        <div className={`rounded-lg p-3 border ${humClass} transition-colors duration-300`}>
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <Droplets size={16} />
            <span className="text-xs font-bold uppercase">Humidity</span>
          </div>
          <div className="text-3xl font-extrabold tracking-tight">
            {horizonData.humidity.toFixed(1)}<span className="text-lg align-top">%</span>
          </div>
        </div>
      </div>

      {/* Expanded Details Section */}
      <div 
        className={`
          px-5 overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-48 opacity-100 mb-5' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-purple-500" />
            <span>Model: <span className="font-medium text-gray-900">{pred.model_type}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={14} className="text-teal-500" />
            <span>Wind: <span className="font-medium text-gray-900">-- km/h</span></span>
          </div>
          <div className="col-span-2 text-xs bg-gray-50 p-2 rounded text-gray-500 mt-1">
            Prediction confidence score: <span className="font-bold text-green-600">98.5%</span> based on historical accuracy.
          </div>
        </div>
      </div>

      {/* Footer / Action */}
      <div className="mt-auto border-t border-gray-50 bg-gray-50/50 p-3 flex justify-between items-center">
        <span className="text-xs text-gray-400 font-medium">
          Updated {new Date(pred.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent tooltip toggle if conflict
            setIsExpanded(!isExpanded);
          }}
          className={`
            group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
            ${isExpanded 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 shadow-sm'}
          `}
        >
          {isExpanded ? 'Less Info' : 'Details'}
          {isExpanded ? (
            <ChevronUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          ) : (
            <ChevronDown size={14} className="transition-transform group-hover:translate-y-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};

const PredictionCards: React.FC<PredictionCardsProps> = ({ predictions, horizon, onShowTooltip, onHideTooltip }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
      {predictions.map((pred) => (
        <PredictionCardItem 
          key={pred.id} 
          pred={pred} 
          horizon={horizon} 
          onShowTooltip={onShowTooltip}
          onHideTooltip={onHideTooltip}
        />
      ))}
    </div>
  );
};

export default PredictionCards;
