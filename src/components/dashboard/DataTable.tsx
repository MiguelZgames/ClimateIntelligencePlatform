import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight, MapPin, Thermometer, Droplets, Clock, Database } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface DataTableProps {
  data: any[];
}

export default function DataTable({ data }: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    const exportData = data.map(({ id, created_at, ...rest }) => rest);

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      saveAs(blob, 'weather_data.json');
    } else if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, 'weather_data.csv');
    } else {
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');
      XLSX.writeFile(workbook, 'weather_data.xlsx');
    }
  };

  // Helper for Temperature Styling
  const getTempStyle = (temp: number) => {
    if (temp >= 30) return 'bg-red-100 text-red-700 border-red-200';
    if (temp >= 20) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (temp >= 10) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (temp >= 0) return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  };

  // Helper for Humidity Styling
  const getHumidityStyle = (hum: number) => {
    if (hum >= 80) return 'text-blue-700 bg-blue-50';
    if (hum >= 60) return 'text-blue-600 bg-blue-50';
    if (hum >= 40) return 'text-cyan-600 bg-cyan-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Header Section */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            Detailed Data View
          </h3>
          <div className="bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-2">
             <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Total Records</span>
             <span className="text-sm font-bold text-blue-700">{data.length.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExport('xlsx')} className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => handleExport('json')} className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm">
            <Download size={14} /> JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold border-b border-slate-700 rounded-tl-lg">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-blue-400" />
                  City
                </div>
              </th>
              <th className="px-6 py-4 font-semibold border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Thermometer size={14} className="text-red-400" />
                  Temp (°C)
                </div>
              </th>
              <th className="px-6 py-4 font-semibold border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Droplets size={14} className="text-cyan-400" />
                  Humidity (%)
                </div>
              </th>
              <th className="px-6 py-4 font-semibold border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-purple-400" />
                  Time
                </div>
              </th>
              <th className="px-6 py-4 font-semibold border-b border-slate-700 rounded-tr-lg">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`
                    group transition-all duration-200 
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    hover:bg-blue-50/50 hover:shadow-sm
                  `}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-1 h-8 bg-blue-500 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <span className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {row.city}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getTempStyle(row.temperature)} shadow-sm`}>
                      {row.temperature.toFixed(1)}°C
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${Math.min(row.humidity, 100)}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${getHumidityStyle(row.humidity)} px-1.5 py-0.5 rounded`}>
                        {row.humidity}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      {row.displayDate}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-400 uppercase tracking-wide font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                      {row.data_source}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Database size={32} className="text-gray-300" />
                    <p>No data available matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">
            Page <span className="text-gray-900 font-bold">{currentPage}</span> of <span className="text-gray-900 font-bold">{totalPages}</span>
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-all shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
