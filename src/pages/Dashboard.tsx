import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Cashbox } from '../types';
import { motion } from 'motion/react';
import { Wallet, TrendingUp, DollarSign, Settings, Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [cashbox, setCashbox] = useState<Cashbox[]>([]);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState({ currency: 'USD', amount: '', reason: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => api.getCashbox().then(setCashbox);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAdjustment({
        currency: adjustment.currency,
        amount: Number(adjustment.amount),
        reason: adjustment.reason
      });
      setIsAdjusting(false);
      setAdjustment({ currency: 'USD', amount: '', reason: '' });
      loadData();
    } catch (err) {
      alert('Adjustment failed');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('dashboard')}</h1>
          <p className="text-gray-500">{t('daily_balance')}</p>
        </div>
        <button
          onClick={() => setIsAdjusting(!isAdjusting)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4" />
          {t('adjust_balance')}
        </button>
      </header>

      {isAdjusting && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          onSubmit={handleAdjust}
        >
          <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">{t('manual_adjustment')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              className="border p-2 rounded-lg bg-gray-50"
              value={adjustment.currency}
              onChange={e => setAdjustment({ ...adjustment, currency: e.target.value })}
            >
              {cashbox.map(c => (
                <option key={c.currency} value={c.currency}>{c.currency}</option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              placeholder={t('amount')}
              className="border p-2 rounded-lg"
              value={adjustment.amount}
              onChange={e => setAdjustment({ ...adjustment, amount: e.target.value })}
              required
            />
            <input
              placeholder={t('reason')}
              className="border p-2 rounded-lg"
              value={adjustment.reason}
              onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })}
              required
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsAdjusting(false)} className="px-4 py-2 text-gray-600 text-sm">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">{t('save')}</button>
          </div>
        </motion.form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cashbox.map((box) => (
          <motion.div
            key={box.currency}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-xs font-mono text-gray-400">{box.currency}</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-500">{t('current_balance')}</h3>
              <p className="text-2xl font-bold text-gray-900 font-mono">
                {box.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
