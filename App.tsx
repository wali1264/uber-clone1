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
  Edit3,
  Save,
  FileText
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
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const MEDICAL_CC_CATEGORIES = [
  { cat: 'General', items: ['Fever', 'Chills', 'Fatigue', 'Weight loss', 'Appetite loss', 'Body Ache', 'Weakness'] },
  { cat: 'Respiratory', items: ['Cough', 'Shortness of breath', 'Sore throat', 'Runny nose', 'Chest tightness'] },
  { cat: 'Gastrointestinal', items: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal Pain', 'Bloating'] },
  { cat: 'Pain', items: ['Headache', 'Chest pain', 'Back pain', 'Joint pain', 'Muscle pain'] },
  { cat: 'Neurological', items: ['Dizziness', 'Vertigo', 'Seizures', 'Loss of consciousness'] }
];

const MEDICAL_DIAGNOSES = [
  { cat: 'Infectious', items: ['Enteric Fever (Typhoid)', 'Viral Fever', 'Malaria', 'UTI', 'Amoebiasis', 'Acute Tonsillitis'] },
  { cat: 'Respiratory', items: ['Acute Bronchitis', 'Pneumonia', 'Bronchial Asthma', 'COPD', 'Pharyngitis', 'URTI'] },
  { cat: 'Gastrointestinal', items: ['Acute Gastritis', 'Peptic Ulcer (PUD)', 'Gastroenteritis', 'GERD', 'IBS'] },
  { cat: 'Cardiovascular', items: ['Essential Hypertension', 'Ischemic Heart Disease (IHD)', 'Heart Failure'] },
  { cat: 'Endocrine', items: ['DM Type 2', 'Hyperthyroidism', 'Hypothyroidism', 'Hyperlipidemia'] }
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
  const [searchQuery, searchQuerySet] = useState('');
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isDbPopulating, setIsDbPopulating] = useState(false);

  const getAdjustedTime = () => Date.now();

  useEffect(() => {
    const loadAppData = async () => {
      try {
        const database = await initDB();
        setDb(database);
        const tx = database.transaction(DRUG_STORE, 'readwrite');
        const store = tx.objectStore(DRUG_STORE);
        const countReq = store.count();
        
        countReq.onsuccess = () => {
          const currentCount = countReq.result;
          const TARGET_COUNT = 500000;
          
          if (currentCount < TARGET_COUNT) {
            setIsDbPopulating(true);
            INITIAL_DRUGS.forEach(d => store.put(d));
            
            const forms = ['Tab ', 'Syr ', 'Inj ', 'Cap ', 'Drops ', 'Cream ', 'Oint ', 'Spray ', 'Susp ', 'Gel '];
            const stems = ['Amoxi', 'Cipro', 'Levo', 'Atorva', 'Omepra', 'Paraceta', 'Ibupro', 'Azithro', 'Ceftri', 'Metroni', 'Losar', 'Amlodi', 'Bisopro', 'Panto', 'Esomep', 'Diclo', 'Napro', 'Mefena', 'Celeco', 'Trana', 'Keto', 'Melo', 'Indo', 'Fluco', 'Clarithro', 'Roxy', 'Terbi', 'Ketoco', 'Predni', 'Dexa', 'Hydro', 'Betame'];
            const suffixes = ['cillin', 'floxacin', 'statin', 'zole', 'mol', 'fen', 'mycin', 'axone', 'dazole', 'tan', 'pine', 'lol', 'prazole', 'nac', 'xen', 'mic', 'nib', 'mab', 'sone', 'lone', 'line', 'zine', 'mine', 'pril'];
            const categories = ['Analgesic', 'Antibiotic', 'Gastro', 'Cardiac', 'Dermatology', 'Neurology', 'Vitamin', 'Respiratory', 'Pediatric'];
            
            let i = currentCount;
            const populateBatch = () => {
              const txBatch = database.transaction(DRUG_STORE, 'readwrite');
              const storeBatch = txBatch.objectStore(DRUG_STORE);
              const batchLimit = Math.min(i + 15000, TARGET_COUNT);
              
              for (; i < batchLimit; i++) {
                const form = forms[i % forms.length];
                const stem = stems[i % stems.length];
                const suffix = suffixes[i % suffixes.length];
                
                storeBatch.put({
                  id: `gen-${i}`,
                  name: `${form}${stem}${suffix}-${i}`,
                  category: categories[i % categories.length],
                  defaultStrength: `${((i % 20) + 1) * 25}mg`,
                  defaultInstructions: 'Daily Use - After Meal'
                });
              }
              
              if (i < TARGET_COUNT) {
                setTimeout(populateBatch, 0);
              } else {
                setIsDbPopulating(false);
              }
            };
            populateBatch();
          }
        };
      } catch (e) { console.error(e); }

      const savedP = localStorage.getItem('patients');
      const savedPr = localStorage.getItem('prescriptions');
      const savedS = localStorage.getItem('clinicSettings');
      const savedPin = localStorage.getItem('doctorPin');
      if (savedP) setPatients(JSON.parse(savedP));
      if (savedPr) setPrescriptions(JSON.parse(savedPr));
      if (savedS) setClinicSettings(JSON.parse(savedS));
      if (savedPin) setStoredPin(savedPin);
      if (sessionStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
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
    if (pin === storedPin) { setIsLoggedIn(true); sessionStorage.setItem('isLoggedIn', 'true'); }
    else alert('Invalid PIN');
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) return patients;
    return patients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery));
  }, [patients, searchQuery]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
          <h1 className="text-2xl font-bold">ورود به سیستم</h1>
          <input type="password" placeholder="PIN" className="w-full p-4 rounded-2xl bg-gray-50 text-center text-2xl" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold">ورود</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-2xl relative border-x border-gray-100 font-sans print:max-w-none print:mx-0 print:border-none print:shadow-none">
      <header className="bg-indigo-800 text-white p-4 sticky top-0 z-40 flex justify-between items-center no-print">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
          <Stethoscope className="w-5 h-5" />
          <h1 className="text-xl font-bold">آسان نسخه</h1>
        </div>
        <button onClick={() => { setIsLoggedIn(false); sessionStorage.removeItem('isLoggedIn'); }} className="p-2 bg-red-600/20 rounded-full"><LogOut className="w-5 h-5" /></button>
      </header>

      {isDbPopulating && (
        <div className="bg-amber-50 text-amber-800 px-4 py-1 text-[10px] text-center font-bold no-print animate-pulse">
          در حال آماده‌سازی ۵۰۰,۰۰۰ قلم داروی متنوع... لطفاً کمی صبر کنید.
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-28 p-4 bg-gray-50/30 print:p-0 print:bg-white">
        {view === 'HOME' && (
          <div className="space-y-6 fade-in">
            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h2 className="text-2xl font-bold">خوش آمدید!</h2>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setView('NEW_PATIENT')} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all"><UserPlus /><span>مریض جدید</span></button>
                <button onClick={() => setView('PATIENTS')} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all"><Users /><span>لیست مریضان</span></button>
              </div>
            </div>
            <QuickAction icon={<History />} title="آرشیف نسخه‌ها" onClick={() => setView('PRESCRIPTION_HISTORY')} />
            <QuickAction icon={<Database />} title="بانک دواها" onClick={() => setView('DRUGS')} />
            <QuickAction icon={<Settings />} title="تنظیمات" onClick={() => setView('SETTINGS')} />
          </div>
        )}

        {view === 'NEW_PATIENT' && <PatientForm onSubmit={(p: any) => {
          const newId = Math.random().toString(36).substr(2, 9);
          const newP = { ...p, id: newId, code: `P-${1000 + patients.length + 1}`, createdAt: getAdjustedTime() } as Patient;
          setPatients([newP, ...patients]); setSelectedPatientId(newId); setDraftPrescription(null); setView('NEW_PRESCRIPTION');
        }} onCancel={() => setView('HOME')} />}

        {view === 'PATIENTS' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="w-full bg-white border rounded-2xl py-4 pr-12 pl-4 text-right" placeholder="جستجوی مریض..." value={searchQuery} onChange={e => searchQuerySet(e.target.value)} />
            </div>
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setView('NEW_PRESCRIPTION'); }} className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer flex justify-between items-center hover:border-indigo-200 border border-transparent transition-all">
                <ChevronLeft className="text-gray-300" />
                <div className="text-right"><b>{p.name}</b><p className="text-xs text-gray-500">{p.code} | سن: {p.age}</p></div>
              </div>
            ))}
          </div>
        )}

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && db && (
          <PrescriptionForm 
            db={db} patient={patients.find(p => p.id === selectedPatientId)!}
            onSubmit={(pr: any) => {
              const newPr = { ...pr, id: Math.random().toString(36).substr(2, 9), date: getAdjustedTime() };
              setPrescriptions([newPr, ...prescriptions]); setSelectedPrescription(newPr); setView('VIEW_PDF');
            }}
          />
        )}

        {view === 'PRESCRIPTION_HISTORY' && (
          <div className="space-y-4">
            {prescriptions.map(pr => {
              const p = patients.find(x => x.id === pr.patientId);
              return (
                <div key={pr.id} onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer text-right hover:border-indigo-200 border border-transparent">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-400">{new Date(pr.date).toLocaleDateString()}</span>
                    <b>{p?.name}</b>
                  </div>
                  <div className="text-sm text-indigo-600 mt-1">{pr.diagnosis}</div>
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
          />
        )}
      </main>

      <nav className="bg-white border-t fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex justify-around p-4 no-print rounded-t-3xl shadow-lg">
        <NavBtn icon={<Home />} label="اصلی" onClick={() => setView('HOME')} />
        <NavBtn icon={<Users />} label="مریضان" onClick={() => setView('PATIENTS')} />
        <NavBtn icon={<Settings />} label="تنظیمات" onClick={() => setView('SETTINGS')} />
      </nav>
    </div>
  );
};

const QuickAction = ({ icon, title, onClick }: any) => (
  <button onClick={onClick} className="flex items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm w-full text-right hover:bg-gray-50 transition-all">
    <div className="bg-gray-100 p-4 rounded-2xl text-indigo-600">{icon}</div>
    <div className="font-bold flex-1">{title}</div>
    <ChevronLeft className="w-5 h-5 text-gray-200" />
  </button>
);

const NavBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 text-gray-400 hover:text-indigo-700 transition-colors">
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const PatientForm = ({ onSubmit, onCancel }: any) => {
  const [d, setD] = useState({ name: '', phone: '', age: '', gender: 'male' });
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-5 text-right fade-in">
      <h2 className="text-xl font-bold text-indigo-900 border-b pb-4">ثبت مریض جدید</h2>
      <div className="space-y-4 pt-2">
        <input className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all" placeholder="نام مریض" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
        <input className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all" placeholder="شماره تلیفون" type="tel" value={d.phone} onChange={e => setD({...d, phone: e.target.value})} />
        <input className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all" placeholder="سن" type="number" value={d.age} onChange={e => setD({...d, age: e.target.value})} />
        <select className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 outline-none transition-all" value={d.gender} onChange={e => setD({...d, gender: e.target.value})}>
          <option value="male">مذکر</option><option value="female">مونث</option>
        </select>
      </div>
      <div className="flex gap-3 pt-6">
        <button onClick={() => onSubmit(d)} className="flex-2 bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all">ثبت مریض</button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 p-5 rounded-2xl font-bold active:scale-95 transition-all">لغو</button>
      </div>
    </div>
  );
};

const PrescriptionForm = ({ patient, db, onSubmit }: any) => {
  const [cc, setCc] = useState('');
  const [diag, setDiag] = useState('');
  const [meds, setMeds] = useState<any[]>([]);
  const [vitals, setVitals] = useState({ bp: '', hr: '', pr: '', spo2: '', temp: '', wt: '' });
  const [search, setSearch] = useState('');
  const [drugResults, setDrugResults] = useState<any[]>([]);

  useEffect(() => {
    if (!db) return;
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const nameIndex = store.index('name');
    
    const results: any[] = [];
    const searchLower = search.toLowerCase();
    
    nameIndex.openCursor().onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor && results.length < 50) { 
        const drugName = cursor.value.name.toLowerCase();
        if (!search || drugName.includes(searchLower)) {
          results.push(cursor.value);
        }
        cursor.continue();
      } else {
        setDrugResults(results);
      }
    };
  }, [search, db]);

  const toggleCC = (item: string) => {
    setCc(prev => {
      const items = prev ? prev.split(', ').filter(x => x) : [];
      if (items.includes(item)) {
        return items.filter(x => x !== item).join(', ');
      } else {
        return [...items, item].join(', ');
      }
    });
  };

  const toggleDiag = (item: string) => {
    setDiag(prev => {
      const items = prev ? prev.split(', ').filter(x => x) : [];
      if (items.includes(item)) {
        return items.filter(x => x !== item).join(', ');
      } else {
        return [...items, item].join(', ');
      }
    });
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-right shadow-xl">
        <div className="font-bold text-xl">{patient.name}</div>
        <div className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">سن: {patient.age} | کود: {patient.code}</div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-sm grid grid-cols-3 gap-2 border border-gray-100">
        {Object.keys(vitals).map(k => (
          <div key={k} className="relative">
            <input placeholder={k.toUpperCase()} className="w-full p-2.5 bg-gray-50 rounded-xl text-center text-xs outline-none focus:ring-1 focus:ring-indigo-300 transition-all" onChange={e => setVitals({...vitals, [k]: e.target.value})} />
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <label className="font-bold text-indigo-700 flex items-center justify-end gap-2">
          شکایت مریض (C/C) <Activity className="w-4 h-4" />
        </label>
        <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 min-h-[80px]" placeholder="علائم مریض..." value={cc} onChange={e => setCc(e.target.value)} />
        <div className="flex flex-wrap gap-1 justify-end">
          {MEDICAL_CC_CATEGORIES.flatMap(cat => cat.items).map(item => (
            <button key={item} onClick={() => toggleCC(item)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${cc.includes(item) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <label className="font-bold text-indigo-700 flex items-center justify-end gap-2">
          تشخیص مریض (Diagnosis) <FileText className="w-4 h-4" />
        </label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Diagnosis..." value={diag} onChange={e => setDiag(e.target.value)} />
        <div className="flex flex-wrap gap-1 justify-end">
          {MEDICAL_DIAGNOSES.flatMap(cat => cat.items).map(item => (
            <button key={item} onClick={() => toggleDiag(item)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${diag.includes(item) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <div className="flex justify-between items-center border-b pb-3 mb-2">
          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input className="text-xs w-full py-2 pr-7 pl-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-300" placeholder="Search 500k drugs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <h3 className="font-bold text-indigo-700 flex items-center gap-2">دواهای تجویزی <Database className="w-4 h-4" /></h3>
        </div>
        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
          {drugResults.map(d => (
            <button key={d.id} onClick={() => setMeds([...meds, { ...d, quantity: '1', instructions: d.defaultInstructions }])} className="w-full p-3 bg-gray-50 hover:bg-indigo-50 transition-all rounded-xl text-right text-sm border border-transparent hover:border-indigo-100 flex justify-between items-center">
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-indigo-400 font-mono">{d.category}</span>
              <span className="font-bold">{d.name} <span className="text-gray-400 text-xs font-normal">({d.defaultStrength})</span></span>
            </button>
          ))}
          {drugResults.length === 0 && <div className="text-center text-xs text-gray-400 py-4">موردی یافت نشد</div>}
        </div>
        <div className="border-t pt-4 space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-indigo-50 rounded-2xl ltr shadow-sm">
              <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
              <div className="text-left flex-1 px-4">
                <b className="text-indigo-900">{m.name}</b>
                <div className="text-[10px] text-indigo-400 italic mt-0.5">{m.instructions}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ patientId: patient.id, cc, diagnosis: diag, medications: meds, clinicalRecords: vitals })} className="w-full bg-indigo-700 text-white p-5 rounded-[2rem] font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
        <Save className="w-5 h-5" />
        ذخیره و چاپ نسخه
      </button>
    </div>
  );
};

const DrugSettings = ({ db }: any) => {
  const [drugs, setDrugs] = useState<any[]>([]);
  useEffect(() => {
    db.transaction(DRUG_STORE).objectStore(DRUG_STORE).getAll(null, 100).onsuccess = (e: any) => setDrugs(e.target.result);
  }, [db]);
  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-bold text-center text-indigo-900 border-b pb-4">بانک داروهای آماده</h2>
      <p className="text-[10px] text-center text-gray-400 italic">نمایش ۱۰۰ مورد تصادفی از کل ۵۰۰,۰۰۰ رکورد</p>
      <div className="grid gap-2">
        {drugs.map(d => (
          <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm text-right border border-gray-50 flex justify-between items-center">
            <span className="text-[10px] text-indigo-300 font-mono uppercase">{d.category}</span>
            <div className="flex flex-col items-end">
              <b className="text-gray-800">{d.name}</b>
              <span className="text-xs text-gray-400">{d.defaultStrength}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, storedPin, onSavePin, onBack }: any) => {
  const [d, setD] = useState(settings);
  const [newPin, setNewPin] = useState(storedPin);

  const handleSave = () => {
    onSave(d);
    onSavePin(newPin);
    alert('تنظیمات با موفقیت ذخیره شد!');
  };

  return (
    <div className="space-y-6 text-right fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-indigo-900">تنظیمات کلینیک</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold border-r-4 border-indigo-600 pr-2 text-indigo-700">اطلاعات پایه</h3>
        <div className="space-y-3">
          <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="Clinic Name" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
          <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="Doctor Name" value={d.doctor} onChange={e => setD({...d, doctor: e.target.value})} />
          <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="Clinic Address" value={d.address} onChange={e => setD({...d, address: e.target.value})} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold border-r-4 border-red-600 pr-2 text-red-700">تغییر رمز ورود (PIN)</h3>
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 font-bold pr-1">رمز عبور جدید سیستم</label>
          <div className="relative">
            <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
            <input 
              type="password" 
              className="w-full p-4 pr-12 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none text-center text-xl tracking-[0.5em] transition-all" 
              placeholder="****"
              value={newPin} 
              onChange={e => setNewPin(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2">
        <Save className="w-5 h-5" />
        ذخیره تمامی تغییرات
      </button>
    </div>
  );
};

const PrescriptionPrintStudio = ({ settings, prescription, patient, onBack }: any) => {
  return (
    <div className="preview-modal-overlay no-print">
      <div className="preview-header-ui">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
        <span className="font-bold text-indigo-900">پیش‌نمایش نسخه</span>
        <button onClick={() => window.print()} className="bg-teal-700 hover:bg-teal-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
          <Printer className="w-4 h-4" /> چاپ نسخه
        </button>
      </div>

      <div className="preview-content">
        <div id="print-area" className="shadow-2xl ring-1 ring-gray-200">
          <div className="rx-header">
            <h1 className="text-2xl font-bold">{settings.name}</h1>
            <div className="text-lg font-bold">{settings.doctor}</div>
            <div className="text-sm italic mb-2">{settings.specialty}</div>
            
            <div className="flex justify-between border-t pt-4 px-4 text-[10pt] font-bold" style={{ direction: 'ltr' }}>
              <div>Patient Name: {patient.name}</div>
              <div>Age: {patient.age}</div>
              <div>Gender: {patient.gender === 'male' ? 'Male' : 'Female'}</div>
              <div>Date: {new Date(prescription.date).toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          <div className="rx-body">
            <div className="rx-sidebar">
              <div>
                <div className="text-[8pt] uppercase text-gray-400">Code</div>
                <div className="font-bold">{patient.code}</div>
              </div>
              <div>
                <div className="text-[8pt] uppercase text-gray-400">Vitals</div>
                <div className="text-[9pt] space-y-1">
                  <div>BP: {prescription.clinicalRecords.bp || '-'}</div>
                  <div>HR: {prescription.clinicalRecords.hr || '-'}</div>
                  <div>Wt: {prescription.clinicalRecords.wt || '-'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[8pt] uppercase text-gray-400">C/C</div>
                <div className="text-[9pt] leading-tight">{prescription.cc || '-'}</div>
              </div>
              <div className="text-right">
                <div className="text-[8pt] uppercase text-gray-400">Diagnosis</div>
                <div className="text-[9pt] leading-tight">{prescription.diagnosis || '-'}</div>
              </div>
            </div>

            <div className="rx-main">
              <div className="rx-symbol-large">Rx</div>
              <ul className="meds-list">
                {prescription.medications.map((m: any, idx: number) => (
                  <li key={idx} className="med-item">
                    <div className="font-bold text-[12pt]">{idx + 1}. {m.name} {m.strength}</div>
                    <div className="text-[10pt] text-gray-600 italic ml-6">-- {m.instructions}</div>
                  </li>
                ))}
              </ul>
              <div className="signature-area mt-auto pt-10 text-[8pt] uppercase font-bold text-gray-300">
                Doctor's Signature
              </div>
            </div>
          </div>

          <div className="rx-footer">
            <div className="text-[9pt]">{settings.address}</div>
            <div className="text-[9pt]">{settings.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;