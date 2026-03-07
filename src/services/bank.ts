import { query, run } from "./db";

export interface BankAccount {
  id: number;
  bank_name: string;
  card_number: string;
  owner_name: string;
}

export interface BankTransaction {
  id: number;
  bank_id: number;
  customer_name: string;
  customer_code: string;
  type: 'in' | 'out'; // Assuming similar logic to cashbox/journal for simplicity, though prompt didn't specify enum
  amount: number;
  source_card_last4: string;
  tracking_code: string;
  dest_card: string;
  dest_card_last4: string;
  date: string;
}

export const BankService = {
  getAccounts: () => query("SELECT * FROM bank_accounts") as BankAccount[],
  
  createAccount: async (data: Omit<BankAccount, 'id'>) => {
    await run(
      "INSERT INTO bank_accounts (bank_name, card_number, owner_name) VALUES (?, ?, ?)",
      [data.bank_name, data.card_number, data.owner_name]
    );
  },

  deleteAccount: async (id: number) => {
    await run("DELETE FROM bank_accounts WHERE id = ?", [id]);
  },

  getTransactions: () => query(`
    SELECT t.*, b.bank_name 
    FROM bank_transactions t
    LEFT JOIN bank_accounts b ON t.bank_id = b.id
    ORDER BY t.date DESC, t.id DESC
  `) as (BankTransaction & { bank_name: string })[],

  createTransaction: async (data: Omit<BankTransaction, 'id'>) => {
    await run(
      `INSERT INTO bank_transactions (
        bank_id, customer_name, customer_code, type, amount, 
        source_card_last4, tracking_code, dest_card, dest_card_last4, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.bank_id, data.customer_name, data.customer_code, data.type, data.amount,
        data.source_card_last4, data.tracking_code, data.dest_card, data.dest_card_last4, data.date
      ]
    );
  },

  deleteTransaction: async (id: number) => {
    await run("DELETE FROM bank_transactions WHERE id = ?", [id]);
  }
};
