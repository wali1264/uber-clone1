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
  { cat: 'General', items: ['Fever', 'Chills', 'Fatigue', 'Weight loss', 'Appetite loss'] },
  { cat: 'Pain', items: ['Headache', 'Chest pain', 'Abdominal pain', 'Back pain'] },
  { cat: 'Respiratory', items: ['Cough', 'Shortness of breath', 'Sore throat'] }
];

const MEDICAL_DIAGNOSES = [
  { cat: 'Respiratory', items: ['Acute Bronchitis', 'Pneumonia', 'Bronchial Asthma'] },
  { cat: 'GI', items: ['Acute Gastritis', 'Peptic Ulcer', 'Gastroenteritis'] }
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
          if (countReq.result === 0) INITIAL_DRUGS.forEach(d => store.add(d));
        };
      } catch (e) { console.error(e); }

      const savedP = localStorage.getItem('patients');
      const savedPr = localStorage.getItem('prescriptions');
      const savedS = localStorage.getItem('clinicSettings');
      if (savedP) setPatients(JSON.parse(savedP));
      if (savedPr) setPrescriptions(JSON.parse(savedPr));
      if (savedS) setClinicSettings(JSON.parse(savedS));
      if (sessionStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
    };
    loadAppData();
  }, []);

  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
  }, [patients, prescriptions, clinicSettings]);

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
        <div className="w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
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

      <main className="flex-1 overflow-y-auto pb-28 p-4 bg-gray-50/30 print:p-0 print:bg-white">
        {view === 'HOME' && (
          <div className="space-y-6 fade-in">
            <div className="bg-gradient-to-br from-indigo-800 to-blue-900 rounded-[2.5rem] p-8 text-white shadow-xl">
              <h2 className="text-2xl font-bold">خوش آمدید!</h2>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setView('NEW_PATIENT')} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2"><UserPlus /><span>مریض جدید</span></button>
                <button onClick={() => setView('PATIENTS')} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2"><Users /><span>لیست مریضان</span></button>
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
            <input className="w-full bg-white border rounded-2xl py-4 px-4 text-right" placeholder="جستجوی مریض..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setView('NEW_PRESCRIPTION'); }} className="bg-white p-4 rounded-2xl shadow-sm cursor-pointer flex justify-between items-center">
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
                <div key={pr.id} onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="bg-white p-5 rounded-2xl shadow-sm cursor-pointer text-right">
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
        {view === 'SETTINGS' && <ClinicSettingsForm settings={clinicSettings} onSave={setClinicSettings} onBack={() => setView('HOME')} />}
        
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
  <button onClick={onClick} className="flex items-center gap-4 bg-white p-5 rounded-3xl border shadow-sm w-full text-right">
    <div className="bg-gray-100 p-4 rounded-2xl">{icon}</div>
    <div className="font-bold flex-1">{title}</div>
    <ChevronLeft className="w-5 h-5 text-gray-200" />
  </button>
);

const NavBtn = ({ icon, label, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 text-gray-400 hover:text-indigo-700">
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);

const PatientForm = ({ onSubmit, onCancel }: any) => {
  const [d, setD] = useState({ name: '', age: '', gender: 'male' });
  return (
    <div className="bg-white p-8 rounded-[2.5rem] space-y-5 text-right">
      <h2 className="text-xl font-bold">ثبت مریض جدید</h2>
      <input className="w-full p-4 rounded-2xl bg-gray-50" placeholder="Name" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
      <input className="w-full p-4 rounded-2xl bg-gray-50" placeholder="Age" type="number" value={d.age} onChange={e => setD({...d, age: e.target.value})} />
      <select className="w-full p-4 rounded-2xl bg-gray-50" value={d.gender} onChange={e => setD({...d, gender: e.target.value})}>
        <option value="male">Male</option><option value="female">Female</option>
      </select>
      <div className="flex gap-3 pt-6">
        <button onClick={() => onSubmit(d)} className="flex-1 bg-indigo-700 text-white p-5 rounded-2xl font-bold">ثبت</button>
        <button onClick={onCancel} className="flex-1 bg-gray-100 p-5 rounded-2xl">لغو</button>
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
    tx.objectStore(DRUG_STORE).openCursor().onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor) {
        if (!search || cursor.value.name.toLowerCase().includes(search.toLowerCase())) {
          setDrugResults(prev => [...prev, cursor.value].slice(0, 10));
        }
        cursor.continue();
      }
    };
    setDrugResults([]);
  }, [search, db]);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-right">
        <div className="font-bold text-xl">{patient.name}</div>
        <div className="text-xs text-indigo-400 mt-1">Age: {patient.age} | Code: {patient.code}</div>
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-sm grid grid-cols-3 gap-2">
        {Object.keys(vitals).map(k => (
          <input key={k} placeholder={k.toUpperCase()} className="p-2 bg-gray-50 rounded-xl text-center text-xs" onChange={e => setVitals({...vitals, [k]: e.target.value})} />
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right">
        <label className="font-bold">Complaints (C/C)</label>
        <textarea className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Symptoms..." value={cc} onChange={e => setCc(e.target.value)} />
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right">
        <label className="font-bold">Diagnosis</label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm" placeholder="Diagnosis..." value={diag} onChange={e => setDiag(e.target.value)} />
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right">
        <div className="flex justify-between items-center">
          <input className="text-xs p-2 border rounded-xl" placeholder="Search drugs..." value={search} onChange={e => setSearch(e.target.value)} />
          <h3 className="font-bold">Meds</h3>
        </div>
        <div className="space-y-2">
          {drugResults.map(d => (
            <button key={d.id} onClick={() => setMeds([...meds, { ...d, quantity: '1', instructions: d.defaultInstructions }])} className="w-full p-3 bg-gray-50 rounded-xl text-right text-sm">+{d.name} {d.defaultStrength}</button>
          ))}
        </div>
        <div className="border-t pt-4 space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="flex justify-between items-center p-2 bg-indigo-50 rounded-xl ltr">
              <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>
              <div className="text-left flex-1 px-3"><b>{m.name}</b><br/><span className="text-[10px]">{m.instructions}</span></div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ patientId: patient.id, cc, diagnosis: diag, medications: meds, clinicalRecords: vitals })} className="w-full bg-indigo-700 text-white p-5 rounded-[2rem] font-bold shadow-xl">ذخیره و چاپ نسخه</button>
    </div>
  );
};

const DrugSettings = ({ db }: any) => {
  const [drugs, setDrugs] = useState<any[]>([]);
  useEffect(() => {
    db.transaction(DRUG_STORE).objectStore(DRUG_STORE).getAll().onsuccess = (e: any) => setDrugs(e.target.result);
  }, [db]);
  return (
    <div className="space-y-4">
      <h2 className="font-bold text-center">بانک دواها</h2>
      {drugs.map(d => (
        <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm text-right"><b>{d.name}</b><p className="text-xs text-gray-500">{d.category}</p></div>
      ))}
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, onBack }: any) => {
  const [d, setD] = useState(settings);
  return (
    <div className="space-y-6 text-right">
      <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft /></button>
      <input className="w-full p-4 rounded-2xl border" placeholder="Clinic Name" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
      <input className="w-full p-4 rounded-2xl border" placeholder="Doctor" value={d.doctor} onChange={e => setD({...d, doctor: e.target.value})} />
      <input className="w-full p-4 rounded-2xl border" placeholder="Address" value={d.address} onChange={e => setD({...d, address: e.target.value})} />
      <button onClick={() => { onSave(d); alert('Saved!'); }} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold">Save Settings</button>
    </div>
  );
};

const PrescriptionPrintStudio = ({ settings, prescription, patient, onBack }: any) => {
  return (
    <div className="preview-modal-overlay no-print">
      <div className="preview-header-ui">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        <span className="font-bold">پیش‌نمایش نسخه</span>
        <button onClick={() => window.print()} className="bg-teal-700 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2">
          <Printer className="w-4 h-4" /> چاپ نسخه
        </button>
      </div>

      <div className="preview-content">
        <div id="print-area">
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