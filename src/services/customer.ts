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
  }
};
