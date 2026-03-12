import React, { useState } from 'react';
import { SettingsService } from '../services/settings';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';

interface Props {
  onUnlock: () => void;
}

export function UpdateLockScreen({ onUnlock }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await SettingsService.unlockUpdate(code);
    if (success) {
      onUnlock();
    } else {
      setError('کد وارد شده اشتباه است');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-blue-600 p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold">فعال‌سازی نسخه جدید</h1>
          <p className="mt-2 text-blue-100">برنامه قفل شده است. لطفا کد فعال‌سازی را وارد کنید.</p>
        </div>

        <form onSubmit={handleUnlock} className="p-8">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-700">کد فعال‌سازی</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <KeyRound className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                required
                className="w-full rounded-xl border border-slate-300 py-3 pl-4 pr-10 text-left font-mono text-lg tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                placeholder="****"
                value={code}
                onChange={e => {
                  setCode(e.target.value);
                  setError('');
                }}
              />
            </div>
            {error && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            تایید و فعال‌سازی
          </button>
        </form>
      </div>
    </div>
  );
}
