import { query, run } from "./db";

export interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  phone: string;
  description: string;
}

export interface JournalEntry {
  id: number;
  customer_id: number;
  type: 'bard' | 'resid';
  currency: string;
  amount: number;
  description: string;
  date: string;
  sentence: string;
}

export const CustomerService = {
  getAll: () => query("SELECT * FROM customers ORDER BY id DESC") as Customer[],
  
  create: async (data: Omit<Customer, 'id'>) => {
    await run(
      "INSERT INTO customers (customer_code, customer_name, phone, description) VALUES (?, ?, ?, ?)",
      [data.customer_code, data.customer_name, data.phone, data.description]
    );
  },

  update: async (id: number, data: Omit<Customer, 'id'>) => {
    await run(
      "UPDATE customers SET customer_code = ?, customer_name = ?, phone = ?, description = ? WHERE id = ?",
      [data.customer_code, data.customer_name, data.phone, data.description, id]
    );
  },

  delete: async (id: number) => {
    await run("DELETE FROM customers WHERE id = ?", [id]);
  },

  getBalance: (customerId: number, currency: string) => {
    const res = query(`
      SELECT 
        SUM(CASE WHEN type = 'bard' THEN amount ELSE 0 END) as total_bard,
        SUM(CASE WHEN type = 'resid' THEN amount ELSE 0 END) as total_resid
      FROM journal 
      WHERE customer_id = ? AND currency = ?
    `, [customerId, currency]);
    
    const bard = res[0].total_bard || 0;
    const resid = res[0].total_resid || 0;
    return bard - resid;
  },

  saveBalanceHistory: async (customerId: number, type: 'weekly' | 'monthly' | 'manual', balances: Record<string, number>, description: string) => {
    await run(
      "INSERT INTO customer_balance_history (customer_id, date, type, balances, description) VALUES (?, ?, ?, ?, ?)",
      [customerId, new Date().toISOString(), type, JSON.stringify(balances), description]
    );
  },

  getBalanceHistory: (customerId: number) => {
    return query("SELECT * FROM customer_balance_history WHERE customer_id = ? ORDER BY date DESC", [customerId]);
  }
};

export const JournalService = {
  getAll: () => query(`
    SELECT j.*, c.customer_name 
    FROM journal j 
    LEFT JOIN customers c ON j.customer_id = c.id 
    ORDER BY j.date DESC, j.id DESC
  `) as (JournalEntry & { customer_name: string })[],

  create: async (data: Omit<JournalEntry, 'id'>) => {
    // 1. Create Journal Entry
    await run(
      "INSERT INTO journal (customer_id, type, currency, amount, description, date, sentence) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [data.customer_id, data.type, data.currency, data.amount, data.description, data.date, data.sentence]
    );

    // 2. Create Corresponding Cashbox Entry
    // Bard (Withdrawal by customer) -> Money leaves our cashbox (OUT)
    // Resid (Deposit by customer) -> Money enters our cashbox (IN)
    const cashboxType = data.type === 'bard' ? 'out' : 'in';
    
    // Get customer name for description
    const customer = query("SELECT customer_name FROM customers WHERE id = ?", [data.customer_id])[0];
    const customerName = customer ? customer.customer_name : 'مشتری ناشناس';
    
    const cashboxDesc = `ثبت خودکار از روزنامچه: ${data.type === 'bard' ? 'برداشت' : 'رسید'} - ${customerName} - ${data.description}`;

    await run(
      "INSERT INTO cashbox (currency, amount, type, date, description) VALUES (?, ?, ?, ?, ?)",
      [data.currency, data.amount, cashboxType, data.date, cashboxDesc]
    );
  },

  delete: async (id: number) => {
    await run("DELETE FROM journal WHERE id = ?", [id]);
  },

  getDailyReport: (dateStr: string) => {
    // dateStr is YYYY-MM-DD
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0,0,0,0);
    
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23,59,59,999);
    
    // Get all entries with customer names
    const all = query(`
      SELECT j.*, c.customer_name 
      FROM journal j 
      LEFT JOIN customers c ON j.customer_id = c.id
    `) as (JournalEntry & { customer_name: string })[];
    
    const openingBalances: Record<string, number> = {};
    const todayEntries: (JournalEntry & { customer_name: string })[] = [];
    
    all.forEach((entry) => {
      const entryDate = new Date(entry.date);
      
      if (entryDate < startOfDay) {
        // Previous Balance
        if (!openingBalances[entry.currency]) openingBalances[entry.currency] = 0;
        // Bard (+), Resid (-)
        if (entry.type === 'bard') openingBalances[entry.currency] += entry.amount;
        else openingBalances[entry.currency] -= entry.amount;
      } else if (entryDate >= startOfDay && entryDate <= endOfDay) {
        // Today's Entry
        todayEntries.push(entry);
      }
    });
    
    // Sort todayEntries DESC
    todayEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return { openingBalances, todayEntries };
  }
};
