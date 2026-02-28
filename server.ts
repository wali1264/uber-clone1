import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('ledger.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cashbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency TEXT NOT NULL UNIQUE,
    balance REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER,
    type TEXT,
    currency_from TEXT,
    currency_to TEXT,
    amount REAL,
    rate REAL,
    total REAL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    transaction_id INTEGER,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    balance REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS balance_adjustments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency TEXT NOT NULL,
    amount REAL NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Cashbox if empty
const cashboxCount = db.prepare('SELECT COUNT(*) as count FROM cashbox').get() as { count: number };
if (cashboxCount.count === 0) {
  const insert = db.prepare('INSERT INTO cashbox (currency, balance) VALUES (?, ?)');
  const currencies = ['AFN', 'USD', 'TOMAN', 'BANK_TOMAN', 'PKR'];
  currencies.forEach(curr => insert.run(curr, 0));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Customers
  app.get('/api/customers', (req, res) => {
    const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
    res.json(customers);
  });

  app.post('/api/customers', (req, res) => {
    const { name, code, phone } = req.body;
    try {
      const result = db.prepare('INSERT INTO customers (name, code, phone) VALUES (?, ?, ?)').run(name, code, phone);
      res.json({ id: result.lastInsertRowid, name, code, phone });
    } catch (error: any) {
      console.error('Error creating customer:', error.message);
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/customers/:id/ledger', (req, res) => {
    const ledger = db.prepare('SELECT * FROM ledger WHERE customer_id = ? ORDER BY id DESC').all(req.params.id);
    res.json(ledger);
  });

  // Cashbox
  app.get('/api/cashbox', (req, res) => {
    const balances = db.prepare('SELECT * FROM cashbox').all();
    res.json(balances);
  });

  app.get('/api/cashbox/history', (req, res) => {
    const history = db.prepare(`
      SELECT 
        id,
        'TRANSACTION' as source,
        created_at,
        currency_from as currency,
        amount,
        description,
        type as movement_type,
        customer_id
      FROM transactions
      UNION ALL
      SELECT 
        id,
        'ADJUSTMENT' as source,
        created_at,
        currency,
        amount,
        reason as description,
        CASE WHEN amount >= 0 THEN 'DEPOSIT' ELSE 'WITHDRAWAL' END as movement_type,
        NULL as customer_id
      FROM balance_adjustments
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    res.json(history);
  });

  // Transactions
  app.get('/api/transactions', (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const transactions = db.prepare(`
      SELECT t.*, c.name as customer_name 
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      ORDER BY t.created_at DESC 
      LIMIT ?
    `).all(limit);
    res.json(transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { customer_id, type, currency_from, currency_to, amount, rate, total, description } = req.body;
    
    // Transaction Transaction (Atomic)
    const makeTransaction = db.transaction(() => {
      // 1. Insert Transaction
      const transResult = db.prepare(`
        INSERT INTO transactions (customer_id, type, currency_from, currency_to, amount, rate, total, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(customer_id, type, currency_from, currency_to, amount, rate, total, description);
      
      const transactionId = transResult.lastInsertRowid;

      // 2. Update Cashbox
      if (type === 'DEPOSIT') {
         db.prepare('UPDATE cashbox SET balance = balance + ? WHERE currency = ?').run(amount, currency_from);
      } else if (type === 'WITHDRAWAL') {
         db.prepare('UPDATE cashbox SET balance = balance - ? WHERE currency = ?').run(amount, currency_from);
      }
      
      // 3. Update Ledger
      const lastEntry = db.prepare('SELECT balance FROM ledger WHERE customer_id = ? ORDER BY id DESC LIMIT 1').get(customer_id) as { balance: number } | undefined;
      const oldBalance = lastEntry ? lastEntry.balance : 0;
      
      let debit = 0;
      let credit = 0;
      
      if (type === 'DEPOSIT') {
        credit = amount;
      } else if (type === 'WITHDRAWAL') {
        debit = amount;
      }

      const newBalance = oldBalance + debit - credit;
      
      db.prepare(`
        INSERT INTO ledger (customer_id, transaction_id, debit, credit, balance)
        VALUES (?, ?, ?, ?, ?)
      `).run(customer_id, transactionId, debit, credit, newBalance);

      return { transactionId, newBalance };
    });

    try {
      const result = makeTransaction();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/transactions/today', (req, res) => {
    const summary = db.prepare(`
      SELECT SUM(total) as total 
      FROM transactions 
      WHERE DATE(created_at) = DATE('now')
    `).get();
    res.json(summary);
  });

  // Balance Adjustments
  app.post('/api/adjustments', (req, res) => {
    const { currency, amount, reason } = req.body;
    const adjust = db.transaction(() => {
      db.prepare('INSERT INTO balance_adjustments (currency, amount, reason) VALUES (?, ?, ?)').run(currency, amount, reason);
      db.prepare('UPDATE cashbox SET balance = balance + ? WHERE currency = ?').run(amount, currency);
    });
    try {
      adjust();
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve static files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
