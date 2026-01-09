
import React, { useState, useEffect } from 'react';
import { Patient, Prescription, Doctor, Medication, Gender, DrugInfo } from './types';
import { INITIAL_DOCTOR, MOCK_PATIENTS, DRUG_DATABASE } from './constants';
import Dashboard from './components/Dashboard';
import PatientManagement from './components/PatientManagement';
import PrescriptionForm from './components/PrescriptionForm';
import DrugDatabase from './components/DrugDatabase';
import Reports from './components/Reports';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'patients' | 'new-prescription' | 'database' | 'reports' | 'settings'>('dashboard');
  const [doctor] = useState<Doctor>(INITIAL_DOCTOR);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [customDrugs, setCustomDrugs] = useState<DrugInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Font Settings State
  const [fontConfig, setFontConfig] = useState({
    family: 'Vazirmatn',
    size: 14
  });

  useEffect(() => {
    const saved = localStorage.getItem('prescriptions');
    if (saved) setPrescriptions(JSON.parse(saved));
    const savedPatients = localStorage.getItem('patients');
    if (savedPatients) setPatients(JSON.parse(savedPatients));
    const savedDrugs = localStorage.getItem('custom_drugs');
    if (savedDrugs) setCustomDrugs(JSON.parse(savedDrugs));
    const savedFont = localStorage.getItem('font_config');
    if (savedFont) setFontConfig(JSON.parse(savedFont));
    
    const authStatus = sessionStorage.getItem('isLoggedIn');
    if (authStatus === 'true') setIsLoggedIn(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default Credentials: admin / 1234
    if (username === 'admin' && password === '1234') {
      setIsLoggedIn(true);
      setLoginError(false);
      sessionStorage.setItem('isLoggedIn', 'true');
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
  };

  const updateFont = (config: { family: string, size: number }) => {
    setFontConfig(config);
    localStorage.setItem('font_config', JSON.stringify(config));
  };

  const savePrescription = (newP: Prescription) => {
    const updated = [newP, ...prescriptions];
    setPrescriptions(updated);
    localStorage.setItem('prescriptions', JSON.stringify(updated));
    setActiveTab('dashboard');
  };

  const addPatient = (p: Patient) => {
    const updated = [p, ...patients];
    setPatients(updated);
    localStorage.setItem('patients', JSON.stringify(updated));
  };

  const addDrug = (drug: DrugInfo) => {
    const updated = [...customDrugs, drug];
    setCustomDrugs(updated);
    localStorage.setItem('custom_drugs', JSON.stringify(updated));
  };

  const startPrescription = (patient: Patient) => {
    setSelectedPatient(patient);
    setActiveTab('new-prescription');
  };

  const goToDashboard = () => setActiveTab('dashboard');

  const allDrugs = [...DRUG_DATABASE, ...customDrugs];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white w-full max-w-md p-8 rounded-[2.5rem] shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mb-4 shadow-lg shadow-blue-200">
              <i className="fa-solid fa-stethoscope"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-800">ورود به MediScript Pro</h1>
            <p className="text-slate-500 text-sm mt-2">لطفاً اطلاعات کاربری خود را وارد کنید</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-2">نام کاربری</label>
              <div className="relative">
                <i className="fa-solid fa-user absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" 
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2 mr-2">رمز عبور</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="password" 
                  className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  placeholder="****"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold text-center animate-bounce">
                نام کاربری یا رمز عبور اشتباه است!
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              ورود به سیستم
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden font-sans no-print" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} doctor={doctor} onLogout={handleLogout} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {activeTab === 'dashboard' && 'داشبورد پزشک'}
              {activeTab === 'patients' && 'مدیریت مریضان'}
              {activeTab === 'new-prescription' && 'نسخه‌نویسی دیجیتال'}
              {activeTab === 'database' && 'بانک دارو ها'}
              {activeTab === 'reports' && 'آمار و ارقام'}
              {activeTab === 'settings' && 'تنظیمات برنامه'}
            </h1>
            <p className="text-slate-500 text-sm mt-1">{doctor.clinicName} | {doctor.name}</p>
          </div>
          {activeTab !== 'dashboard' && (
            <button 
              onClick={goToDashboard}
              className="bg-white text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-bold flex items-center gap-2"
            >
              <i className="fa-solid fa-right-from-bracket"></i>
              خروج از این بخش
            </button>
          )}
        </header>

        <section className="animate-in fade-in duration-500">
          {activeTab === 'dashboard' && <Dashboard prescriptions={prescriptions} patientsCount={patients.length} onNewPrescription={() => setActiveTab('patients')} />}
          {activeTab === 'patients' && <PatientManagement patients={patients} onAddPatient={addPatient} onPrescribe={startPrescription} onExit={goToDashboard} />}
          {activeTab === 'new-prescription' && <PrescriptionForm doctor={doctor} patient={selectedPatient} recentPrescriptions={prescriptions} allDrugs={allDrugs} onSave={savePrescription} onCancel={goToDashboard} onAddDrug={addDrug} fontConfig={fontConfig} />}
          {activeTab === 'database' && <DrugDatabase drugs={allDrugs} onAddDrug={addDrug} onExit={() => setActiveTab('settings')} />}
          {activeTab === 'reports' && <Reports prescriptions={prescriptions} onExit={goToDashboard} />}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <button 
                onClick={() => setActiveTab('database')}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-right group"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-pills"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800">بانک دارو ها</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">ویرایش لیست دواها، افزودن دواهای اختصاصی و مدیریت دیتابیس دارویی کلینیک.</p>
                <div className="mt-8 flex items-center gap-2 text-blue-600 font-bold text-sm">
                  <span>ورود به بخش</span>
                  <i className="fa-solid fa-chevron-left text-[10px]"></i>
                </div>
              </button>

              {/* Font Settings Card */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  <i className="fa-solid fa-font"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800">تنظیمات فونت نسخه</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed mb-6">انتخاب قلم و اندازه متن برای نسخه چاپی جهت خوانایی بهتر.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-2">نوع فونت</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200"
                      value={fontConfig.family}
                      onChange={(e) => updateFont({ ...fontConfig, family: e.target.value })}
                    >
                      <option value="Vazirmatn">Vazirmatn (استاندارد)</option>
                      <option value="Amiri">Amiri (کلاسیک)</option>
                      <option value="Lalezar">Lalezar (تیتر)</option>
                      <option value="Tahoma">Tahoma</option>
                      <option value="Arial">Arial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-2">اندازه قلم ({fontConfig.size}px)</label>
                    <input 
                      type="range" min="10" max="24" step="1"
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      value={fontConfig.size}
                      onChange={(e) => updateFont({ ...fontConfig, size: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 mt-4">
                    <p style={{ fontFamily: fontConfig.family, fontSize: `${fontConfig.size}px` }} className="text-slate-800">
                      نمونه متن نسخه: ۲ عدد کپسول امپرازول هر ۱۲ ساعت
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm opacity-50 cursor-not-allowed grayscale relative overflow-hidden">
                <div className="absolute top-4 left-4 bg-amber-100 text-amber-600 text-[10px] font-black px-2 py-1 rounded-lg">به زودی</div>
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-3xl mb-6">
                  <i className="fa-solid fa-user-doctor"></i>
                </div>
                <h3 className="text-xl font-black text-slate-800">پروفایل داکتر</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">تنظیمات اطلاعات شخصی، تخصص، شماره تماس و آپلود مهر و امضای دیجیتال.</p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;
