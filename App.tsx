import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  History, 
  Settings, 
  Search, 
  Printer, 
  ChevronLeft, 
  Home, 
  Trash2, 
  Stethoscope, 
  Activity, 
  X, 
  UserPlus, 
  LogOut, 
  Lock, 
  CheckCircle2, 
  Plus, 
  Database, 
  Key,
  Layout,
  Type as TypeIcon,
  Scaling,
  Move,
  FileDown,
  PanelLeftClose,
  PanelLeftOpen,
  Edit3
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings } from './types';
import { INITIAL_DRUGS, DEFAULT_CLINIC_SETTINGS } from './constants';

// --- Database Configuration ---
const DB_NAME = 'AsanNoskhaProfessionalDB';
const DB_VERSION = 1;
const DRUG_STORE = 'drugs_master';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DRUG_STORE)) {
        const store = db.createObjectStore(DRUG_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('brandNames', 'brandNames', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const MEDICAL_CC_CATEGORIES = [
  { cat: 'علائم عمومی (General)', items: ['Fever', 'Chills', 'Fatigue', 'Weight loss', 'Loss of appetite', 'Weakness', 'Body Ache'] },
  { cat: 'درد (Pain)', items: ['Headache', 'Chest pain', 'Abdominal pain', 'Back pain', 'Joint pain', 'Muscle pain', 'Pain on movement'] },
  { cat: 'تنفسی (Respiratory)', items: ['Cough', 'Shortness of breath', 'Sore throat', 'Wheezing', 'Runny nose', 'Chest tightness'] },
  { cat: 'قلب و عروق (CVS)', items: ['Palpitations', 'Chest tightness', 'Dizziness', 'Syncope', 'Hypertension', 'Edema'] },
  { cat: 'گوارش (GI)', items: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Heartburn', 'Bloating', 'Epigastric pain'] },
  { cat: 'ادراری تناسلی (GU)', items: ['Dysuria', 'Frequency', 'Urgency', 'Hematuria', 'Flank pain'] },
  { cat: 'عصب شناسی (Neuro)', items: ['Vertigo', 'Seizures', 'Weakness', 'Numbness', 'Loss of consciousness'] },
  { cat: 'پوست (Skin)', items: ['Rash', 'Itching', 'Swelling', 'Redness'] },
  { cat: 'اطفال (Pediatrics)', items: ['Poor feeding', 'Crying', 'Fever', 'Vomiting'] }
];

const MEDICAL_DIAGNOSES = [
  { cat: 'Respiratory', items: ['Acute Bronchitis', 'Pneumonia', 'COPD Exacerbation', 'Bronchial Asthma', 'URTI', 'COVID-19', 'Pharyngitis'] },
  { cat: 'Gastrointestinal', items: ['Acute Gastritis', 'Peptic Ulcer Disease (PUD)', 'GERD', 'Acute Gastroenteritis', 'IBS', 'H. Pylori Infection', 'Amoebic Dysentery'] },
  { cat: 'Cardiovascular', items: ['Essential Hypertension', 'Angina Pectoris', 'Heart Failure', 'Atrial Fibrillation', 'Valvular Heart Disease', 'Peripheral Vascular Disease'] },
  { cat: 'Endocrine', items: ['Diabetes Mellitus Type 2', 'Diabetes Mellitus Type 1', 'Hypothyroidism', 'Hyperthyroidism', 'Dyslipidemia', 'Vitamin D Deficiency'] },
  { cat: 'Infectious', items: ['Enteric Fever (Typhoid)', 'Malaria (PF)', 'Malaria (PV)', 'Urinary Tract Infection (UTI)', 'Sepsis', 'Viral Fever', 'Tuberculosis'] },
  { cat: 'Neurological', items: ['Migraine', 'Tension-type Headache', 'Ischemic Stroke', 'Hemorrhagic Stroke', 'Epilepsy', 'Peripheral Neuropathy', 'Vertigo'] },
  { cat: 'Orthopedic', items: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Low Back Pain', 'Sciatica', 'Cervical Spondylosis', 'Osteoporosis'] },
  { cat: 'Dermatology', items: ['Contact Dermatitis', 'Eczema', 'Urticaria', 'Fungal Infection', 'Scabies', 'Acne Vulgaris'] }
];

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState('0796606605');
  const [view, setView] = useState<ViewState>('HOME');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [draftPrescription, setDraftPrescription] = useState<Partial<Prescription> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [db, setDb] = useState<IDBDatabase | null>(null);

  const getAdjustedTime = () => Date.now() + 3600000;

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const database = await initDB();
        setDb(database);
        const tx = database.transaction(DRUG_STORE, 'readwrite');
        const store = tx.objectStore(DRUG_STORE);
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          if (countRequest.result === 0) {
            INITIAL_DRUGS.forEach(drug => store.add(drug));
          }
        };
      } catch (err) {
        console.error('Failed to init IndexedDB:', err);
      }

      const savedPatients = localStorage.getItem('patients');
      const savedPrescriptions = localStorage.getItem('prescriptions');
      const savedSettings = localStorage.getItem('clinicSettings');
      const savedPin = localStorage.getItem('doctorPin');
      const savedLogin = sessionStorage.getItem('isLoggedIn');

      if (savedPatients) setPatients(JSON.parse(savedPatients));
      if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
      if (savedSettings) setClinicSettings(JSON.parse(savedSettings));
      if (savedPin) setStoredPin(savedPin);
      if (savedLogin === 'true') setIsLoggedIn(true);
    };
    loadAppData();
  }, []);

  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
    localStorage.setItem('doctorPin', storedPin);
  }, [patients, prescriptions, clinicSettings, storedPin]);

  const handleLogin = () => {
    if (pin === storedPin) {
      setIsLoggedIn(true);
      sessionStorage.setItem('isLoggedIn', 'true');
      setPin('');
    } else {
      alert('رمز اشتباه است!');
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
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }, [patients, searchQuery]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300">
          <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2"><Lock className="w-10 h-10 text-indigo-600" /></div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">ورود داکتر</h1>
          <p className="text-[11px] text-gray-400 font-bold">برای دسترسی به سیستم رمز عبور خود را وارد کنید</p>
          <input 
            type="password" 
            className="w-full p-4 rounded-2xl bg-gray-50 border-none text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none" 
            placeholder="****" 
            value={pin} 
            onChange={e => setPin(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleLogin()} 
          />
          <button onClick={handleLogin} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold text-lg active:scale-95 transition-transform shadow-lg">ورود به پنل</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative border-x border-gray-100 font-sans print:max-w-none print:mx-0 print:border-none print:shadow-none`}>
      <header className="bg-indigo-800 text-white p-4 sticky top-0 z-40 flex justify-between items-center no-print shadow-lg">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
          <div className="bg-white/20 p-2 rounded-xl"><Stethoscope className="w-5 h-5 text-indigo-100" /></div>
          <h1 className="text-xl font-bold tracking-tight">آسان نسخه</h1>
        </div>
        <button onClick={handleLogout} className="p-2.5 bg-red-600/20 hover:bg-red-600 rounded-full transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className={`flex-1 overflow-y-auto pb-28 p-4 bg-gray-50/30 print:p-0 print:bg-white print:overflow-visible`}>
        {view === 'HOME' && (
          <div className="space-y-6 fade-in">
            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
               <h2 className="text-2xl font-bold mb-1 relative z-10">خوش آمدید، داکتر صاحب!</h2>
               <p className="text-indigo-200 text-sm relative z-10">{new Date(getAdjustedTime()).toLocaleDateString('fa-AF', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
               <div className="mt-8 flex gap-3 relative z-10">
                 <button onClick={() => { setDraftPrescription(null); setView('NEW_PATIENT'); }} className="flex-1 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] flex flex-col items-center gap-2 border border-white/5 transition-all active:scale-95">
                   <UserPlus className="w-8 h-8" />
                   <span className="text-xs font-bold">مریض جدید</span>
                 </button>
                 <button onClick={() => { setDraftPrescription(null); setView('PATIENTS'); }} className="flex-1 bg-white/10 hover:bg-white/20 p-5 rounded-[2rem] flex flex-col items-center gap-2 border border-white/5 transition-all active:scale-95">
                   <Users className="w-8 h-8" />
                   <span className="text-xs font-bold">بانک مریضان</span>
                 </button>
               </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <QuickAction icon={<History className="text-orange-600" />} bg="bg-orange-50" title="آرشیف نسخه‌ها" onClick={() => setView('PRESCRIPTION_HISTORY')} />
              <QuickAction icon={<Database className="text-blue-600" />} bg="bg-blue-50" title="بانک دواها" onClick={() => setView('DRUGS')} />
              <QuickAction icon={<Settings className="text-gray-600" />} bg="bg-gray-100" title="تنظیمات سیستم" onClick={() => setView('SETTINGS')} />
            </div>
          </div>
        )}

        {view === 'NEW_PATIENT' && <PatientForm onSubmit={(p: Partial<Patient>) => {
          const newId = Math.random().toString(36).substr(2, 9);
          const newPatient = { ...p, id: newId, code: `P-${1000 + patients.length + 1}`, createdAt: getAdjustedTime() } as Patient;
          setPatients([newPatient, ...patients]);
          setSelectedPatientId(newId);
          setDraftPrescription(null);
          setView('NEW_PRESCRIPTION');
        }} onCancel={() => setView('HOME')} />}

        {view === 'PATIENTS' && (
          <div className="space-y-4 fade-in">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-4 pr-12 pl-4 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="جستجو نام یا کد مریض..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <div className="space-y-3">
              {filteredPatients.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98] transition-all" onClick={() => { setSelectedPatientId(p.id); setDraftPrescription(null); setView('NEW_PRESCRIPTION'); }}>
                  <div className="flex-1 text-right">
                    <div className="font-bold text-gray-800">{p.name} <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono">{p.code}</span></div>
                    <div className="text-xs text-gray-500 mt-1">فرزند: {p.fatherName} | سن: {p.age}</div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && db && (
          <PrescriptionForm 
            db={db}
            initialData={draftPrescription}
            patient={patients.find(p => p.id === selectedPatientId)!}
            onSubmit={(pr: any) => {
              const newPr = { ...pr, id: Math.random().toString(36).substr(2, 9), date: getAdjustedTime() };
              setPrescriptions([newPr, ...prescriptions]);
              setSelectedPrescription(newPr);
              setDraftPrescription(null);
              setView('VIEW_PDF');
            }}
          />
        )}

        {view === 'PRESCRIPTION_HISTORY' && (
          <div className="space-y-4 fade-in">
            {prescriptions.map(pr => {
              const p = patients.find(x => x.id === pr.patientId);
              return (
                <div key={pr.id} onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-indigo-300 group transition-all text-right">
                  <div className="flex justify-between items-start flex-row-reverse">
                    <span className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{p?.name || 'نامشخص'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{new Date(pr.date).toLocaleDateString('fa-AF')}</span>
                  </div>
                  <div className="text-sm text-indigo-600 font-medium mt-1 truncate">تشخیص: {pr.diagnosis}</div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'DRUGS' && db && <DrugSettings db={db} />}
        {view === 'SETTINGS' && <ClinicSettingsForm settings={clinicSettings} onSave={setClinicSettings} storedPin={storedPin} onSavePin={setStoredPin} onBack={() => setView('HOME')} />}
        
        {view === 'VIEW_PDF' && selectedPrescription && (
          <PrescriptionPrintStudio 
            settings={clinicSettings} 
            prescription={selectedPrescription} 
            patient={patients.find(p => p.id === selectedPrescription.patientId)!} 
            onBack={() => setView('HOME')} 
            onEdit={() => {
              setDraftPrescription(selectedPrescription);
              setSelectedPatientId(selectedPrescription.patientId);
              setView('NEW_PRESCRIPTION');
            }}
          />
        )}
      </main>

      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex justify-around items-center p-4 z-40 no-print rounded-t-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <NavBtn active={view === 'HOME'} icon={<Home />} label="اصلی" onClick={() => setView('HOME')} />
        <NavBtn active={view === 'PATIENTS' || view === 'NEW_PATIENT' || view === 'NEW_PRESCRIPTION'} icon={<Users />} label="مریضان" onClick={() => { setDraftPrescription(null); setView('PATIENTS'); }} />
        <NavBtn active={view === 'PRESCRIPTION_HISTORY'} icon={<History />} label="تاریخچه" onClick={() => setView('PRESCRIPTION_HISTORY')} />
        <NavBtn active={view === 'SETTINGS' || view === 'DRUGS'} icon={<Settings />} label="تنظیمات" onClick={() => setView('SETTINGS')} />
      </nav>
    </div>
  );
};

// --- Helper Components ---

const QuickAction = ({ icon, bg, title, onClick }: { icon: React.ReactElement; bg: string; title: string; onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white p-5 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md active:scale-[0.98] transition-all w-full text-right">
    <div className={`${bg} p-4 rounded-2xl`}>{React.cloneElement(icon, { className: 'w-6 h-6' } as any)}</div>
    <div className="font-bold text-gray-800 flex-1">{title}</div>
    <ChevronLeft className="w-5 h-5 text-gray-200" />
  </button>
);

const NavBtn = ({ active, icon, label, onClick }: { active: boolean; icon: React.ReactElement; label: string; onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${active ? 'text-indigo-700 scale-110' : 'text-gray-400 hover:text-gray-600'}`}>
    {React.cloneElement(icon, { className: 'w-6 h-6' } as any)}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const PatientForm = ({ onSubmit, onCancel }: any) => {
  const [data, setData] = useState({ name: '', fatherName: '', phone: '', age: '', gender: 'male' });
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-5 fade-in text-right">
      <h2 className="text-xl font-bold text-gray-800 border-r-4 border-indigo-600 pr-3">ثبت هویت مریض جدید</h2>
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">نام مکمل مریض</label><input className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm text-right focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none" placeholder="نام..." value={data.name} onChange={e => setData({...data, name: e.target.value})} /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">نام پدر</label><input className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm text-right focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none" placeholder="نام پدر..." value={data.fatherName} onChange={e => setData({...data, fatherName: e.target.value})} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">سن</label><input className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm text-right focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none" placeholder="سن..." type="number" value={data.age} onChange={e => setData({...data, age: e.target.value})} /></div>
          <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">جنسیت</label><select className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm text-right outline-none" value={data.gender} onChange={e => setData({...data, gender: e.target.value as any})}>
            <option value="male">مرد</option><option value="female">زن</option>
          </select></div>
        </div>
      </div>
      <div className="flex gap-3 pt-6 flex-row-reverse">
        <button onClick={() => onSubmit(data)} className="flex-[2] bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform">ثبت و شروع معاینه</button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 text-gray-500 p-5 rounded-2xl font-bold active:scale-95 transition-transform">انصراف</button>
      </div>
    </div>
  );
};

const PrescriptionForm = ({ patient, db, onSubmit, initialData }: any) => {
  const [cc, setCc] = useState(initialData?.cc || '');
  const [ccSearch, setCcSearch] = useState('');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
  const [diagSearch, setDiagSearch] = useState('');
  const [meds, setMeds] = useState<any[]>(initialData?.medications || []);
  const [records, setRecords] = useState<ClinicalRecords>(initialData?.clinicalRecords || { bp: '', hr: '', pr: '', spo2: '', temp: '' });
  const [showDrugList, setShowDrugList] = useState(false);
  const [drugSearchQuery, setDrugSearchQuery] = useState('');
  const [drugResults, setDrugResults] = useState<DrugTemplate[]>([]);

  useEffect(() => {
    if (!db) return;
    const searchDrugs = async () => {
      const q = drugSearchQuery.toLowerCase().trim();
      const tx = db.transaction(DRUG_STORE, 'readonly');
      const store = tx.objectStore(DRUG_STORE);
      const request = store.openCursor();
      const results: DrugTemplate[] = [];

      request.onsuccess = (e) => {
        const cursor = (e.target as any).result;
        if (cursor && results.length < 50) {
          const drug = cursor.value as DrugTemplate;
          if (!q || drug.name.toLowerCase().includes(q) || (drug.brandNames && drug.brandNames.toLowerCase().includes(q))) {
            results.push(drug);
          }
          cursor.continue();
        } else {
          setDrugResults(results);
        }
      };
    };
    searchDrugs();
  }, [drugSearchQuery, db]);

  const toggleCCTerm = (term: string) => {
    setCc(prev => {
      const terms = prev.split(', ').filter(t => t.trim() !== '');
      if (terms.includes(term)) return terms.filter(t => t !== term).join(', ');
      return [...terms, term].join(', ');
    });
  };

  const selectDiagnosis = (term: string) => {
    setDiagnosis(term);
  };

  const isCCSelected = (term: string) => cc.split(', ').map(t => t.trim()).includes(term);

  return (
    <div className="space-y-6 pb-12 fade-in">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex justify-between items-center shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-8 -mt-8 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        <div className="text-right w-full relative z-10">
          <div className="font-bold text-xl">{patient.name}</div>
          <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">Age: {patient.age} | Code: {patient.code}</div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-[10px] font-bold text-gray-300 uppercase tracking-[2px] mb-2 text-right">Vital Signs (V.S)</h3>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(records).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-[8px] font-black text-gray-300 uppercase text-center">{k}</label>
              <input className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-center text-xs font-black focus:ring-2 focus:ring-indigo-400 shadow-inner outline-none" value={v} onChange={e => setRecords({...records, [k]: e.target.value})} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center flex-row-reverse border-b border-gray-50 pb-3">
          <h3 className="text-sm font-bold text-gray-800">شکایت اصلی (Chief Complaint)</h3>
        </div>
        <div className="relative mb-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input className="w-full p-3 pr-10 bg-gray-50 border-none rounded-xl text-xs text-right outline-none shadow-inner" placeholder="جستجوی علائم..." value={ccSearch} onChange={e => setCcSearch(e.target.value)} />
        </div>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scroll">
          {MEDICAL_CC_CATEGORIES.map(category => {
            const items = category.items.filter(i => i.toLowerCase().includes(ccSearch.toLowerCase()));
            if (ccSearch && items.length === 0) return null;
            return (
              <div key={category.cat} className="space-y-2">
                <div className="text-[9px] font-black text-indigo-400 border-b border-indigo-50/50 pb-1 text-right uppercase tracking-[1px]">{category.cat}</div>
                <div className="flex flex-wrap gap-2 flex-row-reverse">
                  {items.map(item => (
                    <button key={item} onClick={() => toggleCCTerm(item)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${isCCSelected(item) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {item}{isCCSelected(item) && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <textarea className="w-full p-4 rounded-2xl bg-gray-50 border-none text-sm text-left font-mono min-h-[70px] focus:ring-2 focus:ring-indigo-500 shadow-inner outline-none" placeholder="Selected symptoms..." value={cc} onChange={e => setCc(e.target.value)} />
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center flex-row-reverse border-b border-gray-50 pb-3">
          <h3 className="text-sm font-bold text-gray-800">تشخیص (Medical Diagnosis)</h3>
          <span className="text-[9px] text-indigo-500 font-black uppercase tracking-[1px]">Select English Terms</span>
        </div>
        <div className="relative mb-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input className="w-full p-3 pr-10 bg-gray-50 border-none rounded-xl text-xs text-right outline-none shadow-inner" placeholder="جستجوی تشخیص..." value={diagSearch} onChange={e => setDiagSearch(e.target.value)} />
        </div>
        <div className="space-y-4 max-h-[200px] overflow-y-auto pr-1 custom-scroll">
          {MEDICAL_DIAGNOSES.map(category => {
            const items = category.items.filter(i => i.toLowerCase().includes(diagSearch.toLowerCase()));
            if (diagSearch && items.length === 0) return null;
            return (
              <div key={category.cat} className="space-y-2">
                <div className="text-[9px] font-black text-indigo-400 border-b border-indigo-50/50 pb-1 text-right uppercase tracking-[1px]">{category.cat}</div>
                <div className="flex flex-wrap gap-2 flex-row-reverse">
                  {items.map(item => (
                    <button key={item} onClick={() => selectDiagnosis(item)} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${diagnosis === item ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                      {item}{diagnosis === item && <CheckCircle2 className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <textarea className="w-full p-5 rounded-[2rem] bg-gray-50 border-none shadow-inner text-sm text-right min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Enter clinical diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center flex-row-reverse px-1">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 flex-row-reverse">Rx - لیست تداوی <Activity className="w-5 h-5 text-indigo-600" /></h3>
          <button onClick={() => setShowDrugList(true)} className="text-xs font-bold text-indigo-700 bg-indigo-50 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-all">+ انتخاب از بانک</button>
        </div>
        <div className="space-y-3">
          {meds.map((m, i) => (
            <div key={m.id || i} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm relative animate-in slide-in-from-right duration-300 text-right">
               <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="absolute top-4 left-4 text-gray-200 hover:text-red-500 transition-colors"><X className="w-5 h-5" /></button>
               <input className="w-full font-black text-indigo-900 border-none p-0 text-lg text-right mb-4 focus:ring-0 outline-none" placeholder="نام دوا" value={m.name} onChange={e => { const n = [...meds]; n[i].name = e.target.value; setMeds(n); }} />
               <div className="grid grid-cols-2 gap-3 mb-3">
                 <input className="text-xs bg-gray-50 p-3.5 rounded-xl border-none text-right focus:ring-1 focus:ring-indigo-300 shadow-inner outline-none" placeholder="دوز" value={m.strength} onChange={e => { const n = [...meds]; n[i].strength = e.target.value; setMeds(n); }} />
                 <input className="text-xs bg-gray-50 p-3.5 rounded-xl border-none text-right focus:ring-1 focus:ring-indigo-300 shadow-inner outline-none" placeholder="تعداد" value={m.quantity} onChange={e => { const n = [...meds]; n[i].quantity = e.target.value; setMeds(n); }} />
               </div>
               <textarea className="w-full text-xs bg-gray-50 p-3.5 rounded-xl border-none text-right focus:ring-1 focus:ring-indigo-300 min-h-[60px] shadow-inner outline-none" placeholder="هدایات" value={m.instructions} onChange={e => { const n = [...meds]; n[i].instructions = e.target.value; setMeds(n); }} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ patientId: patient.id, cc, diagnosis, clinicalRecords: records, medications: meds })} className="w-full bg-indigo-700 text-white p-5 rounded-[2rem] font-bold shadow-xl active:scale-95 transition-transform text-lg">مشاهده و چاپ نسخه</button>

      {showDrugList && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in duration-300 text-right">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4 flex-row-reverse">
              <span className="font-bold text-xl text-gray-800">بانک دواها</span>
              <button onClick={() => setShowDrugList(false)} className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"><X className="w-6 h-6" /></button>
            </div>
            <div className="relative mb-6 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-indigo-600" />
              <input className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 outline-none text-right text-sm shadow-inner focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="جستجوی سریع..." value={drugSearchQuery} onChange={e => setDrugSearchQuery(e.target.value)} autoFocus />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll">
              <button onClick={() => { setMeds([...meds, { id: Math.random().toString(), name: '', strength: '', quantity: '', instructions: '' }]); setShowDrugList(false); }} className="w-full p-4.5 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"><Plus className="w-5 h-5" /> دوای جدید (دستی)</button>
              <div className="pt-2">
                {drugResults.map(t => (
                  <div key={t.id} onClick={() => { setMeds([...meds, { id: Math.random().toString(), name: t.name, strength: t.defaultStrength, quantity: '', instructions: t.defaultInstructions }]); setShowDrugList(false); }} className="p-4 border border-gray-50 rounded-2xl hover:bg-indigo-50 cursor-pointer group transition-all active:scale-[0.98] mb-2">
                    <div className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{t.name} <span className="text-[9px] opacity-40 font-normal">({t.brandNames?.split(',')[0]})</span></div>
                    <div className="text-[10px] text-gray-400 mt-1 font-medium italic">{t.defaultStrength} — {t.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PrescriptionPrintStudio = ({ settings, prescription, patient, onBack, onEdit }: any) => {
  const [pageSize, setPageSize] = useState<'A4' | 'A5' | 'Letter'>('A4');
  const [fontSize, setFontSize] = useState(14);
  const [margin, setMargin] = useState(15); 
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [lineHeight, setLineHeight] = useState(1.5);
  const [showWatermark, setShowWatermark] = useState(true);
  const [fontFamily, setFontFamily] = useState('Vazirmatn');
  const [showFooter, setShowFooter] = useState(true);
  const [showSignature, setShowSignature] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-200 no-print-container font-sans" dir="rtl">
      {/* Settings Panel (Sidebar) */}
      <aside className={`no-print bg-white border-l border-slate-300 transition-all duration-300 overflow-y-auto h-screen sticky top-0 z-50 shadow-2xl flex flex-col ${isSidebarCollapsed ? 'w-0 md:w-12' : 'w-full md:w-72'}`}>
        {isSidebarCollapsed ? (
          <div className="p-2 flex flex-col items-center gap-4 pt-10">
             <button onClick={() => setIsSidebarCollapsed(false)} className="p-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all">
               <PanelLeftOpen className="w-5 h-5" />
             </button>
             <button onClick={handlePrint} className="p-2 bg-indigo-700 text-white rounded-lg shadow-lg" title="چاپ">
               <Printer className="w-5 h-5" />
             </button>
             <button onClick={onEdit} className="p-2 bg-orange-100 text-orange-700 rounded-lg shadow-sm" title="ویرایش">
               <Edit3 className="w-5 h-5" />
             </button>
          </div>
        ) : (
          <div className="p-5 space-y-6 flex-1 flex flex-col text-right">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-row-reverse">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 flex-row-reverse">
                <Layout className="w-5 h-5 text-indigo-600" />
                تنظیمات چاپ
              </h2>
              <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-1 custom-scroll">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <Scaling className="w-3 h-3" /> تنظیمات صفحه
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">سایز کاغذ:</label>
                    <select value={pageSize} onChange={e => setPageSize(e.target.value as any)} className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none">
                      <option value="A4">A4 (استاندارد)</option>
                      <option value="A5">A5 (کوچک)</option>
                      <option value="Letter">Letter</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">جهت صفحه:</label>
                    <div className="flex bg-slate-50 p-1 rounded-xl">
                      <button onClick={() => setOrientation('portrait')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orientation === 'portrait' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>عمودی</button>
                      <button onClick={() => setOrientation('landscape')} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${orientation === 'landscape' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>افقی</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <TypeIcon className="w-3 h-3" /> تایپوگرافی
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 flex justify-between flex-row-reverse">سایز متن: <span>{fontSize}px</span></label>
                    <input type="range" min="10" max="24" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">نوع قلم:</label>
                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full p-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none">
                      <option value="Vazirmatn">Vazirmatn</option>
                      <option value="system-ui">System UI</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2 flex-row-reverse">
                  <Move className="w-3 h-3" /> حاشیه
                </h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 flex justify-between flex-row-reverse">سفیدی لبه: <span>{margin}mm</span></label>
                  <input type="range" min="0" max="40" value={margin} onChange={e => setMargin(parseInt(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer" />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <Toggle label="واتر مارک" active={showWatermark} onClick={() => setShowWatermark(!showWatermark)} />
                <Toggle label="فوتر آدرس" active={showFooter} onClick={() => setShowFooter(!showFooter)} />
                <Toggle label="خط امضا" active={showSignature} onClick={() => setShowSignature(!showSignature)} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button onClick={handlePrint} className="w-full bg-indigo-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-800 transition-all">
                <Printer className="w-5 h-5" /> چاپ مستقیم
              </button>
              <button onClick={onEdit} className="w-full bg-orange-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-orange-700 transition-all">
                <Edit3 className="w-5 h-5" /> تغییر و ویرایش نسخه
              </button>
              <button onClick={handlePrint} className="w-full bg-white text-slate-700 border border-slate-200 p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-xs">
                <FileDown className="w-4 h-4" /> ذخیره PDF
              </button>
              <button onClick={onBack} className="w-full text-slate-400 p-2 text-xs hover:text-red-500 transition-colors">لغو و بازگشت</button>
            </div>
          </div>
        )}
      </aside>

      {/* Real Paper Preview Area */}
      <div className="flex-1 flex flex-col items-center overflow-auto p-4 md:p-12 pb-32 bg-slate-300 relative">
        <div className="no-print absolute top-4 left-1/2 -translate-x-1/2 bg-indigo-900 text-white px-6 py-2 rounded-full text-[10px] font-black tracking-widest uppercase opacity-50 z-10 shadow-lg pointer-events-none">
          Visual Alignment Guide (WYSIWYG)
        </div>

        {/* The Paper Simulation Container (Shows bounds) */}
        <div 
          className="relative transition-all duration-500 flex items-center justify-center"
          style={{
             padding: '40px', // Extra space around for "alignment" feel
          }}
        >
          {/* Subtle Guidelines for Alignment */}
          <div className="no-print absolute top-0 left-0 w-full h-full border border-dashed border-indigo-200/40 pointer-events-none rounded-sm"></div>

          {/* Actual Printable Document */}
          <div 
            id="printable-document"
            style={{ 
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              padding: `${margin}mm`,
              lineHeight: lineHeight,
              width: orientation === 'portrait' ? (pageSize === 'A4' ? '210mm' : pageSize === 'A5' ? '148mm' : '216mm') : (pageSize === 'A4' ? '297mm' : pageSize === 'A5' ? '210mm' : '279mm'),
              minHeight: orientation === 'portrait' ? (pageSize === 'A4' ? '297mm' : pageSize === 'A5' ? '210mm' : '279mm') : (pageSize === 'A4' ? '210mm' : pageSize === 'A5' ? '148mm' : '216mm'),
            }}
            className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.3)] flex flex-col relative print:shadow-none print:m-0 overflow-hidden text-left prescription-print-area"
            dir="ltr"
          >
            {/* Direct Print CSS */}
            <style>{`
              @media print {
                @page {
                  size: ${pageSize} ${orientation};
                  margin: 0;
                }
                body { background: white !important; visibility: hidden !important; }
                .prescription-print-area {
                  visibility: visible !important;
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: 100% !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                }
                .no-print { display: none !important; }
              }
            `}</style>

            {/* Header */}
            <div className="border-b-[4px] border-indigo-900 pb-6 mb-8 flex justify-between items-end">
              <div className="text-left flex flex-col items-start gap-1">
                <div className="bg-indigo-900 text-white px-4 py-1.5 rounded-lg font-black text-[10px] tracking-widest">PRESCRIPTION</div>
                <p className="text-[10px] text-slate-400 font-mono font-bold">DATE: {new Date(prescription.date).toLocaleDateString('fa-AF')}</p>
                <p className="text-[10px] text-slate-400 font-mono font-bold">ID: {patient.code}</p>
              </div>
              <div className="text-right">
                <h1 className="text-2xl font-black text-indigo-900 tracking-tighter mb-1">{settings.name}</h1>
                <h2 className="text-lg font-bold text-slate-800">{settings.doctor}</h2>
                <p className="text-[11px] text-indigo-600 font-black uppercase tracking-widest">{settings.specialty}</p>
              </div>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-4 gap-4 bg-slate-50 p-6 rounded-3xl mb-8 text-[13px] border border-slate-100">
               <div><span className="text-[8px] text-slate-300 block uppercase font-black mb-1">Name</span><span className="font-black text-slate-900 text-sm">{patient.name}</span></div>
               <div><span className="text-[8px] text-slate-300 block uppercase font-black mb-1">Age</span><span className="font-black text-slate-900 text-sm">{patient.age}</span></div>
               <div><span className="text-[8px] text-slate-300 block uppercase font-black mb-1">Gender</span><span className="font-black text-slate-900 text-sm capitalize">{patient.gender}</span></div>
               <div><span className="text-[8px] text-slate-300 block uppercase font-black mb-1">Phone</span><span className="font-black text-slate-900 text-sm font-mono">{patient.phone || 'N/A'}</span></div>
            </div>

            <div className="flex gap-10 flex-1 relative">
              {showWatermark && (
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                   <Stethoscope className="w-1/2 h-1/2" />
                </div>
              )}

              {/* Vitals Sidebar */}
              <div className="w-16 space-y-10 pt-4 border-r-2 border-dashed border-slate-100 flex flex-col items-center">
                 {Object.entries(prescription.clinicalRecords).map(([k, v]) => (
                   <div key={k} className="text-center">
                     <span className="text-[8px] font-black text-slate-300 uppercase block mb-1 tracking-wider">{k.toUpperCase()}</span>
                     <p className="text-[10px] font-black text-slate-900">{(v as string) || '--'}</p>
                   </div>
                 ))}
              </div>

              {/* Medical Rx Details */}
              <div className="flex-1 pt-4 relative z-10">
                <div className="mb-6">
                  <span className="text-[9px] text-indigo-300 font-black uppercase block mb-1 tracking-widest">Chief Complaint</span>
                  <p className="font-bold text-slate-700 border-l-[3px] border-indigo-200 pl-4 py-0.5">{prescription.cc || 'N/A'}</p>
                </div>
                
                <div className="mb-8">
                  <span className="text-[9px] text-indigo-300 font-black uppercase block mb-1 tracking-widest">Diagnosis</span>
                  <p className="text-xl font-black text-slate-900 border-l-[4px] border-indigo-600 pl-4 py-0.5">{prescription.diagnosis}</p>
                </div>
                
                <div className="text-[60px] font-serif text-indigo-900 italic opacity-5 mb-4 select-none leading-none">Rx</div>
                
                <div className="space-y-6">
                  {prescription.medications.map((m: Medication, idx: number) => (
                    <div key={m.id || idx} className="border-b border-slate-50 pb-4 flex gap-4">
                       <span className="text-indigo-200 font-black text-lg">{idx + 1}.</span>
                       <div className="flex-1">
                          <div className="flex justify-between items-baseline mb-1">
                             <span className="font-black text-slate-900 text-lg">{m.name}</span>
                             <span className="text-sm font-black text-indigo-700">{m.strength}</span>
                          </div>
                          <div className="flex justify-between items-center text-[0.9em]">
                             <p className="text-slate-500 font-bold leading-relaxed">{m.instructions}</p>
                             <span className="text-[9px] font-black text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded uppercase">Qty: {m.quantity}</span>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 flex justify-between items-end border-t border-slate-100">
              {showSignature && (
                <div className="text-center pb-2">
                  <div className="w-32 border-t-2 border-indigo-900 mb-1"></div>
                  <p className="font-black uppercase tracking-widest text-[9px] text-indigo-900">Dr. Signature</p>
                </div>
              )}
              {showFooter && (
                <div className="space-y-1 max-w-[300px] text-right">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Address & Contact</p>
                   <p className="font-bold text-slate-500 text-[10px] leading-tight">{settings.address}</p>
                   <p className="font-mono font-black text-indigo-400 text-xs">{settings.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Toggle = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button onClick={onClick} className="w-full flex justify-between items-center p-2 rounded-lg hover:bg-slate-50 transition-colors flex-row-reverse">
    <span className="text-[11px] font-bold text-slate-600">{label}</span>
    <div className={`w-8 h-4 rounded-full transition-all relative ${active ? 'bg-indigo-600' : 'bg-slate-200'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'left-4.5' : 'left-0.5'}`}></div>
    </div>
  </button>
);

const DrugSettings = ({ db }: { db: IDBDatabase }) => {
  const [newDrug, setNewDrug] = useState({ name: '', strength: '', instructions: '', category: '' });
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<DrugTemplate[]>([]);

  const loadDrugs = async () => {
    const q = search.toLowerCase().trim();
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const request = store.openCursor();
    const found: DrugTemplate[] = [];
    request.onsuccess = (e) => {
      const cursor = (e.target as any).result;
      if (cursor && found.length < 50) {
        const drug = cursor.value as DrugTemplate;
        if (!q || drug.name.toLowerCase().includes(q)) found.push(drug);
        cursor.continue();
      } else {
        setResults(found);
      }
    };
  };

  useEffect(() => { loadDrugs(); }, [search, db]);

  const handleAdd = () => {
    if (!newDrug.name) return;
    const drug: DrugTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: newDrug.name,
      defaultStrength: newDrug.strength,
      defaultInstructions: newDrug.instructions,
      category: newDrug.category || 'User Added'
    };
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).add(drug);
    tx.oncomplete = () => {
      setNewDrug({ name: '', strength: '', instructions: '', category: '' });
      loadDrugs();
    };
  };

  const handleDelete = (id: string) => {
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).delete(id);
    tx.oncomplete = () => loadDrugs();
  };

  return (
    <div className="space-y-6 fade-in text-right">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 border-r-4 border-indigo-600 pr-3">افزودن دوای جدید</h3>
        <input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none" placeholder="نام دوا" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none" placeholder="دوز پیش‌فرض" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
          <input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none" placeholder="کتگوری" value={newDrug.category} onChange={e => setNewDrug({...newDrug, category: e.target.value})} />
        </div>
        <button onClick={handleAdd} className="w-full bg-indigo-700 text-white p-4 rounded-2xl font-bold">ذخیره در بانک</button>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input className="w-full bg-white border border-gray-100 p-4 pr-12 rounded-2xl text-right outline-none" placeholder="جستجوی دوا..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="space-y-2">
        {results.map(t => (
          <div key={t.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center text-right shadow-sm">
            <button onClick={() => handleDelete(t.id)} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
            <div className="flex-1">
              <div className="font-bold text-gray-800">{t.name}</div>
              <div className="text-[10px] text-gray-400 italic">{t.defaultStrength} — {t.category}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, storedPin, onSavePin, onBack }: any) => {
  const [data, setData] = useState(settings);
  const [newPin, setNewPin] = useState('');
  const [currentPinCheck, setCurrentPinCheck] = useState('');

  const handlePinUpdate = () => {
    if (currentPinCheck !== storedPin) {
      alert('رمز فعلی اشتباه است.');
      return;
    }
    onSavePin(newPin);
    alert('رمز عبور تغییر یافت.');
    setNewPin('');
    setCurrentPinCheck('');
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-6 text-right fade-in">
      <h2 className="text-2xl font-black text-gray-800">تنظیمات کلینیک</h2>
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">نام شفاخانه / کلینیک</label><input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none shadow-inner" value={data.name} onChange={e => setData({...data, name: e.target.value})} /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">نام داکتر</label><input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none shadow-inner" value={data.doctor} onChange={e => setData({...data, doctor: e.target.value})} /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">آدرس</label><textarea className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none shadow-inner min-h-[80px]" value={data.address} onChange={e => setData({...data, address: e.target.value})} /></div>
        <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400">نمبر تماس</label><input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-right outline-none shadow-inner" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} /></div>
      </div>
      
      <div className="pt-8 border-t border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 flex-row-reverse">تغییر رمز عبور ورود <Key className="w-4 h-4" /></h3>
        <div className="grid grid-cols-2 gap-3">
          <input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-center outline-none" type="password" placeholder="رمز فعلی" value={currentPinCheck} onChange={e => setCurrentPinCheck(e.target.value)} />
          <input className="w-full p-4 bg-gray-50 rounded-2xl border-none text-center outline-none" type="password" placeholder="رمز جدید" value={newPin} onChange={e => setNewPin(e.target.value)} />
        </div>
        <button onClick={handlePinUpdate} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">ثبت رمز جدید</button>
      </div>
      
      <button onClick={() => { onSave(data); onBack(); }} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl active:scale-95 transition-transform">ذخیره نهایی تنظیمات</button>
    </div>
  );
};

export default App;