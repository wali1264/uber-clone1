import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Cashbox } from '../types';
import { motion } from 'motion/react';
import { Wallet, DollarSign, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CashboxPage() {
  const { t } = useLanguage();
  const [cashbox, setCashbox] = useState<Cashbox[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    api.getCashbox().then(setCashbox);
    api.getCashboxHistory().then(setHistory);
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('cashbox')}</h1>
        <p className="text-gray-500">{t('current_balance')}</p>
      </header>

      {/* Balances Cards */}
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

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <History className="w-4 h-4 text-gray-500" />
          <h2 className="font-medium text-gray-900">{t('recent_activity')}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('type')}</th>
                <th className="px-4 py-3">{t('description')}</th>
                <th className="px-4 py-3 text-right">{t('amount')}</th>
                <th className="px-4 py-3">{t('currency')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      item.movement_type === 'DEPOSIT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.movement_type === 'DEPOSIT' ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      {item.movement_type === 'DEPOSIT' ? t('deposit') : t('withdrawal')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {item.description || '-'}
                    {item.source === 'ADJUSTMENT' && <span className="ml-2 text-xs text-gray-400">({t('manual_adjustment')})</span>}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">
                    {Math.abs(item.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.currency}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
