import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { PredictionRecord, PredictionHorizons } from '../../services/predictionService';
import { MapTooltip } from './MapTooltip';
import { Thermometer, Droplets } from 'lucide-react';

interface PredictionMapProps {
  predictions: PredictionRecord[];
  horizon: keyof PredictionHorizons;
}

const Legend = () => (
  <div className="leaflet-bottom leaflet-left">
    <div className="leaflet-control leaflet-bar bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-xl m-4 text-xs border border-gray-200 grid grid-cols-2 gap-4">
      <div>
        <h4 className="font-bold mb-2 text-gray-700">Temperature (Fill)</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 border border-gray-300"></div><span>&gt; 30°C (Hot)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 border border-gray-300"></div><span>20 - 30°C (Warm)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500 border border-gray-300"></div><span>10 - 20°C (Mild)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500 border border-gray-300"></div><span>0 - 10°C (Cool)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500 border border-gray-300"></div><span>&lt; 0°C (Cold)</span></div>
        </div>
      </div>
      <div>
        <h4 className="font-bold mb-2 text-gray-700">Humidity (Border)</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border-2 border-blue-900"></div><span>&gt; 80% (High)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border-2 border-blue-600"></div><span>60 - 80% (Mod)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border-2 border-cyan-400"></div><span>40 - 60% (Normal)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-100 border-2 border-gray-300"></div><span>&lt; 40% (Dry)</span></div>
        </div>
      </div>
    </div>
  </div>
);

const PredictionMarkers = ({ predictions, horizon }: PredictionMapProps) => {
    const map = useMap();

    const getTempColor = (value: number) => {
        if (value > 30) return '#ef4444'; // red-500
        if (value > 20) return '#f97316'; // orange-500
        if (value > 10) return '#eab308'; // yellow-500
        if (value > 0) return '#3b82f6'; // blue-500
        return '#6366f1'; // indigo-500
    };

    const getHumidityColor = (value: number) => {
        if (value > 80) return '#1e3a8a'; // blue-900
        if (value > 60) return '#2563eb'; // blue-600
        if (value > 40) return '#22d3ee'; // cyan-400
        return '#d1d5db'; // gray-300
    };

    return (
        <>
            {predictions.map((pred) => {
                if (!pred.latitude || !pred.longitude) return null;
                
                const data = pred.prediction_results.horizons[horizon];
                const fillColor = getTempColor(data.temperature);
                const borderColor = getHumidityColor(data.humidity);
                
                return (
                    <CircleMarker
                        key={pred.id}
                        center={[pred.latitude, pred.longitude]}
                        pathOptions={{ 
                            fillColor: fillColor, 
                            color: borderColor, 
                            weight: 3, 
                            opacity: 0.9, 
                            fillOpacity: 0.85 
                        }}
                        radius={7}
                        eventHandlers={{
                            mouseover: (e) => e.target.openTooltip(),
                            mouseout: (e) => e.target.closeTooltip(),
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -8]} opacity={1} className="custom-tooltip">
                            <div className="text-center">
                                <div className="font-bold text-sm">{pred.city}</div>
                                <div className="text-xs flex gap-2 justify-center mt-1">
                                    <span className="text-red-600 font-semibold">{data.temperature.toFixed(1)}°C</span>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-blue-600 font-semibold">{data.humidity.toFixed(1)}%</span>
                                </div>
                            </div>
                        </Tooltip>
                        
                        <Popup className="custom-popup bg-transparent shadow-none border-none p-0">
                            <div className="min-w-[240px]">
                                <MapTooltip
                                    title={pred.city}
                                    subtitle={pred.country || 'Unknown'}
                                    tone="light"
                                    iconColor={fillColor}
                                    onClose={() => map.closePopup()}
                                    leftBlock={
                                        <div className="flex flex-col bg-red-50 p-3 rounded-lg border border-red-100 h-full justify-between">
                                            <div className="flex items-center gap-2 text-red-600 mb-1">
                                                <Thermometer size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Temp</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">{data.temperature.toFixed(1)}°</div>
                                            <div className="text-xs text-red-400 mt-1 font-medium">
                                                {data.temperature > 30 ? 'Hot' : data.temperature > 20 ? 'Warm' : 'Mild'}
                                            </div>
                                        </div>
                                    }
                                    rightBlock={
                                        <div className="flex flex-col bg-blue-50 p-3 rounded-lg border border-blue-100 h-full justify-between">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Droplets size={16} />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-800">{data.humidity.toFixed(1)}%</div>
                                            <div className="text-xs text-blue-400 mt-1 font-medium">
                                                Dew Pt: {(data.temperature - ((100 - data.humidity) / 5)).toFixed(1)}°
                                            </div>
                                        </div>
                                    }
                                    footer={
                                        <div className="flex justify-between items-center w-full opacity-70">
                                            <span className="text-[10px]">Source: <strong>{pred.model_type}</strong></span>
                                        </div>
                                    }
                                />
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
};

const PredictionMap: React.FC<PredictionMapProps> = ({ predictions, horizon }) => {
  // Global view center
  const center: [number, number] = [20, 0];
  const zoom = 2;

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-xl border border-gray-200 relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false} // Custom placement
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Cleaner "Voyager" map style
        />
        
        <ZoomControl position="topright" />

        <PredictionMarkers predictions={predictions} horizon={horizon} />
        
        <Legend />
      </MapContainer>
    </div>
  );
};

export default PredictionMap;
