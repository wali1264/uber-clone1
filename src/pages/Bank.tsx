import React, { useEffect, useState } from 'react';
import { BankService, BankAccount, BankTransaction } from '../services/bank';
import { Plus, Trash2, CreditCard, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Bank() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<(BankTransaction & { bank_name: string })[]>([]);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);

  const [accountForm, setAccountForm] = useState({
    bank_name: '',
    card_number: '',
    owner_name: ''
  });

  const [transForm, setTransForm] = useState({
    bank_id: '',
    customer_name: '',
    customer_code: '',
    type: 'in',
    amount: '',
    source_card_last4: '',
    tracking_code: '',
    dest_card: '',
    dest_card_last4: ''
  });

  const fetchData = () => {
    setAccounts(BankService.getAccounts());
    setTransactions(BankService.getTransactions());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    await BankService.createAccount(accountForm);
    setShowAccountModal(false);
    setAccountForm({ bank_name: '', card_number: '', owner_name: '' });
    fetchData();
  };

  const handleCreateTrans = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transForm.bank_id) return;
    
    await BankService.createTransaction({
      bank_id: Number(transForm.bank_id),
      customer_name: transForm.customer_name,
      customer_code: transForm.customer_code,
      type: transForm.type as 'in' | 'out',
      amount: Number(transForm.amount),
      source_card_last4: transForm.source_card_last4,
      tracking_code: transForm.tracking_code,
      dest_card: transForm.dest_card,
      dest_card_last4: transForm.dest_card_last4,
      date: new Date().toISOString()
    });
    setShowTransModal(false);
    setTransForm({
      bank_id: '', customer_name: '', customer_code: '', type: 'in', amount: '',
      source_card_last4: '', tracking_code: '', dest_card: '', dest_card_last4: ''
    });
    fetchData();
  };

  const handleDeleteAccount = async (id: number) => {
    if (confirm('حذف حساب بانکی؟')) {
      await BankService.deleteAccount(id);
      fetchData();
    }
  };

  const handleDeleteTrans = async (id: number) => {
    if (confirm('حذف تراکنش؟')) {
      await BankService.deleteTransaction(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-8">
      {/* Accounts Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">حساب‌های بانکی</h2>
          <button 
            onClick={() => setShowAccountModal(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            <Plus className="h-4 w-4" />
            <span>حساب جدید</span>
          </button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(acc => (
            <div key={acc.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white shadow-lg">
              <div className="mb-8 flex items-start justify-between">
                <CreditCard className="h-8 w-8 opacity-50" />
                <button onClick={() => handleDeleteAccount(acc.id)} className="opacity-50 hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-bold tracking-widest">{acc.card_number}</p>
                <div className="flex justify-between text-sm opacity-80">
                  <span>{acc.owner_name}</span>
                  <span>{acc.bank_name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Transactions Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">تراکنش‌های بانکی</h2>
          <button 
            onClick={() => setShowTransModal(true)}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>تراکنش جدید</span>
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-slate-50 text-sm font-medium text-slate-500">
                <tr>
                  <th className="px-6 py-4">تاریخ</th>
                  <th className="px-6 py-4">بانک</th>
                  <th className="px-6 py-4">مشتری</th>
                  <th className="px-6 py-4">نوع</th>
                  <th className="px-6 py-4">مبلغ</th>
                  <th className="px-6 py-4">کد پیگیری</th>
                  <th className="px-6 py-4">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(t.date), 'yyyy/MM/dd HH:mm')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{t.bank_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{t.customer_name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        t.type === 'in' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {t.type === 'in' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {t.type === 'in' ? 'واریز' : 'برداشت'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{t.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-sm text-slate-500">{t.tracking_code}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDeleteTrans(t.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">افزودن حساب بانکی</h3>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">نام بانک</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={accountForm.bank_name}
                  onChange={e => setAccountForm({...accountForm, bank_name: e.target.value})}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">شماره کارت</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={accountForm.card_number}
                  onChange={e => setAccountForm({...accountForm, card_number: e.target.value})}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">نام صاحب حساب</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={accountForm.owner_name}
                  onChange={e => setAccountForm({...accountForm, owner_name: e.target.value})}
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAccountModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">ثبت تراکنش بانکی</h3>
            <form onSubmit={handleCreateTrans} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">حساب بانکی</label>
                  <select 
                    required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.bank_id}
                    onChange={e => setTransForm({...transForm, bank_id: e.target.value})}
                  >
                    <option value="">انتخاب کنید</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.bank_name} - {a.owner_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نوع</label>
                  <select 
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.type}
                    onChange={e => setTransForm({...transForm, type: e.target.value})}
                  >
                    <option value="in">واریز به حساب</option>
                    <option value="out">برداشت از حساب</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">نام مشتری</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.customer_name}
                    onChange={e => setTransForm({...transForm, customer_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">مبلغ</label>
                  <input 
                    type="number" required
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.amount}
                    onChange={e => setTransForm({...transForm, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">کد پیگیری</label>
                  <input 
                    type="text"
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.tracking_code}
                    onChange={e => setTransForm({...transForm, tracking_code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">4 رقم آخر کارت مبدا</label>
                  <input 
                    type="text" maxLength={4}
                    className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                    value={transForm.source_card_last4}
                    onChange={e => setTransForm({...transForm, source_card_last4: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowTransModal(false)} className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100">انصراف</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
