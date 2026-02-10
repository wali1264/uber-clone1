
import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Wallet, 
  TrendingDown, 
  Clock, 
  Settings, 
  BarChart3,
  UserCheck,
  Building,
  Book,
  Coins
} from 'lucide-react';
import { MenuItem } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'داشبورد', icon: <LayoutDashboard size={20} /> },
    { id: 'travelers', label: 'مسافران', icon: <Users size={20} /> },
    { id: 'ledger', label: 'دفتر کل (حسابداری)', icon: <Book size={20} /> },
    { id: 'cashbox', label: 'صندوق نقد', icon: <Coins size={20} /> },
    { id: 'arabic-companies', label: 'شرکت‌های عربی', icon: <Building size={20} /> },
    { id: 'services', label: 'خدمات و پکیج‌ها', icon: <Package size={20} /> },
    { id: 'accounts', label: 'حسابات و بیلانس', icon: <Wallet size={20} /> },
    { id: 'expenses', label: 'مصارفات شرکت', icon: <TrendingDown size={20} /> },
    { id: 'commission', label: 'کمیشن‌کاران', icon: <UserCheck size={20} /> },
    { id: 'history', label: 'تاریخچه رسیدها', icon: <Clock size={20} /> },
    { id: 'settings', label: 'تنظیمات', icon: <Settings size={20} /> },
    { id: 'reports', label: 'گزارش‌های هوشمند', icon: <BarChart3 size={20} /> },
  ];

  return (
    <div className="w-72 bg-[#0F172A] text-slate-300 flex flex-col h-full border-l border-slate-800">
      <div className="p-6">
        <h1 className="text-xl font-bold text-emerald-500 mb-1">شرکت سیاحتی افغان-لبیک</h1>
        <p className="text-xs text-slate-500 font-medium">پنل مدیریت یکپارچه</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={activeTab === item.id ? 'text-white' : 'text-slate-400'}>
              {item.icon}
            </span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold">
            م
          </div>
          <div>
            <p className="text-sm font-medium text-white">مدیر سیستم</p>
            <p className="text-xs text-slate-500">مشاهده پروفایل</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
