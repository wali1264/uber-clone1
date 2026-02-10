
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Travelers from './components/Travelers';
import Services from './components/Services';
import Accounts from './components/Accounts';
import Expenses from './components/Expenses';
import Commission from './components/Commission';
import History from './components/History';
import Reports from './components/Reports';
import GeneralLedger from './components/GeneralLedger';
import CashBox from './components/CashBox';
import ArabicCompanies, { ArabicCompany } from './components/ArabicCompanies';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [companies, setCompanies] = useState<ArabicCompany[]>([
    {
      id: '1',
      name: 'شركة مكة للفنادق والخدمات',
      code: 'SA-101',
      location: 'مکه مکرمه',
      phone: '+966 12 345 6789',
      email: 'info@makkah-hotels.sa',
      balance: 2500.50,
      ledger: [
        { id: 'l1', date: '۱۴۰۳/۰۳/۰۱', description: 'رزرو گروهی هتل مکه - ۲۰ نفر', debit: 3000, credit: 0 },
        { id: 'l2', date: '۱۴۰۳/۰۳/۰۵', description: 'پرداخت قسط اول حواله', debit: 0, credit: 499.50 }
      ]
    },
    {
      id: '2',
      name: 'مجموعة المدينة للنقل والخدمات',
      code: 'SA-202',
      location: 'مدینه منوره',
      phone: '+966 14 987 6543',
      email: 'contact@madina-trans.sa',
      balance: 1200,
      ledger: [
        { id: 'l3', date: '۱۴۰۳/۰۳/۰۸', description: 'ترانسپورت جده-مدینه', debit: 1200, credit: 0 }
      ]
    }
  ]);

  const [travelers, setTravelers] = useState<any[]>([
    {
      id: '1',
      code: 'TRV-1042',
      firstNameDari: 'احمد',
      lastNameDari: 'رحمانی',
      firstNameEng: 'Ahmad',
      lastNameEng: 'Rahmani',
      name: 'احمد رحمانی',
      tripType: 'عمره',
      passport: 'P1234567',
      phone: '۰۷۸۸۸۸۸۸۸۸',
      status: 'تایید شده',
      date: '۱۴۰۳/۰۲/۱۵',
      tripDate: '1403/05/20',
      saudiRepresentative: 'شركة مكة للفنادق والخدمات',
      representativeFee: '50',
      visaPurchase: '100',
      visaSelling: '150',
      flightRoute: 'کابل-جده',
      flightPurchase: '450',
      flightSelling: '520',
      hotelNights: '5',
      hotelPurchase: '40',
      hotelSelling: '50',
      hotelMakkahNights: '5',
      hotelMakkahPurchase: '60',
      hotelMakkahSelling: '70',
      transportPurchase: '80',
      transportSelling: '100',
      foodPurchase: '30',
      foodSelling: '50',
      totalReceived: '500',
      totalPayable: '1520',
      ledger: [
        { id: 'l1', date: '۱۴۰۳/۰۲/۱۵', description: 'فروش پکیج عمره', debit: 1520, credit: 0 },
        { id: 'l2', date: '۱۴۰۳/۰۲/۱۶', description: 'رسید قسط اول', debit: 0, credit: 500 }
      ]
    }
  ]);

  const handleUpdateCompanies = (updatedCompanies: ArabicCompany[]) => {
    setCompanies(updatedCompanies);
  };

  const handleUpdateTravelers = (updatedTravelers: any[]) => {
    setTravelers(updatedTravelers);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-right" dir="rtl">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' ? (
          <Dashboard />
        ) : activeTab === 'travelers' ? (
          <Travelers 
            companies={companies} 
            travelers={travelers} 
            onUpdateTravelers={handleUpdateTravelers}
            onUpdateCompanies={handleUpdateCompanies}
          />
        ) : activeTab === 'ledger' ? (
          <GeneralLedger />
        ) : activeTab === 'cashbox' ? (
          <CashBox />
        ) : activeTab === 'arabic-companies' ? (
          <ArabicCompanies 
            companies={companies} 
            onUpdateCompanies={handleUpdateCompanies} 
          />
        ) : activeTab === 'reports' ? (
          <Reports travelers={travelers} />
        ) : activeTab === 'services' ? (
          <Services />
        ) : activeTab === 'accounts' ? (
          <Accounts />
        ) : activeTab === 'expenses' ? (
          <Expenses />
        ) : activeTab === 'commission' ? (
          <Commission />
        ) : activeTab === 'history' ? (
          <History />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 font-medium">
             این بخش در حال توسعه است
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
