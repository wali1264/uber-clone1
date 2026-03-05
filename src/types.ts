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

export interface BankAccount {
  id: number;
  bank_name: string;
  account_number?: string;
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
  bank_account_id?: number;
  source_card_last4?: string;
  source_serial_no?: string;
  destination_card_name?: string;
  destination_card_last4?: string;
  exchange_info?: string;
}

export interface LedgerEntry {
  id: number;
  customer_id: number;
  transaction_id: number;
  debit: number;
  credit: number;
  balance: number;
  created_at: string;
  description?: string;
  currency_from?: string;
  rate?: number;
  exchange_info?: string;
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'EXCHANGE';
}
