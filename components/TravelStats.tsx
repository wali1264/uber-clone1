
import React from 'react';

const TravelStats: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-200">
            1
          </div>
          <span className="font-medium text-slate-700">تعداد حجاج</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-700 shadow-sm border border-slate-200">
            1
          </div>
          <span className="font-medium text-slate-700">تعداد عمره‌کاران</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        </div>
      </div>
      
      {/* Visual representation of split */}
      <div className="pt-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>حج (50%)</span>
          <span>عمره (50%)</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-emerald-500 w-1/2"></div>
          <div className="h-full bg-blue-500 w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default TravelStats;
