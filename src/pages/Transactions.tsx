import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Customer, Cashbox, Transaction } from '../types';
import { motion } from 'motion/react';
import { ArrowRightLeft, Download, Upload, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashbox, setCashbox] = useState<Cashbox[]>([]);
  const [transactions, setTransactions] = useState<(Transaction & { customer_name: string })[]>([]);
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [formData, setFormData] = useState({
    customer_id: '',
    currency_from: 'USD',
    amount: '',
    description: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.getCustomers().then(setCustomers);
    api.getCashbox().then(setCashbox);
    api.getTransactions().then(setTransactions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.amount) return;

    try {
      await api.createTransaction({
        customer_id: Number(formData.customer_id),
        type,
        currency_from: formData.currency_from,
        amount: Number(formData.amount),
        description: formData.description,
        total: Number(formData.amount) // Simple for now
      });
      setFormData({ ...formData, amount: '', description: '' });
      loadData(); // Refresh list
    } catch (err) {
      alert('Transaction failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('transaction')}</h1>
        <p className="text-gray-500">{t('new_transaction')}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Form */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="flex border-b">
            <button
              onClick={() => setType('DEPOSIT')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                type === 'DEPOSIT' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Upload className="w-4 h-4" /> {t('deposit')}
            </button>
            <button
              onClick={() => setType('WITHDRAWAL')}
              className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                type === 'WITHDRAWAL' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Download className="w-4 h-4" /> {t('withdrawal')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('customers')}</label>
              <select
                className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                value={formData.customer_id}
                onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                required
              >
                <option value="">{t('select_customer')}</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('currency')}</label>
                <select
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.currency_from}
                  onChange={e => setFormData({ ...formData, currency_from: e.target.value })}
                >
                  {cashbox.map(c => (
                    <option key={c.currency} value={c.currency}>{c.currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('description')}</label>
              <textarea
                className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
            >
              {t('confirm')}
            </button>
          </form>
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h2 className="font-medium text-gray-900">{t('recent_activity')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3">{t('customers')}</th>
                  <th className="px-4 py-3">{t('transaction')}</th>
                  <th className="px-4 py-3 text-right">{t('amount')}</th>
                  <th className="px-4 py-3">{t('currency')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {tx.customer_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type === 'DEPOSIT' ? t('deposit') : t('withdrawal')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {tx.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {tx.currency_from}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No recent transactions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
