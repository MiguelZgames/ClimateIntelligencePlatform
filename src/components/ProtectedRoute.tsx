import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  requiredRole?: 'admin' | 'visualizador';
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Get role from public.users table
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !userData) {
          console.error('Error fetching user role:', error);
          setRole('visualizador'); // Default to lowest privilege on error
        } else {
          setRole(userData.role);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkRole();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requiredRole && role !== requiredRole) {
    // If user is trying to access admin but is not admin
    if (requiredRole === 'admin') {
      return (
        <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
            <p className="text-gray-500 max-w-md">
                You do not have permission to view this section. This incident has been logged.
            </p>
            <button 
                onClick={() => window.history.back()}
                className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
            >
                Go Back
            </button>
        </div>
      );
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
