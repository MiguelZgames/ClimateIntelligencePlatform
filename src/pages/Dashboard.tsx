import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { cityCountryMap } from '../lib/cityCountryMap';
import DashboardMetrics from '../components/dashboard/MetricsCards';
import DashboardFilters from '../components/dashboard/Filters';
import DataTable from '../components/dashboard/DataTable';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  
  // Filters
  const [selectedCities, setSelectedCities] = useState<string[]>(['All']);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [timeRangeType, setTimeRangeType] = useState('all'); // 'all', 'today', 'week'

  // Stats
  const [stats, setStats] = useState({
    maxTemps: [] as any[],
    minTemps: [] as any[],
    maxHumidity: [] as any[],
    minHumidity: [] as any[],
    totalCountries: 0,
    totalCities: 0
  });

  // 1. Initial Load: Get unique cities and initial latest data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Get unique cities
      const { data: citiesData } = await supabase
        .from('weather_data')
        .select('city')
        .order('city');
      
      if (citiesData) {
        const unique = Array.from(new Set(citiesData.map(c => c.city)));
        setAvailableCities(unique);
      }

      // Load initial data (last 1000 records to have enough coverage)
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
      
      // Limit to 2000 records for performance, assuming users filter down
      const { data, error } = await query.limit(2000);
      
      if (error) throw error;

      const formatted = data?.map(d => ({
        ...d,
        displayDate: format(new Date(d.weather_timestamp), 'MM/dd HH:mm'),
        country: cityCountryMap[d.city] || 'Unknown'
      })) || [];

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

    // Get latest snapshot per city for accurate "Current" stats
    // Or just use the visible dataset if that's what the user wants. 
    // Usually "Top Cities" implies the latest reading.
    const latestPerCity = new Map();
    data.forEach(item => {
        if (!latestPerCity.has(item.city)) {
            latestPerCity.set(item.city, item);
        }
    });
    const uniqueCityData = Array.from(latestPerCity.values());

    // Sort for stats
    const sortedByTemp = [...uniqueCityData].sort((a, b) => b.temperature - a.temperature);
    const sortedByHum = [...uniqueCityData].sort((a, b) => b.humidity - a.humidity);

    // Countries count
    const uniqueCountries = new Set(uniqueCityData.map(d => d.country)).size;

    setStats({
      maxTemps: sortedByTemp.slice(0, 5),
      minTemps: sortedByTemp.slice(-5).reverse(),
      maxHumidity: sortedByHum.slice(0, 5),
      minHumidity: sortedByHum.slice(-5).reverse(), // Or just lowest humidity? Usually we want high/low
      totalCountries: uniqueCountries,
      totalCities: uniqueCityData.length
    });
  };

  // Chart Data Preparation
  const getChartData = () => {
     // If "All" or multiple cities selected, show Bar Chart of latest values
     // If single city, show Line Chart history
     if (selectedCities.includes('All') || selectedCities.length > 1) {
         // Return unique latest per city
         const latest = new Map();
         filteredData.forEach(d => {
             if (!latest.has(d.city)) latest.set(d.city, d);
         });
         return Array.from(latest.values()).sort((a, b) => a.city.localeCompare(b.city));
     } else {
         // Return history for the single city
         return filteredData.slice().reverse(); // Chronological for line chart
     }
  };

  const chartData = getChartData();
  const isComparison = selectedCities.includes('All') || selectedCities.length > 1;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Climate Intelligence Dashboard</h1>
        <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
      </div>

      {/* 1. Metrics Cards */}
      <DashboardMetrics stats={stats} />

      {/* 2. Filters */}
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
            const defaultCities = ['All'];
            const defaultDate = { start: '', end: '' };
            setSelectedCities(defaultCities);
            setDateRange(defaultDate);
            setTimeRangeType('all');
            window.location.reload(); 
        }}
        loading={loading}
      />

      {/* 3. Main Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">
            {isComparison ? 'Global Overview (Latest Readings)' : `Historical Trends: ${selectedCities[0]}`}
        </h2>
        <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                {isComparison ? (
                    <BarChart data={chartData} margin={{ bottom: 100 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="city" angle={-90} textAnchor="end" interval={0} fontSize={10} height={100} />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Bar dataKey="temperature" fill="#3b82f6" name="Temp (°C)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="humidity" fill="#10b981" name="Humidity (%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                ) : (
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="displayDate" fontSize={12} />
                        <YAxis />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={false} name="Temp (°C)" />
                        <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} dot={false} name="Humidity (%)" />
                    </LineChart>
                )}
            </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Detailed Data Table */}
      <DataTable data={filteredData} />
    </div>
  );
}
