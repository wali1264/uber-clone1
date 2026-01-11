
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  PlusCircle, 
  History, 
  Settings, 
  Search, 
  Printer, 
  Share2, 
  ChevronRight,
  ChevronLeft,
  Home,
  Trash2,
  Copy,
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  PenTool,
  Save,
  X,
  FileText,
  UserPlus,
  LogOut,
  Lock,
  Maximize2,
  Minimize2,
  Type,
  User,
  Phone,
  Calendar,
  Check
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings } from './types';
import { INITIAL_DRUGS, DEFAULT_CLINIC_SETTINGS } from './constants';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [view, setView] = useState<ViewState>('HOME');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [drugTemplates, setDrugTemplates] = useState<DrugTemplate[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Load
  useEffect(() => {
    const savedPatients = localStorage.getItem('patients');
    const savedPrescriptions = localStorage.getItem('prescriptions');
    const savedDrugs = localStorage.getItem('drugTemplates');
    const savedSettings = localStorage.getItem('clinicSettings');
    const savedLogin = sessionStorage.getItem('isLoggedIn');

    if (savedPatients) setPatients(JSON.parse(savedPatients));
    if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
    if (savedDrugs) setDrugTemplates(JSON.parse(savedDrugs));
    else setDrugTemplates(INITIAL_DRUGS);
    if (savedSettings) setClinicSettings(JSON.parse(savedSettings));
    if (savedLogin === 'true') setIsLoggedIn(true);
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('drugTemplates', JSON.stringify(drugTemplates));
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
  }, [patients, prescriptions, drugTemplates, clinicSettings]);

  const handleLogin = () => {
    if (pin === '1234') {
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      setPin('');
    } else {
      alert('رمز اشتباه است! (رمز پیش‌فرض: ۱۲۳۴)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('isLoggedIn');
    setView('HOME');
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    const q = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.fatherName.toLowerCase().includes(q) || 
      p.code.toLowerCase().includes(q) || 
      p.phone.includes(q)
    );
  }, [patients, searchQuery]);

  // Derived state for safe patient selection
  const currentSelectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId), 
  [patients, selectedPatientId]);

  const handleAddPatient = (p: Omit<Patient, 'id' | 'code' | 'createdAt'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
    
    // Robust code calculation
    const maxCode = patients.reduce((max, pat) => {
      if (!pat.code || !pat.code.includes('-')) return max;
      const parts = pat.code.split('-');
      const num = parseInt(parts[1]);
      return !isNaN(num) && num > max ? num : max;
    }, 1000);
    
    const newPatient: Patient = {
      ...p,
      id: newId,
      code: `P-${maxCode + 1}`,
      createdAt: Date.now()
    };
    
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);
    setView('NEW_PRESCRIPTION');
  };

  const handleAddPrescription = (pr: Omit<Prescription, 'id' | 'date'>) => {
    const newPr: Prescription = {
      ...pr,
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now()
    };
    setPrescriptions(prev => [newPr, ...prev]);
    setSelectedPrescription(newPr);
    setView('VIEW_PDF');
  };

  const handleCopyPrescription = (old: Prescription, newPatientId: string) => {
    const newPr: Prescription = {
      ...old,
      id: Math.random().toString(36).substr(2, 9),
      patientId: newPatientId,
      date: Date.now()
    };
    setPrescriptions(prev => [newPr, ...prev]);
    setSelectedPrescription(newPr);
    setView('VIEW_PDF');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-900 p-6">
        <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 italic">ورود به سیستم</h1>
          <p className="text-sm text-gray-400">لطفاً رمز عبور خود را وارد کنید</p>
          <input 
            type="password"
            className="w-full p-4 rounded-2xl bg-gray-50 border-none text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-indigo-500 shadow-inner"
            placeholder="****"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            ورود داکتر
          </button>
          <p className="text-[10px] text-gray-300">رمز پیش‌فرض: ۱۲۳۴</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative border-x border-gray-100">
      <header className="bg-indigo-800 text-white p-4 sticky top-0 z-20 flex justify-between items-center no-print">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
          <Stethoscope className="w-6 h-6 text-indigo-300" />
          <h1 className="text-xl font-bold tracking-tight">آسان نسخه</h1>
        </div>
        <div className="flex items-center gap-1">
          {view !== 'HOME' && (
            <button onClick={() => setView('HOME')} className="p-2 bg-indigo-700/50 hover:bg-indigo-600 rounded-full transition-all">
              <Home className="w-5 h-5" />
            </button>
          )}
          <button onClick={handleLogout} className="p-2 bg-red-600/20 hover:bg-red-600 rounded-full transition-all group" title="خروج">
            <LogOut className="w-5 h-5 group-hover:text-white text-red-200" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28 p-4 bg-gray-50/30">
        {view === 'HOME' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
                 <Stethoscope className="w-48 h-48" />
               </div>
               <h2 className="text-2xl font-bold mb-1">خوش آمدید، {clinicSettings.doctor.split(' ')[1] || 'داکتر'} صاحب!</h2>
               <p className="text-indigo-200 text-sm font-medium">{new Date().toLocaleDateString('fa-AF', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
               
               <div className="mt-8 flex gap-3 relative z-10">
                 <button onClick={() => setView('NEW_PATIENT')} className="flex-1 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] flex flex-col items-center gap-2 transition-all border border-white/5 active:scale-95">
                   <UserPlus className="w-8 h-8 text-white" />
                   <span className="text-xs font-bold">مریض جدید</span>
                 </button>
                 <button onClick={() => setView('PATIENTS')} className="flex-1 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] flex flex-col items-center gap-2 transition-all border border-white/5 active:scale-95">
                   <Users className="w-8 h-8 text-white" />
                   <span className="text-xs font-bold">لیست مریضان</span>
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <QuickAction 
                icon={<History className="text-orange-600" />} 
                bg="bg-orange-50"
                title="تاریخچه نسخه‌ها" 
                desc="مشاهده و چاپ مجدد نسخه‌های ثبت شده"
                onClick={() => setView('PRESCRIPTION_HISTORY')}
              />
              <QuickAction 
                icon={<FileText className="text-blue-600" />} 
                bg="bg-blue-50"
                title="بانک دواها" 
                desc="مدیریت دواهای پرمصرف و هدایات"
                onClick={() => setView('DRUGS')}
              />
              <QuickAction 
                icon={<Settings className="text-gray-600" />} 
                bg="bg-gray-100"
                title="تنظیمات کلینیک" 
                desc="تغییر هدر نسخه، آدرس و شماره تماس"
                onClick={() => setView('SETTINGS')}
              />
            </div>
          </div>
        )}

        {view === 'PATIENTS' && (
          <div className="space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
                placeholder="جستجو (نام، کد، موبایل یا پدر)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              {filteredPatients.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  <div className="flex-1 cursor-pointer" onClick={() => { setSelectedPatientId(p.id); setView('NEW_PRESCRIPTION'); }}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800">{p.name}</span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{p.code}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">فرزند: {p.fatherName} | {p.phone}</div>
                  </div>
                  <button onClick={() => setPatients(prev => prev.filter(x => x.id !== p.id))} className="text-red-200 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>مریضی پیدا نشد.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'NEW_PATIENT' && <PatientForm onSubmit={handleAddPatient} onCancel={() => setView('HOME')} />}

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && (
          <PrescriptionForm 
            patient={currentSelectedPatient || patients.find(p => p.id === selectedPatientId) || patients[0]}
            drugTemplates={drugTemplates}
            previousPrescriptions={prescriptions.filter(pr => pr.patientId === selectedPatientId)}
            onSubmit={handleAddPrescription}
            onCancel={() => setView('PATIENTS')}
            onCopy={handleCopyPrescription}
          />
        )}

        {view === 'PRESCRIPTION_HISTORY' && (
          <div className="space-y-4 animate-in fade-in">
            {prescriptions.length === 0 ? (
               <div className="text-center py-20 text-gray-400">تاریخچه‌ای موجود نیست.</div>
            ) : (
              prescriptions.map(pr => {
                const p = patients.find(x => x.id === pr.patientId);
                return (
                  <div key={pr.id} onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-indigo-300 group">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-800 group-hover:text-indigo-700">{p?.name || 'مریض نامعلوم'}</span>
                      <span className="text-[10px] text-gray-400 font-mono">{new Date(pr.date).toLocaleDateString('fa-AF')}</span>
                    </div>
                    <div className="text-sm text-indigo-600 font-medium mt-1 truncate">Diagnosis: {pr.diagnosis}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {pr.medications.slice(0, 3).map(m => (
                        <span key={m.id} className="text-[9px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{m.name}</span>
                      ))}
                      {pr.medications.length > 3 && <span className="text-[9px] text-gray-300">+{pr.medications.length - 3}</span>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {view === 'DRUGS' && <DrugSettings drugTemplates={drugTemplates} setDrugTemplates={setDrugTemplates} />}
        
        {view === 'SETTINGS' && <ClinicSettingsForm settings={clinicSettings} onSave={setClinicSettings} onBack={() => setView('HOME')} />}

        {view === 'VIEW_PDF' && selectedPrescription && (
          <PrescriptionPrintView 
            settings={clinicSettings}
            prescription={selectedPrescription} 
            patient={patients.find(p => p.id === selectedPrescription.patientId)!}
            onBack={() => setView('HOME')}
          />
        )}
      </main>

      <nav className="bg-white/90 backdrop-blur-lg border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex justify-around items-center p-4 z-30 no-print rounded-t-3xl shadow-2xl">
        <NavBtn active={view === 'HOME'} icon={<Home />} label="اصلی" onClick={() => setView('HOME')} />
        <NavBtn active={view === 'PATIENTS' || view === 'NEW_PATIENT'} icon={<Users />} label="مریضان" onClick={() => setView('PATIENTS')} />
        <NavBtn active={view === 'PRESCRIPTION_HISTORY'} icon={<History />} label="تاریخچه" onClick={() => setView('PRESCRIPTION_HISTORY')} />
        <NavBtn active={view === 'SETTINGS'} icon={<Settings />} label="تنظیمات" onClick={() => setView('SETTINGS')} />
      </nav>
    </div>
  );
};

// --- Sub-Components ---

const QuickAction: React.FC<{ icon: React.ReactNode, bg: string, title: string, desc: string, onClick: () => void }> = ({ icon, bg, title, desc, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all active:scale-[0.98] text-right w-full">
    <div className={`${bg} p-4 rounded-2xl`}>{React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}</div>
    <div>
      <div className="font-bold text-gray-800 text-right">{title}</div>
      <div className="text-xs text-gray-400 mt-0.5 text-right">{desc}</div>
    </div>
  </button>
);

const NavBtn: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-indigo-700 scale-110' : 'text-gray-400'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const PatientForm: React.FC<{ onSubmit: (p: any) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [data, setData] = useState({ name: '', fatherName: '', phone: '', age: '', gender: 'male' as const });
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus the name input immediately when the form opens
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const isFormValid = data.name.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onSubmit(data);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, nextFieldRef?: React.RefObject<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextFieldRef?.current) {
        nextFieldRef.current.focus();
      } else if (isFormValid) {
        handleSubmit(e as any);
      }
    }
  };

  const fatherRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const ageRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center justify-between border-b border-gray-50 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 rounded-2xl">
            <UserPlus className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">ثبت هویت مریض</h2>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormGroup label="نام مکمل مریض (ضروری)" icon={<User className="w-4 h-4" />}>
          <input 
            ref={nameInputRef}
            required 
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm text-right outline-none font-bold" 
            placeholder="مثلاً: احمد فرید" 
            value={data.name} 
            onChange={e => setData({...data, name: e.target.value})}
            onKeyDown={e => handleKeyDown(e, fatherRef)}
          />
        </FormGroup>

        <FormGroup label="نام پدر" icon={<Users className="w-4 h-4" />}>
          <input 
            ref={fatherRef}
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm text-right outline-none" 
            placeholder="نام پدر را وارد کنید..." 
            value={data.fatherName} 
            onChange={e => setData({...data, fatherName: e.target.value})}
            onKeyDown={e => handleKeyDown(e, phoneRef)}
          />
        </FormGroup>

        <FormGroup label="نمبر موبایل" icon={<Phone className="w-4 h-4" />}>
          <input 
            ref={phoneRef}
            type="tel"
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm font-mono text-right outline-none" 
            placeholder="۰۷xxxxxxxx" 
            value={data.phone} 
            onChange={e => setData({...data, phone: e.target.value})}
            onKeyDown={e => handleKeyDown(e, ageRef)}
          />
        </FormGroup>

        <div className="grid grid-cols-2 gap-4">
          <FormGroup label="سن (سال)" icon={<Calendar className="w-4 h-4" />}>
            <input 
              ref={ageRef}
              type="number"
              className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm text-right outline-none font-bold" 
              placeholder="مثلاً: ۲۵"
              value={data.age} 
              onChange={e => setData({...data, age: e.target.value})}
              onKeyDown={e => handleKeyDown(e)}
            />
          </FormGroup>
          
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 pr-2">جنسیت</label>
            <div className="flex bg-gray-50 p-1 rounded-2xl border-2 border-transparent h-[58px]">
              <button 
                type="button"
                onClick={() => setData({...data, gender: 'male'})}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${data.gender === 'male' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}
              >
                مرد
              </button>
              <button 
                type="button"
                onClick={() => setData({...data, gender: 'female'})}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${data.gender === 'female' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}
              >
                زن
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={!isFormValid} 
            className="flex-[2] bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> تأیید و شروع نسخه
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 bg-gray-100 text-gray-500 p-5 rounded-2xl font-bold transition-all hover:bg-gray-200"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
};

const FormGroup: React.FC<{ label: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 pr-2">
      {icon} {label}
    </label>
    {children}
  </div>
);

const PrescriptionForm: React.FC<{
  patient: Patient,
  drugTemplates: DrugTemplate[],
  previousPrescriptions: Prescription[],
  onSubmit: (p: any) => void,
  onCancel: () => void,
  onCopy: (old: Prescription, newId: string) => void
}> = ({ patient, drugTemplates, previousPrescriptions, onSubmit, onCancel, onCopy }) => {
  const [cc, setCc] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [meds, setMeds] = useState<Omit<Medication, 'id'>[]>([]);
  const [records, setRecords] = useState<ClinicalRecords>({ bp: '', hr: '', pr: '', spo2: '', temp: '' });
  const [showDrugList, setShowDrugList] = useState(false);
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [activeDraw, setActiveDraw] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const filteredDrugTemplates = useMemo(() => {
    if (!drugSearchQuery) return drugTemplates;
    const q = drugSearchQuery.toLowerCase();
    return drugTemplates.filter(t => t.name.toLowerCase().includes(q));
  }, [drugTemplates, drugSearchQuery]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const addMed = (t?: DrugTemplate) => {
    setMeds([...meds, {
      name: t?.name || '',
      strength: t?.defaultStrength || '',
      quantity: '',
      instructions: t?.defaultInstructions || ''
    }]);
    setShowDrugList(false);
    setDrugSearchQuery('');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="bg-indigo-900 p-6 rounded-[2rem] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="z-10">
          <div className="font-bold text-xl text-right">{patient.name}</div>
          <div className="text-xs text-indigo-300 font-medium text-right">فرزند {patient.fatherName} | {patient.age} ساله | {patient.code}</div>
        </div>
        {previousPrescriptions.length > 0 && (
          <button onClick={() => onCopy(previousPrescriptions[0], patient.id)} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[10px] flex items-center gap-1.5 font-bold transition-all active:scale-95 z-10"><Copy className="w-3.5 h-3.5" /> نسخه قبلی</button>
        )}
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 pr-1 text-right">Clinical Records</h3>
        <div className="grid grid-cols-5 gap-2">
          <RecordInput label="BP" value={records.bp} placeholder="120/80" onChange={v => setRecords({...records, bp: v})} />
          <RecordInput label="HR" value={records.hr} placeholder="75" onChange={v => setRecords({...records, hr: v})} />
          <RecordInput label="PR" value={records.pr} placeholder="72" onChange={v => setRecords({...records, pr: v})} />
          <RecordInput label="SpO2" value={records.spo2} placeholder="98%" onChange={v => setRecords({...records, spo2: v})} />
          <RecordInput label="Temp" value={records.temp} placeholder="37°C" onChange={v => setRecords({...records, temp: v})} />
        </div>
        <div className="mt-4 border-t border-gray-50 pt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 pr-1 block text-right">CC (Chief Complaint)</label>
          <input 
            className="w-full p-3 bg-gray-50 border-none rounded-xl text-right text-sm focus:ring-2 focus:ring-indigo-400 shadow-inner" 
            placeholder="شکایت اصلی مریض..." 
            value={cc}
            onChange={e => setCc(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 pr-1 block text-right">تشخیص بیماری (Diagnosis)</label>
        <textarea 
          className="w-full p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 min-h-[90px] text-right" 
          placeholder="جزئیات تشخیص..." 
          value={diagnosis} 
          onChange={e => setDiagnosis(e.target.value)} 
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600" /> Rx - لیست دواها</h3>
          <button onClick={() => setShowDrugList(true)} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl hover:bg-indigo-100 transition-all">+ افزودن از لیست</button>
        </div>
        
        <div className="space-y-3">
          {meds.map((m, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative group animate-in slide-in-from-right">
               <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
               <input className="w-full font-bold text-indigo-900 border-none p-0 focus:ring-0 text-lg mb-4 text-right" placeholder="نام دوا (مثلاً پانادول)" value={m.name} onChange={e => { const n = [...meds]; n[i].name = e.target.value; setMeds(n); }} />
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <input className="text-xs bg-gray-50 p-3 rounded-xl border-none focus:ring-1 focus:ring-indigo-300 text-right" placeholder="دوز (500mg)" value={m.strength} onChange={e => { const n = [...meds]; n[i].strength = e.target.value; setMeds(n); }} />
                 <input className="text-xs bg-gray-50 p-3 rounded-xl border-none focus:ring-1 focus:ring-indigo-300 text-right" placeholder="تعداد (10 Tab)" value={m.quantity} onChange={e => { const n = [...meds]; n[i].quantity = e.target.value; setMeds(n); }} />
               </div>
               <textarea className="w-full text-xs bg-gray-50 p-3 rounded-xl border-none focus:ring-1 focus:ring-indigo-300 min-h-[50px] text-right" placeholder="هدایات (طریقه مصرف)" value={m.instructions} onChange={e => { const n = [...meds]; n[i].instructions = e.target.value; setMeds(n); }} />
            </div>
          ))}
          {meds.length === 0 && (
            <button onClick={() => addMed()} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-[2.5rem] text-gray-400 text-sm hover:border-indigo-300 hover:text-indigo-400 transition-all flex flex-col items-center gap-2">
              <PlusCircle className="w-6 h-6" />
              <span>هنوز دوایی اضافه نشده است.</span>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <button onClick={() => setActiveDraw(!activeDraw)} className={`w-full flex items-center justify-center gap-2 font-bold p-4 rounded-2xl transition-all ${activeDraw ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
          <PenTool className="w-4 h-4" /> {activeDraw ? 'تکمیل ترسیم' : 'ترسیم دستی / علامت‌گذاری'}
        </button>
        {activeDraw && (
          <div className="mt-4 bg-white border border-gray-200 rounded-[2rem] overflow-hidden relative shadow-inner" style={{ height: '350px' }}>
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none p-10">
               <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1">
                 <path d="M12 2C7.03 2 3 6.03 3 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM12 18c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
                 <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
               </svg>
            </div>
            <canvas 
              ref={canvasRef}
              width={500}
              height={350}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseOut={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair touch-none relative z-10"
            />
            <button onClick={() => { const c = canvasRef.current; c?.getContext('2d')?.clearRect(0,0,c.width,c.height); }} className="absolute bottom-4 left-4 bg-white border border-gray-100 p-2 rounded-xl text-xs font-bold text-red-500 shadow-md z-20">پاک کردن صفحه</button>
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          onClick={() => {
            const drawing = activeDraw ? canvasRef.current?.toDataURL() : undefined;
            onSubmit({ patientId: patient.id, cc, diagnosis, clinicalRecords: records, medications: meds, drawingData: drawing });
          }}
          disabled={!diagnosis || meds.length === 0}
          className="flex-2 grow bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-2xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          تکمیل و مشاهده نسخه
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-600 p-5 rounded-2xl font-bold">انصراف</button>
      </div>

      {showDrugList && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full rounded-[2.5rem] p-8 max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-xl text-gray-800">انتخاب دوا</span>
              <button onClick={() => { setShowDrugList(false); setDrugSearchQuery(''); }} className="p-2 bg-gray-50 rounded-full text-gray-400"><X className="w-6 h-6" /></button>
            </div>

            <div className="relative group mb-2">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
              <input 
                className="w-full bg-gray-50 border border-gray-100 shadow-sm rounded-2xl py-3 pr-10 pl-4 focus:ring-2 focus:ring-indigo-500 text-sm text-right transition-all"
                placeholder="جستجوی نام دوا..."
                value={drugSearchQuery}
                onChange={e => setDrugSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <button onClick={() => addMed()} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mb-2">
              <PlusCircle className="w-5 h-5" /> دوا با نام جدید
            </button>

            <div className="pt-2 space-y-2 overflow-y-auto pr-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase pr-1 text-right">دواهای ذخیره شده</p>
              {filteredDrugTemplates.map(t => (
                <div key={t.id} onClick={() => addMed(t)} className="p-4 border border-gray-100 rounded-2xl hover:bg-indigo-50 cursor-pointer transition-all active:scale-[0.98] text-right">
                  <div className="font-bold text-gray-800">{t.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{t.defaultStrength} — {t.defaultInstructions}</div>
                </div>
              ))}
              {filteredDrugTemplates.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs">دوایی پیدا نشد.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RecordInput: React.FC<{ label: string, value: string, placeholder?: string, onChange: (v: string) => void }> = ({ label, value, placeholder, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-bold text-gray-300 uppercase text-center">{label}</label>
    <input 
      className="w-full p-2 bg-gray-50 border-none rounded-xl text-center text-xs font-bold focus:ring-2 focus:ring-indigo-400 shadow-inner" 
      value={value} 
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const PrescriptionPrintView: React.FC<{
  settings: ClinicSettings,
  prescription: Prescription,
  patient: Patient,
  onBack: () => void
}> = ({ settings, prescription, patient, onBack }) => {
  const [printSize, setPrintSize] = useState<'small' | 'normal' | 'large'>('normal');

  const handlePrint = () => window.print();
  const handleShare = async () => {
    const text = `Prescription\nPatient: ${patient.name}\nDiagnosis: ${prescription.diagnosis}\nMeds:\n${prescription.medications.map(m => `- ${m.name} (${m.strength}): ${m.instructions}`).join('\n')}`;
    if (navigator.share) {
      await navigator.share({ title: 'Medical Prescription', text });
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const getFontSizeClass = () => {
    if (printSize === 'small') return 'text-[12px]';
    if (printSize === 'large') return 'text-[18px]';
    return 'text-[14px]';
  };

  const getContainerPadding = () => {
    if (printSize === 'small') return 'p-4 print:p-2';
    if (printSize === 'large') return 'p-16 print:p-8';
    return 'p-12 print:p-4';
  };

  return (
    <div className="space-y-6 pb-20 no-print-container">
      <div className="flex flex-col gap-4 no-print bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="font-bold text-gray-700 flex items-center gap-2"><Type className="w-4 h-4" /> تنظیم اندازه چاپ:</span>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setPrintSize('small')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printSize === 'small' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              خرد (A5)
            </button>
            <button 
              onClick={() => setPrintSize('normal')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printSize === 'normal' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              متوسط
            </button>
            <button 
              onClick={() => setPrintSize('large')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${printSize === 'large' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
            >
              کلان (A4)
            </button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex-1 bg-indigo-800 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-900 transition-all"><Printer className="w-5 h-5" /> چاپ نسخه</button>
          <button onClick={handleShare} className="bg-green-600 text-white p-5 rounded-2xl shadow-lg hover:bg-green-700 transition-all"><Share2 className="w-5 h-5" /></button>
          <button onClick={onBack} className="p-5 bg-gray-200 rounded-2xl text-gray-600 hover:bg-gray-300 transition-all"><ChevronRight /></button>
        </div>
      </div>

      <div className={`bg-white border border-gray-200 shadow-2xl flex flex-col relative print:shadow-none print:border-none print:m-0 ${getContainerPadding()} ${getFontSizeClass()} ${printSize === 'small' ? 'min-h-[600px]' : 'min-h-[950px]'}`}>
        <div className="border-b-4 border-indigo-900 pb-4 mb-6 flex justify-between items-center print:pb-2 print:mb-4">
          <div className="text-right">
            <h1 className={`${printSize === 'small' ? 'text-xl' : 'text-2xl'} font-black text-indigo-900 leading-tight`}>{settings.name}</h1>
            <h2 className={`${printSize === 'small' ? 'text-lg' : 'text-xl'} font-bold text-gray-800 mt-1`}>{settings.doctor}</h2>
            <p className="text-sm text-indigo-600 font-bold mt-1">{settings.specialty}</p>
          </div>
          <div className="text-left flex flex-col items-end gap-1.5">
            <div className="bg-indigo-900 text-white px-4 py-1.5 rounded-lg font-black text-[10px] tracking-tighter">MEDICAL PRESCRIPTION</div>
            <p className="text-[10px] text-gray-400 font-mono">Date: {new Date(prescription.date).toLocaleDateString('fa-AF')}</p>
            <p className="text-[10px] text-gray-400 font-mono">Serial: {patient.code}</p>
          </div>
        </div>

        <div className={`grid grid-cols-4 gap-6 bg-gray-50 rounded-[2rem] border border-gray-100 print:rounded-2xl ${printSize === 'small' ? 'p-3 mb-6 gap-2' : 'p-6 mb-10'}`}>
           <InfoItem label="نام مریض (Patient)" value={patient.name} compact={printSize === 'small'} />
           <InfoItem label="سن (Age)" value={patient.age} compact={printSize === 'small'} />
           <InfoItem label="جنسیت (Gender)" value={patient.gender === 'male' ? 'M' : 'F'} compact={printSize === 'small'} />
           <InfoItem label="نمبر تماس (Phone)" value={patient.phone} compact={printSize === 'small'} />
        </div>

        <div className="flex gap-10 flex-1 print:gap-4">
          <div className={`w-28 border-l-2 border-dashed border-gray-100 flex flex-col items-center print:w-20 ${printSize === 'small' ? 'space-y-4 pt-4' : 'space-y-10 pt-10'}`}>
             <SidebarRecord icon={<Heart className="w-4 h-4" />} label="BP" value={prescription.clinicalRecords.bp} compact={printSize === 'small'} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="HR" value={prescription.clinicalRecords.hr} compact={printSize === 'small'} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="PR" value={prescription.clinicalRecords.pr} compact={printSize === 'small'} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="SpO2" value={prescription.clinicalRecords.spo2} compact={printSize === 'small'} />
             <SidebarRecord icon={<Thermometer className="w-4 h-4" />} label="T°" value={prescription.clinicalRecords.temp} compact={printSize === 'small'} />
          </div>

          <div className="flex-1 relative pt-4 print:pt-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
               <svg width="450" height="450" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                 <path d="M12 2C7.03 2 3 6.03 3 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM12 18c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" />
               </svg>
            </div>

            <div className="mb-4 text-right">
              <h3 className="text-[10px] font-black text-gray-300 uppercase mb-1 tracking-widest">CC (Chief Complaint):</h3>
              <p className={`${printSize === 'small' ? 'text-md' : 'text-lg'} font-bold text-gray-800 border-r-4 border-indigo-400 pr-4 leading-tight`}>{prescription.cc || 'N/A'}</p>
            </div>

            <div className="mb-10 text-right print:mb-6">
              <h3 className="text-[10px] font-black text-gray-300 uppercase mb-2 tracking-widest">Diagnosis:</h3>
              <p className={`${printSize === 'small' ? 'text-lg' : 'text-xl'} font-black text-gray-800 border-r-4 border-indigo-600 pr-4 leading-relaxed`}>{prescription.diagnosis}</p>
            </div>

            <div className={`${printSize === 'small' ? 'text-4xl' : 'text-6xl'} font-serif text-indigo-900 italic opacity-20 mb-8 select-none text-right print:mb-4`}>Rx</div>
            
            <div className={`${printSize === 'small' ? 'space-y-4' : 'space-y-8'}`}>
              {prescription.medications.map((m, idx) => (
                <div key={idx} className="flex gap-5 flex-row-reverse">
                  <span className="text-gray-300 font-black text-lg">{idx + 1}.</span>
                  <div className="flex-1 text-right">
                    <div className="flex flex-row-reverse justify-between items-baseline border-b-2 border-gray-50 pb-2">
                       <span className={`${printSize === 'small' ? 'text-md' : 'text-xl'} font-black text-gray-900`}>{m.name}</span>
                       <span className="text-sm font-black text-indigo-700">{m.strength}</span>
                    </div>
                    <div className="flex flex-row-reverse justify-between mt-2">
                       <p className="text-sm text-gray-600 font-medium">{m.instructions}</p>
                       <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded">Qty: {m.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {prescription.drawingData && (
              <div className={`${printSize === 'small' ? 'mt-6' : 'mt-16'} bg-gray-50/50 rounded-3xl p-4 border border-gray-100 border-dashed print:mt-10`}>
                <p className="text-[8px] text-gray-300 uppercase mb-2 text-right">Clinical Sketch</p>
                <img src={prescription.drawingData} className="max-w-full h-auto rounded-xl opacity-90 mx-auto" alt="Clinic Note" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto pt-10 border-t-2 border-gray-100 flex justify-between items-end print:pt-6">
          <div className="text-[10px] text-gray-400 max-w-[300px] space-y-1.5 text-right">
             <p className="font-black text-gray-600 uppercase tracking-tighter">آدرس کلینیک و تماس</p>
             <p className="font-bold text-gray-500 leading-tight">{settings.address}</p>
             <p className="font-mono">P: {settings.phone}</p>
             <p className="italic text-[9px] text-indigo-400 mt-2">لطفاً در مراجعه بعدی این نسخه را همراه داشته باشید.</p>
          </div>
          <div className="text-center pb-2">
            <div className="w-36 h-0.5 bg-gray-200 mb-2"></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Doctor's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string, compact?: boolean }> = ({ label, value, compact }) => (
  <div className="text-right">
    <span className={`${compact ? 'text-[8px]' : 'text-[9px]'} text-gray-300 font-bold block mb-1 uppercase`}>{label}</span>
    <span className={`${compact ? 'text-xs' : 'text-sm'} font-bold text-gray-800 block truncate`}>{value || '-'}</span>
  </div>
);

const SidebarRecord: React.FC<{ icon: React.ReactNode, label: string, value: string, compact?: boolean }> = ({ icon, label, value, compact }) => (
  <div className={`flex flex-col items-center text-center ${compact ? 'gap-0.5' : 'gap-1'}`}>
    <div className="text-indigo-300 mb-1">{icon}</div>
    <span className={`${compact ? 'text-[7px]' : 'text-[9px]'} font-bold text-gray-300 uppercase tracking-tighter`}>{label}</span>
    <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-black text-gray-900 mt-0.5`}>{value || '--'}</span>
  </div>
);

const DrugSettings: React.FC<{ drugTemplates: DrugTemplate[], setDrugTemplates: React.Dispatch<React.SetStateAction<DrugTemplate[]>> }> = ({ drugTemplates, setDrugTemplates }) => {
  const [newDrug, setNewDrug] = useState({ name: '', strength: '', instructions: '' });
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
        <h3 className="font-bold text-gray-800 pr-1 text-right">افزودن دوای جدید به بانک</h3>
        <div className="space-y-4">
          <input className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner text-sm text-right" placeholder="نام دوا" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner text-sm text-right" placeholder="دوز" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
            <input className="w-full p-4 bg-gray-50 rounded-2xl border-none shadow-inner text-sm text-right" placeholder="هدایات" value={newDrug.instructions} onChange={e => setNewDrug({...newDrug, instructions: e.target.value})} />
          </div>
          <button onClick={() => { if(newDrug.name) { setDrugTemplates(prev => [{id: Math.random().toString(), ...newDrug, defaultStrength: newDrug.strength, defaultInstructions: newDrug.instructions}, ...prev]); setNewDrug({name:'', strength:'', instructions:''}); } }} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-100">ذخیره در بانک دوا</button>
        </div>
      </div>
      <div className="space-y-3">
        {drugTemplates.map(t => (
          <div key={t.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm flex-row-reverse">
            <div className="text-right">
              <div className="font-bold text-gray-800">{t.name}</div>
              <div className="text-xs text-gray-400 mt-1">{t.defaultStrength} — {t.defaultInstructions}</div>
            </div>
            <button onClick={() => setDrugTemplates(prev => prev.filter(x => x.id !== t.id))} className="text-red-200 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClinicSettingsForm: React.FC<{ settings: ClinicSettings, onSave: (s: ClinicSettings) => void, onBack: () => void }> = ({ settings, onSave, onBack }) => {
  const [data, setData] = useState(settings);
  return (
    <div className="space-y-6 animate-in slide-in-from-right">
      <div className="flex flex-row-reverse items-center gap-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold text-gray-800 text-right">تنظیمات کلینیک</h2>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
        <FormGroup label="نام کلینیک / شفاخانه">
          <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
        </FormGroup>
        <FormGroup label="نام داکتر معالج">
          <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.doctor} onChange={e => setData({...data, doctor: e.target.value})} />
        </FormGroup>
        <FormGroup label="تخصص و مهارت">
          <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.specialty} onChange={e => setData({...data, specialty: e.target.value})} />
        </FormGroup>
        <FormGroup label="آدرس دقیق">
          <textarea className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
        </FormGroup>
        <FormGroup label="نمبر تماس">
          <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
        </FormGroup>
        <FormGroup label="شعار کلینیک (Tagline)">
          <input className="w-full p-4 rounded-2xl bg-gray-50 border-none shadow-inner text-sm text-right" value={data.tagline} onChange={e => setData({...data, tagline: e.target.value})} />
        </FormGroup>
        <button onClick={() => { onSave(data); onBack(); }} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
          <Save className="w-5 h-5" /> ذخیره تنظیمات
        </button>
      </div>
    </div>
  );
};

export default App;
