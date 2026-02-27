import { Customer, Cashbox, Transaction, LedgerEntry } from './types';

export const api = {
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch('/api/customers');
    return res.json();
  },
  
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getCashbox: async (): Promise<Cashbox[]> => {
    const res = await fetch('/api/cashbox');
    return res.json();
  },

  createTransaction: async (data: Partial<Transaction>) => {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getTransactions: async (limit = 50): Promise<(Transaction & { customer_name: string })[]> => {
    const res = await fetch(`/api/transactions?limit=${limit}`);
    return res.json();
  },

  createAdjustment: async (data: { currency: string; amount: number; reason: string }) => {
    const res = await fetch('/api/adjustments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getCustomerLedger: async (id: number): Promise<LedgerEntry[]> => {
    const res = await fetch(`/api/customers/${id}/ledger`);
    return res.json();
  }
};
