
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  currency: string;
  icon: React.ReactNode;
  iconBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, currency, icon, iconBg }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between transition-transform hover:scale-[1.02]">
      <div className="space-y-2">
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-800">{value}</span>
          <span className="text-xs text-slate-400 font-medium">{currency}</span>
        </div>
      </div>
      <div className={`w-14 h-14 ${iconBg} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
