import React, { useEffect, useState } from 'react';
import { CustomerService } from '../services/customer';
import { query } from '../services/db';

export function ManagementDashboard() {
  const [balances, setBalances] = useState<Record<string, { totalResid: number, totalBard: number, balance: number }>>({});
  const [currencies, setCurrencies] = useState<string[]>([]);

  useEffect(() => {
    const allCurrencies = query("SELECT name FROM currencies").map((c: any) => c.name);
    setCurrencies(allCurrencies);

    const customers = CustomerService.getAll();
    const newBalances: Record<string, { totalResid: number, totalBard: number, balance: number }> = {};

    allCurrencies.forEach(curr => {
      let totalResid = 0;
      let totalBard = 0;
      let balance = 0;

      customers.forEach(customer => {
        const custBal = CustomerService.getBalance(customer.id, curr);
        balance += custBal;
        if (custBal > 0) {
          totalBard += custBal; // Positive balance means customer owes us (Bard)
        } else {
          totalResid += Math.abs(custBal); // Negative balance means we owe customer (Resid)
        }
      });

      newBalances[curr] = { totalResid, totalBard, balance };
    });

    setBalances(newBalances);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">داشبورد مدیریتی</h2>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {currencies.map(curr => {
          const data = balances[curr];
          if (!data) return null;

          return (
            <div key={curr} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">{curr}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">مجموع طلب (بدهکاران):</span>
                  <span className="font-mono font-medium text-red-600">
                    {data.totalBard.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">مجموع بدهی (بستانکاران):</span>
                  <span className="font-mono font-medium text-green-600">
                    {data.totalResid.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-bold">
                  <span className="text-slate-700">تراز کلی:</span>
                  <span className={`font-mono ${data.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(data.balance).toLocaleString()} {data.balance > 0 ? 'طلب' : 'بدهی'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
