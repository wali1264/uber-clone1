import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Customer, LedgerEntry } from '../types';
import { motion } from 'motion/react';
import { Users, Search, Plus, FileText } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Customers() {
  const { t } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', code: '', phone: '' });

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomer) {
      api.getCustomerLedger(selectedCustomer.id).then(setLedger);
    }
  }, [selectedCustomer]);

  const loadCustomers = () => api.getCustomers().then(setCustomers);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCustomer(newCustomer);
      setIsCreating(false);
      setNewCustomer({ name: '', code: '', phone: '' });
      loadCustomers();
    } catch (err: any) {
      alert(`Failed to create customer: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-4rem)] flex flex-col">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('customers')}</h1>
          <p className="text-gray-500">{t('customers')}</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('add_customer')}
        </button>
      </header>

      {isCreating && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 shrink-0"
          onSubmit={handleCreate}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              placeholder={t('name')}
              className="border p-2 rounded-lg"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              required
            />
            <input
              placeholder={t('code')}
              className="border p-2 rounded-lg"
              value={newCustomer.code}
              onChange={e => setNewCustomer({...newCustomer, code: e.target.value})}
              required
            />
            <input
              placeholder={t('phone')}
              className="border p-2 rounded-lg"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-600">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg">{t('save')}</button>
          </div>
        </motion.form>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Customer List */}
        <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input 
                placeholder={t('search')} 
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {customers.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedCustomer(c)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${selectedCustomer?.id === c.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="text-xs text-gray-500 font-mono">{c.code}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger View */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selectedCustomer ? (
            <>
              <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                  <p className="text-sm text-gray-500 font-mono">{selectedCustomer.code}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{t('current_balance')}</div>
                  <div className={`text-2xl font-mono font-bold ${(ledger[0]?.balance || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {(ledger[0]?.balance || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">{t('date')}</th>
                      <th className="px-6 py-3">{t('debit')}</th>
                      <th className="px-6 py-3">{t('credit')}</th>
                      <th className="px-6 py-3 text-right">{t('balance')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ledger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-gray-500">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-red-600 font-mono">
                          {entry.debit > 0 ? entry.debit.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-green-600 font-mono">
                          {entry.credit > 0 ? entry.credit.toLocaleString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-medium">
                          {entry.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {ledger.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-12 h-12 mb-4 opacity-20" />
              <p>{t('select_customer')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
