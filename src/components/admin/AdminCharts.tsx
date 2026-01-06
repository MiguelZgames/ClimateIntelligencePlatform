import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminChartsProps {
  userGrowthData: { date: string; users: number }[];
  userDistributionData: { name: string; value: number }[];
  activityData: { name: string; active: number; inactive: number }[];
  totalUsers: number;
}

const COLORS = ['#94a3b8', '#3b82f6', '#10b981'];

export default function AdminCharts({ userGrowthData, userDistributionData, activityData, totalUsers }: AdminChartsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. User Growth (Area Chart) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
      >
        <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-800 text-lg">Total User Evolution</h3>
            <div className="flex bg-gray-50 rounded-lg p-1">
                {['24h', '7d', '30d'].map(range => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            timeRange === range 
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
        </div>
        <div className="h-[300px] w-full">
            {userGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                    Not enough data to display growth history.
                </div>
            )}
        </div>
      </motion.div>

      {/* 2. User Segments (Pie Chart) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <h3 className="font-bold text-gray-800 text-lg mb-4">User Segmentation</h3>
        <div className="h-[250px] w-full relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {userDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
             </ResponsiveContainer>
             {/* Center Text */}
             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none pb-8">
                 <span className="text-2xl font-bold text-gray-800">{totalUsers}</span>
                 <p className="text-xs text-gray-400">Total Users</p>
             </div>
        </div>
      </motion.div>

      {/* 3. Active vs Inactive (Bar Chart) */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        <h3 className="font-bold text-gray-800 text-lg mb-4">Active vs Inactive</h3>
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    <Legend />
                    <Bar dataKey="active" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="inactive" stackId="a" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
