import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { cityCountryMap } from '../lib/cityCountryMap';
import DashboardMetrics from '../components/dashboard/MetricsCards';
import DashboardFilters from '../components/dashboard/Filters';
import DataTable from '../components/dashboard/DataTable';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis, ReferenceLine, Brush, BarChart, Bar
} from 'recharts';
import { CloudRain, Thermometer, Wind, Droplets, MapPin, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import RichTooltip from '../components/common/RichTooltip';
import ChartFrame from '../components/dashboard/ChartFrame';

export default function Dashboard() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const chartsRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [selectedCities, setSelectedCities] = useState<string[]>(['All']);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [timeRangeType, setTimeRangeType] = useState('all'); 

  // Stats
  const [stats, setStats] = useState({
    maxTemps: [] as any[],
    minTemps: [] as any[],
    maxHumidity: [] as any[],
    minHumidity: [] as any[],
    totalCountries: 0,
    totalCities: 0
  });

  // Initial Load
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const { data: citiesData } = await supabase
        .from('weather_data')
        .select('city')
        .order('city');
      
      if (citiesData) {
        const unique = Array.from(new Set(citiesData.map(c => c.city)));
        setAvailableCities(unique);
      }

      await applyFilters();
      
    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('weather_data')
        .select('*')
        .order('weather_timestamp', { ascending: false });

      if (!selectedCities.includes('All') && selectedCities.length > 0) {
        query = query.in('city', selectedCities);
      }

      if (dateRange.start) {
        query = query.gte('weather_timestamp', dateRange.start);
      }
      
      // Fetch data in chunks to bypass default API limits (usually 1000 rows)
      const allData: any[] = [];
      const CHUNK_SIZE = 1000;
      const MAX_RECORDS = 15000; // Frontend safety limit

      let from = 0;
      let moreAvailable = true;

      while (moreAvailable && allData.length < MAX_RECORDS) {
          const { data, error } = await query.range(from, from + CHUNK_SIZE - 1);
          
          if (error) throw error;

          if (data && data.length > 0) {
              allData.push(...data);
              from += CHUNK_SIZE;
              // If we got less than requested, we've reached the end
              if (data.length < CHUNK_SIZE) {
                  moreAvailable = false;
              }
          } else {
              moreAvailable = false;
          }
      }

      const formatted = allData.map(d => ({
        ...d,
        displayDate: format(new Date(d.weather_timestamp), 'MM/dd HH:mm'),
        country: cityCountryMap[d.city] || 'Unknown',
        dewPoint: d.temperature - ((100 - d.humidity) / 5) // Approx Dew Point
      }));

      setRawData(formatted);
      setFilteredData(formatted);
      calculateStats(formatted);

    } catch (error) {
      console.error('Error fetching filtered data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return;

    const latestPerCity = new Map();
    data.forEach(item => {
        if (!latestPerCity.has(item.city)) {
            latestPerCity.set(item.city, item);
        }
    });
    const uniqueCityData = Array.from(latestPerCity.values());

    const sortedByTemp = [...uniqueCityData].sort((a, b) => b.temperature - a.temperature);
    const sortedByHum = [...uniqueCityData].sort((a, b) => b.humidity - a.humidity);
    const uniqueCountries = new Set(uniqueCityData.map(d => d.country)).size;

    setStats({
      maxTemps: sortedByTemp.slice(0, 5),
      minTemps: sortedByTemp.slice(-5).reverse(),
      maxHumidity: sortedByHum.slice(0, 5),
      minHumidity: sortedByHum.slice(-5).reverse(),
      totalCountries: uniqueCountries,
      totalCities: uniqueCityData.length
    });
  };

  const getChartData = () => {
     if (selectedCities.includes('All') || selectedCities.length > 1) {
         const latest = new Map();
         filteredData.forEach(d => {
             if (!latest.has(d.city)) latest.set(d.city, d);
         });
         return Array.from(latest.values()).sort((a: any, b: any) => a.city.localeCompare(b.city));
     } else {
         return filteredData.slice().reverse();
     }
  };

  const chartData = getChartData();
  const isComparison = selectedCities.includes('All') || selectedCities.length > 1;

  const handleExportChart = () => {
    if (chartsRef.current) {
        html2canvas(chartsRef.current, { backgroundColor: '#f3f4f6' }) // Changed to light gray to match body bg since wrapper is transparent
            .then(function (blob) {
                if (blob) {
                    blob.toBlob((b) => {
                        if (b) saveAs(b, 'climate_dashboard_charts.png');
                    });
                }
            });
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Climate Intelligence Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Real-time monitoring of 103 global cities</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={handleExportChart}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm text-sm font-medium"
             >
                <Download size={16} />
                Export Charts
             </button>
             <span className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex items-center">
                Last update: {new Date().toLocaleTimeString()}
             </span>
        </div>
      </div>

      <DashboardMetrics stats={stats} />

      <DashboardFilters 
        cities={availableCities}
        selectedCities={selectedCities}
        onCityChange={setSelectedCities}
        timeRangeType={timeRangeType}
        onTimeRangeChange={(type, range) => {
            setTimeRangeType(type);
            setDateRange(range);
        }}
        onApply={applyFilters}
        onReset={() => {
            setSelectedCities(['All']);
            setDateRange({ start: '', end: '' });
            setTimeRangeType('all');
            window.location.reload(); 
        }}
        loading={loading}
      />

      {/* Charts Section */}
      <div ref={chartsRef} className="space-y-6">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Climate Analysis
                {isComparison && <span className="text-sm font-normal text-gray-500 ml-2">(Multi-City View)</span>}
            </h2>
        </div>

        {/* 1. Scatter Plot (Comparison) or Line Chart (History) */}
        <ChartFrame 
            title={isComparison ? 'Temperature vs Humidity Distribution' : 'Historical Trends'}
            subtitle={isComparison ? 'Distribution analysis of all cities' : `Detailed trend for ${selectedCities[0]}`}
        >
            <ResponsiveContainer width="100%" height="100%">
                {isComparison ? (
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            type="number" 
                            dataKey="temperature" 
                            name="Temperature" 
                            unit="°C" 
                            label={{ value: 'Temperature (°C)', position: 'bottom', offset: 0 }}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <YAxis 
                            type="number" 
                            dataKey="humidity" 
                            name="Humidity" 
                            unit="%" 
                            label={{ value: 'Humidity (%)', angle: -90, position: 'insideLeft' }}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                        />
                        <ZAxis range={[100, 100]} />
                        <Tooltip content={<RichTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="3 3" />
                        <ReferenceLine x={20} stroke="#e5e7eb" strokeDasharray="3 3" />
                        <Scatter 
                            name="Cities" 
                            data={chartData} 
                            fill="#3b82f6" 
                            fillOpacity={0.6}
                            stroke="#2563eb"
                        />
                    </ScatterChart>
                ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} syncId="history">
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="displayDate" fontSize={12} tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip content={<RichTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={3} dot={false} name="Temp (°C)" activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={3} dot={false} name="Humidity (%)" activeDot={{ r: 6 }} />
                        <Brush dataKey="displayDate" height={30} stroke="#e5e7eb" fill="#f9fafb" />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </ChartFrame>

        {/* 2. Bar Chart (Parallel Visualization for Comparison) */}
        {isComparison && (
            <ChartFrame 
                title="City-by-City Comparison" 
                subtitle="Scroll to view all 103 cities"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barGap={2}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="city" angle={-90} textAnchor="end" interval={0} fontSize={10} height={80} tick={{ fill: '#6b7280' }} />
                        <YAxis tick={{ fill: '#6b7280' }} />
                        <Tooltip content={<RichTooltip />} cursor={{ fill: '#f3f4f6' }} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="temperature" fill="#3b82f6" name="Temp (°C)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="humidity" fill="#10b981" name="Humidity (%)" radius={[4, 4, 0, 0]} />
                        <Brush dataKey="city" height={30} stroke="#e5e7eb" fill="#f9fafb" startIndex={0} endIndex={20} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartFrame>
        )}
      </div>

      <DataTable data={filteredData} />
    </div>
  );
}
