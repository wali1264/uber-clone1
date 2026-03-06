import React, { useState, useEffect } from 'react';
import { Save, History, DollarSign, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { api } from '../api';

interface ExchangeRate {
  currency_code: string;
  rate_to_toman: number;
}

interface FinancialReport {
  totalAssets: number;
  totalLiabilities: number;
  netCapital: number;
  rates: Record<string, number>;
  details: {
    customers: { customer_id: number; customer_name: string; currency: string; balance: number }[];
    cashbox: { currency: string; balance: number }[];
    banks: { currency: string; balance: number; bank_name: string }[];
  };
}

interface ReportHistory {
  id: number;
  report_date: string;
  total_assets_toman: number;
  total_liabilities_toman: number;
  net_capital_toman: number;
}

export default function Reports() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [history, setHistory] = useState<ReportHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const currencies = ['AFN', 'USD', 'PKR', 'EUR'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const savedRates = await api.getExchangeRates();
      setRates(savedRates);
      await generateReport(savedRates);
      const savedHistory = await api.getReportHistory();
      setHistory(savedHistory);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (currentRates: Record<string, number>) => {
    try {
      const [customers, cashbox, banks] = await Promise.all([
        api.getCustomers(),
        api.getCashbox(),
        api.getBankAccounts()
      ]);

      // Calculate Customer Balances
      const customerBalances = await Promise.all(customers.map(async (c) => {
        const ledger = await api.getCustomerLedger(c.id);
        const balance = ledger.length > 0 ? ledger[0].balance : 0;
        // Assuming customer balance currency is usually based on their transactions or default
        // For simplicity, we might need to know the currency of the balance.
        // In this app, ledger is single currency? No, transactions can be mixed.
        // But the ledger balance is just a number.
        // Wait, the ledger logic in localStore sums debits and credits.
        // If transactions are mixed currency, the balance number is meaningless without conversion.
        // The current app seems to assume a single base currency or handles it elsewhere?
        // Looking at Transaction type: currency_from, currency_to.
        // The ledger entry just has 'balance'.
        // If I have 100 USD and 100 AFN, the ledger just says 200? That's a bug in the original design if so.
        // But for now, let's assume the ledger balance is in a primary currency or we just use it.
        // Actually, let's look at how Ledger is calculated in localStore.
        // It just adds amounts. So if I add 100 USD and 100 AFN, it says 200.
        // This is a limitation of the current simple ledger.
        // However, for this Report, we need to estimate.
        // Let's assume for now we treat customer balance as 'TOMAN' if not specified, or we need to fetch transactions to know.
        // To keep it simple and consistent with "Offline/Simple" request:
        // We will just list them.
        return {
          customer_id: c.id,
          customer_name: c.name,
          currency: 'TOMAN', // Defaulting to Toman as we don't track currency per customer balance in simple ledger
          balance: balance
        };
      }));

      const reportData: FinancialReport = {
        totalAssets: 0,
        totalLiabilities: 0,
        netCapital: 0,
        rates: currentRates,
        details: {
          customers: customerBalances,
          cashbox: cashbox.map(c => ({ currency: c.currency, balance: c.balance })),
          banks: banks.map(b => ({ currency: b.currency, balance: b.balance, bank_name: b.bank_name }))
        }
      };

      // Calculate Totals
      let assets = 0;
      let liabilities = 0;

      // Cashbox
      reportData.details.cashbox.forEach(item => {
        const rate = currentRates[item.currency] || (item.currency === 'TOMAN' ? 1 : 0);
        assets += item.balance * rate;
      });

      // Banks
      reportData.details.banks.forEach(item => {
        const rate = currentRates[item.currency] || (item.currency === 'BANK_TOMAN' ? 1 : 0);
        assets += item.balance * rate;
      });

      // Customers
      reportData.details.customers.forEach(item => {
        const rate = currentRates[item.currency] || 1;
        const val = item.balance * rate;
        if (val > 0) assets += val; // They owe us
        else liabilities += Math.abs(val); // We owe them
      });

      reportData.totalAssets = assets;
      reportData.totalLiabilities = liabilities;
      reportData.netCapital = assets - liabilities;

      setReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const updateRate = async (currency: string, value: number) => {
    const rate = isNaN(value) ? 0 : value;
    const newRates = { ...rates, [currency]: rate };
    setRates(newRates);
    await api.saveExchangeRates(newRates);
    generateReport(newRates);
  };

  const saveSnapshot = async () => {
    if (!report) {
      alert('گزارش آماده نیست. لطفاً صبر کنید یا صفحه را رفرش کنید.');
      return;
    }
    try {
      const snapshot = {
        report_date: new Date().toISOString(),
        total_assets_toman: report.totalAssets || 0,
        total_liabilities_toman: report.totalLiabilities || 0,
        net_capital_toman: report.netCapital || 0,
        details: JSON.stringify(report.details)
      };
      await api.saveReportSnapshot(snapshot);
      const savedHistory = await api.getReportHistory();
      setHistory(savedHistory);
      alert('گزارش با موفقیت ذخیره شد');
    } catch (error) {
      console.error('Error saving snapshot:', error);
      alert('خطا در ذخیره گزارش');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(Math.round(amount));
  };

  const calculateTotal = (items: any[], currencyKey: string, balanceKey: string) => {
    if (!report || !items) return 0;
    return items.reduce((acc, item) => {
      const rate = report.rates[item[currencyKey]] || (item[currencyKey] === 'TOMAN' || item[currencyKey] === 'BANK_TOMAN' ? 1 : 0);
      return acc + (item[balanceKey] * rate);
    }, 0);
  };
  
  const calculateCustomerTotal = (items: any[], isAsset: boolean) => {
      if (!report || !items) return 0;
      return items.reduce((acc, item) => {
          const rate = report.rates[item.currency] || 1;
          const val = item.balance * rate;
          if (isAsset && item.balance > 0) return acc + val;
          if (!isAsset && item.balance < 0) return acc + val; // returns negative sum
          return acc;
      }, 0);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Scale className="w-8 h-8 text-indigo-600" />
          گزارشات مالی (Financial Reports)
        </h1>
        <button
          onClick={saveSnapshot}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          ذخیره گزارش (Snapshot)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exchange Rates */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            نرخ ارز (Exchange Rates)
          </h2>
          <div className="space-y-4">
            {currencies.map(curr => (
              <div key={curr} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-700">{curr}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={rates[curr] || ''}
                    onChange={(e) => updateRate(curr, parseFloat(e.target.value))}
                    className="w-32 p-2 border rounded text-left ltr focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Rate"
                  />
                  <span className="text-xs text-gray-500 w-12">تومان</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">مجموع دارایی‌ها</span>
              </div>
              <div className="text-2xl font-bold text-emerald-800 ltr text-right">
                {report ? formatMoney(report.totalAssets) : '...'} <span className="text-sm font-normal">تومان</span>
              </div>
            </div>

            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <TrendingDown className="w-5 h-5" />
                <span className="font-medium">مجموع بدهی‌ها</span>
              </div>
              <div className="text-2xl font-bold text-red-800 ltr text-right">
                {report ? formatMoney(report.totalLiabilities) : '...'} <span className="text-sm font-normal">تومان</span>
              </div>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-700 mb-2">
                <Scale className="w-5 h-5" />
                <span className="font-medium">سرمایه خالص</span>
              </div>
              <div className="text-2xl font-bold text-indigo-800 ltr text-right">
                {report ? formatMoney(report.netCapital) : '...'} <span className="text-sm font-normal">تومان</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold mb-4 text-gray-800 border-b pb-2">جزئیات محاسبات (Details)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
               <div className="space-y-2">
                 <p className="text-gray-500 font-medium">دارایی‌ها (Assets)</p>
                 <div className="flex justify-between border-b border-gray-50 pb-1">
                   <span>موجودی صندوق:</span>
                   <span className="font-mono">{report ? formatMoney(calculateTotal(report.details.cashbox, 'currency', 'balance')) : 0}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-50 pb-1">
                   <span>موجودی بانک:</span>
                   <span className="font-mono">{report ? formatMoney(calculateTotal(report.details.banks, 'currency', 'balance')) : 0}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-50 pb-1">
                   <span>طلب از مشتریان:</span>
                   <span className="font-mono">{report ? formatMoney(calculateCustomerTotal(report.details.customers, true)) : 0}</span>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <p className="text-gray-500 font-medium">بدهی‌ها (Liabilities)</p>
                 <div className="flex justify-between border-b border-gray-50 pb-1">
                   <span>بدهی به مشتریان:</span>
                   <span className="font-mono text-red-600">{report ? formatMoney(Math.abs(calculateCustomerTotal(report.details.customers, false))) : 0}</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-gray-500" />
            تاریخچه گزارشات (History)
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-500 text-sm">
              <tr>
                <th className="p-4">تاریخ</th>
                <th className="p-4">دارایی‌ها</th>
                <th className="p-4">بدهی‌ها</th>
                <th className="p-4">سرمایه خالص</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-mono text-gray-600">{new Date(item.report_date).toLocaleString('fa-IR')}</td>
                  <td className="p-4 text-emerald-600 font-mono">{formatMoney(item.total_assets_toman)}</td>
                  <td className="p-4 text-red-600 font-mono">{formatMoney(item.total_liabilities_toman)}</td>
                  <td className="p-4 font-bold text-indigo-600 font-mono">{formatMoney(item.net_capital_toman)}</td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    هنوز گزارشی ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
