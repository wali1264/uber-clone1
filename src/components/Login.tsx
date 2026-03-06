import React, { useState } from 'react';
import { AuthService } from '../services/auth';
import { Lock } from 'lucide-react';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await AuthService.login(password);
    if (isValid) {
      onLogin();
    } else {
      setError('رمز عبور اشتباه است');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">سیستم مدیریت صرافی</h1>
          <p className="text-slate-500">لطفا رمز عبور را وارد کنید</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">رمز عبور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            ورود به سیستم
          </button>
        </form>
      </div>
    </div>
  );
}
