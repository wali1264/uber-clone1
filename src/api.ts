import { Customer, Cashbox, Transaction, LedgerEntry } from './types';
import { localStore } from './localStore';

const useFallback = async <T>(apiCall: () => Promise<T>, fallback: () => Promise<T>): Promise<T> => {
  try {
    const res = await apiCall();
    return res;
  } catch (error) {
    console.warn('API call failed, falling back to local storage:', error);
    return fallback();
  }
};

export const api = {
  getCustomers: async (): Promise<Customer[]> => {
    return useFallback(
      async () => {
        const res = await fetch('/api/customers');
        if (!res.ok) throw new Error('API Error');
        return res.json();
      },
      localStore.getCustomers
    );
  },
  
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    return useFallback(
      async () => {
        const res = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorText = await res.text();
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.error || errorText);
          } catch (e) {
            throw new Error(errorText);
          }
        }
        return res.json();
      },
      () => localStore.createCustomer(data)
    );
  },

  getCashbox: async (): Promise<Cashbox[]> => {
    return useFallback(
      async () => {
        const res = await fetch('/api/cashbox');
        if (!res.ok) throw new Error('API Error');
        return res.json();
      },
      localStore.getCashbox
    );
  },

  getCashboxHistory: async (): Promise<any[]> => {
    return useFallback(
      async () => {
        const res = await fetch('/api/cashbox/history');
        if (!res.ok) throw new Error('API Error');
        return res.json();
      },
      localStore.getCashboxHistory
    );
  },

  createTransaction: async (data: Partial<Transaction>) => {
    return useFallback(
      async () => {
        const res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      () => localStore.createTransaction(data)
    );
  },

  getTransactions: async (limit = 50): Promise<(Transaction & { customer_name: string })[]> => {
    return useFallback(
      async () => {
        const res = await fetch(`/api/transactions?limit=${limit}`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
      },
      () => localStore.getTransactions(limit)
    );
  },

  createAdjustment: async (data: { currency: string; amount: number; reason: string }) => {
    return useFallback(
      async () => {
        const res = await fetch('/api/adjustments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      () => localStore.createAdjustment(data)
    );
  },

  getCustomerLedger: async (id: number): Promise<LedgerEntry[]> => {
    return useFallback(
      async () => {
        const res = await fetch(`/api/customers/${id}/ledger`);
        if (!res.ok) throw new Error('API Error');
        return res.json();
      },
      () => localStore.getCustomerLedger(id)
    );
  }
};
