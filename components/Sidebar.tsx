
import React from 'react';
import { Doctor } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  doctor: Doctor;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, doctor, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'داشبورد' },
    { id: 'patients', icon: 'fa-users', label: 'مریضان' },
    { id: 'new-prescription', icon: 'fa-file-medical', label: 'نسخه جدید' },
    { id: 'reports', icon: 'fa-file-lines', label: 'گزارش‌ها' },
    { id: 'settings', icon: 'fa-gear', label: 'تنظیمات' },
  ];

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <i className="fa-solid fa-stethoscope"></i>
        </div>
        <span className="font-bold text-xl text-slate-800 tracking-tight">MediScript</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id || (item.id === 'settings' && activeTab === 'database')
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <i className={`fa-solid ${item.icon} w-6`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <i className="fa-solid fa-user-doctor"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-slate-800 truncate">{doctor.name}</p>
            <p className="text-xs text-slate-500 truncate">{doctor.specialty}</p>
          </div>
        </div>
        
        {onLogout && (
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <i className="fa-solid fa-power-off"></i>
            خروج از حساب
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
