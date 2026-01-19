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
  FileDown,
  Edit3,
  Image as ImageIcon,
  Save,
  RotateCcw,
  FileText,
  File
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings, PrintLayoutSettings } from './types';
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
  { cat: 'Respiratory', items: ['Acute Bronchitis', 'Community Acquired Pneumonia', 'COPD Exacerbation', 'Bronchial Asthma', 'Viral URTI', 'Pulmonary Tuberculosis', 'Acute Tonsillopharyngitis', 'Sinusitis', 'Bronchiectasis'] },
  { cat: 'Gastrointestinal', items: ['Acute Gastritis', 'Peptic Ulcer Disease', 'GERD', 'Acute Gastroenteritis', 'Irritable Bowel Syndrome', 'H. Pylori Infection', 'Bacillary Dysentery', 'Amoebic Colitis', 'Acute Cholecystitis', 'Hepatitis'] },
  { cat: 'Cardiovascular', items: ['Essential Hypertension', 'Ischemic Heart Disease', 'Congestive Heart Failure', 'Atrial Fibrillation', 'Deep Vein Thrombosis', 'Valvular Heart Disease'] },
  { cat: 'Endocrine', items: ['Diabetes Mellitus Type 2', 'Diabetes Mellitus Type 1', 'Hypothyroidism', 'Hyperthyroidism', 'Dyslipidemia', 'Vitamin D Deficiency', 'Polycystyic Ovary Syndrome'] },
  { cat: 'Infectious', items: ['Enteric Fever (Typhoid)', 'Malaria (Falciparum)', 'Malaria (Vivax)', 'Urinary Tract Infection', 'Acute Pyelonephritis', 'Sepsis', 'Meningitis', 'Brucellosis'] },
  { cat: 'Neurological', items: ['Migraine', 'Tension Headache', 'Ischemic Stroke', 'Transient Ischemic Attack', 'Epilepsy', 'Peripheral Neuropathy', 'BPPV / Vertigo'] },
  { cat: 'Orthopedic', items: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Lumbar Radiculopathy', 'Cervical Spondylosis', 'Osteoporosis', 'Fibromyalgia', 'Gouty arthritis'] },
  { cat: 'Dermatology', items: ['Eczema / Dermatitis', 'Urticaria', 'Fungal Skin Infection', 'Scabies', 'Acne Vulgaris', 'Psoriasis', 'Herpes Zoster'] }
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
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (!settings.printLayout) settings.printLayout = DEFAULT_CLINIC_SETTINGS.printLayout;
        if (!settings.language) settings.language = DEFAULT_CLINIC_SETTINGS.language;
        setClinicSettings(settings);
      }
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

      <nav className="bg-white/95 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex justify-around items-center p-4 z-40 no-print rounded-t-3xl shadow-[0_-10px_30_rgba(0,0,0,0.05)]">
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
  const [records, setRecords] = useState<ClinicalRecords>(initialData?.clinicalRecords || { bp: '', hr: '', pr: '', spo2: '', temp: '', wt: '' });
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
        <div className="grid grid-cols-6 gap-2">
          {Object.entries(records).map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-[8px] font-black text-gray-300 uppercase text-center">{k}</label>
              <input className="w-full p-2.5 bg-gray-50 border-none rounded-xl text-center text-xs font-black focus:ring-2 focus:ring-indigo-400 shadow-inner outline-none" value={v} onChange={e => setRecords({...records, [k]: e.target.value})} />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center flex-row-reverse border-b border-gray-50 pb-2 mb-2">
          <h3 className="text-xs font-bold text-indigo-700">شکایت مریض (C/C)</h3>
          <div className="flex gap-2">
            <input className="text-[10px] p-2 bg-gray-50 rounded-lg outline-none" placeholder="جستجو شکایت..." value={ccSearch} onChange={e => setCcSearch(e.target.value)} />
          </div>
        </div>
        <textarea className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" value={cc} onChange={e => setCc(e.target.value)} placeholder="شکایت مریض را اینجا بنویسید..." />
        <div className="flex flex-wrap gap-1 mt-2 justify-end">
          {MEDICAL_CC_CATEGORIES.flatMap(c => c.items).filter(i => !ccSearch || i.toLowerCase().includes(ccSearch.toLowerCase())).slice(0, 15).map(item => (
            <button key={item} onClick={() => toggleCCTerm(item)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isCCSelected(item) ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center flex-row-reverse border-b border-gray-50 pb-2 mb-2">
          <h3 className="text-xs font-bold text-red-700">تشخیص (Diagnosis)</h3>
          <input className="text-[10px] p-2 bg-gray-50 rounded-lg outline-none" placeholder="جستجو تشخیص..." value={diagSearch} onChange={e => setDiagSearch(e.target.value)} />
        </div>
        <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 outline-none" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="تشخیص احتمالی یا قطعی..." />
        <div className="flex flex-wrap gap-1 mt-2 justify-end">
          {MEDICAL_DIAGNOSES.flatMap(c => c.items).filter(i => !diagSearch || i.toLowerCase().includes(diagSearch.toLowerCase())).slice(0, 15).map(item => (
            <button key={item} onClick={() => selectDiagnosis(item)} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${diagnosis === item ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center flex-row-reverse border-b border-gray-50 pb-3">
          <h3 className="text-xs font-bold text-indigo-700">اقلام دوایی (Meds)</h3>
          <button onClick={() => setShowDrugList(true)} className="bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 active:scale-95 transition-all shadow-md"><Plus className="w-4 h-4" /> افزودن دوا</button>
        </div>
        
        <div className="space-y-3">
          {meds.map((m, idx) => (
            <div key={idx} className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-2 group relative animate-in slide-in-from-right-2">
              <button onClick={() => setMeds(meds.filter((_, i) => i !== idx))} className="absolute top-2 left-2 p-1.5 text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              <div className="flex justify-between items-center flex-row-reverse">
                <span className="font-bold text-indigo-900 text-sm ltr">{m.name}</span>
                <input className="bg-transparent border-none text-[10px] font-black text-indigo-500 w-16 focus:ring-0 text-center" value={m.strength} onChange={e => {
                  const n = [...meds];
                  n[idx].strength = e.target.value;
                  setMeds(n);
                }} />
              </div>
              <input className="w-full bg-white/50 border-none rounded-lg p-2 text-[10px] font-bold text-right outline-none focus:ring-1 focus:ring-indigo-300" value={m.instructions} onChange={e => {
                const n = [...meds];
                n[idx].instructions = e.target.value;
                setMeds(n);
              }} />
            </div>
          ))}
          {meds.length === 0 && <div className="text-center py-6 text-gray-300 text-[10px] font-bold">دوا انتخاب نشده است</div>}
        </div>
      </div>

      <button onClick={() => onSubmit({ patientId: patient.id, cc, diagnosis, medications: meds, clinicalRecords: records })} className="w-full bg-gradient-to-r from-indigo-700 to-blue-800 text-white p-5 rounded-[2rem] font-bold shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all mb-10"><CheckCircle2 className="w-6 h-6" /> چاپ و ذخیره نسخه نهایی</button>

      {showDrugList && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] p-4 flex items-end">
          <div className="w-full max-sm:max-w-lg mx-auto bg-white rounded-[3rem] p-6 space-y-4 animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center px-2">
              <button onClick={() => setShowDrugList(false)} className="p-2 bg-gray-100 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
              <h3 className="font-bold text-indigo-900">لیست دواهای سیستم</h3>
            </div>
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 outline-none focus:ring-2 focus:ring-indigo-500 text-right font-bold text-sm" placeholder="جستجوی نام دوا یا برند..." value={drugSearchQuery} onChange={e => setDrugSearchQuery(e.target.value)} />
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {drugResults.map(drug => (
                <div key={drug.id} onClick={() => {
                  setMeds([...meds, { id: Math.random().toString(), name: drug.name, strength: drug.defaultStrength, quantity: '1', instructions: drug.defaultInstructions }]);
                  setShowDrugList(false);
                }} className="bg-gray-50 p-4 rounded-2xl flex justify-between items-center hover:bg-indigo-50 cursor-pointer transition-all active:scale-[0.98]">
                  <div className="text-[10px] font-bold text-indigo-400 bg-white px-3 py-1.5 rounded-xl shadow-sm ltr">{drug.defaultStrength}</div>
                  <div className="text-right">
                    <div className="font-bold text-indigo-900 ltr">{drug.name}</div>
                    <div className="text-[9px] text-gray-400 font-bold">{drug.brandNames || drug.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DrugSettings = ({ db }: { db: IDBDatabase }) => {
  const [drugs, setDrugs] = useState<DrugTemplate[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<DrugTemplate> | null>(null);

  const fetchDrugs = async () => {
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const request = store.getAll();
    request.onsuccess = () => setDrugs(request.result);
  };

  useEffect(() => { fetchDrugs(); }, [db]);

  const saveDrug = async () => {
    if (!editing?.name) return;
    const drugToSave = {
      ...editing,
      id: editing.id || Math.random().toString(36).substr(2, 9),
      defaultStrength: editing.defaultStrength || '500mg',
      defaultInstructions: editing.defaultInstructions || 'روزانه یک عدد'
    } as DrugTemplate;
    
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).put(drugToSave);
    tx.oncomplete = () => {
      setEditing(null);
      fetchDrugs();
    };
  };

  const deleteDrug = async (id: string) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).delete(id);
    tx.oncomplete = () => fetchDrugs();
  };

  const filtered = drugs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.brandNames?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4 fade-in">
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm">
        <button onClick={() => setEditing({})} className="bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">افزودن دوای جدید</button>
        <h2 className="font-bold text-indigo-900">مدیریت بانک دواها</h2>
      </div>
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input className="w-full bg-white border border-gray-100 rounded-2xl py-4 pr-12 pl-4 outline-none focus:ring-2 focus:ring-indigo-500 text-right font-bold text-sm shadow-sm" placeholder="جستجو در لیست..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="space-y-3">
        {filtered.map(d => (
          <div key={d.id} className="bg-white p-5 rounded-2xl flex justify-between items-center shadow-sm border border-gray-50 group">
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => deleteDrug(d.id)} className="p-2 text-red-100 bg-red-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              <button onClick={() => setEditing(d)} className="p-2 text-indigo-100 bg-indigo-700 rounded-lg"><Edit3 className="w-4 h-4" /></button>
            </div>
            <div className="text-right">
              <div className="font-bold text-gray-800 ltr">{d.name}</div>
              <div className="text-[10px] text-gray-400 font-bold">{d.brandNames || 'بدون برند'} | {d.category || 'عمومی'}</div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] p-6 flex items-center justify-center">
          <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] p-8 space-y-4 shadow-2xl scale-in text-right">
            <h3 className="font-bold text-indigo-900 border-r-4 border-indigo-600 pr-3">{editing.id ? 'ویرایش دوا' : 'ثبت دوای جدید'}</h3>
            <div className="space-y-3">
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">نام جنریک (Generic Name)</label><input className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-right outline-none ltr" value={editing.name || ''} onChange={e => setEditing({...editing, name: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">برندها (Brand Names)</label><input className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-right outline-none ltr" value={editing.brandNames || ''} onChange={e => setEditing({...editing, brandNames: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">دوز (Strength)</label><input className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-right outline-none ltr" value={editing.defaultStrength || ''} onChange={e => setEditing({...editing, defaultStrength: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">کتگوری</label><input className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-right outline-none" value={editing.category || ''} onChange={e => setEditing({...editing, category: e.target.value})} /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 pr-2">رهنمود پیش‌فرض (Instructions)</label><input className="w-full p-3.5 bg-gray-50 border-none rounded-xl text-sm font-bold text-right outline-none" value={editing.defaultInstructions || ''} onChange={e => setEditing({...editing, defaultInstructions: e.target.value})} /></div>
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={saveDrug} className="flex-[2] bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">ذخیره دوا</button>
              <button onClick={() => setEditing(null)} className="flex-1 bg-gray-100 text-gray-500 p-4 rounded-xl font-bold active:scale-95 transition-all">لغو</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, storedPin, onSavePin, onBack }: any) => {
  const [data, setData] = useState<ClinicSettings>(settings);
  const [pin, setPin] = useState(storedPin);

  const handleSave = () => {
    onSave(data);
    onSavePin(pin);
    alert('تنظیمات با موفقیت ذخیره شد!');
  };

  return (
    <div className="space-y-6 fade-in text-right">
      <div className="flex justify-between items-center bg-white p-5 rounded-[2rem] shadow-sm">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
        <h2 className="font-bold text-indigo-900">تنظیمات شفاخانه و داکتر</h2>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-indigo-700 border-r-4 border-indigo-600 pr-3">اطلاعات سرورقی و پای‌ورقی</h3>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">نام شفاخانه / کلینیک</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={data.name} onChange={e => setData({...data, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">نام داکتر</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={data.doctor} onChange={e => setData({...data, doctor: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">تخصص داکتر</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={data.specialty} onChange={e => setData({...data, specialty: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">شعار / متن انگلیسی (Tagline)</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none ltr" value={data.tagline} onChange={e => setData({...data, tagline: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">آدرس (پای‌ورقی)</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={data.address} onChange={e => setData({...data, address: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">شماره‌های تماس (پای‌ورقی)</label>
            <input className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" value={data.phone} onChange={e => setData({...data, phone: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 pr-2">زبان سیستم</label>
            <select className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none" value={data.language} onChange={e => setData({...data, language: e.target.value as any})}>
              <option value="fa">دری / فارسی</option>
              <option value="ps">پشتو</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <h3 className="text-sm font-bold text-red-700 border-r-4 border-red-600 pr-3 pt-4">امنیت سیستم</h3>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 pr-2">رمز عبور داکتر (PIN)</label>
          <div className="relative">
            <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input type="password" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-red-500 pr-12 outline-none" value={pin} onChange={e => setPin(e.target.value)} />
          </div>
        </div>

        <div className="pt-6">
          <button onClick={handleSave} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Save className="w-6 h-6" /> ذخیره تمامی تغییرات</button>
        </div>
      </div>
    </div>
  );
};

const PrescriptionPrintStudio = ({ settings, prescription, patient, onBack, onEdit }: any) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrePrinted, setIsPrePrinted] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleFullPreview = () => {
    const printContent = printRef.current?.innerHTML;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(style => style.outerHTML)
      .join('\n');
    
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html lang="fa" dir="rtl">
          <head>
            <meta charset="UTF-8">
            <title>پیش‌نمایش نسخه - ${patient.name}</title>
            ${styles}
            <style>
              body { 
                background: #f1f5f9; 
                margin: 0; 
                padding: 40px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                min-height: 100vh;
              }
              .print-area { 
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); 
                background: white;
                margin-bottom: 40px;
              }
              @media print {
                body { background: white; padding: 0; }
                .print-area { box-shadow: none; margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="print-area ${isPrePrinted ? 'pre-printed-mode' : ''}">
              ${printContent}
            </div>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <div className="preview-modal-overlay no-print">
      {/* Top UI Header */}
      <div className="preview-header">
         <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
         </button>
         <span className="font-bold text-gray-800">پیش‌نمایش چاپ</span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Sheet Container */}
        <div className="flex-1 overflow-y-auto bg-[#e2e8f0] p-8 rx-preview-container scrollbar-hide">
          <div ref={printRef} className={`print-area ${isPrePrinted ? 'pre-printed-mode' : ''}`}>
            {/* Header Area updated to include Patient Info under Doctor name */}
            <div className="rx-header">
              <div className="text-2xl font-bold text-slate-800 tracking-tight">{settings.name}</div>
              <div className="text-lg font-bold text-slate-600">{settings.doctor}</div>
              <div className="text-xs text-slate-400 italic mb-2">{settings.specialty}</div>
              
              {/* Patient details row in the header - Updated labels and date format to English */}
              <div className="flex justify-between gap-6 text-[10pt] border-t border-slate-100 pt-2 mt-1 px-4 ltr">
                <div><span className="font-bold text-slate-500 mr-1">Date:</span> {new Date(prescription.date).toLocaleDateString('en-GB')}</div>
                <div><span className="font-bold text-slate-500 mr-1">Gender:</span> {patient.gender === 'male' ? 'Male' : 'Female'}</div>
                <div><span className="font-bold text-slate-500 mr-1">Age:</span> {patient.age}</div>
                <div><span className="font-bold text-slate-500 mr-1">Patient Name:</span> {patient.name}</div>
              </div>
            </div>

            <div className="rx-body">
              {/* Sidebar (Right side in sheet) */}
              <div className="rx-sidebar">
                <div className="sidebar-title">اطلاعات جنبی</div>
                
                <div className="sidebar-section">
                    <div className="sidebar-label">PATIENT CODE</div>
                    <div className="sidebar-value">{patient.code}</div>
                </div>

                {/* V.S moved to top of the detailed sidebar info */}
                <div className="sidebar-section mt-4">
                    <div className="sidebar-label">VITALS (V.S)</div>
                    <div className="vitals-grid">
                      <div className="vital-box"><label>BP</label><span>{prescription.clinicalRecords.bp || '-'}</span></div>
                      <div className="vital-box"><label>HR</label><span>{prescription.clinicalRecords.hr || '-'}</span></div>
                      <div className="vital-box"><label>PR</label><span>{prescription.clinicalRecords.pr || '-'}</span></div>
                      <div className="vital-box"><label>SPO2</label><span>{prescription.clinicalRecords.spo2 || '-'}</span></div>
                      <div className="vital-box"><label>TEMP</label><span>{prescription.clinicalRecords.temp || '-'}</span></div>
                      <div className="vital-box"><label>WT</label><span>{prescription.clinicalRecords.wt || '-'}</span></div>
                    </div>
                </div>

                {/* CC Section below V.S */}
                <div className="sidebar-section mt-4">
                    <div className="sidebar-label">C/C</div>
                    <div className="sidebar-value text-[9pt] leading-tight text-right">{prescription.cc || '-'}</div>
                </div>

                {/* Diagnosis Section below V.S and C/C */}
                <div className="sidebar-section mt-4">
                    <div className="sidebar-label">DIAGNOSIS</div>
                    <div className="sidebar-value text-[9pt] leading-tight text-right">{prescription.diagnosis || '-'}</div>
                </div>
              </div>

              {/* Main Content (Left side in sheet) */}
              <div className="rx-main">
                <div className="main-top-left">:N.M.C</div>

                <div className="rx-symbol-container">
                    <span className="rx-symbol-large">Rx</span>
                </div>

                <div className="meds-container">
                    {prescription.medications.map((m: any, idx: number) => (
                      <div key={idx} className="med-item">
                          <div className="med-name">{idx + 1}. {m.name} {m.strength}</div>
                          <div className="med-instruction">-- {m.instructions}</div>
                      </div>
                    ))}
                </div>

                <div className="signature-area">
                    DOCTOR'S SIGNATURE
                </div>
              </div>
            </div>

            {/* Footer added to display clinic address and phones */}
            <div className="rx-footer">
              <div>{settings.address}</div>
              <div>{settings.phone}</div>
            </div>
          </div>
        </div>

        {/* Right Design Panel */}
        <div className="w-72 bg-white border-l border-gray-100 p-6 hidden lg:block">
           <h3 className="font-bold text-gray-800 mb-4 text-right">طراحی نسخه</h3>
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-[11px] text-gray-500 leading-relaxed text-right">
              اطلاعات مریض در سرورقی نسخه اکنون به زبان انگلیسی نمایش داده می‌شوند.
           </div>
        </div>
      </div>

      {/* Bottom Footer with Buttons */}
      <div className="preview-footer">
         <button onClick={handlePrint} className="bg-[#0f766e] text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#0d6d65] active:scale-95 transition-all shadow-lg shadow-teal-100">
            <Printer className="w-5 h-5" /> 
            تایید و چاپ
         </button>
         <button onClick={handleFullPreview} className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-700 active:scale-95 transition-all shadow-lg shadow-gray-100">
            <FileText className="w-4 h-4" />
            پیش‌نمایش پرنت
         </button>
         <button onClick={onBack} className="bg-white border border-gray-200 text-gray-600 px-8 py-2.5 rounded-xl font-bold hover:bg-gray-50 active:scale-95 transition-all">
            انصراف
         </button>
      </div>
    </div>
  );
};

export default App;
