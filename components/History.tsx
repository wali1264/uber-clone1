
import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Search, 
  Filter, 
  Printer, 
  Eye, 
  FileText, 
  Calendar, 
  User, 
  ArrowLeftRight,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  MoreVertical,
  RotateCcw
} from 'lucide-react';

const SAR_RATE = 3.75;

interface Receipt {
  id: string;
  receiptNo: string;
  travelerName: string;
  amount: string;
  paymentType: 'نقد' | 'بانک' | 'حواله';
  service: 'عمره' | 'حج' | 'ویزه';
  date: string;
  status: 'معتبر' | 'باطل شده';
}

const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: '1',
      receiptNo: 'REC-2024-001',
      travelerName: 'احمد رحمانی',
      amount: '1,200',
      paymentType: 'نقد',
      service: 'عمره',
      date: '1403/03/12',
      status: 'معتبر'
    },
    {
      id: '2',
      receiptNo: 'REC-2024-002',
      travelerName: 'مریم کریمی',
      amount: '3,500',
      paymentType: 'حواله',
      service: 'حج',
      date: '1403/03/14',
      status: 'معتبر'
    },
    {
      id: '3',
      receiptNo: 'REC-2024-003',
      travelerName: 'محمد ادریس ناصری',
      amount: '400',
      paymentType: 'نقد',
      service: 'ویزه',
      date: '1403/03/15',
      status: 'باطل شده'
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

  const formatWithSAR = (usdVal: string) => {
    const usd = parseFloat(usdVal.replace(/,/g, '')) || 0;
    return (usd * SAR_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const voidReceipt = (id: string) => {
    setReceipts(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'باطل شده' } : r
    ));
    setOpenMenuId(null);
  };

  const filteredReceipts = receipts.filter(r => 
    r.receiptNo.includes(searchTerm) || r.travelerName.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <Clock size={32} />
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-black text-slate-800">تاریخچه رسیدها</h2>
            <p className="text-slate-500 mt-1 font-medium">مشاهده و مدیریت تمام رسیدهای نقدی و غیرنقدی صادره (USD/SAR)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold shadow-sm">
            <Download size={20} />
            خروجی اکسل
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right" dir="rtl">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-slate-400 text-xs font-bold">کل رسیدهای صادره</span>
          <span className="text-2xl font-black text-slate-800">124 عدد</span>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-slate-400 text-xs font-bold">مجموع مبالغ دریافتی ($)</span>
          <span className="text-2xl font-black text-emerald-600">15,600 $</span>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-slate-400 text-xs font-bold">رسیدهای باطل شده</span>
          <span className="text-2xl font-black text-rose-500">8 مورد</span>
        </div>
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col gap-2">
          <span className="text-slate-400 text-xs font-bold">میانگین هر رسید ($)</span>
          <span className="text-2xl font-black text-blue-600">125 $</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full text-right">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="جستجو بر اساس شماره رسید یا نام مسافر..." 
            className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-4 border border-slate-100 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold">
            <Calendar size={20} />
            انتخاب بازه زمانی
          </button>
          <button className="flex items-center gap-2 px-4 py-4 border border-slate-100 rounded-2xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-visible text-right">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-black text-slate-500">شماره رسید</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مشخصات پرداخت کننده</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">نوع خدمت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">مبلغ ($)</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">روش پرداخت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">تاریخ ثبت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500">وضعیت</th>
                <th className="px-8 py-5 text-sm font-black text-slate-500 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReceipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-slate-300" />
                      <span className="font-mono text-sm font-bold text-slate-600">{receipt.receiptNo}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User size={14} className="text-slate-400" />
                      </div>
                      <span className="font-bold text-slate-700">{receipt.travelerName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-500">
                      {receipt.service}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                        <span className="text-lg font-black text-slate-800">{receipt.amount} $</span>
                        <span className="text-[10px] font-bold text-slate-400">≈ {formatWithSAR(receipt.amount)} SAR</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500">
                      <ArrowLeftRight size={14} className="text-slate-300" />
                      <span className="text-sm font-medium">{receipt.paymentType}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400">{receipt.date}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      {receipt.status === 'معتبر' ? (
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                      <span className={`text-xs font-black ${receipt.status === 'معتبر' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {receipt.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center relative">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === receipt.id ? null : receipt.id)}
                      className="p-2 text-slate-300 hover:text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {openMenuId === receipt.id && (
                      <div 
                        ref={menuRef}
                        className="absolute left-8 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ top: '80%' }}
                      >
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Printer size={16} className="text-indigo-500" /> چاپ مجدد رسید
                        </button>
                        <button className="w-full text-right px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3">
                          <Eye size={16} className="text-blue-500" /> مشاهده جزئیات
                        </button>
                        <div className="h-px bg-slate-50 my-1"></div>
                        {receipt.status === 'معتبر' ? (
                          <button 
                            onClick={() => voidReceipt(receipt.id)}
                            className="w-full text-right px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3"
                          >
                            <Trash2 size={16} /> ابطال رسید
                          </button>
                        ) : (
                          <button className="w-full text-right px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3">
                            <RotateCcw size={16} /> بازگردانی اعتبار
                          </button>
                        )}
                      </div>
                    )}
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

export default History;
