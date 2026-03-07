import React, { useEffect, useState } from 'react';
import { CustomerService, Customer } from '../services/customer';
import { query } from '../services/db';
import { Plus, Search, Trash2, Eye, Calculator, Lock, History } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // History State
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [currentBalances, setCurrentBalances] = useState<Record<string, number>>({});
  const [historyType, setHistoryType] = useState<'weekly' | 'monthly' | 'manual'>('manual');
  const [historyDesc, setHistoryDesc] = useState('');

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
    initial_kaldar: ''
  });

  const [convertData, setConvertData] = useState({
    fromCurrency: 'دالر',
    toCurrency: 'تومان نقد',
    amount: '',
    rate: '',
    operation: 'multiply'
  });

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

      for (const cap of capitals) {
        if (cap.amount && Number(cap.amount) > 0) {
          await import('../services/customer').then(({ JournalService }) => 
            JournalService.create({
              customer_id: newCustomer.id,
              type: 'resid',
              currency: cap.curr,
              amount: Number(cap.amount),
              description: 'سرمایه اولیه',
              date: date,
              sentence: 'افتتاح حساب'
            })
          );
        }
      }
    }

    setShowModal(false);
    setFormData({ 
      customer_code: '', customer_name: '', phone: '', description: '',
      initial_afghani: '', initial_toman_cash: '', initial_toman_bank: '', initial_dollar: '', initial_kaldar: ''
    });
    fetchData();
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !convertData.amount || !convertData.rate) return;

    const amount = Number(convertData.amount);
    const rate = Number(convertData.rate);
    
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
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <h3 className="mb-6 text-xl font-bold text-slate-800">تعریف مشتری جدید</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">کد مشتری</label>
                  <input 
                    type="text" required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.customer_code}
                    onChange={e => setFormData({...formData, customer_code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نام مشتری</label>
                  <input 
                    type="text" required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.customer_name}
                    onChange={e => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">شماره تماس</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">توضیحات</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="mb-4 font-bold text-slate-700">سرمایه اولیه (اختیاری)</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">افغانی</label>
                    <input type="number" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_afghani} onChange={e => setFormData({...formData, initial_afghani: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان نقد</label>
                    <input type="number" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_toman_cash} onChange={e => setFormData({...formData, initial_toman_cash: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">تومان بانکی</label>
                    <input type="number" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_toman_bank} onChange={e => setFormData({...formData, initial_toman_bank: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">دالر</label>
                    <input type="number" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_dollar} onChange={e => setFormData({...formData, initial_dollar: e.target.value})} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-600">کلدار</label>
                    <input type="number" className="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none focus:border-blue-500"
                      value={formData.initial_kaldar} onChange={e => setFormData({...formData, initial_kaldar: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ذخیره</button>
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
                  type="number" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={convertData.amount}
                  onChange={e => setConvertData({...convertData, amount: e.target.value})}
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
                  type="number" required step="any"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={convertData.rate}
                  onChange={e => setConvertData({...convertData, rate: e.target.value})}
                />
                <p className="mt-1 text-xs text-slate-500">
                  {convertData.amount && convertData.rate && (
                    `مبلغ نهایی: ${(convertData.operation === 'multiply' 
                      ? Number(convertData.amount) * Number(convertData.rate) 
                      : Number(convertData.amount) / Number(convertData.rate)
                    ).toLocaleString()} ${convertData.toCurrency}`
                  )}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowConvertModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ثبت تبدیل</button>
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
                  <button 
                    onClick={handleSaveHistory}
                    className="w-full rounded-lg bg-purple-600 py-2 text-sm font-medium text-white hover:bg-purple-700"
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
          </div>
        </div>
      )}
    </div>
  );
}
