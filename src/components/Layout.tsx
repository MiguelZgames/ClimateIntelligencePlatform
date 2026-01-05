import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, Settings, CloudRain } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-4 text-xl font-bold border-b border-blue-800">
          Weather Platform
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2 hover:bg-blue-800 rounded">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/predictions" className="flex items-center gap-3 px-4 py-2 hover:bg-blue-800 rounded">
            <CloudRain size={20} />
            Predictions
          </Link>
          <Link to="/admin" className="flex items-center gap-3 px-4 py-2 hover:bg-blue-800 rounded">
            <Settings size={20} />
            Admin
          </Link>
        </nav>
        <div className="p-4 border-t border-blue-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full hover:bg-blue-800 rounded text-red-200">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
