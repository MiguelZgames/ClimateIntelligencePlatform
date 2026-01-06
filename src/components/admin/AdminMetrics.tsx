import React, { useState, useEffect } from 'react';
import { Users, Activity, Database, Server, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';

interface AdminMetricsProps {
  modelAccuracy: number;
  totalApiCalls: number;
  activeUsers: number;
}

export default function AdminMetrics({ modelAccuracy, totalApiCalls, activeUsers }: AdminMetricsProps) {
  
  const metrics = [
    {
      title: "Active Users",
      value: activeUsers,
      subValue: "Live Count",
      icon: Users,
      color: "blue",
      live: true
    },
    {
      title: "Total API Calls",
      value: totalApiCalls.toLocaleString(),
      subValue: "Total Records Processed",
      icon: Database,
      color: "green",
      helpText: "Total requests processed (Ingestion + Inference)."
    },
    {
      title: "XGBoost Accuracy",
      value: `${modelAccuracy}%`,
      subValue: "RMSE: ±0.54°C",
      icon: Activity,
      color: "purple",
      helpText: "Model performance based on latest validation results."
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((m, idx) => (
        <motion.div
          key={m.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${m.color}-500 relative overflow-hidden group hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-gray-500 text-sm font-medium">{m.title}</h3>
                {m.helpText && (
                  <div className="group/tooltip relative">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs p-2 rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                      {m.helpText}
                    </div>
                  </div>
                )}
                {m.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-800">
                    {m.value}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                 {m.subValue}
              </p>
            </div>
            
            <div className={`p-3 rounded-full bg-${m.color}-50 text-${m.color}-600`}>
              <m.icon size={24} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
