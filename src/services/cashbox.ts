import { query, run } from "./db";

export interface CashboxEntry {
  id: number;
  currency: string;
  amount: number;
  type: 'in' | 'out';
  date: string;
  description: string;
}

export const CashboxService = {
  getAll: () => query("SELECT * FROM cashbox ORDER BY date DESC, id DESC") as CashboxEntry[],

  create: async (data: Omit<CashboxEntry, 'id'>) => {
    await run(
      "INSERT INTO cashbox (currency, amount, type, date, description) VALUES (?, ?, ?, ?, ?)",
      [data.currency, data.amount, data.type, data.date, data.description]
    );
  },

  delete: async (id: number) => {
    await run("DELETE FROM cashbox WHERE id = ?", [id]);
  },

  getBalance: (currency: string) => {
    const res = query(`
      SELECT 
        SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) as total_in,
        SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as total_out
      FROM cashbox 
      WHERE currency = ?
    `, [currency]);
    
    const totalIn = res[0].total_in || 0;
    const totalOut = res[0].total_out || 0;
    return totalIn - totalOut;
  }
};
