import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Transactions from './pages/Transactions';
import CashboxPage from './pages/Cashbox';
import { LayoutDashboard, Users, ArrowRightLeft, Globe, Wallet } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </Link>
  );
}

function Sidebar() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            L
          </div>
          Ledger
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <NavItem to="/" icon={LayoutDashboard} label={t('dashboard')} />
        <NavItem to="/customers" icon={Users} label={t('customers')} />
        <NavItem to="/transactions" icon={ArrowRightLeft} label={t('journal')} />
        <NavItem to="/cashbox" icon={Wallet} label={t('cashbox')} />
      </nav>
      
      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Globe className="w-4 h-4" />
            <span>{t('language')}</span>
          </div>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as any)}
            className="text-sm border rounded p-1 bg-gray-50"
          >
            <option value="fa">فارسی</option>
            <option value="ps">پشتو</option>
          </select>
        </div>
        <div className="text-xs text-gray-400 text-center">
          v1.0.0 • Multi-Currency
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-gray-50 font-sans" dir="rtl">
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/cashbox" element={<CashboxPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </BrowserRouter>
    </LanguageProvider>
  );
}
