import React, { useEffect, useState } from 'react';
import { ReportService } from '../services/report';
import { query } from '../services/db';
import { Calculator, Save, History, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns-jalali';

export function Reports() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [report, setReport] = useState<{
    totalInToman: number;
    breakdown: any[];
  } | null>(null);
  
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [description, setDescription] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);

  const fetchData = () => {
    setRates(ReportService.getRates());
    setCurrencies(query("SELECT name FROM currencies").map((c: any) => c.name));
    ReportService.calculateTotalAssets().then(setReport);
    setSavedReports(ReportService.getSavedReports());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRateChange = async (currency: string, rawValue: string) => {
    // Remove commas and non-numeric chars
    const cleanValue = rawValue.replace(/,/g, '');
    if (isNaN(Number(cleanValue))) return;

    const numRate = cleanValue ? Number(cleanValue) : 0;
    await ReportService.setRate(currency, numRate);
    setRates(prev => ({ ...prev, [currency]: numRate }));
    ReportService.calculateTotalAssets().then(setReport);
  };

  const handleSaveReport = async () => {
    if (!report) return;
    await ReportService.saveReport(report.totalInToman, report.breakdown, description);
    setDescription('');
    fetchData();
    alert('گزارش با موفقیت ذخیره شد');
  };

  const handleDeleteReport = async (id: number) => {
    if (confirm('آیا از حذف این گزارش مطمئن هستید؟')) {
      await ReportService.deleteSavedReport(id);
      fetchData();
    }
  };

  const toggleReportDetails = (id: number) => {
    setExpandedReportId(expandedReportId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">گزارشات و دارایی</h2>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-colors ${
            showHistory ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <History className="h-5 w-5" />
          <span>{showHistory ? 'مشاهده گزارش فعلی' : 'تاریخچه گزارشات'}</span>
        </button>
      </div>

      {!showHistory ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Exchange Rates Input */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-800">
                <Calculator className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold">نرخ ارز (به تومان)</h3>
              </div>
              
              <div className="space-y-4">
                {currencies.filter(c => !c.includes('تومان')).map(curr => (
                  <div key={curr} className="flex items-center gap-4">
                    <label className="w-24 text-sm font-medium text-slate-600">{curr}</label>
                    <input 
                      type="text"
                      inputMode="numeric"
                      className="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-mono outline-none focus:border-blue-500"
                      placeholder="0"
                      value={rates[curr] ? rates[curr].toLocaleString('en-US') : ''}
                      onChange={e => handleRateChange(curr, e.target.value)}
                    />
                    <span className="text-xs text-slate-400">تومان</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Assets Display */}
            <div className="flex flex-col justify-center rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
              <p className="mb-2 text-slate-400">مجموع کل دارایی‌ها</p>
              <div className="mb-8 text-4xl font-bold tracking-tight">
                {report?.totalInToman.toLocaleString()} <span className="text-lg font-normal text-slate-400">تومان</span>
              </div>
              
              <div className="space-y-4 border-t border-white/10 pt-4">
                <div className="text-sm text-slate-400">
                  <p>این مبلغ بر اساس نرخ‌های وارد شده محاسبه شده است.</p>
                  <p>شامل موجودی صندوق و تراز حساب مشتریان.</p>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="توضیحات (اختیاری) - مثلا: گزارش پایان روز"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                  <button 
                    onClick={handleSaveReport}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4" />
                    <span>ذخیره</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          {report && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                <h3 className="font-bold text-slate-800">جزئیات دارایی به تفکیک ارز</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                    <tr>
                      <th className="px-6 py-3">ارز</th>
                      <th className="px-6 py-3">تراز مشتریان</th>
                      <th className="px-6 py-3">موجودی صندوق</th>
                      <th className="px-6 py-3">مجموع</th>
                      <th className="px-6 py-3">نرخ تبدیل</th>
                      <th className="px-6 py-3">ارزش به تومان</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.breakdown.map((item: any) => (
                      <tr key={item.currency} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{item.currency}</td>
                        <td className={`px-6 py-4 font-mono text-sm ${item.customerBalance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {item.customerBalance.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-600">{item.cashboxBalance.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-medium text-slate-900">{item.total.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono text-sm text-slate-500">{item.rate.toLocaleString()}</td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">{item.valueInToman.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {savedReports.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              هنوز هیچ گزارشی ذخیره نشده است.
            </div>
          ) : (
            savedReports.map((savedReport) => {
              const details = JSON.parse(savedReport.details);
              const isExpanded = expandedReportId === savedReport.id;
              
              return (
                <div key={savedReport.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all">
                  <div 
                    className="flex cursor-pointer items-center justify-between bg-slate-50 p-4 hover:bg-slate-100"
                    onClick={() => toggleReportDetails(savedReport.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                        <History className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">
                          {format(new Date(savedReport.date), 'yyyy/MM/dd HH:mm')}
                        </div>
                        <div className="text-sm text-slate-500">
                          {savedReport.description || 'بدون توضیحات'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-left">
                        <div className="text-xs text-slate-500">مجموع دارایی</div>
                        <div className="font-bold text-slate-900">
                          {savedReport.total_in_toman.toLocaleString()} <span className="text-xs font-normal text-slate-500">تومان</span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReport(savedReport.id);
                        }}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                          <thead className="bg-slate-50 text-xs font-medium text-slate-500 uppercase">
                            <tr>
                              <th className="px-4 py-2">ارز</th>
                              <th className="px-4 py-2">مجموع</th>
                              <th className="px-4 py-2">نرخ تبدیل</th>
                              <th className="px-4 py-2">ارزش به تومان</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {details.map((item: any) => (
                              <tr key={item.currency}>
                                <td className="px-4 py-2 font-medium text-slate-900">{item.currency}</td>
                                <td className="px-4 py-2 font-mono text-slate-600">{item.total.toLocaleString()}</td>
                                <td className="px-4 py-2 font-mono text-slate-500">{item.rate.toLocaleString()}</td>
                                <td className="px-4 py-2 font-mono font-bold text-slate-900">{item.valueInToman.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
