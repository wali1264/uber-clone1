import { query, run } from "./db";

export const ReportService = {
  getRates: () => {
    const res = query("SELECT * FROM exchange_rates");
    const rates: Record<string, number> = {};
    res.forEach((r: any) => {
      rates[r.currency] = r.rate_to_toman;
    });
    return rates;
  },

  setRate: async (currency: string, rate: number) => {
    await run(
      "INSERT INTO exchange_rates (currency, rate_to_toman) VALUES (?, ?) ON CONFLICT(currency) DO UPDATE SET rate_to_toman = ?",
      [currency, rate, rate]
    );
  },

  // Calculate total assets in Toman
  // Assets = (Customer Balances + Cashbox Balances) * Rate
  calculateTotalAssets: async () => {
    const currencies = query("SELECT name FROM currencies").map((c: any) => c.name);
    const rates = ReportService.getRates();
    
    let totalInToman = 0;
    let totalReceivablesInToman = 0; // Talab (Positive Balances)
    let totalPayablesInToman = 0;    // Bedeh (Negative Balances)
    let totalCashboxInToman = 0;

    const breakdown: any[] = [];

    for (const currency of currencies) {
      // Get Rate
      let rate = rates[currency] || 0;
      if (currency.includes("تومان")) rate = 1;

      // 1. Cashbox Balance (In - Out)
      const cashRes = query(`
        SELECT 
          SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) - 
          SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as balance
        FROM cashbox 
        WHERE currency = ?
      `, [currency]);
      const cashboxBalance = cashRes[0].balance || 0;
      totalCashboxInToman += cashboxBalance * rate;

      // 2. Customer Balances (Grouped by customer to separate Debt/Credit)
      const custRes = query(`
        SELECT 
          customer_id,
          SUM(CASE WHEN type = 'bard' THEN amount ELSE 0 END) - 
          SUM(CASE WHEN type = 'resid' THEN amount ELSE 0 END) as balance
        FROM journal 
        WHERE currency = ?
        GROUP BY customer_id
      `, [currency]);

      let currencyReceivables = 0;
      let currencyPayables = 0;
      let netCustomerBalance = 0;

      custRes.forEach((c: any) => {
        const bal = c.balance || 0;
        netCustomerBalance += bal;
        if (bal > 0) {
          currencyReceivables += bal;
        } else {
          currencyPayables += Math.abs(bal);
        }
      });

      totalReceivablesInToman += currencyReceivables * rate;
      totalPayablesInToman += currencyPayables * rate;

      // Total Net for this currency (Cashbox + Net Customer)
      const total = cashboxBalance + netCustomerBalance;
      const valueInToman = total * rate;
      totalInToman += valueInToman;

      breakdown.push({
        currency,
        customerBalance: netCustomerBalance,
        cashboxBalance,
        total,
        rate,
        valueInToman
      });
    }

    const grossAssets = totalCashboxInToman + totalReceivablesInToman;

    return { 
      totalInToman, // Net Real Assets
      grossAssets,  // Cashbox + Receivables
      totalReceivablesInToman,
      totalPayablesInToman,
      breakdown 
    };
  },

  saveReport: async (data: any, description: string = '') => {
    await run(
      "INSERT INTO saved_reports (date, total_in_toman, details, description) VALUES (?, ?, ?, ?)",
      [new Date().toISOString(), data.totalInToman, JSON.stringify(data), description]
    );
  },

  getSavedReports: () => {
    return query("SELECT * FROM saved_reports ORDER BY date DESC");
  },

  deleteSavedReport: async (id: number) => {
    await run("DELETE FROM saved_reports WHERE id = ?", [id]);
  }
};
