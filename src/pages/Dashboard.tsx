import React, { useEffect, useState } from 'react';
import { CustomerService, JournalService, Customer, JournalEntry } from '../services/customer';
import { BankService, BankAccount } from '../services/bank';
import { query } from '../services/db';
import { Plus, Search, ArrowDownLeft, ArrowUpRight, Trash2 } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Dashboard() {
  const [entries, setEntries] = useState<(JournalEntry & { customer_name: string })[]>([]);
  const [openingBalances, setOpeningBalances] = useState<Record<string, number>>({});
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  
  // Form State
  const [formData, setFormData] = useState({
    customer_id: '',
    type: 'bard',
    currency: 'دالر',
    amount: '',
    description: '',
    sentence: '',
    bank_id: '',
    tracking_code: '',
    source_card_last4: ''
  });

  const fetchData = () => {
    const { openingBalances, todayEntries } = JournalService.getDailyReport(selectedDate);
    setEntries(todayEntries);
    setOpeningBalances(openingBalances);
    setCustomers(CustomerService.getAll());
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
    setAccounts(BankService.getAccounts());
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.amount) return;

    await JournalService.create({
      customer_id: Number(formData.customer_id),
      type: formData.type as 'bard' | 'resid',
      currency: formData.currency,
      amount: Number(formData.amount),
      description: formData.description,
      date: new Date().toISOString(),
      sentence: formData.sentence
    }, formData.bank_id ? {
      bank_id: Number(formData.bank_id),
      tracking_code: formData.tracking_code,
      source_card_last4: formData.source_card_last4
    } : undefined);

    setShowModal(false);
    setFormData({ ...formData, amount: '', description: '', sentence: '', bank_id: '', tracking_code: '', source_card_last4: '' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      await JournalService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-slate-800">روزنامچه</h2>
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5">
            <input 
              type="date" 
              className="text-sm outline-none"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <div className="h-4 w-px bg-slate-300 mx-1"></div>
            <span className="text-sm font-medium text-blue-600 min-w-[80px] text-center">
              {selectedDate ? format(new Date(selectedDate), 'yyyy/MM/dd') : '-'}
            </span>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>تراکنش جدید</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-sm font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">تاریخ</th>
                <th className="px-6 py-4">مشتری</th>
                <th className="px-6 py-4">نوع</th>
                <th className="px-6 py-4">مبلغ</th>
                <th className="px-6 py-4">ارز</th>
                <th className="px-6 py-4">توضیحات</th>
                <th className="px-6 py-4">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Opening Balances Rows */}
              {Object.entries(openingBalances).map(([curr, amount]) => {
                if (amount === 0) return null;
                return (
                  <tr key={`opening-${curr}`} className="bg-blue-50/50">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      -
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">مانده از قبل</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        amount > 0 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {amount > 0 ? 'بدهکار' : 'بستانکار'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {Math.abs(amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">{curr}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">انتقال از روز قبل</td>
                    <td className="px-6 py-4"></td>
                  </tr>
                );
              })}

              {/* Daily Entries */}
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(entry.date), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{entry.customer_name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.type === 'bard' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {entry.type === 'bard' ? 'برد (بدهکار)' : 'رسید (بستانکار)'}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">
                    {entry.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{entry.currency}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{entry.description}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {entries.length === 0 && Object.keys(openingBalances).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    هیچ تراکنشی برای این تاریخ یافت نشد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">ثبت تراکنش جدید</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">مشتری</label>
                  <select 
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.customer_id}
                    onChange={e => setFormData({...formData, customer_id: e.target.value})}
                  >
                    <option value="">انتخاب کنید</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.customer_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نوع تراکنش</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="bard">برد (بدهکار)</option>
                    <option value="resid">رسید (بستانکار)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">مبلغ</label>
                  <input 
                    type="number" 
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">ارز</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    {currencies.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">حساب بانکی (اختیاری)</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.bank_id}
                    onChange={e => setFormData({...formData, bank_id: e.target.value})}
                  >
                    <option value="">بدون حساب بانکی (نقدی)</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.bank_name} - {acc.owner_name}</option>
                    ))}
                  </select>
                </div>
                {formData.bank_id && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">کد پیگیری</label>
                      <input 
                        type="text"
                        className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                        value={formData.tracking_code}
                        onChange={e => setFormData({...formData, tracking_code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">۴ رقم آخر کارت مبدا</label>
                      <input 
                        type="text"
                        maxLength={4}
                        className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                        value={formData.source_card_last4}
                        onChange={e => setFormData({...formData, source_card_last4: e.target.value})}
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">توضیحات</label>
                <textarea 
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  ثبت تراکنش
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
