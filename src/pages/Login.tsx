import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Lock, Mail, UserPlus, LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    // Sanitize input
    const cleanEmail = email.trim().toLowerCase();

    // Validation
    if (!validateEmail(cleanEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      if (isLoginMode) {
        // LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        
        if (error) throw error;
        
        if (data.session) {
          console.log('Login successful:', data.user?.id);
          navigate('/dashboard');
        }
      } else {
        // REGISTER
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { 
              role: 'visualizador',
              full_name: cleanEmail.split('@')[0]
            }
          }
        });

        if (error) throw error;

        if (data.session) {
          // HAPPY PATH: Immediate access
          console.log('Registration successful (auto-login):', data.user?.id);
          navigate('/dashboard');
        } else if (data.user && !data.session) {
          // EDGE CASE: Supabase still requires email confirmation
          // We try to sign in immediately just in case, but it will likely fail if config is not changed.
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password
          });

          if (loginData.session) {
             navigate('/dashboard');
          } else {
             // System requires config change
             setError('Registration successful, but "Confirm Email" is enabled in Supabase. Please disable it in Authentication > Providers > Email to allow immediate access.');
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.message?.includes('Invalid login credentials')) {
         setError('Invalid credentials. Please check your email and password.');
      } else if (err.message?.includes('invalid')) {
         setError('Invalid email format. Please check your input.');
      } else if (err.message?.includes('already registered')) {
         setError('This email is already registered. Please sign in instead.');
      } else {
         setError(err.message || 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isLoginMode ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isLoginMode 
              ? 'Enter your credentials to access the platform' 
              : 'Sign up to start visualizing climate data'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 text-green-700 text-sm animate-in fade-in slide-in-from-top-2">
            <UserPlus size={18} className="mt-0.5 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              isLoginMode ? (
                <>
                  <LogIn size={18} /> Sign In
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Create Account
                </>
              )
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
          >
            {isLoginMode 
              ? "Don't have an account? Register" 
              : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
