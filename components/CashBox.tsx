
import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Plus, 
  Minus, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  History, 
  Lock, 
  Archive, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  Printer,
  Calendar,
  User,
  Tags
} from 'lucide-react';

const SAR_RATE = 3.75;

interface CashTransaction {
  id: string;
  date: string;
  type: 'دریافت' | 'پرداخت';
  category: string; 
  amount: number;
  person: string;
  period: string;
  description: string;
  status: 'تأیید شده' | 'در انتظار تأیید';
}

const CashBox: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([
    {
      id: '1',
      date: '1403/05/01',
      type: 'دریافت',
      category: 'دریافت از حاجی',
      amount: 500,
      person: 'احمد رحمانی',
      period: 'دوره حج 1403 - کاروان اول',
      description: 'پیش‌پرداخت قسط اول',
      status: 'تأیید شده'
    },
    {
      id: '2',
      date: '1403/05/02',
      type: 'پرداخت',
      category: 'مصرف دوا',
      amount: 100,
      person: 'دواخانه مرکزی',
      period: 'دوره حج 1403 - کاروان اول',
      description: 'خرید تجهیزات صحی اولیه',
      status: 'تأیید شده'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'دریافت' | 'پرداخت'>('دریافت');
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    person: '',
    period: 'دوره حج 1403 - کاروان اول',
    description: '',
    date: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date())
  });

  const totalReceived = transactions.filter(t => t.type === 'دریافت').reduce((sum, t) => sum + t.amount, 0);
  const totalPaid = transactions.filter(t => t.type === 'پرداخت').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalReceived - totalPaid;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formData.amount) || 0;

    if (modalType === 'پرداخت' && amountNum > currentBalance) {
      setError('خطا: موجودی صندوق کافی نیست!');
      return;
    }

    const newTransaction: CashTransaction = {
      id: Date.now().toString(),
      date: formData.date,
      type: modalType,
      category: formData.category,
      amount: amountNum,
      person: formData.person,
      period: formData.period,
      description: formData.description,
      status: modalType === 'پرداخت' ? 'در انتظار تأیید' : 'تأیید شده'
    };

    setTransactions([newTransaction, ...transactions]);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError(null);
    setFormData({
      amount: '',
      category: '',
      person: '',
      period: 'دوره حج 1403 - کاروان اول',
      description: '',
      date: new Intl.DateTimeFormat('fa-AF', { numberingSystem: 'latn' }).format(new Date())
    });
  };

  const closePeriod = () => {
    if (confirm('آیا از بستن صندوق و تحویل موجودی به رئیس اطمینان دارید؟ دوره فعلی آرشیو خواهد شد.')) {
      alert('گزارش نهایی صندوق صادر شد. صندوق برای دوره جدید آماده است.');
      setTransactions([]);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-[24px] flex items-center justify-center shadow-xl shadow-emerald-100">
            <Coins size={32} />
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800">صندوق نقد (دخل)</h2>
            <p className="text-slate-500 mt-1 font-medium">مدیریت لحظه‌ای نقدینگی و بردی‌های کاروان (USD/SAR)</p>
          </div>
        </div>

        <button 
          onClick={closePeriod}
          className="flex items-center gap-2 px-6 py-4 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl font-black shadow-lg transition-all"
        >
          <Lock size={20} />
          بستن صندوق دوره
        </button>
      </div>

      {/* Balance Card - BIG AND CLEAR */}
      <div className="bg-emerald-600 p-10 rounded-[48px] shadow-2xl shadow-emerald-200 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2 text-center md:text-right">
              <span className="text-emerald-100 font-bold text-sm uppercase tracking-widest">موجودی فعلی صندوق</span>
              <div className="flex flex-col">
                <h3 className="text-5xl md:text-6xl font-black tracking-tight">
                    {currentBalance.toLocaleString('en-US')} <span className="text-2xl font-normal opacity-70">دالر ($)</span>
                </h3>
                <p className="text-xl font-bold text-emerald-100 mt-2 opacity-80">
                    ≈ {(currentBalance * SAR_RATE).toLocaleString('en-US')} رئال سعودی (SAR)
                </p>
              </div>
           </div>
           <div className="flex gap-4 w-full md:w-auto">
              <button 
                onClick={() => { setModalType('دریافت'); setIsModalOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-emerald-700 px-8 py-5 rounded-3xl font-black shadow-lg hover:bg-emerald-50 transition-all"
              >
                <Plus size={24} />
                ثبت دریافت
              </button>
              <button 
                onClick={() => { setModalType('پرداخت'); setIsModalOpen(true); }}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-emerald-700 text-white border border-emerald-500 px-8 py-5 rounded-3xl font-black shadow-lg hover:bg-emerald-800 transition-all"
              >
                <Minus size={24} />
                ثبت بردی (پرداخت)
              </button>
           </div>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <ArrowUpCircle size={28} />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-bold">مجموع دریافت‌ها</p>
              <h4 className="text-xl font-black text-slate-800">{totalReceived.toLocaleString('en-US')} <span className="text-xs">$</span></h4>
              <p className="text-[10px] text-slate-300">≈ {(totalReceived * SAR_RATE).toLocaleString('en-US')} SAR</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
              <ArrowDownCircle size={28} />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-bold">مجموع پرداخت‌ها</p>
              <h4 className="text-xl font-black text-slate-800">{totalPaid.toLocaleString('en-US')} <span className="text-xs">$</span></h4>
              <p className="text-[10px] text-slate-300">≈ {(totalPaid * SAR_RATE).toLocaleString('en-US')} SAR</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
           <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <History size={28} />
           </div>
           <div>
              <p className="text-slate-400 text-xs font-bold">باقی‌مانده نقدی</p>
              <h4 className="text-xl font-black text-slate-800">{currentBalance.toLocaleString('en-US')} <span className="text-xs">$</span></h4>
              <p className="text-[10px] text-slate-300">≈ {(currentBalance * SAR_RATE).toLocaleString('en-US')} SAR</p>
           </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-slate-400">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-800">گردش صندوق (گزارش حرکات)</h3>
           </div>
           <button className="p-2 hover:bg-white rounded-lg text-slate-400"><Printer size={20}/></button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-sm font-black text-slate-500">تاریخ</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">منبع / گیرنده</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">نوع / دسته</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">دریافت ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">پرداخت ($)</th>
                <th className="px-8 py-5 text-sm font-black text-emerald-600">باقی‌مانده</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {(() => {
                let runningBalance = 0;
                return [...transactions].reverse().map((t, idx) => {
                  if (t.type === 'دریافت') runningBalance += t.amount;
                  else runningBalance -= t.amount;

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-slate-400">{t.date}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-700">{t.person}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{t.description}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${t.type === 'دریافت' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                          {t.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-blue-600">
                        {t.type === 'دریافت' ? `+ ${t.amount.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="px-8 py-6 font-black text-rose-600">
                        {t.type === 'پرداخت' ? `- ${t.amount.toLocaleString('en-US')}` : '-'}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                            <span className="font-black text-emerald-600">{runningBalance.toLocaleString('en-US')} $</span>
                            <span className="text-[10px] text-slate-400">≈ {(runningBalance * SAR_RATE).toLocaleString('en-US')} SAR</span>
                        </div>
                      </td>
                    </tr>
                  );
                }).reverse();
              })()}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-slate-400 font-bold">هیچ تراکنشی در این دوره ثبت نشده است.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className={`p-8 border-b border-slate-50 flex justify-between items-center ${modalType === 'دریافت' ? 'bg-blue-50/30' : 'bg-rose-50/30'}`}>
              <div className="flex items-center gap-3">
                 {modalType === 'دریافت' ? <ArrowUpCircle className="text-blue-600" size={24}/> : <ArrowDownCircle className="text-rose-600" size={24}/>}
                 <h3 className="text-2xl font-black text-slate-800">ثبت {modalType} نقدی</h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 text-right">
              {error && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3 text-rose-600 font-bold text-sm animate-pulse">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block px-1">مبلغ (USD $)</label>
                  <input required name="amount" type="number" value={formData.amount} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-2xl font-black text-slate-800 text-center" placeholder="0"/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block px-1">تاریخ</label>
                  <input required name="date" value={formData.date} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block px-1">{modalType === 'دریافت' ? 'منبع دریافت' : 'گیرنده (بردی برای)'}</label>
                <div className="relative">
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input required name="person" value={formData.person} onChange={handleInputChange} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" placeholder={modalType === 'دریافت' ? 'نام حاجی یا بانک' : 'نام شخص یا دلیل برداشت'}/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block px-1">نوع / دسته</label>
                  <div className="relative">
                    <Tags className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    {modalType === 'دریافت' ? (
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                        <option value="">انتخاب کنید...</option>
                        <option value="دریافت از حاجی">دریافت از حاجی</option>
                        <option value="انتقال از بانک">انتقال از بانک</option>
                        <option value="برگشت مصرف">برگشت مصرف</option>
                        <option value="سایر عواید">سایر عواید</option>
                      </select>
                    ) : (
                      <select name="category" value={formData.category} onChange={handleInputChange} className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                        <option value="">انتخاب کنید...</option>
                        <option value="مصرف دوا">مصرف دوا</option>
                        <option value="پرداخت کرایه">پرداخت کرایه</option>
                        <option value="معاش">معاش</option>
                        <option value="بردی رئیس">بردی رئیس</option>
                        <option value="مصارف فوری حج">مصارف فوری حج</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block px-1">دوره حج</label>
                  <input required name="period" value={formData.period} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-xs" readOnly />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block px-1">توضیحات</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold" placeholder="شرح کامل تراکنش..."></textarea>
              </div>

              <button type="submit" className={`w-full py-5 rounded-[24px] font-black text-white shadow-xl transition-all ${modalType === 'دریافت' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                 تایید و ثبت در صندوق
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashBox;
