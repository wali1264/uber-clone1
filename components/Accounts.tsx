
import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus,
  Calendar,
  CreditCard,
  FileText,
  TrendingUp,
  X,
  Check,
  Trash2,
  Edit,
  Printer
} from 'lucide-react';

const SAR_RATE = 3.75;

interface Transaction {
  id: string;
  description: string;
  type: 'دریافتی' | 'پرداختی';
  amount: string;
  category: string;
  date: string;
  status: 'تکمیل شده' | 'در جریان';
}

const Accounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      description: 'قسط اول پکیج حج - احمد رحمانی',
      type: 'دریافتی',
      amount: '۱,۲۰۰',
      category: 'پکیج حج',
      date: '۱۴۰۳/۰۳/۱۲',
      status: 'تکمیل شده'
    },
    {
      id: '2',
      description: 'پرداخت کرایه هوتل زمزم مدینه',
      type: 'پرداختی',
      amount: '۴۵۰',
      category: 'هوتل و اقامت',
      date: '۱۴۰۳/۰۳/۱۰',
      status: 'تکمیل شده'
    },
    {
      id: '3',
      description: 'خرید تکت‌های پرواز کابل-جده',
      type: 'پرداختی',
      amount: '۳۸۰',
      category: 'پرواز',
      date: '۱۴۰۳/۰۳/۰۸',
      status: 'تکمیل شده'
    }
  ]);

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
    description: '',
    type: 'دریافتی' as 'دریافتی' | 'پرداختی',
    amount: '',
    category: 'عمومی',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    setOpenMenuId(null);
  };

  const startEdit = (tx: Transaction) => {
    setEditingTransactionId(tx.id);
    setFormData({
      description: tx.description,
      type: tx.type,
      amount: tx.amount.replace(/,/g, ''),
      category: tx.category
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTransactionId) {
      setTransactions(prev => prev.map(t => 
        t.id === editingTransactionId 
          ? { 
              ...t, 
              description: formData.description,
              type: formData.type,
              category: formData.category,
              amount: Number(formData.amount).toLocaleString()
            } 
          : t
      ));
    } else {
      const newEntry: Transaction = {
        id: Date.now().toString(),
        description: formData.description,
        type: formData.type,
        amount: Number(formData.amount).toLocaleString(),
        category: formData.category,
        date: new Intl.DateTimeFormat('fa-AF').format(new Date()),
        status: 'تکمیل شده'
      };
      setTransactions([newEntry, ...transactions]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransactionId(null);
    setFormData({ description: '', type: 'دریافتی', amount: '', category: 'عمومی' });
  };

  const filteredTransactions = transactions.filter(t => 
    t.description.includes(searchTerm) || t.category.includes(searchTerm)
  );

  const totalBalance = 18500;
  const totalReceived = 21500;
  const totalPaid = 3000;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">حسابات و بیلانس مالی</h2>
          <p className="text-slate-500 mt-1 font-medium">مدیریت نقدینگی، دریافتی‌ها و مخارج شرکت</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-indigo-100"
        >
          <Plus size={22} />
          ثبت تراکنش جدید
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">کل موجودی نقد ($)</span>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Wallet size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800">{totalBalance.toLocaleString()} $</h3>
            <p className="text-xs text-slate-400 font-bold">≈ {(totalBalance * SAR_RATE).toLocaleString()} SAR</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">مجموع دریافتی</span>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800 text-blue-600">{totalReceived.toLocaleString()} $</h3>
            <p className="text-xs text-slate-400 font-bold">در ۳۰ روز گذشته</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">مجموع پرداختی</span>
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <ArrowDownLeft size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800 text-rose-500">{totalPaid.toLocaleString()} $</h3>
            <p className="text-xs text-slate-400 font-bold">مصارف و تادیات</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="جستجوی تراکنش بر اساس شرح یا دسته بندی..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold">
          <Filter size={20} />
          فیلتر پیشرفته
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">شرح تراکنش</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">دسته بندی</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">تاریخ</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مبلغ ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">وضعیت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'دریافتی' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {tx.type === 'دریافتی' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <span className="font-bold text-slate-700">{tx.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-400">{tx.category}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={16} />
                      <span className="text-xs font-bold">{tx.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className={`text-lg font-black ${tx.type === 'دریافتی' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {tx.type === 'دریافتی' ? '+' : '-'}{tx.amount} $
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">≈ {(parseFloat(tx.amount.replace(/,/g, '')) * SAR_RATE).toLocaleString()} SAR</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-500">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === tx.id && (
                      <div 
                        ref={menuRef}
                        className="absolute left-4 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: '80%' }}
                      >
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Printer size={16} className="text-indigo-500" /> چاپ رسید بانکی
                        </button>
                        <button 
                          onClick={() => startEdit(tx)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Edit size={16} className="text-blue-500" /> ویرایش تراکنش
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button 
                          onClick={() => deleteTransaction(tx.id)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                        >
                          <Trash2 size={16} /> حذف تراکنش
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

      {/* Add/Edit Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">
                {editingTransactionId ? 'ویرایش تراکنش مالی' : 'ثبت تراکنش جدید'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right">شرح تراکنش</label>
                <input 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="مثال: قسط اول مسافر..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">نوع تراکنش</label>
                  <select 
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  >
                    <option value="دریافتی">دریافتی (ورودی)</option>
                    <option value="پرداختی">پرداختی (خروجی)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">دسته بندی</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                  >
                    <option value="پکیج حج">پکیج حج</option>
                    <option value="پکیج عمره">پکیج عمره</option>
                    <option value="هوتل و اقامت">هوتل و اقامت</option>
                    <option value="پرواز">پرواز</option>
                    <option value="ویزه">ویزه</option>
                    <option value="عمومی">عمومی</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right">مبلغ (USD $)</label>
                <div className="relative">
                  <input 
                    required
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="۰"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-2xl text-indigo-600"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">$</span>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <Check size={22} />
                  {editingTransactionId ? 'بروزرسانی تراکنش' : 'ذخیره تراکنش'}
                </button>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-[24px] transition-all"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
