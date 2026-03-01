import { Customer, Cashbox, Transaction, LedgerEntry } from './types';

const STORAGE_KEY = 'ledger_app_data';

interface LocalData {
  customers: Customer[];
  cashbox: Cashbox[];
  transactions: Transaction[];
  ledger: LedgerEntry[];
  adjustments: any[];
}

const getInitialData = (): LocalData => ({
  customers: [],
  cashbox: [
    { id: 1, currency: 'AFN', balance: 0 },
    { id: 2, currency: 'USD', balance: 0 },
    { id: 3, currency: 'TOMAN', balance: 0 },
    { id: 4, currency: 'BANK_TOMAN', balance: 0 },
    { id: 5, currency: 'PKR', balance: 0 }
  ],
  transactions: [],
  ledger: [],
  adjustments: []
});

const getData = (): LocalData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : getInitialData();
};

const saveData = (data: LocalData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const localStore = {
  getCustomers: async (): Promise<Customer[]> => {
    return getData().customers.sort((a, b) => a.name.localeCompare(b.name));
  },

  createCustomer: async (customer: Partial<Customer>): Promise<Customer> => {
    const data = getData();
    if (data.customers.some(c => c.code === customer.code)) {
      throw new Error('Customer code already exists');
    }
    const newCustomer: Customer = {
      id: Date.now(),
      name: customer.name!,
      code: customer.code!,
      phone: customer.phone || '',
      created_at: new Date().toISOString()
    };
    data.customers.push(newCustomer);
    saveData(data);
    return newCustomer;
  },

  getCashbox: async (): Promise<Cashbox[]> => {
    return getData().cashbox;
  },

  createTransaction: async (tx: Partial<Transaction>) => {
    const data = getData();
    const newTx: Transaction = {
      id: Date.now(),
      customer_id: tx.customer_id!,
      type: tx.type as any,
      currency_from: tx.currency_from!,
      currency_to: tx.currency_to,
      amount: tx.amount!,
      rate: tx.rate,
      total: tx.total,
      description: tx.description,
      created_at: new Date().toISOString()
    };

    // Update Cashbox
    const boxIndex = data.cashbox.findIndex(b => b.currency === tx.currency_from);
    if (boxIndex >= 0) {
      if (tx.type === 'DEPOSIT') {
        data.cashbox[boxIndex].balance += tx.amount!;
      } else if (tx.type === 'WITHDRAWAL') {
        data.cashbox[boxIndex].balance -= tx.amount!;
      }
    }

    // Update Ledger
    const customerLedger = data.ledger
      .filter(l => l.customer_id === tx.customer_id)
      .sort((a, b) => b.id - a.id);
    
    const lastBalance = customerLedger.length > 0 ? customerLedger[0].balance : 0;
    let debit = 0;
    let credit = 0;

    if (tx.type === 'DEPOSIT') {
      credit = tx.amount!;
    } else if (tx.type === 'WITHDRAWAL') {
      debit = tx.amount!;
    }

    const newBalance = lastBalance + debit - credit;

    const newLedgerEntry: LedgerEntry = {
      id: Date.now(),
      customer_id: tx.customer_id!,
      transaction_id: newTx.id,
      debit,
      credit,
      balance: newBalance,
      created_at: new Date().toISOString()
    };

    data.transactions.push(newTx);
    data.ledger.push(newLedgerEntry);
    saveData(data);

    return { transactionId: newTx.id, newBalance };
  },

  getTransactions: async (limit = 50): Promise<(Transaction & { customer_name: string })[]> => {
    const data = getData();
    return data.transactions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(tx => ({
        ...tx,
        customer_name: data.customers.find(c => c.id === tx.customer_id)?.name || 'Unknown'
      }));
  },

  createAdjustment: async (adj: { currency: string; amount: number; reason: string }) => {
    const data = getData();
    const newAdj = {
      id: Date.now(),
      ...adj,
      created_at: new Date().toISOString()
    };
    
    const boxIndex = data.cashbox.findIndex(b => b.currency === adj.currency);
    if (boxIndex >= 0) {
      data.cashbox[boxIndex].balance += adj.amount;
    }

    data.adjustments.push(newAdj);
    saveData(data);
    return { success: true };
  },

  getCustomerLedger: async (id: number): Promise<LedgerEntry[]> => {
    const data = getData();
    return data.ledger
      .filter(l => l.customer_id === Number(id))
      .sort((a, b) => b.id - a.id);
  },

  getCashboxHistory: async (): Promise<any[]> => {
    const data = getData();
    const history = [
      ...data.transactions.map(tx => ({
        id: tx.id,
        source: 'TRANSACTION',
        created_at: tx.created_at,
        currency: tx.currency_from,
        amount: tx.amount,
        description: tx.description,
        movement_type: tx.type,
        customer_id: tx.customer_id
      })),
      ...data.adjustments.map(adj => ({
        id: adj.id,
        source: 'ADJUSTMENT',
        created_at: adj.created_at,
        currency: adj.currency,
        amount: adj.amount,
        description: adj.reason,
        movement_type: adj.amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
        customer_id: null
      }))
    ];

    return history
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100);
  }
};
