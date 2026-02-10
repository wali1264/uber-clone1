
import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Plus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calculator, 
  Lock, 
  Archive, 
  Printer, 
  FileText, 
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  X,
  CheckCircle2
} from 'lucide-react';

interface LedgerEntry {
  id: string;
  date: string;
  docNo: string;
  type: 'عاید' | 'مصرف';
  category: string;
  amount: number;
  description: string;
}

interface FinancialPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'closed';
  entries: LedgerEntry[];
  summary?: {
    totalIncome: number;
    totalExpense: number;
    profit: number;
  };
}

const GeneralLedger: React.FC = () => {
  const [periods, setPeriods] = useState<FinancialPeriod[]>([
    {
      id: 'p1',
      name: 'دوره حج 1403 - کاروان اول',
      startDate: '1403/01/01',
      status: 'active',
      entries: [
        { id: 'e1', date: '1403/01/15', docNo: '101', type: 'عاید', category: 'ثبت‌نام حجاج', amount: 5000, description: 'دریافت هزینه 5 نفر' },
        { id: 'e2', date: '1403/01/20', docNo: '102', type: 'مصرف', category: 'کرایه دفتر', amount: 400, description: 'کرایه ماه حمل' }
      ]
    }
  ]);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'عاید' | 'مصرف'>('عاید');

  const [formData, setFormData] = useState({
    docNo: '',
    category: '',
    amount: '',
    description: '',
    date: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date())
  });

  const [periodName, setPeriodName] = useState('');

  const activePeriod = periods.find(p => p.status === 'active');
  
  const calculateSummary = (entries: LedgerEntry[]) => {
    const totalIncome = entries.filter(e => e.type === 'عاید').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = entries.filter(e => e.type === 'مصرف').reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;
    return { totalIncome, totalExpense, profit };
  };

  const currentSummary = activePeriod ? calculateSummary(activePeriod.entries) : { totalIncome: 0, totalExpense: 0, profit: 0 };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePeriod) return;

    const newEntry: LedgerEntry = {
      id: Date.now().toString(),
      date: formData.date,
      docNo: formData.docNo || (activePeriod.entries.length + 101).toString(),
      type: entryType,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
      description: formData.description
    };

    setPeriods(periods.map(p => 
      p.id === activePeriod.id 
        ? { ...p, entries: [newEntry, ...p.entries] } 
        : p
    ));
    
    setIsEntryModalOpen(false);
    setFormData({ docNo: '', category: '', amount: '', description: '', date: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date()) });
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const newPeriod: FinancialPeriod = {
      id: Date.now().toString(),
      name: periodName,
      startDate: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date()),
      status: 'active',
      entries: []
    };
    // Close other active periods first (simple logic)
    setPeriods([newPeriod, ...periods.map(p => ({ ...p, status: 'closed' as const }))]);
    setIsPeriodModalOpen(false);
    setPeriodName('');
  };

  const closeActivePeriod = () => {
    if (!activePeriod) return;
    if (confirm('آیا از بستن این دوره مالی اطمینان دارید؟ حسابات صفر شده و دوره آرشیو می‌شود.')) {
      setPeriods(periods.map(p => 
        p.id === activePeriod.id 
          ? { 
              ...p, 
              status: 'closed', 
              endDate: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date()),
              summary: calculateSummary(p.entries)
            } 
          : p
      ));
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#1e293b] text-white rounded-[24px] flex items-center justify-center shadow-xl">
            <Book size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800">دفتر کل (حسابداری مرکزی)</h2>
            <p className="text-slate-500 mt-1 font-medium">مدیریت دوره‌های مالی، عواید و مصارف</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activePeriod ? (
            <button 
              onClick={closeActivePeriod}
              className="flex items-center gap-2 px-6 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg transition-all"
            >
              <Lock size={20} />
              بستن دوره مالی
            </button>
          ) : (
            <button 
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black shadow-lg transition-all"
            >
              <Plus size={20} />
              ایجاد دوره مالی جدید
            </button>
          )}
        </div>
      </div>

      {activePeriod && (
        <>
          {/* Summary Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-black">موجودی فعلی دخل</span>
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Calculator size={20} /></div>
               </div>
               <h4 className={`text-2xl font-black ${currentSummary.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentSummary.profit.toLocaleString('en-US')} $
               </h4>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-black">مجموع عواید دوره</span>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><ArrowUpCircle size={20} /></div>
               </div>
               <h4 className="text-2xl font-black text-blue-600">{currentSummary.totalIncome.toLocaleString('en-US')} $</h4>
            </div>
            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-black">مجموع مصارف دوره</span>
                  <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><ArrowDownCircle size={20} /></div>
               </div>
               <h4 className="text-2xl font-black text-rose-600">{currentSummary.totalExpense.toLocaleString('en-US')} $</h4>
            </div>
            <div className="bg-slate-900 p-6 rounded-[32px] text-white flex flex-col gap-4">
               <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs font-black">وضعیت سود/زیان</span>
                  <TrendingUp size={20} className="text-emerald-400" />
               </div>
               <h4 className="text-2xl font-black text-emerald-400">{currentSummary.profit.toLocaleString('en-US')} $</h4>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button 
              onClick={() => { setEntryType('عاید'); setIsEntryModalOpen(true); }}
              className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-[24px] font-black shadow-lg transition-all"
            >
              <ArrowUpCircle size={24} />
              ثبت عاید جدید
            </button>
            <button 
              onClick={() => { setEntryType('مصرف'); setIsEntryModalOpen(true); }}
              className="flex-1 flex items-center justify-center gap-3 bg-rose-500 hover:bg-rose-600 text-white p-5 rounded-[24px] font-black shadow-lg transition-all"
            >
              <ArrowDownCircle size={24} />
              ثبت مصرف جدید
            </button>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-800">ریز حسابات دوره: {activePeriod.name}</h3>
                <div className="flex gap-2">
                   <button className="p-2 hover:bg-white rounded-lg text-slate-400"><Printer size={20}/></button>
                   <button className="p-2 hover:bg-white rounded-lg text-slate-400"><FileText size={20}/></button>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-right">
                   <thead>
                      <tr className="bg-slate-50/30">
                         <th className="px-8 py-5 text-sm font-black text-slate-500">تاریخ</th>
                         <th className="px-8 py-5 text-sm font-black text-slate-500">سند</th>
                         <th className="px-8 py-5 text-sm font-black text-slate-500">نوع/کتگوری</th>
                         <th className="px-8 py-5 text-sm font-black text-slate-500">شرح</th>
                         <th className="px-8 py-5 text-sm font-black text-slate-500">مبلغ ($)</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {activePeriod.entries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-6 text-sm font-bold text-slate-400">{entry.date}</td>
                           <td className="px-8 py-6 font-mono text-xs text-slate-400">#{entry.docNo}</td>
                           <td className="px-8 py-6">
                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${entry.type === 'عاید' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                 {entry.type} - {entry.category}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-sm font-bold text-slate-700">{entry.description}</td>
                           <td className={`px-8 py-6 font-black ${entry.type === 'عاید' ? 'text-blue-600' : 'text-rose-500'}`}>
                              {entry.type === 'عاید' ? '+' : '-'}{entry.amount.toLocaleString('en-US')} $
                           </td>
                        </tr>
                      ))}
                      {activePeriod.entries.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">هیچ تراکنشی در این دوره ثبت نشده است.</td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {/* Archives Section */}
      <div className="space-y-4">
         <div className="flex items-center gap-2">
            <Archive size={20} className="text-slate-400" />
            <h3 className="text-lg font-black text-slate-600">آرشیو دوره‌های بسته شده</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {periods.filter(p => p.status === 'closed').map(period => (
              <div key={period.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center justify-between hover:border-emerald-200 transition-all cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                       <Lock size={20} />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-700">{period.name}</h4>
                       <p className="text-[10px] font-bold text-slate-400">{period.startDate} تا {period.endDate}</p>
                    </div>
                 </div>
                 <div className="text-left">
                    <span className="text-xs font-black text-emerald-600 block">سود نهایی: {period.summary?.profit.toLocaleString('en-US')} $</span>
                    <button className="text-[10px] font-bold text-blue-500 mt-1 hover:underline flex items-center gap-1">مشاهده گزارش <Printer size={10}/></button>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* New Entry Modal */}
      {isEntryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
             <div className={`p-8 border-b border-slate-50 flex justify-between items-center ${entryType === 'عاید' ? 'bg-blue-50/30' : 'bg-rose-50/30'}`}>
                <h3 className="text-2xl font-black text-slate-800">ثبت {entryType} جدید</h3>
                <button onClick={() => setIsEntryModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddEntry} className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 block px-1">شماره سند</label>
                      <input name="docNo" value={formData.docNo} onChange={(e) => setFormData({...formData, docNo: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-mono" placeholder="101"/>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-400 block px-1">کتگوری</label>
                      <input required name="category" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-bold" placeholder={entryType === 'عاید' ? 'مثلا: ثبت‌نام' : 'مثلا: کرایه'}/>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-slate-400 block px-1">مبلغ (USD $)</label>
                   <input required type="number" name="amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none text-2xl font-black text-slate-800" placeholder="0"/>
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-slate-400 block px-1">توضیحات</label>
                   <input required name="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-slate-900 outline-none font-bold" placeholder="شرح تراکنش..."/>
                </div>
                <button type="submit" className={`w-full py-5 rounded-[24px] font-black text-white shadow-xl transition-all ${entryType === 'عاید' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                   تایید و ثبت در دفتر کل
                </button>
             </form>
          </div>
        </div>
      )}

      {/* New Period Modal */}
      {isPeriodModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
             <div className="p-8 border-b border-slate-50 bg-emerald-50/30 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800">ایجاد دوره مالی جدید</h3>
                <button onClick={() => setIsPeriodModalOpen(false)} className="p-2 hover:bg-white rounded-full text-slate-400"><X size={24} /></button>
             </div>
             <form onSubmit={handleCreatePeriod} className="p-8 space-y-6 text-right">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 text-amber-800 text-xs font-bold italic">
                   <Calculator size={16} className="shrink-0" />
                   توجه: با ایجاد دوره جدید، دوره قبلی به صورت خودکار بسته و آرشیو می‌شود.
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-black text-slate-400 block px-1">نام دوره مالی</label>
                   <input required value={periodName} onChange={(e) => setPeriodName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-slate-800" placeholder="مثلا: کاروان حج رمضان 1405"/>
                </div>
                <button type="submit" className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black shadow-xl transition-all">
                   شروع دوره مالی جدید
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralLedger;
