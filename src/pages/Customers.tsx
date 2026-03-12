import React, { useEffect, useState } from 'react';
import { CustomerService, Customer } from '../services/customer';
import { query, run } from '../services/db';
import { Plus, Search, Trash2, Eye, Calculator, Lock, History, Share2, Download, Image as ImageIcon, X, MessageCircle } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [currentBalances, setCurrentBalances] = useState<Record<string, number>>({});
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [historyType, setHistoryType] = useState<'weekly' | 'monthly' | 'manual'>('manual');
  const [historyDesc, setHistoryDesc] = useState('');
  const [isHistoryConfirmed, setIsHistoryConfirmed] = useState(false);

  const handleOpenShare = (customer: Customer) => {
    setSelectedCustomer(customer);
    
    // Calculate current balances
    const balances: Record<string, number> = {};
    currencies.forEach(curr => {
      const bal = CustomerService.getBalance(customer.id, curr);
      if (bal !== 0) balances[curr] = bal;
    });
    setCurrentBalances(balances);
    
    // Load transactions
    setCustomerTransactions(CustomerService.getTransactions(customer.id));
    
    setShowShareModal(true);
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('statement-capture');
    if (!element) return;
    
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, { scale: 2 });
    const dataUrl = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = `صورت_حساب_${selectedCustomer?.customer_name}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('statement-capture');
    if (!element) return;
    
    const html2canvas = (await import('html2canvas')).default;
    const { jsPDF } = await import('jspdf');
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`صورت_حساب_${selectedCustomer?.customer_name}.pdf`);
  };

  const handleShareWhatsApp = () => {
    if (!selectedCustomer) return;
    
    let text = `*صورت حساب مشتری*\n`;
    text += `نام: ${selectedCustomer.customer_name}\n`;
    if (selectedCustomer.customer_code) {
      text += `کد: ${selectedCustomer.customer_code}\n`;
    }
    text += `تاریخ: ${format(new Date(), 'yyyy/MM/dd')}\n\n`;
    
    text += `*وضعیت حساب فعلی:*\n`;
    if (Object.entries(currentBalances).length > 0) {
      Object.entries(currentBalances).forEach(([curr, amount]) => {
        text += `- ${curr}: ${Math.abs(amount).toLocaleString()} ${amount > 0 ? 'بدهکار' : 'بستانکار'}\n`;
      });
    } else {
      text += `حساب صفر است.\n`;
    }
    
    text += `\n*ریز تراکنش‌های اخیر:*\n`;
    if (customerTransactions.length > 0) {
      customerTransactions.slice(0, 10).forEach(t => {
        text += `${format(new Date(t.date), 'yyyy/MM/dd')} | ${t.type === 'bard' ? 'برد' : 'رسید'} | ${t.amount.toLocaleString()} ${t.currency}\n`;
        if (t.description) text += `📝 ${t.description}\n`;
        text += `-------------------\n`;
      });
    } else {
      text += `تراکنشی یافت نشد.\n`;
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const [formData, setFormData] = useState({
    customer_code: '',
    customer_name: '',
    phone: '',
    description: '',
    // Initial Capital
    initial_afghani: '',
    initial_toman_cash: '',
    initial_toman_bank: '',
    initial_dollar: '',
    initial_kaldar: '',
    // Initial Debt
    initial_debt_afghani: '',
    initial_debt_toman_cash: '',
    initial_debt_toman_bank: '',
    initial_debt_dollar: '',
    initial_debt_kaldar: ''
  });

  const [convertData, setConvertData] = useState({
    fromCurrency: 'دالر',
    toCurrency: 'تومان نقد',
    amount: '',
    rate: '',
    operation: 'multiply'
  });

  const formatCurrencyInput = (value: string) => {
    if (!value) return '';
    let clean = value.replace(/[^\d.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    const finalParts = clean.split('.');
    finalParts[0] = finalParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return finalParts.join('.');
  };

  const fetchData = () => {
    setCustomers(CustomerService.getAll());
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenHistory = (customer: Customer) => {
    setSelectedCustomer(customer);
    
    // Calculate current balances
    const balances: Record<string, number> = {};
    currencies.forEach(curr => {
      const bal = CustomerService.getBalance(customer.id, curr);
      if (bal !== 0) balances[curr] = bal;
    });
    setCurrentBalances(balances);
    
    // Load history
    setHistoryList(CustomerService.getBalanceHistory(customer.id));
    
    // Load transactions
    setCustomerTransactions(CustomerService.getTransactions(customer.id));
    
    setIsHistoryConfirmed(false);
    setShowHistoryModal(true);
  };

  const handleSaveHistory = async () => {
    if (!selectedCustomer) return;
    
    await CustomerService.saveBalanceHistory(
      selectedCustomer.id,
      historyType,
      currentBalances,
      historyDesc
    );
    
    setHistoryList(CustomerService.getBalanceHistory(selectedCustomer.id));
    setHistoryDesc('');
    alert('بیلانس با موفقیت قید شد.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create Customer
    await CustomerService.create({
      customer_code: formData.customer_code,
      customer_name: formData.customer_name,
      phone: formData.phone,
      description: formData.description
    });

    // Get the created customer ID (assuming it's the last one)
    const newCustomer = query("SELECT id FROM customers ORDER BY id DESC LIMIT 1")[0];
    
    if (newCustomer) {
      const date = new Date().toISOString();
      const capitals = [
        { curr: 'افغانی', amount: formData.initial_afghani },
        { curr: 'تومان نقد', amount: formData.initial_toman_cash },
        { curr: 'تومان بانکی', amount: formData.initial_toman_bank },
        { curr: 'دالر', amount: formData.initial_dollar },
        { curr: 'کلدار', amount: formData.initial_kaldar },
      ];

      const debts = [
        { curr: 'افغانی', amount: formData.initial_debt_afghani },
        { curr: 'تومان نقد', amount: formData.initial_debt_toman_cash },
        { curr: 'تومان بانکی', amount: formData.initial_debt_toman_bank },
        { curr: 'دالر', amount: formData.initial_debt_dollar },
        { curr: 'کلدار', amount: formData.initial_debt_kaldar },
      ];

      // Process Initial Capital (Resid/Credit)
      for (const cap of capitals) {
        const val = cap.amount ? Number(cap.amount.replace(/,/g, '')) : 0;
        if (val > 0) {
          await run(
            "INSERT INTO journal (customer_id, type, currency, amount, description, date, sentence) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newCustomer.id, 'resid', cap.curr, val, 'سرمایه اولیه (طلب مشتری)', date, 'افتتاح حساب']
          );
        }
      }

      // Process Initial Debt (Bard/Debit)
      for (const debt of debts) {
        const val = debt.amount ? Number(debt.amount.replace(/,/g, '')) : 0;
        if (val > 0) {
          await run(
            "INSERT INTO journal (customer_id, type, currency, amount, description, date, sentence) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [newCustomer.id, 'bard', debt.curr, val, 'قرضداری اولیه (بدهی مشتری)', date, 'افتتاح حساب']
          );
        }
      }
    }

    setShowModal(false);
    setFormData({ 
      customer_code: '', customer_name: '', phone: '', description: '',
      initial_afghani: '', initial_toman_cash: '', initial_toman_bank: '', initial_dollar: '', initial_kaldar: '',
      initial_debt_afghani: '', initial_debt_toman_cash: '', initial_debt_toman_bank: '', initial_debt_dollar: '', initial_debt_kaldar: ''
    });
    fetchData();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !convertData.amount || !convertData.rate) return;

    const amount = Number(convertData.amount.replace(/,/g, ''));
    const rate = Number(convertData.rate.replace(/,/g, ''));
    
    // Calculate based on operation
    const totalTarget = convertData.operation === 'multiply' 
      ? amount * rate 
      : amount / rate;

    const date = new Date().toISOString();
    const { JournalService } = await import('../services/customer');

    // 1. Debit Source (Bard)
    await JournalService.create({
      customer_id: selectedCustomer.id,
      type: 'bard',
      currency: convertData.fromCurrency,
      amount: amount,
      description: `تبدیل ارز: فروش ${amount} ${convertData.fromCurrency} به نرخ ${rate} (${convertData.operation === 'multiply' ? 'ضرب' : 'تقسیم'})`,
      date: date,
      sentence: 'تبدیل ارز'
    });

    // 2. Credit Target (Resid)
    await JournalService.create({
      customer_id: selectedCustomer.id,
      type: 'resid',
      currency: convertData.toCurrency,
      amount: totalTarget,
      description: `تبدیل ارز: خرید ${totalTarget.toLocaleString()} ${convertData.toCurrency} (از ${convertData.fromCurrency})`,
      date: date,
      sentence: 'تبدیل ارز'
    });

    setShowConvertModal(false);
    setConvertData({ fromCurrency: 'دالر', toCurrency: 'تومان نقد', amount: '', rate: '', operation: 'multiply' });
    setSelectedCustomer(null);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این مشتری اطمینان دارید؟')) {
      await CustomerService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">دفتر مشتریان</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>مشتری جدید</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{customer.customer_name}</h3>
                <p className="text-sm text-slate-500">کد: {customer.customer_code}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenShare(customer)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                  title="اشتراک گذاری صورت حساب"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowConvertModal(true);
                  }}
                  className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                  title="تبدیل ارز"
                >
                  <Calculator className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleOpenHistory(customer)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600"
                  title="قید بیلانس / تاریخچه"
                >
                  <History className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mb-4 space-y-1 text-sm text-slate-600">
              <p>شماره تماس: {customer.phone}</p>
              <p className="truncate">{customer.description}</p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-500">وضعیت حساب:</p>
              <div className="space-y-1">
                {currencies.map(curr => {
                  const bal = CustomerService.getBalance(customer.id, curr);
                  if (bal === 0) return null;
                  return (
                    <div key={curr} className="flex justify-between text-sm">
                      <span className="text-slate-600">{curr}:</span>
                      <span className={`font-mono font-medium ${bal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(bal).toLocaleString()} {bal > 0 ? 'بدهکار' : 'بستانکار'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl my-8">
            <h3 className="mb-4 text-lg font-bold text-slate-800">تعریف مشتری جدید</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">کد مشتری</label>
                  <input 
                    type="text" required
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.customer_code}
                    onChange={e => setFormData({...formData, customer_code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">نام مشتری</label>
                  <input 
                    type="text" required
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">شماره تماس</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">توضیحات</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="mb-3 text-sm font-bold text-slate-700">سرمایه اولیه (اختیاری)</h4>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">افغانی</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_afghani} onChange={e => setFormData({...formData, initial_afghani: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان نقد</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_toman_cash} onChange={e => setFormData({...formData, initial_toman_cash: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان بانکی</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_toman_bank} onChange={e => setFormData({...formData, initial_toman_bank: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">دالر</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_dollar} onChange={e => setFormData({...formData, initial_dollar: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">کلدار</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_kaldar} onChange={e => setFormData({...formData, initial_kaldar: formatCurrencyInput(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="mb-3 text-sm font-bold text-red-600">قرضداری اولیه (بدهی مشتری به ما)</h4>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">افغانی</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-red-500"
                      value={formData.initial_debt_afghani} onChange={e => setFormData({...formData, initial_debt_afghani: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان نقد</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-red-500"
                      value={formData.initial_debt_toman_cash} onChange={e => setFormData({...formData, initial_debt_toman_cash: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان بانکی</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-red-500"
                      value={formData.initial_debt_toman_bank} onChange={e => setFormData({...formData, initial_debt_toman_bank: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">دالر</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-red-500"
                      value={formData.initial_debt_dollar} onChange={e => setFormData({...formData, initial_debt_dollar: formatCurrencyInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">کلدار</label>
                    <input type="text" dir="ltr" className="w-full rounded-lg border border-slate-300 p-1.5 text-sm outline-none focus:border-red-500"
                      value={formData.initial_debt_kaldar} onChange={e => setFormData({...formData, initial_debt_kaldar: formatCurrencyInput(e.target.value)})} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" required className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">تایید نهایی</span>
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">انصراف</button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">ذخیره</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Convert Modal */}
      {showConvertModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">تبدیل ارز برای {selectedCustomer.customer_name}</h3>
            <form onSubmit={handleConvert} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">از ارز (فروش)</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={convertData.fromCurrency}
                    onChange={e => setConvertData({...convertData, fromCurrency: e.target.value})}
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">به ارز (خرید)</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={convertData.toCurrency}
                    onChange={e => setConvertData({...convertData, toCurrency: e.target.value})}
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">مبلغ (ارز مبدا)</label>
                <input 
                  type="text" dir="ltr" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={convertData.amount}
                  onChange={e => setConvertData({...convertData, amount: formatCurrencyInput(e.target.value)})}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">عملیات نرخ</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="operation"
                      checked={convertData.operation === 'multiply'}
                      onChange={() => setConvertData({...convertData, operation: 'multiply'})}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-slate-700">ضرب (Amount × Rate)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="operation"
                      checked={convertData.operation === 'divide'}
                      onChange={() => setConvertData({...convertData, operation: 'divide'})}
                      className="text-blue-600"
                    />
                    <span className="text-sm text-slate-700">تقسیم (Amount ÷ Rate)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">نرخ تبدیل</label>
                <input 
                  type="text" dir="ltr" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={convertData.rate}
                  onChange={e => setConvertData({...convertData, rate: formatCurrencyInput(e.target.value)})}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {convertData.amount && convertData.rate && (
                    `مبلغ نهایی: ${(convertData.operation === 'multiply' 
                      ? Number(convertData.amount.replace(/,/g, '')) * Number(convertData.rate.replace(/,/g, '')) 
                      : Number(convertData.amount.replace(/,/g, '')) / Number(convertData.rate.replace(/,/g, ''))
                    ).toLocaleString()} ${convertData.toCurrency}`
                  )}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" required className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-700">تایید نهایی</span>
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowConvertModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                  <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ثبت تبدیل</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* History / Qaid Balance Modal */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">قید بیلانس و تاریخچه - {selectedCustomer.customer_name}</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 hover:text-slate-600">
                <Trash2 className="h-5 w-5 rotate-45" /> {/* Using Trash as Close icon for now or just X if imported */}
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Save New Balance */}
              <div className="space-y-4 rounded-xl border border-slate-200 p-4 bg-slate-50">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  قید بیلانس فعلی
                </h4>
                
                <div className="space-y-2 text-sm">
                  {Object.entries(currentBalances).length > 0 ? (
                    Object.entries(currentBalances).map(([curr, amount]) => (
                      <div key={curr} className="flex justify-between border-b border-slate-200 pb-1 last:border-0">
                        <span>{curr}:</span>
                        <span className={`font-mono font-bold ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(amount).toLocaleString()} {amount > 0 ? 'بدهکار' : 'بستانکار'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">حساب صفر است.</p>
                  )}
                </div>

                <div className="pt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">نوع دوره</label>
                    <select 
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none"
                      value={historyType}
                      onChange={(e) => setHistoryType(e.target.value as any)}
                    >
                      <option value="weekly">هفته وار</option>
                      <option value="monthly">ماه وار</option>
                      <option value="manual">دستی / موردی</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">توضیحات</label>
                    <input 
                      type="text" 
                      className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none"
                      placeholder="مثلا: پایان هفته اول"
                      value={historyDesc}
                      onChange={(e) => setHistoryDesc(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                        checked={isHistoryConfirmed}
                        onChange={(e) => setIsHistoryConfirmed(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-slate-700">تایید نهایی</span>
                    </label>
                  </div>
                  <button 
                    onClick={handleSaveHistory}
                    disabled={!isHistoryConfirmed}
                    className={`w-full rounded-lg py-2 text-sm font-medium text-white transition-colors ${
                      isHistoryConfirmed ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    ثبت و قید بیلانس
                  </button>
                </div>
              </div>

              {/* Right: History List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <History className="h-4 w-4" />
                  تاریخچه
                </h4>
                
                <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                  {historyList.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">هنوز هیچ بیلانسی قید نشده است.</p>
                  ) : (
                    historyList.map((item) => {
                      const balances = JSON.parse(item.balances);
                      return (
                        <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                {item.type === 'weekly' ? 'هفته وار' : item.type === 'monthly' ? 'ماه وار' : 'دستی'}
                              </span>
                              <div className="text-xs text-slate-400 mt-1">
                                {format(new Date(item.date), 'yyyy/MM/dd HH:mm')}
                              </div>
                            </div>
                            {item.description && (
                              <span className="text-xs text-slate-600">{item.description}</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            {Object.entries(balances).map(([curr, amount]: [string, any]) => (
                              <div key={curr} className="flex justify-between text-xs">
                                <span className="text-slate-500">{curr}:</span>
                                <span className="font-mono">{Math.abs(amount).toLocaleString()} {amount > 0 ? 'بد' : 'بس'}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="mt-6 border-t border-slate-100 pt-6">
              <h4 className="mb-4 font-bold text-slate-700 flex items-center gap-2">
                <History className="h-4 w-4" />
                ریز تراکنش‌ها
              </h4>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="bg-slate-50 text-xs font-medium text-slate-500 sticky top-0">
                      <tr>
                        <th className="px-4 py-2">تاریخ</th>
                        <th className="px-4 py-2">نوع</th>
                        <th className="px-4 py-2">مبلغ</th>
                        <th className="px-4 py-2">ارز</th>
                        <th className="px-4 py-2">توضیحات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customerTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2 text-slate-600 whitespace-nowrap">
                            {format(new Date(t.date), 'yyyy/MM/dd HH:mm')}
                          </td>
                          <td className="px-4 py-2">
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              t.type === 'bard' 
                                ? 'bg-red-100 text-red-700' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {t.type === 'bard' ? 'برد (بدهکار)' : 'رسید (بستانکار)'}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-mono font-medium text-slate-900">
                            {t.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-slate-600">{t.currency}</td>
                          <td className="px-4 py-2 text-slate-500 truncate max-w-[200px]" title={t.description}>
                            {t.description}
                          </td>
                        </tr>
                      ))}
                      {customerTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-500">
                            هیچ تراکنشی یافت نشد.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Share Modal */}
      {showShareModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 p-4">
          <div className="mb-4 flex w-full max-w-2xl justify-end gap-2">
            <button 
              onClick={handleShareWhatsApp}
              className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white shadow hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              ارسال به واتساپ
            </button>
            <button 
              onClick={handleDownloadImage}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-slate-700 shadow hover:bg-slate-50"
            >
              <ImageIcon className="h-4 w-4" />
              ذخیره عکس
            </button>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              دانلود PDF
            </button>
            <button 
              onClick={() => setShowShareModal(false)}
              className="flex items-center justify-center rounded-lg bg-white p-2 text-slate-500 shadow hover:bg-slate-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl max-h-[80vh]">
            <div id="statement-capture" className="bg-white p-8">
              <div className="mb-8 border-b border-slate-200 pb-6 text-center">
                <h2 className="text-2xl font-bold text-slate-800">صورت حساب مشتری</h2>
                <p className="mt-2 text-slate-500">تاریخ: {format(new Date(), 'yyyy/MM/dd')}</p>
              </div>

              <div className="mb-8 flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">نام مشتری:</p>
                  <p className="text-lg font-bold text-slate-800">{selectedCustomer.customer_name}</p>
                </div>
                {selectedCustomer.customer_code && (
                  <div className="text-left">
                    <p className="text-sm text-slate-500">کد مشتری:</p>
                    <p className="font-mono font-medium text-slate-800">{selectedCustomer.customer_code}</p>
                  </div>
                )}
              </div>

              <div className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h4 className="mb-3 font-bold text-slate-700">وضعیت حساب فعلی</h4>
                <div className="space-y-2">
                  {Object.entries(currentBalances).length > 0 ? (
                    Object.entries(currentBalances).map(([curr, amount]) => (
                      <div key={curr} className="flex justify-between border-b border-slate-200 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-600">{curr}:</span>
                        <span className={`font-mono font-bold ${amount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {Math.abs(amount).toLocaleString()} {amount > 0 ? 'بدهکار' : 'بستانکار'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500">حساب صفر است.</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-3 font-bold text-slate-700">ریز تراکنش‌های اخیر</h4>
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-100 text-xs font-medium text-slate-600">
                    <tr>
                      <th className="px-4 py-2">تاریخ</th>
                      <th className="px-4 py-2">نوع</th>
                      <th className="px-4 py-2">مبلغ</th>
                      <th className="px-4 py-2">ارز</th>
                      <th className="px-4 py-2">توضیحات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customerTransactions.slice(0, 20).map((t) => (
                      <tr key={t.id}>
                        <td className="px-4 py-2 text-slate-600">{format(new Date(t.date), 'yyyy/MM/dd')}</td>
                        <td className="px-4 py-2">
                          <span className={t.type === 'bard' ? 'text-red-600' : 'text-green-600'}>
                            {t.type === 'bard' ? 'برد' : 'رسید'}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono font-medium">{t.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-slate-600">{t.currency}</td>
                        <td className="px-4 py-2 text-slate-500">{t.description}</td>
                      </tr>
                    ))}
                    {customerTransactions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-500">هیچ تراکنشی یافت نشد.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {customerTransactions.length > 20 && (
                  <p className="mt-4 text-center text-xs text-slate-400">فقط ۲۰ تراکنش آخر نمایش داده شده است.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
