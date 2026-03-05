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

  CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bank_name TEXT NOT NULL,
    account_number TEXT,
    currency TEXT DEFAULT 'BANK_TOMAN',
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
    bank_account_id INTEGER,
    source_card_last4 TEXT,
    source_serial_no TEXT,
    destination_card_name TEXT,
    destination_card_last4 TEXT,
    exchange_info TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
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

  CREATE TABLE IF NOT EXISTS exchange_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    currency_code TEXT NOT NULL,
    rate_to_toman REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS weekly_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_assets_toman REAL,
    total_liabilities_toman REAL,
    net_capital_toman REAL,
    rate_version INTEGER,
    details TEXT
  );
`);

// Seed Cashbox if empty
const cashboxCount = db.prepare('SELECT COUNT(*) as count FROM cashbox').get() as { count: number };
if (cashboxCount.count === 0) {
  const insert = db.prepare('INSERT INTO cashbox (currency, balance) VALUES (?, ?)');
  const currencies = ['AFN', 'USD', 'TOMAN', 'BANK_TOMAN', 'PKR'];
  currencies.forEach(curr => insert.run(curr, 0));
}

// Seed Bank Accounts if empty
const bankCount = db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get() as { count: number };
if (bankCount.count === 0) {
  const insert = db.prepare('INSERT INTO bank_accounts (bank_name, currency, balance) VALUES (?, ?, ?)');
  insert.run('Saderat', 'BANK_TOMAN', 0);
  insert.run('Mellat', 'BANK_TOMAN', 0);
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
    const ledger = db.prepare(`
      SELECT 
        l.*,
        t.description,
        t.currency_from,
        t.rate,
        t.exchange_info,
        t.type
      FROM ledger l
      LEFT JOIN transactions t ON l.transaction_id = t.id
      WHERE l.customer_id = ? 
      ORDER BY l.id DESC
    `).all(req.params.id);
    res.json(ledger);
  });

  // Cashbox
  app.get('/api/cashbox', (req, res) => {
    const cashbox = db.prepare('SELECT id, currency, balance FROM cashbox').all();
    const bankAccounts = db.prepare('SELECT id, currency, balance, bank_name FROM bank_accounts').all();
    
    const combined = [
      ...cashbox,
      ...bankAccounts.map((b: any) => ({
        id: b.id + 10000, // Offset ID to avoid collision
        currency: `${b.currency} (${b.bank_name})`,
        balance: b.balance
      }))
    ];
    
    res.json(combined);
  });

  app.get('/api/cashbox/history', (req, res) => {
    const history = db.prepare(`
      SELECT 
        t.id,
        'TRANSACTION' as source,
        t.created_at,
        t.currency_from as currency,
        t.amount,
        t.rate,
        t.description,
        t.type as movement_type,
        t.customer_id,
        c.name as customer_name
      FROM transactions t
      LEFT JOIN customers c ON t.customer_id = c.id
      WHERE t.bank_account_id IS NULL
      UNION ALL
      SELECT 
        id,
        'ADJUSTMENT' as source,
        created_at,
        currency,
        amount,
        NULL as rate,
        reason as description,
        CASE WHEN amount >= 0 THEN 'DEPOSIT' ELSE 'WITHDRAWAL' END as movement_type,
        NULL as customer_id,
        NULL as customer_name
      FROM balance_adjustments
      ORDER BY created_at DESC
      LIMIT 1000
    `).all();
    res.json(history);
  });

  // Bank Accounts
  app.get('/api/bank-accounts', (req, res) => {
    const accounts = db.prepare('SELECT * FROM bank_accounts').all();
    res.json(accounts);
  });

  app.post('/api/bank-accounts', (req, res) => {
    const { bank_name, account_number, currency, balance } = req.body;
    try {
      const result = db.prepare('INSERT INTO bank_accounts (bank_name, account_number, currency, balance) VALUES (?, ?, ?, ?)').run(bank_name, account_number, currency || 'BANK_TOMAN', balance || 0);
      res.json({ id: result.lastInsertRowid, bank_name, account_number, currency: currency || 'BANK_TOMAN', balance: balance || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/bank-accounts/history', (req, res) => {
    const history = db.prepare(`
      SELECT 
        t.id,
        'TRANSACTION' as source,
        t.created_at,
        t.currency_from as currency,
        t.amount,
        t.description,
        t.type as movement_type,
        t.customer_id,
        b.bank_name,
        t.source_card_last4,
        t.source_serial_no,
        t.destination_card_name,
        t.destination_card_last4
      FROM transactions t
      JOIN bank_accounts b ON t.bank_account_id = b.id
      ORDER BY t.created_at DESC
      LIMIT 100
    `).all();
    res.json(history);
  });

  // Transactions
  app.get('/api/transactions', (req, res) => {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const transactions = db.prepare(`
      SELECT 
        t.id,
        t.customer_id,
        c.name as customer_name,
        t.type,
        t.currency_from,
        t.currency_to,
        t.amount,
        t.rate,
        t.total,
        t.description,
        t.created_at,
        t.bank_account_id,
        t.source_card_last4,
        t.source_serial_no,
        t.destination_card_name,
        t.destination_card_last4,
        t.exchange_info
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      
      UNION ALL
      
      SELECT 
        -id as id,
        NULL as customer_id,
        'Adjustment' as customer_name,
        CASE WHEN amount >= 0 THEN 'DEPOSIT' ELSE 'WITHDRAWAL' END as type,
        currency as currency_from,
        NULL as currency_to,
        ABS(amount) as amount,
        NULL as rate,
        ABS(amount) as total,
        reason as description,
        created_at,
        NULL as bank_account_id,
        NULL as source_card_last4,
        NULL as source_serial_no,
        NULL as destination_card_name,
        NULL as destination_card_last4,
        NULL as exchange_info
      FROM balance_adjustments
      
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(limit);
    res.json(transactions);
  });

  app.post('/api/transactions', (req, res) => {
    const { 
      customer_id, type, currency_from, currency_to, amount, rate, total, description, bank_account_id,
      source_card_last4, source_serial_no, destination_card_name, destination_card_last4, exchange_info
    } = req.body;
    
    // Transaction Transaction (Atomic)
    const makeTransaction = db.transaction(() => {
      // 1. Insert Transaction
      const transResult = db.prepare(`
        INSERT INTO transactions (
          customer_id, type, currency_from, currency_to, amount, rate, total, description, bank_account_id,
          source_card_last4, source_serial_no, destination_card_name, destination_card_last4, exchange_info
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        customer_id, type, currency_from, currency_to, amount, rate, total, description, bank_account_id,
        source_card_last4, source_serial_no, destination_card_name, destination_card_last4, exchange_info
      );
      
      const transactionId = transResult.lastInsertRowid;

      // 2. Update Cashbox OR Bank Account
      if (bank_account_id) {
        if (type === 'DEPOSIT') {
           db.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id = ?').run(amount, bank_account_id);
        } else if (type === 'WITHDRAWAL') {
           db.prepare('UPDATE bank_accounts SET balance = balance - ? WHERE id = ?').run(amount, bank_account_id);
        }
      } else {
        if (type === 'DEPOSIT') {
           db.prepare('UPDATE cashbox SET balance = balance + ? WHERE currency = ?').run(amount, currency_from);
        } else if (type === 'WITHDRAWAL') {
           db.prepare('UPDATE cashbox SET balance = balance - ? WHERE currency = ?').run(amount, currency_from);
        }
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

  // Exchange Rates
  app.get('/api/exchange-rates', (req, res) => {
    const rates = db.prepare(`
      SELECT currency_code, rate_to_toman
      FROM exchange_rates
      WHERE id IN (
        SELECT MAX(id)
        FROM exchange_rates
        GROUP BY currency_code
      )
    `).all();
    res.json(rates);
  });

  app.post('/api/exchange-rates', (req, res) => {
    const { currency_code, rate_to_toman } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO exchange_rates (currency_code, rate_to_toman) VALUES (?, ?)');
      stmt.run(currency_code, rate_to_toman);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Financial Reports
  app.get('/api/reports/summary', (req, res) => {
    try {
      // 1. Get Rates
      const ratesRaw = db.prepare(`
        SELECT currency_code, rate_to_toman
        FROM exchange_rates
        WHERE id IN (
          SELECT MAX(id)
          FROM exchange_rates
          GROUP BY currency_code
        )
      `).all() as { currency_code: string, rate_to_toman: number }[];
      
      const rates: Record<string, number> = {};
      ratesRaw.forEach(r => rates[r.currency_code] = r.rate_to_toman);
      // Default Toman to 1 if not set
      if (!rates['TOMAN']) rates['TOMAN'] = 1;
      if (!rates['BANK_TOMAN']) rates['BANK_TOMAN'] = 1;

      // 2. Calculate Customer Balances (Assets/Liabilities)
      const customerBalances = db.prepare(`
        SELECT 
          customer_id,
          c.name as customer_name,
          t.currency_from as currency,
          SUM(CASE WHEN t.type = 'WITHDRAWAL' THEN t.amount ELSE -t.amount END) as balance
        FROM transactions t
        JOIN customers c ON t.customer_id = c.id
        WHERE t.customer_id IS NOT NULL AND t.type IN ('DEPOSIT', 'WITHDRAWAL')
        GROUP BY t.customer_id, t.currency_from
        HAVING balance != 0
      `).all() as { customer_id: number, customer_name: string, currency: string, balance: number }[];

      // 3. Calculate Cashbox Balances (Assets)
      const cashboxBalances = db.prepare('SELECT currency, balance FROM cashbox WHERE balance != 0').all() as { currency: string, balance: number }[];

      // 4. Calculate Bank Balances (Assets)
      const bankBalances = db.prepare('SELECT currency, balance, bank_name FROM bank_accounts WHERE balance != 0').all() as { currency: string, balance: number, bank_name: string }[];

      let totalAssets = 0;
      let totalLiabilities = 0;

      // Process Customers
      customerBalances.forEach(c => {
        const rate = rates[c.currency] || 0;
        const valueInToman = c.balance * rate;
        if (c.balance > 0) {
          totalAssets += valueInToman;
        } else {
          totalLiabilities += Math.abs(valueInToman);
        }
      });

      // Process Cashbox
      cashboxBalances.forEach(c => {
        const rate = rates[c.currency] || 0;
        totalAssets += c.balance * rate;
      });

      // Process Banks
      bankBalances.forEach(b => {
        const rate = rates[b.currency] || 0;
        totalAssets += b.balance * rate;
      });

      const netCapital = totalAssets - totalLiabilities;

      res.json({
        totalAssets,
        totalLiabilities,
        netCapital,
        rates,
        details: {
          customers: customerBalances,
          cashbox: cashboxBalances,
          banks: bankBalances
        }
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/reports/snapshot', (req, res) => {
    const { totalAssets, totalLiabilities, netCapital, details } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO weekly_reports (total_assets_toman, total_liabilities_toman, net_capital_toman, details) VALUES (?, ?, ?, ?)');
      stmt.run(totalAssets, totalLiabilities, netCapital, JSON.stringify(details));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/reports/history', (req, res) => {
    const history = db.prepare('SELECT * FROM weekly_reports ORDER BY report_date DESC LIMIT 50').all();
    res.json(history);
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
