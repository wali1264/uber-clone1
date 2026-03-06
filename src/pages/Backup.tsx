import React from 'react';
import { BackupService } from '../services/backup';
import { Download, FileText, Database, FileType } from 'lucide-react';

export function Backup() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">بکاپ و پشتیبان‌گیری</h2>
      <p className="text-slate-600">
        از اطلاعات سیستم به صورت مرتب نسخه پشتیبان تهیه کنید. فایل دیتابیس (DB) برای بازگردانی اطلاعات در آینده ضروری است.
      </p>

      <div className="grid gap-6 sm:grid-cols-3">
        {/* Database Backup */}
        <button 
          onClick={() => BackupService.downloadDB()}
          className="group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-200">
            <Database className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">دانلود دیتابیس</h3>
            <p className="text-sm text-slate-500">فرمت .db (کامل)</p>
          </div>
        </button>

        {/* Word Backup */}
        <button 
          onClick={() => BackupService.generateWord()}
          className="group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-200">
            <FileText className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">گزارش Word</h3>
            <p className="text-sm text-slate-500">فرمت .docx</p>
          </div>
        </button>

        {/* PDF Backup */}
        <button 
          onClick={() => BackupService.generatePDF()}
          className="group flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
        >
          <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-200">
            <FileType className="h-8 w-8" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-slate-800">گزارش PDF</h3>
            <p className="text-sm text-slate-500">فرمت .pdf (محدودیت فونت فارسی)</p>
          </div>
        </button>
      </div>
      
      <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
        <p>نکته: برای گزارش‌های فارسی، استفاده از فرمت Word پیشنهاد می‌شود زیرا پشتیبانی بهتری از فونت‌های فارسی دارد.</p>
      </div>
    </div>
  );
}
