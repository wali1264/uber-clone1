
import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  X, 
  Save, 
  Phone, 
  MapPin, 
  Globe, 
  DollarSign, 
  Check, 
  Trash2, 
  Edit, 
  Printer, 
  BookOpen,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard
} from 'lucide-react';

const SAR_RATE = 3.75;

export interface ArabicCompanyLedger {
  id: string;
  date: string;
  description: string;
  debit: number; // What we owe them (Bard)
  credit: number; // What we paid them (Rasid)
}

export interface ArabicCompany {
  id: string;
  name: string;
  code: string;
  location: string;
  phone: string;
  email: string;
  balance: number;
  ledger: ArabicCompanyLedger[];
}

interface ArabicCompaniesProps {
  companies: ArabicCompany[];
  onUpdateCompanies: (companies: ArabicCompany[]) => void;
}

const ArabicCompanies: React.FC<ArabicCompaniesProps> = ({ companies, onUpdateCompanies }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ArabicCompany | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    location: 'مکه مکرمه',
    phone: '',
    email: '',
    initialDebt: ''
  });

  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: 'پرداخت بابت تسویه حساب',
    date: new Intl.DateTimeFormat('fa-AF').format(new Date())
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initialDebtVal = parseFloat(formData.initialDebt) || 0;
    const newCompany: ArabicCompany = {
      id: Date.now().toString(),
      name: formData.name,
      code: `SA-${Math.floor(Math.random() * 900) + 100}`,
      location: formData.location,
      phone: formData.phone,
      email: formData.email,
      balance: initialDebtVal,
      ledger: initialDebtVal > 0 ? [{
        id: Date.now().toString() + '-init',
        date: new Intl.DateTimeFormat('fa-AF').format(new Date()),
        description: 'ثبت اولیه حساب',
        debit: initialDebtVal,
        credit: 0
      }] : []
    };
    onUpdateCompanies([newCompany, ...companies]);
    closeModal();
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompany) return;

    const amount = parseFloat(paymentData.amount) || 0;
    if (amount <= 0) return;

    const newLedgerEntry: ArabicCompanyLedger = {
      id: Date.now().toString(),
      date: paymentData.date,
      description: paymentData.description,
      debit: 0,
      credit: amount
    };

    const updatedCompanies = companies.map(c => {
      if (c.id === selectedCompany.id) {
        return {
          ...c,
          balance: c.balance - amount,
          ledger: [...c.ledger, newLedgerEntry]
        };
      }
      return c;
    });

    onUpdateCompanies(updatedCompanies);
    setIsPaymentModalOpen(false);
    setPaymentData({
      amount: '',
      description: 'پرداخت بابت تسویه حساب',
      date: new Intl.DateTimeFormat('fa-AF').format(new Date())
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', location: 'مکه مکرمه', phone: '', email: '', initialDebt: '' });
  };

  const filteredCompanies = companies.filter(c => 
    c.name.includes(searchTerm) || c.code.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">شرکت‌های طرف قرارداد عربی</h2>
          <p className="text-slate-500 mt-1 font-medium">مدیریت تعاملات مالی و رزروهای هوتل و ترانسپورت در عربستان</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-emerald-100"
        >
          <Plus size={22} />
          ثبت شرکت همکار جدید
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">تعداد شرکت‌ها</span>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Building size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800">{companies.length} شرکت</h3>
            <p className="text-xs text-slate-400 font-bold">طرف قرارداد فعال</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">مجموع بدهی‌های ما (Bard)</span>
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <ArrowDownLeft size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-rose-600">
               {companies.reduce((sum, c) => sum + c.balance, 0).toLocaleString()} $
            </h3>
            <p className="text-xs text-slate-400 font-bold">≈ {(companies.reduce((sum, c) => sum + c.balance, 0) * SAR_RATE).toLocaleString()} SAR</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">رزروهای در جریان</span>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Globe size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-blue-600">
               {companies.reduce((sum, c) => sum + c.ledger.filter(l => l.description.includes('رزرو') || l.description.includes('ترانسپورت')).length, 0)} مورد
            </h3>
            <p className="text-xs text-slate-400 font-bold">هوتل و ترانسپورت</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="جستجوی شرکت با نام یا کد..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold">
          <Filter size={20} />
          فیلتر شهر
        </button>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">نام شرکت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">موقعیت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">شماره تماس</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مانده حساب (بدهی)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Building size={20} />
                      </div>
                      <div>
                        <span className="block font-black text-slate-800" dir="ltr">{company.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{company.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="text-sm font-bold">{company.location}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-300" />
                      <span className="text-sm font-bold" dir="ltr">{company.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-rose-600">
                        {company.balance.toLocaleString()} $
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">≈ {(company.balance * SAR_RATE).toLocaleString()} SAR</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === company.id ? null : company.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === company.id && (
                      <div 
                        ref={menuRef}
                        className="absolute left-4 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: '80%' }}
                      >
                        <button 
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsLedgerOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <BookOpen size={16} className="text-emerald-500" /> صورت حساب و دفتر
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedCompany(company);
                            setIsPaymentModalOpen(true);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3"
                        >
                          <CreditCard size={16} className="text-emerald-600" /> ثبت رسید (پرداخت) به شرکت
                        </button>
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Printer size={16} className="text-indigo-500" /> چاپ تاییدیه شرکت
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3">
                          <Trash2 size={16} /> حذف همکار
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Company Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">ثبت شرکت همکار عربی</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right">نام کامل شرکت (عربی/انگلیسی)</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: شركة المجد للفنادق..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">شهر</label>
                  <select 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  >
                    <option value="مکه مکرمه">مکه مکرمه</option>
                    <option value="مدینه منوره">مدینه منوره</option>
                    <option value="جده">جده</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">شماره تماس (WhatsApp)</label>
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+966 ..."
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right">بدهی اولیه ما به شرکت (USD $)</label>
                <input 
                  name="initialDebt"
                  type="number"
                  value={formData.initialDebt}
                  onChange={handleInputChange}
                  placeholder="۰"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-2xl text-rose-600"
                />
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                  <Check size={22} /> ثبت شرکت
                </button>
                <button type="button" onClick={closeModal} className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-[24px]">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment to Company Modal */}
      {isPaymentModalOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800">ثبت رسید (پرداخت) به شرکت</h3>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-5 text-right">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-1">پرداخت به شرکت:</p>
                <p className="text-lg font-black text-slate-800">{selectedCompany.name}</p>
                <p className="text-xs font-bold text-rose-500 mt-2">باقیمانده بدهی فعلی: {selectedCompany.balance.toLocaleString()} $</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block px-1">مبلغ پرداختی (USD $)</label>
                <input 
                  required
                  name="amount"
                  type="number"
                  value={paymentData.amount}
                  onChange={handlePaymentInputChange}
                  placeholder="0.00"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-2xl text-emerald-600 text-center"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block px-1">تاریخ پرداخت</label>
                <input 
                  required
                  name="date"
                  value={paymentData.date}
                  onChange={handlePaymentInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block px-1">شرح / توضیحات</label>
                <input 
                  required
                  name="description"
                  value={paymentData.description}
                  onChange={handlePaymentInputChange}
                  placeholder="مثلا: پرداخت بابت هوتل مکه"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[20px] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                  <Check size={20} /> تایید و ثبت در دفتر شرکت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {isLedgerOpen && selectedCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <BookOpen size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800">دفتر حساب شرکت: {selectedCompany.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedCompany.code}</p>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-3 gap-6">
                <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100">
                  <span className="text-xs font-bold text-rose-400 block mb-1">مجموع بدهی ما (Bard)</span>
                  <span className="text-2xl font-black text-rose-600">
                    {selectedCompany.ledger.reduce((sum, e) => sum + e.debit, 0).toLocaleString()} $
                  </span>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">مجموع پرداخت‌های ما (Rasid)</span>
                  <span className="text-2xl font-black text-emerald-600">
                    {selectedCompany.ledger.reduce((sum, e) => sum + e.credit, 0).toLocaleString()} $
                  </span>
                </div>
                <div className="bg-slate-900 p-6 rounded-3xl text-white">
                  <span className="text-xs font-bold text-slate-400 block mb-1">مانده نهایی بدهی ($)</span>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black">
                        {(selectedCompany.ledger.reduce((sum, e) => sum + e.debit, 0) - 
                        selectedCompany.ledger.reduce((sum, e) => sum + e.credit, 0)).toLocaleString()} $
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">≈ {((selectedCompany.ledger.reduce((sum, e) => sum + e.debit, 0) - selectedCompany.ledger.reduce((sum, e) => sum + e.credit, 0)) * SAR_RATE).toLocaleString()} SAR</span>
                  </div>
                </div>
              </div>

              <div className="border border-slate-100 rounded-3xl overflow-hidden">
                <table className="w-full text-right">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-sm font-black text-slate-500">تاریخ</th>
                      <th className="px-6 py-4 text-sm font-black text-slate-500">شرح تراکنش</th>
                      <th className="px-6 py-4 text-sm font-black text-rose-500">بدهی ما ($)</th>
                      <th className="px-6 py-4 text-sm font-black text-emerald-600">پرداخت ما ($)</th>
                      <th className="px-6 py-4 text-sm font-black text-slate-800">مانده ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {(() => {
                      let runningBalance = 0;
                      return selectedCompany.ledger.map((entry) => {
                        runningBalance += (entry.debit - entry.credit);
                        return (
                          <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold text-slate-400">{entry.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-700">{entry.description}</td>
                            <td className="px-6 py-4 font-black text-rose-500">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 font-black text-emerald-600">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 font-black text-slate-900">{runningBalance.toLocaleString()} $</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between">
               <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                 <Printer size={18} /> چاپ صورت حساب
               </button>
               <button onClick={() => setIsLedgerOpen(false)} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black">بستن دفتر</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArabicCompanies;
