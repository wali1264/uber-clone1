
import React from 'react';
import { Prescription } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportsProps {
  prescriptions: Prescription[];
  onExit: () => void;
}

const Reports: React.FC<ReportsProps> = ({ prescriptions, onExit }) => {
  // Mock data for charts
  const monthlyData = [
    { name: 'فروردین', count: 12 },
    { name: 'اردیبهشت', count: 19 },
    { name: 'خرداد', count: 15 },
    { name: 'تیر', count: 22 },
    { name: 'مرداد', count: 30 },
    { name: 'شهریور', count: prescriptions.length + 5 },
  ];

  const drugUsageData = [
    { name: 'Panadol', value: 40 },
    { name: 'Amoxicillin', value: 30 },
    { name: 'Metformin', value: 20 },
    { name: 'Other', value: 10 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">تعداد نسخه‌ها در ماه</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">پرتجویزترین داروها</h3>
          <div className="h-64 w-full flex flex-col md:flex-row items-center">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={drugUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {drugUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {drugUsageData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                  <span className="text-sm text-slate-600">{d.name}: %{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4">گزارش مریضان فعال</h3>
        <p className="text-sm text-slate-500 mb-6">تحلیل جنسیت و محدوده سنی مراجعین کلینیک</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">میانگین سن مریضان</p>
              <p className="text-3xl font-black text-slate-800">۳۶ <span className="text-sm font-normal text-slate-500">سال</span></p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">مراجعه مجدد (Retention)</p>
              <p className="text-3xl font-black text-slate-800">۶۸٪</p>
           </div>
           <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-xs text-slate-400 font-bold mb-1">نرخ تجویز آنتی‌بیوتیک</p>
              <p className="text-3xl font-black text-slate-800">۲۲٪</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
