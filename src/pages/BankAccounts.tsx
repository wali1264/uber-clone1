import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { BankAccount } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, DollarSign, ArrowUpRight, ArrowDownLeft, History, Plus, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function BankAccounts() {
  const { t } = useLanguage();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: '',
    account_number: '',
    currency: 'BANK_TOMAN',
    balance: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    api.getBankAccounts().then(serverAccounts => {
      const localBanksRaw = localStorage.getItem('banks');
      const localBanks = localBanksRaw ? JSON.parse(localBanksRaw) : [];
      const formattedLocalBanks = localBanks.map((b: any, i: number) => ({
        id: 900000 + i,
        bank_name: b.bankName,
        account_number: b.accountNumber,
        currency: 'BANK_TOMAN',
        balance: b.balance
      }));
      
      const allAccounts = Array.isArray(serverAccounts) ? [...serverAccounts, ...formattedLocalBanks] : formattedLocalBanks;
      setAccounts(allAccounts);
    }).catch(err => {
      console.error(err);
      const localBanksRaw = localStorage.getItem('banks');
      const localBanks = localBanksRaw ? JSON.parse(localBanksRaw) : [];
      const formattedLocalBanks = localBanks.map((b: any, i: number) => ({
        id: 900000 + i,
        bank_name: b.bankName,
        account_number: b.accountNumber,
        currency: 'BANK_TOMAN',
        balance: b.balance
      }));
      setAccounts(formattedLocalBanks);
    });

    api.getBankAccountHistory().then(res => setHistory(Array.isArray(res) ? res : [])).catch(err => console.error(err));
  };

  const saveBankAccount = (bank: any) => {
    const existing = JSON.parse(localStorage.getItem('banks') || '[]');

    // اگر شماره حساب تکراری بود
    const alreadyExists = existing.find(
      (b: any) => b.accountNumber === bank.accountNumber
    );

    if (alreadyExists) {
      alert("شماره حساب تکراری است");
      return;
    }

    existing.push(bank);

    localStorage.setItem('banks', JSON.stringify(existing));

    alert("حساب با موفقیت ذخیره شد");
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBank = {
      bankName: newAccount.bank_name,
      accountNumber: newAccount.account_number,
      balance: Number(newAccount.balance)
    };

    saveBankAccount(newBank);
    
    setShowAddModal(false);
    setNewAccount({ bank_name: '', account_number: '', currency: 'BANK_TOMAN', balance: '' });
    loadData();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('bank_accounts')}</h1>
          <p className="text-gray-500">{t('bank_accounts_desc')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('add_bank_account')}
        </button>
      </header>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                <h3 className="font-bold text-gray-900">{t('add_bank_account')}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('bank_name')}</label>
                  <input
                    type="text"
                    required
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={newAccount.bank_name}
                    onChange={e => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('account_number')}</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={newAccount.account_number}
                    onChange={e => setNewAccount({ ...newAccount, account_number: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">{t('initial_balance')}</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={newAccount.balance}
                    onChange={e => setNewAccount({ ...newAccount, balance: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    {t('save')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Accounts Cards and History */}
      <div className="space-y-8">
        {Array.isArray(accounts) && accounts.map((account) => {
          const accountHistory = Array.isArray(history) ? history.filter(item => item.bank_name === account.bank_name) : [];
          
          return (
            <div key={account.id} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building2 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">{account.bank_name}</h3>
                  </div>
                  <span className="text-xs font-mono text-gray-400">{account.currency}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-gray-900 font-mono">
                    {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </motion.div>

              {/* History Table for this Account */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  <h2 className="font-medium text-gray-900">{t('recent_activity')} - {account.bank_name}</h2>
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
                      {accountHistory.map((item, index) => (
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
                            <div className="flex flex-col">
                              <span>{item.description || '-'}</span>
                              {(item.source_card_last4 || item.destination_card_last4) && (
                                <span className="text-xs text-gray-400 mt-1">
                                  {item.source_card_last4 && `${t('source')}: ...${item.source_card_last4}`}
                                  {item.destination_card_last4 && ` -> ${t('destination')}: ...${item.destination_card_last4}`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-medium">
                            {Math.abs(item.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {item.currency}
                          </td>
                        </tr>
                      ))}
                      {accountHistory.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                            No history found for {account.bank_name}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
