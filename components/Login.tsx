
import React, { useState } from 'react';
import { Store, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated auth delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (username === 'admin' && password === 'admin123') {
      onLogin({ username: 'admin', role: 'admin', name: 'Administrator' });
    } else if (username === 'kasir' && password === 'kasir123') {
      onLogin({ username: 'kasir', role: 'kasir', name: 'Kasir Utama' });
    } else {
      setError('Username atau password salah.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 pt-12">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-pink-600 p-4 rounded-3xl shadow-lg shadow-pink-200 mb-6">
              <Store className="text-white w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">WHY Sembako</h1>
            <p className="text-gray-400 font-medium text-sm mt-2 uppercase tracking-widest">Smart POS System</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-semibold animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Username</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 font-medium"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-gray-900 font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-pink-100 hover:bg-pink-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                'Masuk Ke Sistem'
              )}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-400 text-xs font-medium italic">Powered by Smart Retail Hub v2.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
