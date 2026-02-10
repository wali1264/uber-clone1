
import React from 'react';
import { Bell, DollarSign, Users, TrendingUp, Wallet, Lightbulb } from 'lucide-react';
import StatCard from './StatCard';
import FinancialChart from './FinancialChart';
import TravelStats from './TravelStats';

const Dashboard: React.FC = () => {
  const today = new Intl.DateTimeFormat('fa-AF', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    numberingSystem: 'latn'
  }).format(new Date());

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">داشبورد</h2>
          <p className="text-slate-500 mt-1">خوش آمدید، امروز {today} است.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm border border-emerald-100">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            وضعیت سیستم: متصل
          </div>
          <button className="p-2 bg-white rounded-full shadow-sm border border-slate-200 text-slate-400 hover:text-slate-600">
            <Bell size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="کل عواید"
          value="18,500"
          currency="$"
          icon={<DollarSign size={24} />}
          iconBg="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          title="تعداد مسافران"
          value="2"
          currency="نفر"
          icon={<Users size={24} />}
          iconBg="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="سود خالص"
          value="4,200"
          currency="$"
          icon={<TrendingUp size={24} />}
          iconBg="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="مجموع مصارف"
          value="8,500"
          currency="$"
          icon={<Wallet size={24} />}
          iconBg="bg-rose-100 text-rose-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Financial Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">وضعیت مالی (USD $)</h3>
          <FinancialChart />
        </div>

        {/* Travel Stats & Tips */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6">آمار سفرها</h3>
            <TravelStats />
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex gap-4">
            <div className="w-10 h-10 bg-amber-200 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb size={24} />
            </div>
            <div>
              <p className="text-amber-900 font-bold mb-1 italic">نکته مدیریتی:</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                میزان سود از هر مسافر عمره به طور میانگین 12% بیشتر از حج است. تمرکز بر پکیج‌های عمره می‌تواند سودآوری را افزایش دهد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
