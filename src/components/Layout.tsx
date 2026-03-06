import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Landmark, 
  PieChart, 
  Save, 
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'روزنامچه', icon: LayoutDashboard },
    { id: 'customers', label: 'دفتر مشتریان', icon: Users },
    { id: 'cashbox', label: 'صندوق', icon: Wallet },
    { id: 'bank', label: 'حسابات بانکی', icon: Landmark },
    { id: 'reports', label: 'گزارشات', icon: PieChart },
    { id: 'backup', label: 'بکاپ و پشتیبان', icon: Save },
    { id: 'settings', label: 'تنظیمات', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-center border-b border-slate-100">
            <h1 className="text-xl font-bold text-blue-600">صرافی آنلاین</h1>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors",
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-slate-800">
            {menuItems.find(i => i.id === currentPage)?.label}
          </span>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
