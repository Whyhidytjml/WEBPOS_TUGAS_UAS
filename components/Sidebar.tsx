
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Store, LogOut, User as UserIcon } from 'lucide-react';
import { AppView, User } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, user, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'kasir'] },
    { id: 'cashier', label: 'Kasir', icon: ShoppingCart, roles: ['admin', 'kasir'] },
    { id: 'inventory', label: 'Stok Barang', icon: Package, roles: ['admin'] },
    { id: 'history', label: 'Riwayat', icon: History, roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="w-64 bg-white h-screen border-r border-gray-200 fixed left-0 top-0 flex flex-col shadow-sm no-print z-[999]">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
        <div className="bg-pink-600 p-2 rounded-lg">
          <Store className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">WHY Sembako</h1>
      </div>

      <div className="p-4 border-b border-gray-50 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200 shadow-sm">
            <UserIcon size={20} />
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
            <p className="text-[10px] font-black uppercase text-pink-500 tracking-wider leading-none mt-0.5">{user.role}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id as AppView)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-pink-600 text-white font-semibold shadow-md shadow-pink-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 font-medium'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-4 bg-white">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onLogout();
          }}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-600 bg-red-50 hover:bg-red-600 hover:text-white transition-all duration-200 font-black text-sm group active:scale-[0.95] border border-red-100"
        >
          <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Keluar Sistem</span>
        </button>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Sistem Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-600 uppercase">Aktif & Terenkripsi</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
