
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
  Type,
  User,
  Phone,
  Calendar,
  Check,
  ChevronDown,
  Pill,
  Bookmark,
  BriefcaseMedical,
  Languages,
  FileBox,
  Maximize2
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings, DiagnosisTemplate } from './types';
import { INITIAL_DRUGS, DEFAULT_CLINIC_SETTINGS, ICD_DIAGNOSES } from './constants';

// --- IndexedDB Helper for Unlimited Storage ---
const DB_NAME = 'AsanNoskhaDB';
const DB_VERSION = 2; // Updated version for new schema
const DRUG_STORE = 'drugs';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (db.objectStoreNames.contains(DRUG_STORE)) {
        db.deleteObjectStore(DRUG_STORE);
      }
      const store = db.createObjectStore(DRUG_STORE, { keyPath: 'id' });
      store.createIndex('name', 'name', { unique: false });
      store.createIndex('brandNames', 'brandNames', { unique: false });
      store.createIndex('category', 'category', { unique: false });
      store.createIndex('barcode', 'barcode', { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const COMMON_CC = [
  { cat: 'General', items: ['Fever', 'Headache', 'Body Ache', 'General Weakness', 'Anorexia', 'Weight Loss'] },
  { cat: 'Respiratory', items: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Flu / Nasal Discharge', 'Chest Tightness'] },
  { cat: 'Gastrointestinal', items: ['Abdominal Pain', 'Diarrhea', 'Constipation', 'Nausea', 'Vomiting', 'Heartburn'] },
  { cat: 'Cardiovascular', items: ['Chest Pain', 'Palpitations', 'Hypertension', 'Hypotension', 'Edema'] },
  { cat: 'Neurological', items: ['Dizziness', 'Numbness', 'Seizures', 'Anxiety', 'Insomnia', 'Tremor'] }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [view, setView] = useState<ViewState>('HOME');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // DB Instance for drug templates
  const [db, setDb] = useState<IDBDatabase | null>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      const savedPatients = localStorage.getItem('patients');
      const savedPrescriptions = localStorage.getItem('prescriptions');
      const savedSettings = localStorage.getItem('clinicSettings');
      const savedLogin = sessionStorage.getItem('isLoggedIn');

      if (savedPatients) setPatients(JSON.parse(savedPatients));
      if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
      if (savedSettings) setClinicSettings(JSON.parse(savedSettings));
      if (savedLogin === 'true') setIsLoggedIn(true);

      // Initialize IndexedDB
      try {
        const database = await initDB();
        setDb(database);
        
        // Seed DB if empty
        const countRequest = database.transaction(DRUG_STORE).objectStore(DRUG_STORE).count();
        countRequest.onsuccess = () => {
          if (countRequest.result === 0) {
            const tx = database.transaction(DRUG_STORE, 'readwrite');
            const store = tx.objectStore(DRUG_STORE);
            INITIAL_DRUGS.forEach(d => store.add(d));
          }
        };
      } catch (err) {
        console.error("DB Init failed", err);
      }
    };
    loadData();
  }, []);

  // Auto-save (other than drugs which are saved directly to DB)
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
  }, [patients, prescriptions, clinicSettings]);

  const handleLogin = () => {
    if (pin === '0796606605') {
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      setPin('');
    } else {
      alert('رمز اشتباه است! (رمز پیش‌فرض: ۰۷۹۶۶۰۶۶۰۵)');
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

  const currentSelectedPatient = useMemo(() => 
    patients.find(p => p.id === selectedPatientId), 
  [patients, selectedPatientId]);

  const handleAddPatient = (p: Omit<Patient, 'id' | 'code' | 'createdAt'>) => {
    const newId = Math.random().toString(36).substr(2, 9);
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
            className="w-full p-4 rounded-2xl bg-gray-50 border-none text-center text-2xl tracking-[0.2em] focus:ring-2 focus:ring-indigo-500 shadow-inner"
            placeholder="********"
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
          <p className="text-[10px] text-gray-300">رمز پیش‌فرض: ۰۷۹۶۶۰۶۶۰۵</p>
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

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && db && (
          <PrescriptionForm 
            db={db}
            patient={currentSelectedPatient || patients.find(p => p.id === selectedPatientId) || patients[0]}
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

        {view === 'DRUGS' && db && <DrugSettings db={db} />}
        
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
    if (nameInputRef.current) nameInputRef.current.focus();
  }, []);

  const isFormValid = data.name.trim().length >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) onSubmit(data);
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
          <h2 className="text-xl font-bold text-gray-800 text-right">ثبت هویت مریض</h2>
        </div>
        <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"><X className="w-5 h-5" /></button>
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
          />
        </FormGroup>

        <FormGroup label="نام پدر" icon={<Users className="w-4 h-4" />}>
          <input 
            ref={fatherRef}
            className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all text-sm text-right outline-none" 
            placeholder="نام پدر را وارد کنید..." 
            value={data.fatherName} 
            onChange={e => setData({...data, fatherName: e.target.value})}
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
            />
          </FormGroup>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 pr-2 text-right">جنسیت</label>
            <div className="flex bg-gray-50 p-1 rounded-2xl border-2 border-transparent h-[58px]">
              <button type="button" onClick={() => setData({...data, gender: 'male'})} className={`flex-1 flex items-center justify-center rounded-xl text-xs font-bold ${data.gender === 'male' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-400'}`}>مرد</button>
              <button type="button" onClick={() => setData({...data, gender: 'female'})} className={`flex-1 flex items-center justify-center rounded-xl text-xs font-bold ${data.gender === 'female' ? 'bg-white text-pink-600 shadow-sm' : 'text-gray-400'}`}>زن</button>
            </div>
          </div>
        </div>

        <button type="submit" disabled={!isFormValid} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
          <Check className="w-5 h-5" /> تأیید و شروع نسخه
        </button>
      </form>
    </div>
  );
};

const FormGroup: React.FC<{ label: string, icon?: React.ReactNode, children: React.ReactNode }> = ({ label, icon, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center flex-row-reverse gap-2 text-xs font-bold text-gray-400 pr-2">
      {icon} {label}
    </label>
    {children}
  </div>
);

const PrescriptionForm: React.FC<{
  db: IDBDatabase,
  patient: Patient,
  previousPrescriptions: Prescription[],
  onSubmit: (p: any) => void,
  onCancel: () => void,
  onCopy: (old: Prescription, newId: string) => void
}> = ({ db, patient, previousPrescriptions, onSubmit, onCancel, onCopy }) => {
  const [cc, setCc] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [diagSearch, setDiagSearch] = useState('');
  const [showDiagList, setShowDiagList] = useState(false);
  const [meds, setMeds] = useState<Omit<Medication, 'id'>[]>([]);
  const [records, setRecords] = useState<ClinicalRecords>({ bp: '', hr: '', pr: '', spo2: '', temp: '' });
  const [showDrugList, setShowDrugList] = useState(false);
  const [showCcList, setShowCcList] = useState(false);
  const [ccSearch, setCcSearch] = useState('');

  const filteredDiagnoses = useMemo(() => {
    if (!diagSearch) return ICD_DIAGNOSES.slice(0, 50);
    const q = diagSearch.toLowerCase();
    return ICD_DIAGNOSES.filter(d => 
      d.title.toLowerCase().includes(q) || 
      d.code.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    ).slice(0, 50);
  }, [diagSearch]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      <div className="bg-indigo-900 p-6 rounded-[2rem] text-white shadow-xl flex justify-between items-center relative overflow-hidden">
        <div className="z-10">
          <div className="font-bold text-xl text-right">{patient.name}</div>
          <div className="text-xs text-indigo-300 font-medium text-right">{patient.age} ساله | {patient.code}</div>
        </div>
        {previousPrescriptions.length > 0 && (
          <button onClick={() => onCopy(previousPrescriptions[0], patient.id)} className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl text-[10px] flex items-center gap-1.5 font-bold z-10"><Copy className="w-3.5 h-3.5" /> نسخه قبلی</button>
        )}
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setShowCcList(!showCcList)} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl flex items-center gap-1">
            <ChevronDown className={`w-3 h-3 transition-transform ${showCcList ? 'rotate-180' : ''}`} /> انتخاب سریع CC
          </button>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Chief Complaint</h3>
        </div>

        {showCcList && (
          <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="relative">
               <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
               <input 
                 className="w-full bg-gray-50 p-2 pr-9 rounded-xl text-xs text-right outline-none focus:ring-1 focus:ring-indigo-300 transition-all" 
                 placeholder="Search Complaint (English)..." 
                 value={ccSearch}
                 onChange={e => setCcSearch(e.target.value)}
               />
            </div>
            <div className="max-h-[200px] overflow-y-auto pr-1 space-y-4">
              {COMMON_CC.map(cat => (
                <div key={cat.cat} className="space-y-2">
                  <div className="text-[8px] font-black text-gray-300 uppercase text-right border-b border-gray-50 pb-1">{cat.cat}</div>
                  <div className="flex flex-wrap flex-row-reverse gap-1.5">
                    {cat.items.filter(i => i.toLowerCase().includes(ccSearch.toLowerCase())).map(item => (
                      <button 
                        key={item} 
                        onClick={() => { setCc(prev => prev ? `${prev}, ${item}` : item); setShowCcList(false); }}
                        className="text-[10px] font-bold bg-white border border-gray-100 px-3 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <input 
          className="w-full p-4 bg-gray-50 border-none rounded-2xl text-right text-sm focus:ring-2 focus:ring-indigo-400 shadow-inner font-bold text-indigo-900" 
          placeholder="Chief Complaint (e.g. Fever, Cough...)" 
          value={cc}
          onChange={e => setCc(e.target.value)}
        />
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-right">Clinical Records</h3>
        <div className="grid grid-cols-5 gap-2">
          <RecordInput label="BP" value={records.bp} placeholder="120/80" onChange={v => setRecords({...records, bp: v})} />
          <RecordInput label="HR" value={records.hr} placeholder="75" onChange={v => setRecords({...records, hr: v})} />
          <RecordInput label="PR" value={records.pr} placeholder="72" onChange={v => setRecords({...records, pr: v})} />
          <RecordInput label="SpO2" value={records.spo2} placeholder="98%" onChange={v => setRecords({...records, spo2: v})} />
          <RecordInput label="Temp" value={records.temp} placeholder="37°C" onChange={v => setRecords({...records, temp: v})} />
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative z-20">
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg">
             <BriefcaseMedical className="w-3.5 h-3.5" />
             <span className="text-[10px] font-bold">Standard ICD-10</span>
           </div>
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Diagnosis</h3>
        </div>

        <div className="relative">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
           <input 
             className="w-full p-4 pr-11 bg-gray-50 border-none rounded-2xl text-right text-sm focus:ring-2 focus:ring-indigo-400 font-bold" 
             placeholder="جستجوی بیماری (نام یا کد ICD)..." 
             value={diagSearch}
             onChange={e => { setDiagSearch(e.target.value); setShowDiagList(true); }}
             onFocus={() => setShowDiagList(true)}
           />

           {showDiagList && (diagSearch.length > 0 || filteredDiagnoses.length > 0) && (
             <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 shadow-2xl rounded-[1.5rem] overflow-hidden max-h-[300px] overflow-y-auto z-30 animate-in fade-in slide-in-from-top-2">
               {filteredDiagnoses.map((d, idx) => (
                 <div 
                   key={idx} 
                   onClick={() => { setDiagnosis(d.title); setDiagSearch(d.title); setShowDiagList(false); }}
                   className="p-4 border-b border-gray-50 hover:bg-indigo-50 cursor-pointer transition-all text-right group"
                 >
                   <div className="flex justify-between items-start flex-row-reverse">
                      <span className="font-bold text-gray-800 group-hover:text-indigo-700">{d.title}</span>
                      <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-400 uppercase">{d.code}</span>
                   </div>
                   <div className="text-[9px] text-gray-300 mt-1">{d.category}</div>
                 </div>
               ))}
               <div className="p-4 bg-gray-50 flex justify-between items-center">
                  <button onClick={() => { setDiagnosis(diagSearch); setShowDiagList(false); }} className="text-[10px] font-bold text-indigo-600">استفاده از متن فعلی</button>
                  <button onClick={() => setShowDiagList(false)} className="text-[10px] font-bold text-red-400">بستن</button>
               </div>
             </div>
           )}
        </div>
        
        {diagnosis && !showDiagList && (
          <div className="mt-3 bg-indigo-900 text-white p-4 rounded-xl flex justify-between items-center animate-in zoom-in duration-300">
             <button onClick={() => { setDiagnosis(''); setDiagSearch(''); }} className="hover:text-red-400"><X className="w-4 h-4" /></button>
             <div className="text-right font-black text-sm">{diagnosis}</div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600" /> Rx - لیست دواها</h3>
          <button onClick={() => setShowDrugList(true)} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-xl flex items-center gap-1"><Pill className="w-3.5 h-3.5" /> بانک دواها</button>
        </div>
        
        <div className="space-y-3">
          {meds.map((m, i) => (
            <div key={i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative animate-in slide-in-from-right">
               <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="absolute top-4 left-4 text-gray-300 hover:text-red-500"><X className="w-4 h-4" /></button>
               <input className="w-full font-bold text-indigo-900 border-none p-0 focus:ring-0 text-lg mb-4 text-right" placeholder="نام دوا" value={m.name} onChange={e => { const n = [...meds]; n[i].name = e.target.value; setMeds(n); }} />
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <input className="text-xs bg-gray-50 p-3 rounded-xl text-right" placeholder="دوز" value={m.strength} onChange={e => { const n = [...meds]; n[i].strength = e.target.value; setMeds(n); }} />
                 <input className="text-xs bg-gray-50 p-3 rounded-xl text-right" placeholder="تعداد" value={m.quantity} onChange={e => { const n = [...meds]; n[i].quantity = e.target.value; setMeds(n); }} />
               </div>
               <textarea className="w-full text-xs bg-gray-50 p-3 rounded-xl min-h-[50px] text-right" placeholder="هدایات مصرف" value={m.instructions} onChange={e => { const n = [...meds]; n[i].instructions = e.target.value; setMeds(n); }} />
            </div>
          ))}
          {meds.length === 0 && (
             <button onClick={() => setShowDrugList(true)} className="w-full py-10 border-2 border-dashed border-gray-100 rounded-[2rem] text-gray-400 text-sm hover:border-indigo-300 transition-all flex flex-col items-center gap-2">
               <PlusCircle className="w-6 h-6" />
               <span>هنوز دوایی اضافه نشده است. کلیک کنید.</span>
             </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          onClick={() => {
            onSubmit({ patientId: patient.id, cc, diagnosis, clinicalRecords: records, medications: meds });
          }}
          disabled={!diagnosis || meds.length === 0}
          className="flex-2 grow bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-2xl shadow-indigo-100 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          تکمیل و مشاهده نسخه
        </button>
        <button onClick={onCancel} className="flex-1 bg-gray-200 text-gray-600 p-5 rounded-2xl font-bold">انصراف</button>
      </div>

      {showDrugList && (
        <DrugModal db={db} onAdd={(t) => {
          setMeds([...meds, { 
            id: Math.random().toString(),
            name: t ? `${t.name}${t.brandNames ? ` (${t.brandNames.split(',')[0]})` : ''}` : '', 
            strength: t?.defaultStrength || '', 
            quantity: '', 
            instructions: t?.defaultInstructions || '' 
          }]);
          setShowDrugList(false);
        }} onClose={() => setShowDrugList(false)} />
      )}
    </div>
  );
};

const DrugModal: React.FC<{ db: IDBDatabase, onAdd: (t?: DrugTemplate) => void, onClose: () => void }> = ({ db, onAdd, onClose }) => {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<DrugTemplate[]>([]);

  useEffect(() => {
    const searchInDB = async () => {
      const tx = db.transaction(DRUG_STORE, 'readonly');
      const store = tx.objectStore(DRUG_STORE);
      const query = q.toLowerCase();
      
      const found: DrugTemplate[] = [];
      const cursorRequest = store.openCursor();
      
      cursorRequest.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && found.length < 50) {
          const val = cursor.value as DrugTemplate;
          if (
            val.name.toLowerCase().includes(query) || 
            val.brandNames?.toLowerCase().includes(query) ||
            val.category?.toLowerCase().includes(query) ||
            val.barcode?.toLowerCase().includes(query) ||
            val.company?.toLowerCase().includes(query)
          ) {
            found.push(val);
          }
          cursor.continue();
        } else {
          setResults(found);
        }
      };
    };
    
    const timeout = setTimeout(searchInDB, 150);
    return () => clearTimeout(timeout);
  }, [q, db]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><Pill className="w-6 h-6" /></div>
             <span className="font-bold text-xl text-gray-800">بانک هوشمند دوا</span>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 rounded-full text-gray-400"><X className="w-6 h-6" /></button>
        </div>

        <div className="relative mb-4">
           <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
           <input 
             className="w-full bg-gray-50 p-4 pr-12 rounded-2xl text-right outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-all" 
             placeholder="جستجو در بین میلیون‌ها دوا..." 
             value={q} 
             onChange={e => setQ(e.target.value)}
             autoFocus
           />
        </div>

        <button onClick={() => onAdd()} className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 mb-4">
          <PlusCircle className="w-5 h-5" /> دوای جدید (Manual)
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {results.map(t => (
            <div key={t.id} onClick={() => onAdd(t)} className="p-5 border border-gray-100 rounded-[1.5rem] hover:bg-indigo-50 cursor-pointer transition-all active:scale-[0.98] flex flex-col gap-2 text-right group">
              <div className="flex justify-between items-start flex-row-reverse">
                 <div className="font-black text-gray-900 group-hover:text-indigo-700 text-lg">{t.name}</div>
                 <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full uppercase tracking-tighter">{t.category}</span>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs text-gray-400 font-medium">
                 {t.brandNames && <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded italic">Brands: {t.brandNames}</div>}
                 <div className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-500">{t.form}</div>
                 {t.company && <div className="text-[9px] text-indigo-400 font-bold">Mfg: {t.company}</div>}
              </div>
            </div>
          ))}
          {results.length === 0 && (
             <div className="text-center py-10 text-gray-400 italic">موردی یافت نشد.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const RecordInput: React.FC<{ label: string, value: string, placeholder?: string, onChange: (v: string) => void }> = ({ label, value, placeholder, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[9px] font-bold text-gray-300 uppercase text-center">{label}</label>
    <input className="w-full p-2 bg-gray-50 border-none rounded-xl text-center text-xs font-bold focus:ring-2 focus:ring-indigo-400" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
  </div>
);

type Language = 'en' | 'dr' | 'ps';
type PaperSize = 'A4' | 'A5' | 'Custom';

const TRANSLATIONS: Record<Language, any> = {
  en: {
    dir: 'ltr',
    header: 'PRESCRIPTION',
    date: 'Date',
    code: 'Code',
    name: 'Patient Name',
    age: 'Age',
    gender: 'Gender',
    phone: 'Phone',
    cc: 'Chief Complaint (CC)',
    diagnosis: 'Diagnosis',
    qty: 'Qty',
    address: 'Address & Contact',
    signature: "Doctor's Signature",
    male: 'Male',
    female: 'Female'
  },
  dr: {
    dir: 'rtl',
    header: 'نسخه طبی',
    date: 'تاریخ',
    code: 'کد',
    name: 'نام مریض',
    age: 'سن',
    gender: 'جنسیت',
    phone: 'موبایل',
    cc: 'شکایه اصلی (CC)',
    diagnosis: 'تشخیص',
    qty: 'تعداد',
    address: 'آدرس و تماس',
    signature: 'امضای داکتر',
    male: 'مرد',
    female: 'زن'
  },
  ps: {
    dir: 'rtl',
    header: 'نسخه',
    date: 'نیټه',
    code: 'کوډ',
    name: 'د ناروغ نوم',
    age: 'عمر',
    gender: 'جنسیت',
    phone: 'تلیفون',
    cc: 'اصلي شکایت (CC)',
    diagnosis: 'تشخیص',
    qty: 'شمیر',
    address: 'پته او اړیکه',
    signature: 'د ډاکټر لاسلیک',
    male: 'نارینه',
    female: 'ښځینه'
  }
};

const PrescriptionPrintView: React.FC<{
  settings: ClinicSettings,
  prescription: Prescription,
  patient: Patient,
  onBack: () => void
}> = ({ settings, prescription, patient, onBack }) => {
  const [fontSize, setFontSize] = useState(14);
  const [lang, setLang] = useState<Language>('dr');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const t = TRANSLATIONS[lang];

  return (
    <div className="space-y-6 pb-20 no-print-container">
      <div className="flex flex-col gap-4 no-print bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center flex-row-reverse">
          <span className="font-bold text-gray-700 flex items-center gap-2 flex-row-reverse"><Type className="w-4 h-4" /> اندازه قلم: {fontSize}px</span>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="10" 
              max="40" 
              step="1"
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex items-center gap-1 bg-gray-50 border rounded-xl px-2 py-1">
              <span className="text-[10px] text-gray-400">اندازه دلخواه:</span>
              <input 
                type="number" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value) || 10)}
                className="w-12 bg-transparent text-center text-xs font-bold outline-none"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center flex-row-reverse">
          <span className="font-bold text-gray-700 flex items-center gap-2 flex-row-reverse"><Languages className="w-4 h-4" /> انتخاب زبان نسخه:</span>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['en', 'dr', 'ps'] as Language[]).map(l => (
              <button 
                key={l} 
                onClick={() => setLang(l)} 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                {l === 'en' ? 'English' : l === 'dr' ? 'دری' : 'پښتو'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center flex-row-reverse">
            <span className="font-bold text-gray-700 flex items-center gap-2 flex-row-reverse"><FileBox className="w-4 h-4" /> اندازه کاغذ:</span>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {(['A4', 'A5', 'Custom'] as PaperSize[]).map(size => (
                <button 
                  key={size} 
                  onClick={() => setPaperSize(size)} 
                  className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${paperSize === size ? 'bg-indigo-800 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  {size === 'Custom' ? 'اندازه دلخواه' : size}
                </button>
              ))}
            </div>
          </div>
          
          {paperSize === 'Custom' && (
            <div className="bg-gray-50 p-4 rounded-2xl flex flex-row-reverse items-center justify-between gap-4 border border-indigo-100 animate-in slide-in-from-top-2">
              <span className="text-[10px] font-bold text-indigo-700 flex items-center gap-1 flex-row-reverse"><Maximize2 className="w-3 h-3" /> تنظیم ابعاد کاغذ:</span>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <label className="text-[9px] text-gray-400 font-bold">عرض (mm)</label>
                  <input 
                    type="number" 
                    value={customWidth} 
                    onChange={e => setCustomWidth(parseInt(e.target.value) || 0)}
                    className="w-16 p-2 bg-white border border-gray-200 rounded-lg text-center text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
                <X className="w-3 h-3 text-gray-300 mt-4" />
                <div className="flex flex-col items-center gap-1">
                  <label className="text-[9px] text-gray-400 font-bold">ارتفاع (mm)</label>
                  <input 
                    type="number" 
                    value={customHeight} 
                    onChange={e => setCustomHeight(parseInt(e.target.value) || 0)}
                    className="w-16 p-2 bg-white border border-gray-200 rounded-lg text-center text-xs font-bold focus:ring-1 focus:ring-indigo-500 outline-none" 
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          <button onClick={() => window.print()} className="flex-1 bg-indigo-800 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"><Printer className="w-5 h-5" /> چاپ نسخه</button>
          <button onClick={onBack} className="p-5 bg-gray-200 rounded-2xl text-gray-600 hover:bg-gray-300 transition-all"><ChevronRight /></button>
        </div>
      </div>

      <div 
        dir={t.dir}
        style={{ 
          fontSize: `${fontSize}px`,
          width: paperSize === 'A4' ? '210mm' : paperSize === 'A5' ? '148mm' : `${customWidth}mm`,
          minHeight: paperSize === 'A4' ? '297mm' : paperSize === 'A5' ? '210mm' : `${customHeight}mm`,
          margin: '0 auto'
        }}
        className="bg-white border border-gray-200 shadow-2xl flex flex-col relative print:shadow-none print:border-none p-12 print:p-4"
      >
        <div className={`border-b-4 border-indigo-900 pb-4 mb-6 flex justify-between items-center ${t.dir === 'rtl' ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className={t.dir === 'rtl' ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-black text-indigo-900 leading-tight">{settings.name}</h1>
            <h2 className="text-xl font-bold text-gray-800 mt-1">{settings.doctor}</h2>
            <p className="text-sm text-indigo-600 font-bold mt-1">{settings.specialty}</p>
          </div>
          <div className={t.dir === 'rtl' ? 'text-left' : 'text-right'}>
            <div className="bg-indigo-900 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest">{t.header}</div>
            <p className="text-[10px] text-gray-400 mt-2">{t.date}: {new Date(prescription.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fa-AF')}</p>
            <p className="text-[10px] text-gray-400">{t.code}: {patient.code}</p>
          </div>
        </div>

        <div className={`grid grid-cols-4 gap-6 bg-gray-50 p-6 rounded-2xl mb-10 ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
           <InfoItem label={t.name} value={patient.name} />
           <InfoItem label={t.age} value={patient.age} />
           <InfoItem label={t.gender} value={patient.gender === 'male' ? t.male : t.female} />
           <InfoItem label={t.phone} value={patient.phone} />
        </div>

        <div className={`flex gap-10 flex-1 ${t.dir === 'ltr' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`w-24 border-dashed border-gray-100 flex flex-col items-center space-y-8 pt-6 ${t.dir === 'rtl' ? 'border-l-2' : 'border-r-2'}`}>
             <SidebarRecord icon={<Heart className="w-4 h-4" />} label="BP" value={prescription.clinicalRecords.bp} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="HR" value={prescription.clinicalRecords.hr} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="PR" value={prescription.clinicalRecords.pr} />
             <SidebarRecord icon={<Activity className="w-4 h-4" />} label="SpO2" value={prescription.clinicalRecords.spo2} />
             <SidebarRecord icon={<Thermometer className="w-4 h-4" />} label="T°" value={prescription.clinicalRecords.temp} />
          </div>

          <div className={`flex-1 pt-4 ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div className="mb-6">
              <h3 className="text-[10px] font-black text-gray-300 uppercase mb-1 tracking-widest">{t.cc}:</h3>
              <p className={`text-lg font-bold text-gray-800 border-indigo-400 ${t.dir === 'rtl' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>{prescription.cc || 'N/A'}</p>
            </div>
            <div className="mb-10">
              <h3 className="text-[10px] font-black text-gray-300 uppercase mb-2 tracking-widest">{t.diagnosis}:</h3>
              <p className={`text-xl font-black text-gray-800 border-indigo-600 ${t.dir === 'rtl' ? 'border-r-4 pr-4' : 'border-l-4 pl-4'}`}>{prescription.diagnosis}</p>
            </div>
            <div className="text-6xl font-serif text-indigo-900 italic opacity-20 mb-8 select-none">Rx</div>
            <div className="space-y-6">
              {prescription.medications.map((m, idx) => (
                <div key={idx} className={`flex gap-4 border-b-2 border-gray-50 pb-4 ${t.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="text-gray-300 font-black">{idx + 1}.</span>
                  <div className="flex-1">
                    <div className={`flex justify-between items-baseline ${t.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <span className="text-xl font-black text-gray-900">{m.name}</span>
                       <span className="text-sm font-black text-indigo-700">{m.strength}</span>
                    </div>
                    <div className={`flex justify-between mt-2 ${t.dir === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                       <p className="text-sm text-gray-600 font-medium">{m.instructions}</p>
                       <span className="text-[10px] text-gray-400 uppercase">{t.qty}: {m.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`mt-auto pt-10 border-t-2 border-gray-100 flex justify-between items-end ${t.dir === 'ltr' ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`text-[10px] text-gray-400 max-w-[300px] ${t.dir === 'rtl' ? 'text-right' : 'text-left'}`}>
             <p className="font-black text-gray-600 uppercase">{t.address}</p>
             <p className="font-bold">{settings.address}</p>
             <p>{t.phone}: {settings.phone}</p>
          </div>
          <div className="text-center pb-2">
            <div className="w-32 h-0.5 bg-gray-200 mb-2"></div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.signature}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <span className="text-[9px] text-gray-300 font-bold block mb-1 uppercase tracking-tighter">{label}</span>
    <span className="text-sm font-bold text-gray-800 block">{value || '-'}</span>
  </div>
);

const SidebarRecord: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex flex-col items-center">
    <div className="text-indigo-300 mb-1">{icon}</div>
    <span className="text-[8px] font-bold text-gray-300 uppercase tracking-tighter">{label}</span>
    <span className="text-xs font-black text-gray-900 mt-0.5">{value || '--'}</span>
  </div>
);

const DrugSettings: React.FC<{ db: IDBDatabase }> = ({ db }) => {
  const [newDrug, setNewDrug] = useState({ name: '', brandNames: '', form: 'Tablet', strength: '', instructions: '', category: 'General', company: '', barcode: '' });
  const [bankSearch, setBankSearch] = useState('');
  const [drugs, setDrugs] = useState<DrugTemplate[]>([]);

  const fetchDrugs = async (query = '') => {
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const q = query.toLowerCase();
    
    const found: DrugTemplate[] = [];
    const cursorRequest = store.openCursor();
    
    cursorRequest.onsuccess = (e) => {
      const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor && found.length < 50) {
        const val = cursor.value as DrugTemplate;
        if (!q || 
            val.name.toLowerCase().includes(q) || 
            val.brandNames?.toLowerCase().includes(q) ||
            val.barcode?.toLowerCase().includes(q)
        ) {
          found.push(val);
        }
        cursor.continue();
      } else {
        setDrugs(found);
      }
    };
  };

  useEffect(() => {
    fetchDrugs(bankSearch);
  }, [bankSearch, db]);

  const handleAdd = () => {
    if (!newDrug.name) return;
    const drugToAdd = {
      id: Math.random().toString(36).substr(2, 9),
      ...newDrug,
      defaultStrength: newDrug.strength,
      defaultInstructions: newDrug.instructions
    };
    
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).add(drugToAdd);
    tx.oncomplete = () => {
      setNewDrug({ name: '', brandNames: '', form: 'Tablet', strength: '', instructions: '', category: 'General', company: '', barcode: '' });
      fetchDrugs(bankSearch);
    };
  };

  const handleDelete = (id: string) => {
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).delete(id);
    tx.oncomplete = () => fetchDrugs(bankSearch);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-5">
        <h3 className="font-bold text-gray-800 text-right flex items-center justify-end gap-2"><Bookmark className="w-5 h-5 text-indigo-600" /> افزودن به بانک دایمی</h3>
        <div className="space-y-4">
          <input className="w-full p-4 bg-gray-50 rounded-2xl text-right font-bold outline-none focus:ring-1 focus:ring-indigo-300" placeholder="نام ژنریک (ضروری)" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
          <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none focus:ring-1 focus:ring-indigo-300" placeholder="نام‌های تجارتی (برند)" value={newDrug.brandNames} onChange={e => setNewDrug({...newDrug, brandNames: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
             <select className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" value={newDrug.form} onChange={e => setNewDrug({...newDrug, form: e.target.value})}>
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
                <option value="Drop">Drop</option>
             </select>
             <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" placeholder="کمپانی تولیدکننده" value={newDrug.company} onChange={e => setNewDrug({...newDrug, company: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
             <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" placeholder="بارکد / کد دوا" value={newDrug.barcode} onChange={e => setNewDrug({...newDrug, barcode: e.target.value})} />
             <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" placeholder="دسته طبی" value={newDrug.category} onChange={e => setNewDrug({...newDrug, category: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" placeholder="دوز پیش‌فرض" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
            <input className="w-full p-4 bg-gray-50 rounded-2xl text-right outline-none" placeholder="هدایات پیش‌فرض" value={newDrug.instructions} onChange={e => setNewDrug({...newDrug, instructions: e.target.value})} />
          </div>
          <button onClick={handleAdd} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-lg active:scale-95 transition-all">ثبت در بانک دواها</button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-bold text-gray-400">جستجو در بانک دواها</span>
          <h3 className="font-bold text-gray-600 text-right">لیست دواهای ثبت شده</h3>
        </div>
        
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-indigo-600" />
          <input 
            className="w-full p-3 pr-10 bg-white border border-gray-100 rounded-xl text-right text-xs outline-none focus:ring-2 focus:ring-indigo-100 transition-all" 
            placeholder="جستجو در بانک نامحدود..." 
            value={bankSearch}
            onChange={e => setBankSearch(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          {drugs.map(t => (
            <div key={t.id} className="bg-white p-5 rounded-[2rem] flex justify-between items-center shadow-sm flex-row-reverse border border-gray-50 hover:border-indigo-100 transition-all">
              <div className="text-right">
                <div className="font-black text-indigo-900 text-lg">{t.name} <span className="text-[10px] text-gray-400 font-medium">({t.form})</span></div>
                <div className="text-xs text-gray-400 mt-1">{t.brandNames ? `Brands: ${t.brandNames}` : t.category}</div>
                {t.company && <div className="text-[9px] text-indigo-300 font-bold">Mfg: {t.company}</div>}
              </div>
              <button onClick={() => handleDelete(t.id)} className="text-red-200 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
          {drugs.length === 0 && (
            <div className="text-center py-10 text-gray-300 italic text-sm">موردی برای نمایش وجود ندارد.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const ClinicSettingsForm: React.FC<{ settings: ClinicSettings, onSave: (s: ClinicSettings) => void, onBack: () => void }> = ({ settings, onSave, onBack }) => {
  const [data, setData] = useState(settings);
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-6 text-right animate-in slide-in-from-right">
      <h2 className="text-2xl font-black mb-6 flex items-center justify-end gap-2 text-indigo-900"><Settings className="w-6 h-6" /> تنظیمات پروفایل</h2>
      <FormGroup label="نام کلینیک / شفاخانه">
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-right font-bold" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
      </FormGroup>
      <FormGroup label="نام داکتر معالج">
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-right font-bold" value={data.doctor} onChange={e => setData({...data, doctor: e.target.value})} />
      </FormGroup>
      <FormGroup label="آدرس مطب">
        <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-right min-h-[80px]" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
      </FormGroup>
      <FormGroup label="نمبرهای تماس">
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-right font-mono" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
      </FormGroup>
      <div className="flex gap-3 pt-6">
        <button onClick={() => { onSave(data); onBack(); }} className="flex-1 bg-indigo-700 text-white p-5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95 transition-all">
          <Save className="w-5 h-5" /> ذخیره تغییرات
        </button>
        <button onClick={onBack} className="bg-gray-100 p-5 rounded-2xl font-bold text-gray-500">لغو</button>
      </div>
    </div>
  );
};

export default App;
