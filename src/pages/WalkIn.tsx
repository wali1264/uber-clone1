import React, { useEffect, useState } from 'react';
import { query, run } from '../services/db';
import { Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns-jalali';

interface WalkInEntry {
  id: number;
  name: string;
  currency: string;
  amount: number;
  type: 'in' | 'out';
  description: string;
  date: string;
}

export function WalkIn() {
  const [entries, setEntries] = useState<WalkInEntry[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    currency: 'دالر',
    amount: '',
    type: 'in',
    description: ''
  });

  const fetchData = () => {
    // We need to create the table first if it doesn't exist.
    // For now, let's assume we'll add the table creation to db.ts or handle it here.
    // Since we can't easily modify db.ts initTables without resetting, let's try to run CREATE TABLE here once.
    run(`
      CREATE TABLE IF NOT EXISTS walk_in_journal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        currency TEXT,
        amount REAL,
        type TEXT,
        description TEXT,
        date TEXT
      )
    `).then(() => {
      setEntries(query("SELECT * FROM walk_in_journal ORDER BY date DESC, id DESC") as WalkInEntry[]);
    });
    
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.name) return;

    const date = new Date().toISOString();
    
    // 1. Create Walk-in Entry
    await run(
      "INSERT INTO walk_in_journal (name, currency, amount, type, description, date) VALUES (?, ?, ?, ?, ?, ?)",
      [formData.name, formData.currency, Number(formData.amount), formData.type, formData.description, date]
    );

    // 2. Add to Cashbox
    // Walk-in IN (Receipt) -> Cashbox IN
    // Walk-in OUT (Payment) -> Cashbox OUT
    await run(
      "INSERT INTO cashbox (currency, amount, type, date, description) VALUES (?, ?, ?, ?, ?)",
      [
        formData.currency, 
        Number(formData.amount), 
        formData.type, 
        date, 
        `مشتری راه روی: ${formData.name} - ${formData.description}`
      ]
    );

    setShowModal(false);
    setFormData({ ...formData, amount: '', description: '', name: '' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این تراکنش اطمینان دارید؟')) {
      await run("DELETE FROM walk_in_journal WHERE id = ?", [id]);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">روزنامچه مشتریان راه روی</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>تراکنش جدید</span>
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-sm font-medium text-slate-500">
              <tr>
                <th className="px-6 py-4">تاریخ</th>
                <th className="px-6 py-4">نام مشتری</th>
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
                  <td className="px-6 py-4 font-medium text-slate-900">{entry.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.type === 'out' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {entry.type === 'out' ? 'پرداخت (خروجی)' : 'دریافت (ورودی)'}
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
              {entries.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    هیچ تراکنشی ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">ثبت تراکنش راه روی</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">نام مشتری</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نوع</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as 'in' | 'out'})}
                  >
                    <option value="in">دریافت (ورودی)</option>
                    <option value="out">پرداخت (خروجی)</option>
                  </select>
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
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ثبت</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
