import React, { useEffect, useState } from 'react';
import { CustomerService, Customer } from '../services/customer';
import { query } from '../services/db';
import { Plus, Search, Trash2, Eye } from 'lucide-react';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    customer_code: '',
    customer_name: '',
    phone: '',
    description: ''
  });

  const fetchData = () => {
    setCustomers(CustomerService.getAll());
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await CustomerService.create(formData);
    setShowModal(false);
    setFormData({ customer_code: '', customer_name: '', phone: '', description: '' });
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این مشتری اطمینان دارید؟')) {
      await CustomerService.delete(id);
      fetchData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">دفتر مشتریان</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>مشتری جدید</span>
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{customer.customer_name}</h3>
                <p className="text-sm text-slate-500">کد: {customer.customer_code}</p>
              </div>
              <button 
                onClick={() => handleDelete(customer.id)}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mb-4 space-y-1 text-sm text-slate-600">
              <p>شماره تماس: {customer.phone}</p>
              <p className="truncate">{customer.description}</p>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium text-slate-500">وضعیت حساب:</p>
              <div className="space-y-1">
                {currencies.map(curr => {
                  const bal = CustomerService.getBalance(customer.id, curr);
                  if (bal === 0) return null;
                  return (
                    <div key={curr} className="flex justify-between text-sm">
                      <span className="text-slate-600">{curr}:</span>
                      <span className={`font-mono font-medium ${bal > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {Math.abs(bal).toLocaleString()} {bal > 0 ? 'بدهکار' : 'بستانکار'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-6 text-xl font-bold text-slate-800">تعریف مشتری جدید</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">کد مشتری</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.customer_code}
                  onChange={e => setFormData({...formData, customer_code: e.target.value})}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">نام مشتری</label>
                <input 
                  type="text" required
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.customer_name}
                  onChange={e => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">شماره تماس</label>
                <input 
                  type="text"
                  className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
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
