import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { Lock, Check, AlertCircle } from 'lucide-react';

export function Settings() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage({ type: 'error', text: 'تکرار رمز عبور مطابقت ندارد' });
      return;
    }
    if (password.length < 4) {
      setMessage({ type: 'error', text: 'رمز عبور باید حداقل 4 کاراکتر باشد' });
      return;
    }

    await AuthService.setPassword(password);
    setMessage({ type: 'success', text: 'رمز عبور با موفقیت تغییر کرد' });
    setPassword('');
    setConfirm('');
  };

  return (
    <div className="max-w-md space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">تنظیمات امنیتی</h2>
      
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">تغییر رمز ورود</h3>
            <p className="text-xs text-slate-500">رمز عبور پیش‌فرض مدیر همیشه فعال است</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">رمز عبور جدید</label>
            <input 
              type="password" required
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">تکرار رمز عبور</label>
            <input 
              type="password" required
              className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
          </div>

          {message && (
            <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {message.text}
            </div>
          )}

          <button 
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 font-bold text-white hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </form>
      </div>
    </div>
  );
}
