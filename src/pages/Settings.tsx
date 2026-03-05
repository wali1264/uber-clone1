import React, { useState } from 'react';
import { localStore } from '../localStore';
import { Lock, Check, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../api';

export default function Settings() {
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!localStore.checkPassword(currentPassword)) {
      setError(t('incorrect_current_password'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('password_mismatch'));
      return;
    }

    if (newPassword.length < 4) {
      setError(t('password_min_length'));
      return;
    }

    localStore.setPassword(newPassword);
    setMessage(t('password_changed_success'));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const exportBackup = async () => {
    try {
      // Fetch all data
      const [customers, transactions, cashbox] = await Promise.all([
        api.getCustomers(),
        api.getTransactions(10000), // Get all transactions
        api.getCashbox()
      ]);
      
      const banks = JSON.parse(localStorage.getItem('banks') || '[]');
      const localData = JSON.parse(localStorage.getItem('ledger_app_data') || '{}');

      const data = {
        banks: banks || [],
        customers: customers || [],
        transactions: transactions || [],
        cashbox: cashbox || [],
        ledger: localData.ledger || [],
        adjustments: localData.adjustments || [],
        date: new Date().toLocaleString()
      };

      const jsonContent = JSON.stringify(data);
      const base64Data = btoa(unescape(encodeURIComponent(jsonContent)));

      // Create HTML content that Word can open as a document
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>Backup ${data.date}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
          </style>
        </head>
        <body>
          <h1>Financial Data Backup</h1>
          <p>Date: ${data.date}</p>
          
          <h2>Banks</h2>
          <table>
            <tr><th>Bank Name</th><th>Account Number</th><th>Balance</th></tr>
            ${data.banks.map((b: any) => `<tr><td>${b.bankName}</td><td>${b.accountNumber}</td><td>${b.balance}</td></tr>`).join('')}
          </table>

          <h2>Cashbox</h2>
          <table>
            <tr><th>Currency</th><th>Balance</th></tr>
            ${data.cashbox.map((c: any) => `<tr><td>${c.currency}</td><td>${c.balance}</td></tr>`).join('')}
          </table>

          <h2>Customers</h2>
          <table>
            <tr><th>Name</th><th>Phone</th></tr>
            ${data.customers.map((c: any) => `<tr><td>${c.name}</td><td>${c.phone}</td></tr>`).join('')}
          </table>

          <!-- EMBEDDED DATA FOR APP RESTORE - DO NOT MODIFY -->
          <div id="app-backup-data" style="display:none">${base64Data}</div>
        </body>
        </html>
      `;

      // Word File (HTML disguised as DOC)
      const blobWord = new Blob([htmlContent], { type: "application/msword" });
      const linkWord = document.createElement("a");
      linkWord.href = URL.createObjectURL(blobWord);
      linkWord.download = "backup.doc";
      linkWord.click();

      alert("بکاپ با موفقیت گرفته شد");
    } catch (err) {
      console.error(err);
      alert("خطا در گرفتن بکاپ");
    }
  };

  const importBackup = () => {
    const fileInput = document.getElementById("backupFile") as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const content = e.target?.result as string;
        let data;

        // Try parsing as pure JSON first (legacy backups)
        try {
          data = JSON.parse(content);
        } catch (jsonError) {
          // If not JSON, try to extract from HTML/DOC
          const match = content.match(/<div id="app-backup-data" style="display:none">(.*?)<\/div>/);
          if (match && match[1]) {
            const jsonStr = decodeURIComponent(escape(atob(match[1])));
            data = JSON.parse(jsonStr);
          } else {
            throw new Error("Invalid backup file format");
          }
        }

        // Restore Banks (Client-side)
        if (data.banks) {
          localStorage.setItem('banks', JSON.stringify(data.banks));
        }

        // Restore other data to localStore fallback
        const currentLocalData = JSON.parse(localStorage.getItem('ledger_app_data') || '{}');
        const newLocalData = {
          ...currentLocalData,
          customers: data.customers || currentLocalData.customers || [],
          transactions: data.transactions || currentLocalData.transactions || [],
          cashbox: data.cashbox || currentLocalData.cashbox || [],
          ledger: data.ledger || currentLocalData.ledger || [],
          adjustments: data.adjustments || currentLocalData.adjustments || []
        };
        localStorage.setItem('ledger_app_data', JSON.stringify(newLocalData));

        alert("بکاپ با موفقیت بازیابی شد. لطفا صفحه را رفرش کنید.");
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("خطا در بازیابی فایل بکاپ. لطفا از سالم بودن فایل اطمینان حاصل کنید.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Lock className="w-6 h-6 text-indigo-600" />
          {t('settings')}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Password Change */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('change_password')}</h2>
          
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('current_password')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('new_password')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirm_password')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {message && (
              <div className="text-green-600 text-sm bg-green-50 p-2 rounded flex items-center gap-2">
                <Check className="w-4 h-4" />
                {message}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              {t('update_password')}
            </button>
          </form>
        </div>

        {/* Backup & Restore */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">پشتیبان‌گیری و بازیابی (Backup & Restore)</h2>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              از اطلاعات خود نسخه پشتیبان تهیه کنید یا نسخه قبلی را بازیابی نمایید.
            </p>
            
            <button
              onClick={exportBackup}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              📥 گرفتن بکاپ (Export)
            </button>

            <div className="relative">
              <input
                type="file"
                id="backupFile"
                accept=".json,.txt,.doc"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={importBackup}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                📤 بازیابی بکاپ (Import)
              </button>
            </div>
            
            <div className="text-xs text-gray-400 mt-2 text-center">
              فایل‌های خروجی شامل PDF و Word می‌باشند.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
