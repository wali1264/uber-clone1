
import React, { useState, useEffect, useRef } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  MoreVertical, 
  Plus,
  Phone,
  DollarSign,
  Briefcase,
  TrendingUp,
  X,
  Check,
  UserPlus,
  ArrowUpRight,
  ShieldCheck,
  Edit,
  Trash2,
  Lock,
  Unlock,
  CreditCard
} from 'lucide-react';

const SAR_RATE = 3.75;

interface CommissionAgent {
  id: string;
  name: string;
  code: string;
  phone: string;
  totalCommissions: string;
  paidAmount: string;
  pendingAmount: string;
  status: 'فعال' | 'غیرفعال';
}

const Commission: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [payingAgent, setPayingAgent] = useState<CommissionAgent | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [agents, setAgents] = useState<CommissionAgent[]>([
    {
      id: '1',
      name: 'شریف الله همدرد',
      code: 'AGN-101',
      phone: '0772233445',
      totalCommissions: '450',
      paidAmount: '300',
      pendingAmount: '150',
      status: 'فعال'
    },
    {
      id: '2',
      name: 'نوراحمد منصوری',
      code: 'AGN-102',
      phone: '0788990011',
      totalCommissions: '120',
      paidAmount: '120',
      pendingAmount: '0',
      status: 'فعال'
    },
    {
      id: '3',
      name: 'عبدالکریم رحیمی',
      code: 'AGN-103',
      phone: '0700123456',
      totalCommissions: '85',
      paidAmount: '0',
      pendingAmount: '85',
      status: 'غیرفعال'
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
    name: '',
    phone: '',
    code: '',
    initialCommission: '0'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleStatus = (id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, status: a.status === 'فعال' ? 'غیرفعال' : 'فعال' } : a
    ));
    setOpenMenuId(null);
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
    setOpenMenuId(null);
  };

  const startEdit = (agent: CommissionAgent) => {
    setEditingAgentId(agent.id);
    setFormData({
      name: agent.name,
      phone: agent.phone,
      code: agent.code,
      initialCommission: agent.totalCommissions.replace(/,/g, '')
    });
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const startPayment = (agent: CommissionAgent) => {
    setPayingAgent(agent);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
    setOpenMenuId(null);
  };

  const formatWithSAR = (usdVal: string | number) => {
    const usd = typeof usdVal === 'string' ? parseFloat(usdVal.replace(/,/g, '')) || 0 : usdVal;
    return (usd * SAR_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingAgent) return;

    const amountToPay = Number(paymentAmount);
    if (isNaN(amountToPay) || amountToPay <= 0) return;

    setAgents(prev => prev.map(a => {
      if (a.id === payingAgent.id) {
        const currentPaid = parseFloat(a.paidAmount.replace(/,/g, '')) || 0;
        const currentTotal = parseFloat(a.totalCommissions.replace(/,/g, '')) || 0;
        const newPaid = currentPaid + amountToPay;
        const newPending = Math.max(0, currentTotal - newPaid);

        return {
          ...a,
          paidAmount: newPaid.toLocaleString('en-US'),
          pendingAmount: newPending.toLocaleString('en-US')
        };
      }
      return a;
    }));

    setIsPaymentModalOpen(false);
    setPayingAgent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgentId) {
      setAgents(prev => prev.map(a => 
        a.id === editingAgentId 
          ? { 
              ...a, 
              name: formData.name, 
              phone: formData.phone, 
              code: formData.code,
              totalCommissions: Number(formData.initialCommission).toLocaleString('en-US'),
              pendingAmount: (Number(formData.initialCommission) - (parseFloat(a.paidAmount.replace(/,/g, '')) || 0)).toLocaleString('en-US')
            } 
          : a
      ));
    } else {
      const newAgent: CommissionAgent = {
        id: Date.now().toString(),
        name: formData.name,
        code: formData.code || `AGN-${Math.floor(Math.random() * 900) + 100}`,
        phone: formData.phone,
        totalCommissions: Number(formData.initialCommission).toLocaleString('en-US'),
        paidAmount: '0',
        pendingAmount: Number(formData.initialCommission).toLocaleString('en-US'),
        status: 'فعال'
      };
      setAgents([newAgent, ...agents]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAgentId(null);
    setFormData({ name: '', phone: '', code: '', initialCommission: '0' });
  };

  const filteredAgents = agents.filter(a => 
    a.name.includes(searchTerm) || a.code.includes(searchTerm) || a.phone.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-right">
          <h2 className="text-3xl font-black text-slate-800">مدیریت کمیشن‌کاران</h2>
          <p className="text-slate-500 mt-1 font-medium">پیگیری همکاری‌ها، محاسبه و تصفیه کمیشن‌ها (USD/SAR)</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-[24px] font-black transition-all shadow-xl shadow-emerald-100"
        >
          <UserPlus size={22} />
          افزودن همکار جدید
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 text-right">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">کل همکاران</span>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
              <UserCheck size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800">{agents.length} نفر</h3>
            <p className="text-xs text-slate-400 font-bold">همکاران فعال و غیرفعال</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 text-right">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">مجموع کمیشن‌ها ($)</span>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-blue-600">655 $</h3>
            <p className="text-xs text-slate-400 font-bold">≈ {formatWithSAR(655)} SAR</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-4 text-right">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold text-sm">قابل پرداخت ($)</span>
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <ArrowUpRight size={24} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-amber-600">235 $</h3>
            <p className="text-xs text-slate-400 font-bold">در انتظار تصفیه</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-right">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="جستجوی همکار بر اساس نام، کد یا شماره تماس..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold">
          <Filter size={20} />
          فیلتر
        </button>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-visible text-right">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">مشخصات همکار</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">شماره تماس</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مجموع کمیشن ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">پرداخت شده ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">باقیمانده ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">وضعیت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAgents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        {agent.name.charAt(0)}
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-slate-800">{agent.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{agent.code}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone size={14} className="text-slate-300" />
                      <span className="text-sm font-bold">{agent.phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-700">{agent.totalCommissions} $</span>
                        <span className="text-[10px] font-bold text-slate-300">≈ {formatWithSAR(agent.totalCommissions)} SAR</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-emerald-600">{agent.paidAmount} $</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-sm font-black ${agent.pendingAmount !== '0' ? 'text-amber-600' : 'text-slate-300'}`}>
                      {agent.pendingAmount} $
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${agent.status === 'فعال' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <span className={`text-xs font-black ${agent.status === 'فعال' ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {agent.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === agent.id ? null : agent.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === agent.id && (
                      <div 
                        ref={menuRef}
                        className="absolute left-4 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: '80%' }}
                      >
                        <button 
                          onClick={() => startPayment(agent)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <DollarSign size={16} className="text-emerald-500" /> ثبت پرداخت کمیشن
                        </button>
                        <button 
                          onClick={() => startEdit(agent)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3"
                        >
                          <Edit size={16} className="text-blue-500" /> ویرایش همکار
                        </button>
                        <button 
                          onClick={() => toggleStatus(agent.id)}
                          className={`w-full text-right px-4 py-2 text-sm font-bold hover:bg-slate-50 flex items-center gap-3 ${agent.status === 'فعال' ? 'text-amber-600' : 'text-emerald-600'}`}
                        >
                          {agent.status === 'فعال' ? <Lock size={16} /> : <Unlock size={16} />} 
                          {agent.status === 'فعال' ? 'غیرفعال سازی' : 'فعال سازی'}
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        <button 
                          onClick={() => deleteAgent(agent.id)}
                          className="w-full text-right px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                        >
                          <Trash2 size={16} /> حذف از سیستم
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

      {/* Add/Edit Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-black text-slate-800">
                  {editingAgentId ? 'ویرایش اطلاعات همکار' : 'تعریف همکار جدید'}
                </h3>
              </div>
              <button 
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 text-right" dir="rtl">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right px-1">نام و تخلص کامل</label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="مثال: محمد ادریس ناصری"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right px-1">شماره تماس</label>
                  <input 
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="07XXXXXXXX"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-400 block text-right px-1">کد اختصاصی (اختیاری)</label>
                  <input 
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="AGN-105"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right px-1">کمیشن اولیه / مانده (USD $)</label>
                <div className="relative">
                  <input 
                    required
                    name="initialCommission"
                    type="number"
                    value={formData.initialCommission}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-2xl text-emerald-600 text-center"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">$</span>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-100 flex items-center justify-center gap-3">
                  <Check size={22} /> {editingAgentId ? 'بروزرسانی همکار' : 'تایید همکار'}
                </button>
                <button type="button" onClick={closeModal} className="px-8 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-[24px]">
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && payingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-800">ثبت پرداخت کمیشن</h3>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handlePaymentSubmit} className="p-8 space-y-6 text-right" dir="rtl">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2">همکار:</p>
                <p className="text-lg font-black text-slate-800">{payingAgent.name}</p>
                <div className="flex justify-between mt-3 pt-3 border-t border-slate-200/50">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400">کل طلب:</p>
                    <p className="text-sm font-black text-slate-600">{payingAgent.totalCommissions} $</p>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400">باقیمانده فعلی:</p>
                    <p className="text-sm font-black text-amber-600">{payingAgent.pendingAmount} $</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-400 block text-right px-1">مبلغ پرداختی جدید ($)</label>
                <div className="relative">
                  <input 
                    required
                    type="number"
                    autoFocus
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black text-2xl text-emerald-600 text-center"
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-300">$</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-[20px] shadow-lg shadow-emerald-100 flex items-center justify-center gap-2">
                  <Check size={20} /> تایید و ثبت پرداخت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Commission;
