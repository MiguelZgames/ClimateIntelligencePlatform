import React, { useState } from 'react';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
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
    const exportData = data.map(({ id, created_at, ...rest }) => rest); // Exclude internal IDs

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

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="font-semibold text-gray-700">Detailed Data View</h3>
        <div className="flex gap-2">
          <button onClick={() => handleExport('csv')} className="text-xs flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50">
            <Download size={14} /> CSV
          </button>
          <button onClick={() => handleExport('xlsx')} className="text-xs flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50">
            <Download size={14} /> Excel
          </button>
          <button onClick={() => handleExport('json')} className="text-xs flex items-center gap-1 px-3 py-1.5 border rounded hover:bg-gray-50">
            <Download size={14} /> JSON
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">City</th>
              <th className="px-6 py-3">Temp (°C)</th>
              <th className="px-6 py-3">Humidity (%)</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.length > 0 ? (
                currentData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{row.city}</td>
                    <td className="px-6 py-4 text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.temperature > 25 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                            {row.temperature}°C
                        </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{row.humidity}%</td>
                    <td className="px-6 py-4 text-gray-500">{row.displayDate}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{row.data_source}</td>
                </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No data available matching your filters.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-4 py-3 border-t flex items-center justify-between">
            <span className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </span>
            <div className="flex gap-1">
                <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    <ChevronLeft size={20} />
                </button>
                <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
