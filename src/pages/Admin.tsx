import React from 'react';

export default function Admin() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Active Users</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total API Calls</h3>
          <p className="text-3xl font-bold mt-2">1,240</p>
        </div>
        <div className="bg-white p-6 rounded shadow border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Model Accuracy</h3>
          <p className="text-3xl font-bold mt-2">94.2%</p>
        </div>
      </div>
      
      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">User Activity Log</h2>
        <p className="text-gray-500">No recent activity.</p>
      </div>
    </div>
  );
}
