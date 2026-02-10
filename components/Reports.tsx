
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Download, 
  FilePieChart, 
  TrendingUp, 
  Calendar, 
  Filter, 
  ChevronDown,
  Printer,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownRight,
  User
} from 'lucide-react';

const SAR_RATE = 3.75;

const monthlyData = [
  { name: 'حمل', revenue: 4500, expenses: 3200, profit: 1300 },
  { name: 'ثور', revenue: 5200, expenses: 3800, profit: 1400 },
  { name: 'جوزا', revenue: 4800, expenses: 4500, profit: 300 },
  { name: 'سرطان', revenue: 6100, expenses: 4200, profit: 1900 },
  { name: 'اسد', revenue: 5500, expenses: 3500, profit: 2000 },
  { name: 'سنبله', revenue: 6700, expenses: 4800, profit: 1900 },
];

const serviceDistribution = [
  { name: 'خدمات حج', value: 45, color: '#10B981' },
  { name: 'خدمات عمره', value: 35, color: '#3B82F6' },
  { name: 'صدور ویزه', value: 20, color: '#F59E0B' },
];

interface ReportsProps {
  travelers: any[];
}

const Reports: React.FC<ReportsProps> = ({ travelers }) => {
  const calculateTrueProfit = (t: any) => {
    const parse = (v: any) => parseFloat(v?.toString().replace(/,/g, '')) || 0;
    
    const income = parse(t.totalPayable);
    
    const costs = 
      parse(t.visaPurchase) + 
      parse(t.flightPurchase) + 
      (parse(t.hotelPurchase) * parse(t.hotelNights)) + 
      (parse(t.hotelMakkahPurchase) * parse(t.hotelMakkahNights)) + 
      parse(t.transportPurchase) + 
      parse(t.representativeFee);

    return income - costs;
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-100">
            <BarChart3 size={32} />
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800">گزارش‌های هوشمند</h2>
            <p className="text-slate-500 mt-1 font-medium">تحلیل دقیق وضعیت مالی و عملکرد عملیاتی شرکت (USD $)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-100 flex gap-1">
            <button className="px-5 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-200">سال 1403</button>
            <button className="px-5 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold text-sm transition-all">سال 1402</button>
          </div>
          <button className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-emerald-50">
            <Download size={20} />
            خروجی جامع
          </button>
        </div>
      </div>

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue vs Expenses Line Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-8 text-right">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-800">روند عواید و مصارف ($)</h3>
              <p className="text-xs text-slate-400 font-bold mt-1">مقایسه ماهانه در نیم‌سال اول</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500">عواید</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                <span className="text-xs font-bold text-slate-500">مصارف</span>
              </div>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB7185" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FB7185" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="expenses" stroke="#FB7185" strokeWidth={4} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Distribution Pie Chart */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-between text-right">
          <div className="w-full">
            <h3 className="text-xl font-black text-slate-800">توزیع درآمدی</h3>
            <p className="text-xs text-slate-400 font-bold mt-1">سهم هر خدمت از کل عواید</p>
          </div>

          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {serviceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-black text-slate-800">100%</span>
               <span className="text-[10px] font-bold text-slate-400">کل خدمات</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {serviceDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-bold text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* True Profit Per Traveler Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden text-right">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-indigo-50/20">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                 <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-black text-slate-800">سود حقیقی به تفکیک هر مسافر</h3>
           </div>
           <span className="text-xs font-bold text-indigo-400">محاسبه بر اساس: (قیمت فروش - مجموع مخارج خرید)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-sm font-black text-slate-500">مشخصات مسافر</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">نوع سفر</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">قیمت فروش ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">هزینه تمام‌شد ($)</th>
                <th className="px-8 py-5 text-sm font-black text-emerald-600">سود حقیقی ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {travelers.map((t) => {
                const parse = (v: any) => parseFloat(v?.toString().replace(/,/g, '')) || 0;
                const income = parse(t.totalPayable);
                const costs = 
                  parse(t.visaPurchase) + 
                  parse(t.flightPurchase) + 
                  (parse(t.hotelPurchase) * parse(t.hotelNights)) + 
                  (parse(t.hotelMakkahPurchase) * parse(t.hotelMakkahNights)) + 
                  parse(t.transportPurchase) + 
                  parse(t.representativeFee);
                const profit = income - costs;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                           <User size={14} />
                         </div>
                         <span className="font-black text-slate-700">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500">{t.tripType}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600">{income.toLocaleString('en-US')} $</td>
                    <td className="px-8 py-6 font-bold text-rose-400">{costs.toLocaleString('en-US')} $</td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                         <span className="text-lg font-black text-emerald-600">{profit.toLocaleString('en-US')} $</span>
                         <span className="text-[10px] font-bold text-slate-300">≈ {(profit * SAR_RATE).toLocaleString('en-US')} SAR</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {travelers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">هیچ مسافری یافت نشد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Table Section */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden text-right">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800">ترازنامه فصلی (نیم‌سال اول)</h3>
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold text-sm">
            <Filter size={18} /> فیلتر ستون‌ها
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-sm font-black text-slate-500">ماه مالی</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مجموع عواید ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مجموع مصارف ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">سود خالص ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">درصد بازگشت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6 font-black text-slate-700">{row.name}</td>
                  <td className="px-8 py-6 font-bold text-slate-600">{row.revenue.toLocaleString('en-US')} $</td>
                  <td className="px-8 py-6 font-bold text-slate-600">{row.expenses.toLocaleString('en-US')} $</td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${row.profit > 1500 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {row.profit.toLocaleString('en-US')} $
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full max-w-[100px] overflow-hidden">
                         <div className="h-full bg-indigo-500" style={{ width: `${(row.profit/row.revenue)*100}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-slate-400">{Math.round((row.profit/row.revenue)*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
