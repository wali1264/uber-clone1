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
  // Note: This is a simplified view. Real accounting might be more complex.
  calculateTotalAssets: async () => {
    const currencies = query("SELECT name FROM currencies").map((c: any) => c.name);
    const rates = ReportService.getRates();
    
    let totalInToman = 0;
    const breakdown: any[] = [];

    for (const currency of currencies) {
      // 1. Customer Balance (Total Bard - Total Resid)
      const custRes = query(`
        SELECT 
          SUM(CASE WHEN type = 'bard' THEN amount ELSE 0 END) - 
          SUM(CASE WHEN type = 'resid' THEN amount ELSE 0 END) as balance
        FROM journal 
        WHERE currency = ?
      `, [currency]);
      const customerBalance = custRes[0].balance || 0;

      // 2. Cashbox Balance (In - Out)
      const cashRes = query(`
        SELECT 
          SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END) - 
          SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END) as balance
        FROM cashbox 
        WHERE currency = ?
      `, [currency]);
      const cashboxBalance = cashRes[0].balance || 0;

      // Total for this currency
      const total = customerBalance + cashboxBalance;
      
      // Convert to Toman
      // If currency is Toman (Cash or Bank), rate is 1 (or user defined, but usually 1)
      let rate = rates[currency] || 0;
      if (currency.includes("تومان")) rate = 1;

      const valueInToman = total * rate;
      totalInToman += valueInToman;

      breakdown.push({
        currency,
        customerBalance,
        cashboxBalance,
        total,
        rate,
        valueInToman
      });
    }

    return { totalInToman, breakdown };
  }
};
