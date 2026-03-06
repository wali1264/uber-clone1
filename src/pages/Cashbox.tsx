import React, { useEffect, useState } from 'react';
import { CashboxService, CashboxEntry } from '../services/cashbox';
import { query } from '../services/db';
import { Plus, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Cashbox() {
  const [entries, setEntries] = useState<CashboxEntry[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    currency: 'دالر',
    amount: '',
    type: 'in',
    description: ''
  });

  const fetchData = () => {
    setEntries(CashboxService.getAll());
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await CashboxService.create({
      currency: formData.currency,
      amount: Number(formData.amount),
      type: formData.type as 'in' | 'out',
      description: formData.description,
      date: new Date().toISOString()
    });
    setShowModal(false);
    setFormData({ ...formData, amount: '', description: '' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این آیتم اطمینان دارید؟')) {
      await CashboxService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">صندوق</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>تراکنش نقدی</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {currencies.map(curr => {
          const bal = CashboxService.getBalance(curr);
          return (
            <div key={curr} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-500">{curr}</p>
              <p className="text-lg font-bold text-slate-800">{bal.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-sm font-medium text-slate-500">
            <tr>
              <th className="px-6 py-4">تاریخ</th>
              <th className="px-6 py-4">نوع</th>
              <th className="px-6 py-4">مبلغ</th>
              <th className="px-6 py-4">ارز</th>
              <th className="px-6 py-4">توضیحات</th>
              <th className="px-6 py-4">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {format(new Date(entry.date), 'yyyy/MM/dd HH:mm')}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    entry.type === 'in' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {entry.type === 'in' ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
                    {entry.type === 'in' ? 'ورود' : 'خروج'}
                  </span>
                </td>
                <td className="px-6 py-4 font-mono font-medium text-slate-900">{entry.amount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{entry.currency}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{entry.description}</td>
                <td className="px-6 py-4">
                  <button onClick={() => handleDelete(entry.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">تراکنش صندوق</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نوع</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="in">ورود پول</option>
                    <option value="out">خروج پول</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">ارز</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                  >
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">مبلغ</label>
                <input 
                  type="number" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">توضیحات</label>
                <textarea 
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
