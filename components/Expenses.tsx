
import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingDown, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus,
  Calendar,
  Receipt,
  Tag,
  X,
  Check,
  Building2,
  Users,
  Trash2,
  Edit,
  Printer,
  Eye
} from 'lucide-react';

const SAR_RATE = 3.75;

interface Expense {
  id: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  payee: string;
}

const Expenses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'کرایه دفتر مرکزی - ماه جوزا',
      amount: '۴۰۰',
      category: 'کرایه',
      date: '۱۴۰۳/۰۳/۰۱',
      payee: 'مالک ساختمان'
    },
    {
      id: '2',
      description: 'معاشات کارمندان بخش فروش',
      amount: '۱,۲۰۰',
      category: 'معاشات',
      date: '۱۴۰۳/۰۳/۰۵',
      payee: 'کارمندان'
    },
    {
      id: '3',
      description: 'بیل برق و انترنت دفتر',
      amount: '۶۰',
      category: 'خدمات',
      date: '۱۴۰۳/۰۳/۰۸',
      payee: 'شرکت برشنا / افغان تلیکام'
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
    amount: '',
    category: 'عمومی',
    payee: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    setOpenMenuId(null);
  };

  const startEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setFormData({
      description: expense.description,
      amount: expense.amount.replace(/,/g, ''),
      category: expense.category,
      payee: expense.payee
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpenseId) {
      setExpenses(prev => prev.map(e => 
        e.id === editingExpenseId 
          ? { 
              ...e, 
              description: formData.description,
              amount: Number(formData.amount).toLocaleString(),
              category: formData.category,
              payee: formData.payee
            } 
          : e
      ));
    } else {
      const newEntry: Expense = {
        id: Date.now().toString(),
        description: formData.description,
        amount: Number(formData.amount).toLocaleString(),
        category: formData.category,
        date: new Intl.DateTimeFormat('fa-AF').format(new Date()),
        payee: formData.payee
      };
      setExpenses([newEntry, ...expenses]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpenseId(null);
    setFormData({ description: '', amount: '', category: 'عمومی', payee: '' });
  };

  const filteredExpenses = expenses.filter(e => 
    e.description.includes(searchTerm) || e.category.includes(searchTerm) || e.payee.includes(searchTerm)
  );

  const totalExpenses = 1660;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800">مصارفات جاری شرکت</h2>
          <p className="text-slate-500 mt-1 font-medium">ثبت و کنترل هزینه‌های عملیاتی و اداری</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-rose-100"
        >
          <Plus size={22} />
          ثبت هزینه جدید
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">مجموع مصارف ماه ($)</span>
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800">{totalExpenses.toLocaleString()} $</h3>
            <p className="text-xs text-slate-400 font-bold">≈ {(totalExpenses * SAR_RATE).toLocaleString()} SAR</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">اجاره و ساختمان</span>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-amber-600">۴۰۰ $</h3>
            <p className="text-xs text-slate-400 font-bold">سهم ۲۵٪ از کل مصارف</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">معاشات و پرسونل</span>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
              <Users size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-indigo-500">۱,۲۰۰ $</h3>
            <p className="text-xs text-slate-400 font-bold">بزرگترین بخش هزینه</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="جستجو در شرح، دسته بندی یا دریافت کننده..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold">
          <Filter size={20} />
          فیلتر پیشرفته
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">شرح هزینه</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">دسته بندی</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">دریافت کننده</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">تاریخ پرداخت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مبلغ ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Receipt size={18} />
                      </div>
                      <span className="font-bold text-slate-700">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-slate-300" />
                      <span className="text-sm font-bold text-slate-500">{expense.category}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600">{expense.payee}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={16} />
                      <span className="text-xs font-bold">{expense.date}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-rose-600">
                        {expense.amount} $
                        </span>
                        <span className="text-[10px] font-bold text-slate-300">≈ {(parseFloat(expense.amount.replace(/,/g, '')) * SAR_RATE).toLocaleString()} SAR</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === expense.id && (
                      <div 
                        ref={menuRef}
                        className="absolute left-4 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: '80%' }}
                      >
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Printer size={16} className="text-slate-400" /> چاپ سند مخارج
                        </button>
                        <button 
                          onClick={() => startEdit(expense)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Edit size={16} className="text-blue-500" /> ویرایش هزینه
                        </button>
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Eye size={16} className="text-indigo-500" /> مشاهده پیوست‌ها
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button 
                          onClick={() => deleteExpense(expense.id)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                        >
                          <Trash2 size={16} /> حذف هزینه
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

      {/* Add/Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">
                {editingExpenseId ? 'ویرایش هزینه جاری' : 'ثبت هزینه جدید شرکت'}
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
                <label className="text-xs font-black text-slate-400 block text-right">شرح هزینه</label>
                <input 
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="مثال: خرید ملزمات دفتری..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">دسته بندی</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                  >
                    <option value="معاشات">معاشات و پرسونل</option>
                    <option value="کرایه">کرایه و ساختمان</option>
                    <option value="خدمات">خدمات (برق/انترنت)</option>
                    <option value="تبلیغات">تبلیغات و مارکتینگ</option>
                    <option value="ملزمات">ملزمات اداری</option>
                    <option value="عمومی">عمومی و سایر</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right">دریافت کننده</label>
                  <input 
                    required
                    name="payee"
                    value={formData.payee}
                    onChange={handleInputChange}
                    placeholder="نام شخص یا شرکت"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right">مبلغ هزینه (USD $)</label>
                <div className="relative">
                  <input 
                    required
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="۰"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-black text-2xl text-rose-600"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">$</span>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-rose-100 flex items-center justify-center gap-3"
                >
                  <Check size={22} />
                  {editingExpenseId ? 'بروزرسانی هزینه' : 'ثبت هزینه'}
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

export default Expenses;
