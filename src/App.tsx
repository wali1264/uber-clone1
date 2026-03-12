import React, { useEffect, useState } from 'react';
import { initDB } from './services/db';
import { AuthService } from './services/auth';
import { SettingsService } from './services/settings';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { UpdateLockScreen } from './components/UpdateLockScreen';
import { ManagementDashboard } from './pages/ManagementDashboard';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Cashbox } from './pages/Cashbox';
import { Bank } from './pages/Bank';
import { Reports } from './pages/Reports';
import { Backup } from './pages/Backup';
import { Settings } from './pages/Settings';
import { WalkIn } from './pages/WalkIn';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isInit, setIsInit] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isUpdateLocked, setIsUpdateLocked] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDB().then(() => {
      setIsInit(true);
      setIsUpdateLocked(SettingsService.isUpdateLocked());
    }).catch(err => {
      console.error("DB Init Failed", err);
      setError("خطا در بارگذاری دیتابیس. لطفا اتصال اینترنت خود را بررسی کنید (برای بار اول نیاز است).");
    });
  }, []);

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-red-600 font-bold text-lg">خطا در راه اندازی</div>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!isInit) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-600 font-medium">در حال راه اندازی سیستم...</p>
        </div>
      </div>
    );
  }

  if (isUpdateLocked) {
    return <UpdateLockScreen onUnlock={() => setIsUpdateLocked(false)} />;
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'management': return <ManagementDashboard />;
      case 'dashboard': return <Dashboard />;
      case 'customers': return <Customers />;
      case 'cashbox': return <Cashbox />;
      case 'bank': return <Bank />;
      case 'reports': return <Reports />;
      case 'walkin': return <WalkIn />;
      case 'backup': return <Backup />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
