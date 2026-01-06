import React, { useEffect, useState } from 'react';
import AdminMetrics from '../components/admin/AdminMetrics';
import AdminCharts from '../components/admin/AdminCharts';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export default function Admin() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    totalApiCalls: 0,
    totalUsers: 0
  });
  
  const [chartData, setChartData] = useState({
    userGrowth: [] as { date: string; users: number }[],
    userDistribution: [] as { name: string; value: number }[],
    activity: [] as { name: string; active: number; inactive: number }[]
  });

  // Derived from validation results (static for now as it comes from ML pipeline)
  const MODEL_ACCURACY = 94.2; 

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
        // 1. Fetch Users
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');
        
        if (usersError) throw usersError;

        const activeUsersCount = users.filter(u => u.is_active).length;
        const totalUsersCount = users.length;

        // 2. Fetch API Calls (Weather Data + Predictions)
        const { count: weatherCount } = await supabase
            .from('weather_data')
            .select('*', { count: 'exact', head: true });
            
        const { count: predictionCount } = await supabase
            .from('predictions')
            .select('*', { count: 'exact', head: true });

        const totalCalls = (weatherCount || 0) + (predictionCount || 0);

        setMetrics({
            activeUsers: activeUsersCount,
            totalApiCalls: totalCalls,
            totalUsers: totalUsersCount
        });

        // 3. Process Chart Data
        
        // A. User Growth (Group by Date)
        // Since we likely have few users, we can just map them. For a real app, we'd group by day.
        // Mocking growth based on actual data points if available, or just showing the current state
        const sortedUsers = [...users].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        
        // Create a cumulative growth chart
        let cumulative = 0;
        const growthMap = new Map<string, number>();
        
        sortedUsers.forEach(u => {
            const date = format(new Date(u.created_at), 'MMM dd');
            cumulative++;
            growthMap.set(date, cumulative);
        });

        const userGrowth = Array.from(growthMap.entries()).map(([date, count]) => ({
            date,
            users: count
        }));

        const roleCounts = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Force explicit typing for userDistribution to match AdminCharts props
        const userDistribution: { name: string; value: number }[] = Object.entries(roleCounts).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1), 
            value: value as number
        }));

        // C. Activity (Active vs Inactive)
        const activity = [{
            name: 'Current',
            active: activeUsersCount,
            inactive: totalUsersCount - activeUsersCount
        }];

        setChartData({
            userGrowth,
            userDistribution,
            activity
        });

    } catch (error) {
        console.error("Error fetching admin data:", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">System Administration</h1>
        <p className="text-gray-500 text-sm mt-1">Monitor platform performance, user activity, and ML model health.</p>
      </div>
      
      {/* 1. Key Metrics Cards */}
      <AdminMetrics 
        modelAccuracy={MODEL_ACCURACY} 
        totalApiCalls={metrics.totalApiCalls} 
        activeUsers={metrics.activeUsers}
      />

      {/* 2. Detailed Charts */}
      {loading ? (
          <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
      ) : (
          <AdminCharts 
            userGrowthData={chartData.userGrowth}
            userDistributionData={chartData.userDistribution}
            activityData={chartData.activity}
            totalUsers={metrics.totalUsers}
          />
      )}
      
      {/* 3. Activity Log (Placeholder for future dev) */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Recent System Activity</h2>
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 text-sm pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-500 w-24">10:4{i} AM</span>
                    <span className="text-gray-800 font-medium">System auto-scaled to handle increased load</span>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
