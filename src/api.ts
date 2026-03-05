import { Customer, Cashbox, Transaction, LedgerEntry, BankAccount } from './types';
import { localStore } from './localStore';

// Pure local API implementation - No fetch/server calls
export const api = {
  getCustomers: async (): Promise<Customer[]> => {
    return localStore.getCustomers();
  },
  
  createCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    return localStore.createCustomer(data);
  },

  getCashbox: async (): Promise<Cashbox[]> => {
    return localStore.getCashbox();
  },

  getCashboxHistory: async (): Promise<any[]> => {
    return localStore.getCashboxHistory();
  },

  getBankAccounts: async (): Promise<BankAccount[]> => {
    return localStore.getBankAccounts();
  },

  createBankAccount: async (data: Partial<BankAccount>): Promise<BankAccount> => {
    return localStore.createBankAccount(data);
  },

  getBankAccountHistory: async (): Promise<any[]> => {
    return localStore.getBankAccountHistory();
  },

  createTransaction: async (data: Partial<Transaction>) => {
    return localStore.createTransaction(data);
  },

  getTransactions: async (limit = 50): Promise<(Transaction & { customer_name: string })[]> => {
    return localStore.getTransactions(limit);
  },

  createAdjustment: async (data: { currency: string; amount: number; reason: string }) => {
    return localStore.createAdjustment(data);
  },

  getCustomerLedger: async (id: number): Promise<LedgerEntry[]> => {
    return localStore.getCustomerLedger(id);
  },

  // Reports
  getExchangeRates: async () => {
    return localStore.getExchangeRates();
  },

  saveExchangeRates: async (rates: any) => {
    return localStore.saveExchangeRates(rates);
  },

  getReportHistory: async () => {
    return localStore.getReportHistory();
  },

  saveReportSnapshot: async (snapshot: any) => {
    return localStore.saveReportSnapshot(snapshot);
  }
};
