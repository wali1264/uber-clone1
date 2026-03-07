/// <reference lib="dom" />

import initSqlJs, { Database, SqlJsStatic } from "sql.js";
import localforage from "localforage";

let db: Database | null = null;
let SQL: SqlJsStatic | null = null;

const DB_NAME = "saraf_db_v1";

export async function initDB() {
  if (db) return db;

  // Load SQL.js
  // We need to point to the wasm file. In a typical Vite setup, we might need to copy it to public.
  // For now, we will try to load it from a CDN if local fails, or assume standard node_modules resolution works with Vite plugins.
  // Actually, standard sql.js needs the wasm file available as a static asset.
  // We will try to fetch it from a CDN for simplicity in this environment if local resolution is tricky,
  // but let's try the standard import first.
  
  try {
    SQL = await initSqlJs({
      // Locate the wasm file.
      // Using unpkg to ensure version match and reliability.
      locateFile: file => `https://unpkg.com/sql.js@1.14.1/dist/${file}`
    });

    // Try to load existing DB from storage
    const savedDb = await localforage.getItem<Uint8Array>(DB_NAME);
    
    if (savedDb) {
      db = new SQL.Database(savedDb);
    } else {
      db = new SQL.Database();
    }
    
    // Always run initTables to ensure new tables are created (migrations)
    initTables(db);
    
    if (!savedDb) {
      await saveDB();
    }

    return db;
  } catch (err) {
    console.error("Failed to initialize database", err);
    throw err;
  }
}

export async function saveDB() {
  if (!db) return;
  const data = db.export();
  await localforage.setItem(DB_NAME, data);
}

export async function restoreDB(data: Uint8Array) {
  await localforage.setItem(DB_NAME, data);
  window.location.reload();
}

export function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

function initTables(database: Database) {
  // 2. Currencies
  database.run(`
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    );
  `);
  
  // Check if currencies exist, if not insert defaults
  const res = database.exec("SELECT count(*) as count FROM currencies");
  if (res[0].values[0][0] === 0) {
    database.run(`
      INSERT INTO currencies (name) VALUES
      ('تومان نقد'),
      ('تومان بانکی'),
      ('افغانی'),
      ('دالر'),
      ('کلدار');
    `);
  }

  // 3. Customers
  database.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_code TEXT,
      customer_name TEXT,
      phone TEXT,
      description TEXT
    );
  `);

  // 4. Journal
  database.run(`
    CREATE TABLE IF NOT EXISTS journal (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      type TEXT,   -- bard / resid
      currency TEXT,
      amount REAL,
      description TEXT,
      date TEXT,
      sentence TEXT
    );
  `);

  // 5. Cashbox
  database.run(`
    CREATE TABLE IF NOT EXISTS cashbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      currency TEXT,
      amount REAL,
      type TEXT, -- in / out
      date TEXT,
      description TEXT
    );
  `);

  // 6. Bank Accounts
  database.run(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_name TEXT,
      card_number TEXT,
      owner_name TEXT
    );
  `);

  // Bank Transactions
  database.run(`
    CREATE TABLE IF NOT EXISTS bank_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_id INTEGER,
      customer_name TEXT,
      customer_code TEXT,
      type TEXT,
      amount REAL,
      source_card_last4 TEXT,
      tracking_code TEXT,
      dest_card TEXT,
      dest_card_last4 TEXT,
      date TEXT
    );
  `);

  // 7. Exchange Rates
  database.run(`
    CREATE TABLE IF NOT EXISTS exchange_rates (
      currency TEXT PRIMARY KEY,
      rate_to_toman REAL
    );
  `);

  // 8. Settings (Password)
  database.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      admin_password TEXT
    );
  `);

  // 9. Saved Reports
  database.run(`
    CREATE TABLE IF NOT EXISTS saved_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      total_in_toman REAL,
      details TEXT, -- JSON string
      description TEXT
    );
  `);

  // 10. Customer Balance History (Qaid Balance)
  database.run(`
    CREATE TABLE IF NOT EXISTS customer_balance_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      date TEXT,
      type TEXT, -- 'weekly' | 'monthly' | 'manual'
      balances TEXT, -- JSON string of balances
      description TEXT
    );
  `);
}

// Helper to run a query and return objects
export function query(sql: string, params: any[] = []) {
  const database = getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper to run a command (INSERT, UPDATE, DELETE)
export async function run(sql: string, params: any[] = []) {
  const database = getDB();
  database.run(sql, params);
  await saveDB();
}
