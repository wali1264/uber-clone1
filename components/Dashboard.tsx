
import React from 'react';
import { Prescription } from '../types';

interface DashboardProps {
  prescriptions: Prescription[];
  patientsCount: number;
  onNewPrescription: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ prescriptions, patientsCount, onNewPrescription }) => {
  const stats = [
    { label: 'کل نسخه‌ها', value: prescriptions.length, icon: 'fa-file-medical', color: 'blue' },
    { label: 'مریضان فعال', value: patientsCount, icon: 'fa-user-check', color: 'green' },
    { label: 'ویزیت امروز', value: 0, icon: 'fa-calendar-day', color: 'purple' },
    { label: 'درآمد تخمینی', value: '---', icon: 'fa-money-bill-wave', color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${
              stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
              stat.color === 'green' ? 'bg-emerald-50 text-emerald-600' : 
              stat.color === 'purple' ? 'bg-purple-50 text-purple-600' : 
              'bg-amber-50 text-amber-600'
            }`}>
              <i className={`fa-solid ${stat.icon}`}></i>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800">نسخه‌های اخیر</h3>
              <button className="text-blue-600 text-sm font-medium hover:underline">مشاهده همه</button>
            </div>
            
            {prescriptions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <i className="fa-solid fa-folder-open text-5xl mb-4 opacity-20"></i>
                <p>هنوز نسخه‌ای ثبت نشده است</p>
                <button onClick={onNewPrescription} className="mt-4 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-sm font-bold">ایجاد اولین نسخه</button>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                        {p.patientId.slice(-2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">نسخه {p.diagnosis}</p>
                        <p className="text-slate-500 text-xs">{p.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600"><i className="fa-solid fa-eye"></i></button>
                      <button className="p-2 text-slate-400 hover:text-blue-600"><i className="fa-solid fa-print"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <i className="fa-solid fa-bolt-lightning text-xl text-yellow-300"></i>
              <h3 className="font-bold">دستیار هوشمند</h3>
            </div>
            <p className="text-blue-100 text-sm leading-relaxed mb-6">
              می‌توانید نسخه را با صدا ثبت کنید یا از هوش مصنوعی برای بررسی تداخلات دارویی کمک بگیرید.
            </p>
            <button 
              onClick={onNewPrescription}
              className="w-full bg-white text-blue-600 font-bold py-3 rounded-2xl shadow-lg hover:bg-blue-50 transition-colors"
            >
              شروع نسخه‌نویسی هوشمند
            </button>
          </div>

          {/* New Feature: Global Drug Bank */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 group hover:border-blue-200 transition-all cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className="fa-solid fa-earth-americas text-xl"></i>
              </div>
              <h3 className="font-bold text-slate-800">بانک دارو های جهانی</h3>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed mb-4">
              دسترسی به دیتابیس جامع داروهای بین‌المللی، اطلاعات تخصصی فارماکولوژی و پروتکل‌های درمانی جهانی.
            </p>
            <button className="text-blue-600 text-xs font-black flex items-center gap-2 group-hover:gap-3 transition-all">
              جستجوی جهانی <i className="fa-solid fa-arrow-left"></i>
            </button>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">وضعیت کلینیک</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">ظرفیت تکمیل شده</span>
                <span className="font-bold text-slate-800">۴۵٪</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full w-[45%]"></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 italic">* بر اساس میانگین مراجعات ماهانه</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
