import { Customer, Cashbox, Transaction, LedgerEntry, BankAccount } from './types';

const STORAGE_KEY = 'ledger_app_data';
const AUTH_KEY = 'ledger_app_auth';

interface LocalData {
  customers: Customer[];
  cashbox: Cashbox[];
  bank_accounts: BankAccount[];
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
  bank_accounts: [
    { id: 1, bank_name: 'Saderat', currency: 'BANK_TOMAN', balance: 0 },
    { id: 2, bank_name: 'Mellat', currency: 'BANK_TOMAN', balance: 0 }
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
  // Auth methods
  initAuth: () => {
    if (!localStorage.getItem(AUTH_KEY)) {
      localStorage.setItem(AUTH_KEY, '1234'); // Default password
    }
  },

  checkPassword: (password: string): boolean => {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored === password;
  },

  setPassword: (password: string) => {
    localStorage.setItem(AUTH_KEY, password);
  },

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

  getBankAccounts: async (): Promise<BankAccount[]> => {
    return getData().bank_accounts;
  },

  createBankAccount: async (account: Partial<BankAccount>): Promise<BankAccount> => {
    const data = getData();
    const newAccount: BankAccount = {
      id: Date.now(),
      bank_name: account.bank_name!,
      account_number: account.account_number,
      currency: account.currency || 'BANK_TOMAN',
      balance: account.balance || 0
    };
    data.bank_accounts.push(newAccount);
    saveData(data);
    return newAccount;
  },

  getBankAccountHistory: async (): Promise<any[]> => {
    const data = getData();
    return data.transactions
      .filter(tx => tx.bank_account_id)
      .map(tx => ({
        id: tx.id,
        source: 'TRANSACTION',
        created_at: tx.created_at,
        currency: tx.currency_from,
        amount: tx.amount,
        description: tx.description,
        movement_type: tx.type,
        customer_id: tx.customer_id,
        bank_name: data.bank_accounts.find(b => b.id === tx.bank_account_id)?.bank_name,
        source_card_last4: tx.source_card_last4,
        source_serial_no: tx.source_serial_no,
        destination_card_name: tx.destination_card_name,
        destination_card_last4: tx.destination_card_last4
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 100);
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
      created_at: new Date().toISOString(),
      bank_account_id: tx.bank_account_id,
      source_card_last4: tx.source_card_last4,
      source_serial_no: tx.source_serial_no,
      destination_card_name: tx.destination_card_name,
      destination_card_last4: tx.destination_card_last4,
      exchange_info: tx.exchange_info
    };

    // Update Cashbox or Bank Account
    if (tx.bank_account_id) {
      const bankIndex = data.bank_accounts.findIndex(b => b.id === tx.bank_account_id);
      if (bankIndex >= 0) {
        if (tx.type === 'DEPOSIT') {
          data.bank_accounts[bankIndex].balance += tx.amount!;
        } else if (tx.type === 'WITHDRAWAL') {
          data.bank_accounts[bankIndex].balance -= tx.amount!;
        }
      }
    } else {
      const boxIndex = data.cashbox.findIndex(b => b.currency === tx.currency_from);
      if (boxIndex >= 0) {
        if (tx.type === 'DEPOSIT') {
          data.cashbox[boxIndex].balance += tx.amount!;
        } else if (tx.type === 'WITHDRAWAL') {
          data.cashbox[boxIndex].balance -= tx.amount!;
        }
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
    const transactions = data.transactions.map(tx => ({
      ...tx,
      customer_name: data.customers.find(c => c.id === tx.customer_id)?.name || 'Unknown'
    }));

    const adjustments = data.adjustments.map(adj => ({
      id: -adj.id,
      customer_id: 0,
      customer_name: 'Adjustment',
      type: (adj.amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL') as 'DEPOSIT' | 'WITHDRAWAL',
      currency_from: adj.currency,
      currency_to: undefined,
      amount: Math.abs(adj.amount),
      rate: undefined,
      total: Math.abs(adj.amount),
      description: adj.reason,
      created_at: adj.created_at,
      bank_account_id: undefined,
      source_card_last4: undefined,
      source_serial_no: undefined,
      destination_card_name: undefined,
      destination_card_last4: undefined,
      exchange_info: undefined
    }));

    return [...transactions, ...adjustments]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
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
      .map(l => {
        const tx = data.transactions.find(t => t.id === l.transaction_id);
        return {
          ...l,
          description: tx?.description,
          currency_from: tx?.currency_from,
          rate: tx?.rate,
          exchange_info: tx?.exchange_info,
          type: tx?.type
        };
      })
      .sort((a, b) => b.id - a.id);
  },

  getCashboxHistory: async (): Promise<any[]> => {
    const data = getData();
    const history = [
      ...data.transactions
        .filter(tx => !tx.bank_account_id)
        .map(tx => ({
          id: tx.id,
          source: 'TRANSACTION',
          created_at: tx.created_at,
          currency: tx.currency_from,
          amount: tx.amount,
          rate: tx.rate,
          description: tx.description,
          movement_type: tx.type,
          customer_id: tx.customer_id,
          customer_name: data.customers.find(c => c.id === tx.customer_id)?.name
        })),
      ...data.adjustments.map(adj => ({
        id: adj.id,
        source: 'ADJUSTMENT',
        created_at: adj.created_at,
        currency: adj.currency,
        amount: adj.amount,
        rate: null,
        description: adj.reason,
        movement_type: adj.amount >= 0 ? 'DEPOSIT' : 'WITHDRAWAL',
        customer_id: null,
        customer_name: null
      }))
    ];

    return history
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 1000);
  }
};
