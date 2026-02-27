export interface Customer {
  id: number;
  name: string;
  code: string;
  phone: string;
  created_at: string;
}

export interface Cashbox {
  id: number;
  currency: string;
  balance: number;
}

export interface Transaction {
  id: number;
  customer_id: number;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE';
  currency_from: string;
  currency_to?: string;
  amount: number;
  rate?: number;
  total?: number;
  description?: string;
  created_at: string;
}

export interface LedgerEntry {
  id: number;
  customer_id: number;
  transaction_id: number;
  debit: number;
  credit: number;
  balance: number;
  created_at: string;
}
