import React from 'react';
import { MapPin, Thermometer, Droplets } from 'lucide-react';

export interface TooltipData {
  city: string;
  country: string;
  temperature: number;
  humidity: number;
  dewPoint?: number;
  model_type?: string;
}

interface RichTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  data?: TooltipData; // Direct data prop for non-Recharts usage (e.g. Leaflet)
}

export default function RichTooltip({ active, payload, data }: RichTooltipProps) {
  // Handle Recharts payload or direct data
  const tooltipData: TooltipData | null = data || (active && payload && payload.length ? payload[0].payload : null);

  if (!tooltipData) return null;

  // Calculate dew point if not provided
  const dewPoint = tooltipData.dewPoint ?? (tooltipData.temperature - ((100 - tooltipData.humidity) / 5));

  return (
    <div className="bg-white/95 backdrop-blur-md p-4 border border-blue-100 shadow-xl rounded-xl text-sm min-w-[220px] animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
        <div className="bg-blue-100 p-1.5 rounded-full text-blue-600">
            <MapPin size={16} />
        </div>
        <div>
            <p className="font-bold text-gray-800 text-base leading-tight">{tooltipData.city}</p>
            <p className="text-gray-500 text-xs">{tooltipData.country}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
         <div className="bg-red-50 p-2 rounded-lg border border-red-50">
            <div className="flex items-center gap-1.5 text-red-500 mb-1">
                <Thermometer size={14} />
                <span className="text-[10px] font-bold uppercase">Temp</span>
            </div>
            <div className="text-xl font-bold text-gray-800">{tooltipData.temperature.toFixed(1)}°</div>
            <div className="text-[10px] text-gray-400 mt-1">Range: {tooltipData.temperature > 20 ? 'Warm' : 'Cool'}</div>
         </div>
         
         <div className="bg-blue-50 p-2 rounded-lg border border-blue-50">
            <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                <Droplets size={14} />
                <span className="text-[10px] font-bold uppercase">Humidity</span>
            </div>
            <div className="text-xl font-bold text-gray-800">{tooltipData.humidity.toFixed(0)}%</div>
            <div className="text-[10px] text-gray-400 mt-1">Dew Pt: {dewPoint.toFixed(1)}°</div>
         </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-50 p-2 rounded">
         <span>Source:</span>
         <span className="font-mono text-gray-600">{tooltipData.model_type || 'Open-Meteo'}</span>
      </div>
    </div>
  );
}
