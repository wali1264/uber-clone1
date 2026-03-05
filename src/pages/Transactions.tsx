import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Customer, Cashbox, Transaction, BankAccount } from '../types';
import { motion } from 'motion/react';
import { ArrowRightLeft, Download, Upload, Clock, Wallet, Building2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Transactions() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cashbox, setCashbox] = useState<Cashbox[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<(Transaction & { customer_name: string })[]>([]);
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAWAL'>('DEPOSIT');
  const [sourceType, setSourceType] = useState<'CASHBOX' | 'BANK'>('CASHBOX');
  const [formData, setFormData] = useState({
    customer_id: '',
    currency_from: 'USD',
    bank_account_id: '',
    amount: '',
    description: '',
    source_card_last4: '',
    source_serial_no: '',
    destination_card_name: '',
    destination_card_last4: '',
    exchange_rates: {} as Record<string, { rate: string, amount: string }>
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.getCustomers().then(setCustomers);
    api.getCashbox().then(setCashbox);
    api.getBankAccounts().then(setBankAccounts);
    api.getTransactions(10000).then(setTransactions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id || !formData.amount) return;

    try {
      await api.createTransaction({
        customer_id: Number(formData.customer_id),
        type,
        currency_from: sourceType === 'CASHBOX' ? formData.currency_from : 'BANK_TOMAN', // Bank accounts are typically Toman
        bank_account_id: sourceType === 'BANK' ? Number(formData.bank_account_id) : undefined,
        amount: Number(formData.amount),
        description: formData.description,
        total: Number(formData.amount),
        source_card_last4: sourceType === 'BANK' ? formData.source_card_last4 : undefined,
        source_serial_no: sourceType === 'BANK' ? formData.source_serial_no : undefined,
        destination_card_name: sourceType === 'BANK' ? formData.destination_card_name : undefined,
        destination_card_last4: sourceType === 'BANK' ? formData.destination_card_last4 : undefined,
        exchange_info: JSON.stringify(formData.exchange_rates)
      });
      setFormData({ 
        ...formData, 
        amount: '', 
        description: '',
        source_card_last4: '',
        source_serial_no: '',
        destination_card_name: '',
        destination_card_last4: '',
        exchange_rates: {}
      });
      loadData();
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
            {/* Source/Destination Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => setSourceType('CASHBOX')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                  sourceType === 'CASHBOX' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Wallet className="w-3 h-3" /> {t('cashbox')}
              </button>
              <button
                type="button"
                onClick={() => setSourceType('BANK')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                  sourceType === 'BANK' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Building2 className="w-3 h-3" /> {t('bank')}
              </button>
            </div>

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
                <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                  {sourceType === 'CASHBOX' ? t('currency') : t('bank')}
                </label>
                {sourceType === 'CASHBOX' ? (
                  <select
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.currency_from}
                    onChange={e => setFormData({ ...formData, currency_from: e.target.value })}
                  >
                    {cashbox.map(c => (
                      <option key={c.currency} value={c.currency}>{c.currency}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.bank_account_id}
                    onChange={e => setFormData({ ...formData, bank_account_id: e.target.value })}
                    required
                  >
                    <option value="">{t('select_source')}</option>
                    {bankAccounts.map(b => (
                      <option key={b.id} value={b.id}>{b.bank_name}</option>
                    ))}
                  </select>
                )}
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

            {sourceType === 'BANK' && (
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('source_card_last4')}</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.source_card_last4}
                    onChange={e => setFormData({ ...formData, source_card_last4: e.target.value })}
                    placeholder="1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('source_serial_no')}</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.source_serial_no}
                    onChange={e => setFormData({ ...formData, source_serial_no: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('destination_card_name')}</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.destination_card_name}
                    onChange={e => setFormData({ ...formData, destination_card_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('destination_card_last4')}</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-sm"
                    value={formData.destination_card_last4}
                    onChange={e => setFormData({ ...formData, destination_card_last4: e.target.value })}
                    placeholder="5678"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('description')}</label>
              <textarea
                className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white transition-colors outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                rows={2}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Exchange Rates Section */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3">
              <h3 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">{t('exchange_rates')}</h3>
              <div className="grid grid-cols-1 gap-3">
                {['AFN', 'USD', 'TOMAN', 'PKR', 'BANK_TOMAN'].filter(c => c !== (sourceType === 'CASHBOX' ? formData.currency_from : 'BANK_TOMAN')).map(currency => (
                  <div key={currency} className="grid grid-cols-3 gap-2 items-center">
                    <span className="text-sm font-medium text-gray-600">{currency}</span>
                    <input
                      type="number"
                      step="any"
                      placeholder={t('rate_fee')}
                      className="p-2 border rounded-lg bg-white text-sm"
                      value={formData.exchange_rates[currency]?.rate || ''}
                      onChange={e => {
                        const rate = e.target.value;
                        const amount = formData.amount && rate ? (Number(formData.amount) * Number(rate)).toFixed(2) : '';
                        setFormData({
                          ...formData,
                          exchange_rates: {
                            ...formData.exchange_rates,
                            [currency]: { rate, amount }
                          }
                        });
                      }}
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder={t('equivalent')}
                      className="p-2 border rounded-lg bg-white text-sm"
                      value={formData.exchange_rates[currency]?.amount || ''}
                      onChange={e => {
                        const amount = e.target.value;
                        const rate = formData.amount && amount ? (Number(amount) / Number(formData.amount)).toFixed(4) : '';
                        setFormData({
                          ...formData,
                          exchange_rates: {
                            ...formData.exchange_rates,
                            [currency]: { rate, amount }
                          }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
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
                  <th className="px-4 py-3">{t('description')}</th>
                  <th className="px-4 py-3 text-right text-red-600">{t('bord')}</th>
                  <th className="px-4 py-3 text-right text-green-600">{t('rasid')}</th>
                  <th className="px-4 py-3">{t('waston_fee')}</th>
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
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[150px]">
                      {tx.description || '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-red-600">
                      {tx.type === 'WITHDRAWAL' ? tx.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-green-600">
                      {tx.type === 'DEPOSIT' ? tx.amount.toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {(() => {
                        if (tx.exchange_info) {
                          try {
                            const rates = JSON.parse(tx.exchange_info);
                            const entries = Object.entries(rates);
                            if (entries.length > 0) {
                              return entries.map(([curr, info]: [string, any]) => (
                                <div key={curr} className="whitespace-nowrap">
                                  {curr}: {info.rate}
                                </div>
                              ));
                            }
                          } catch (e) {
                            console.error('Failed to parse exchange_info', e);
                          }
                        }
                        return tx.rate || '-';
                      })()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {tx.currency_from}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
