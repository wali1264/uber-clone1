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
  ChevronUp,
  Pill,
  Bookmark,
  BriefcaseMedical,
  Languages,
  FileBox,
  Maximize2,
  Key,
  Star,
  FileDown,
  Edit,
  Plus,
  Minus
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings, DiagnosisTemplate } from './types';
import { INITIAL_DRUGS, DEFAULT_CLINIC_SETTINGS, ICD_DIAGNOSES } from './constants';

// --- IndexedDB Helper ---
const DB_NAME = 'AsanNoskhaDB';
const DB_VERSION = 2; 
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
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const MEDICAL_CC_CATEGORIES = [
  { cat: 'General Symptoms', items: ['Fever', 'Chills', 'Fatigue', 'Weight loss', 'Loss of appetite', 'Weakness', 'Body Ache'] },
  { cat: 'Pain', items: ['Headache', 'Chest pain', 'Abdominal pain', 'Back pain', 'Joint pain', 'Muscle pain', 'Pain on movement'] },
  { cat: 'Respiratory', items: ['Cough', 'Shortness of breath', 'Sore throat', 'Wheezing', 'Runny nose', 'Chest tightness'] },
  { cat: 'Cardiovascular', items: ['Palpitations', 'Chest tightness', 'Dizziness', 'Syncope', 'Hypertension', 'Edema'] },
  { cat: 'Gastrointestinal', items: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Heartburn', 'Abdominal bloating', 'Epigastric pain'] },
  { cat: 'Genitourinary', items: ['Dysuria', 'Frequency', 'Urgency', 'Hematuria', 'Flank pain'] },
  { cat: 'Neurological', items: ['Dizziness', 'Seizure', 'Weakness', 'Numbness', 'Loss of consciousness', 'Insomnia', 'Tremor'] },
  { cat: 'Skin', items: ['Rash', 'Itching', 'Swelling', 'Redness'] },
  { cat: 'Pediatric', items: ['Poor feeding', 'Crying', 'Fever', 'Vomiting', 'Loose motion'] }
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
  const [prescriptionToEdit, setPrescriptionToEdit] = useState<Prescription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [db, setDb] = useState<IDBDatabase | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const savedPatients = localStorage.getItem('patients');
      const savedPrescriptions = localStorage.getItem('prescriptions');
      const savedSettings = localStorage.getItem('clinicSettings');
      const savedLogin = sessionStorage.getItem('isLoggedIn');
      const savedPin = localStorage.getItem('doctorPin');

      if (savedPatients) setPatients(JSON.parse(savedPatients));
      if (savedPrescriptions) setPrescriptions(JSON.parse(savedPrescriptions));
      if (savedSettings) setClinicSettings(JSON.parse(savedSettings));
      if (savedLogin === 'true') setIsLoggedIn(true);
      if (savedPin) setStoredPin(savedPin);

      try {
        const database = await initDB();
        setDb(database);
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
    const newPatient: Patient = { ...p, id: newId, code: `P-${maxCode + 1}`, createdAt: Date.now() };
    setPatients(prev => [newPatient, ...prev]);
    setSelectedPatientId(newId);
    setPrescriptionToEdit(null);
    setView('NEW_PRESCRIPTION');
  };

  const handleSavePrescription = (pr: Omit<Prescription, 'id' | 'date'> & { id?: string }) => {
    if (pr.id) {
      // Update existing
      const updatedPr: Prescription = { ...pr, id: pr.id, date: Date.now() } as Prescription;
      setPrescriptions(prev => prev.map(p => p.id === pr.id ? updatedPr : p));
      setSelectedPrescription(updatedPr);
    } else {
      // Add new
      const newPr: Prescription = { ...pr, id: Math.random().toString(36).substr(2, 9), date: Date.now() } as Prescription;
      setPrescriptions(prev => [newPr, ...prev]);
      setSelectedPrescription(newPr);
    }
    setPrescriptionToEdit(null);
    setView('VIEW_PDF');
  };

  const handleCopyPrescription = (old: Prescription, newPatientId: string) => {
    const newPr: Prescription = { ...old, id: Math.random().toString(36).substr(2, 9), patientId: newPatientId, date: Date.now() };
    setPrescriptions(prev => [newPr, ...prev]);
    setSelectedPrescription(newPr);
    setPrescriptionToEdit(null);
    setView('VIEW_PDF');
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-sm bg-white rounded-xl p-8 shadow-lg text-center space-y-6 border border-slate-200">
          <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">ورود به سیستم</h1>
          <input 
            type="password"
            className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xl tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="****"
            value={pin}
            onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button 
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white p-3.5 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
          >
            ورود داکتر
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-white shadow-xl relative border-x border-slate-200">
      <header className="bg-indigo-700 text-white px-4 py-3 sticky top-0 z-20 flex justify-between items-center no-print shadow-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
          <Stethoscope className="w-5 h-5 text-indigo-200" />
          <h1 className="text-lg font-bold tracking-tight">آسان نسخه</h1>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'HOME' && (
            <button onClick={() => setView('HOME')} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-all">
              <Home className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleLogout} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-md transition-all group" title="خروج">
            <LogOut className="w-4 h-4 text-red-100" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4 bg-slate-50/50">
        {view === 'HOME' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
               <h2 className="text-xl font-bold mb-1">سلام، {clinicSettings.doctor.split(' ')[1] || 'داکتر'} صاحب!</h2>
               <p className="text-indigo-100 text-xs">{new Date().toLocaleDateString('fa-AF', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
               <div className="mt-6 flex gap-3">
                 <button onClick={() => setView('NEW_PATIENT')} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-lg flex flex-col items-center gap-1 border border-white/5 active:scale-95 transition-all">
                   <UserPlus className="w-5 h-5 text-white" />
                   <span className="text-[10px] font-bold">مریض جدید</span>
                 </button>
                 <button onClick={() => setView('PATIENTS')} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-lg flex flex-col items-center gap-1 border border-white/5 active:scale-95 transition-all">
                   <Users className="w-5 h-5 text-white" />
                   <span className="text-[10px] font-bold">لیست مریضان</span>
                 </button>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <QuickAction icon={<History />} bg="bg-blue-50 text-blue-600" title="تاریخچه نسخه‌ها" onClick={() => setView('PRESCRIPTION_HISTORY')} />
              <QuickAction icon={<FileText />} bg="bg-emerald-50 text-emerald-600" title="بانک دواها" onClick={() => setView('DRUGS')} />
              <QuickAction icon={<Settings />} bg="bg-slate-50 text-slate-600" title="تنظیمات" onClick={() => setView('SETTINGS')} />
            </div>
          </div>
        )}

        {view === 'PATIENTS' && (
          <div className="space-y-3 animate-in fade-in">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-full bg-white border border-slate-200 rounded-lg py-2.5 pr-10 pl-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
                placeholder="جستجوی مریض..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              {filteredPatients.map(p => (
                <div key={p.id} className="bg-white border border-slate-100 rounded-lg p-3 flex justify-between items-center shadow-sm hover:border-indigo-200 cursor-pointer active:scale-[0.99] transition-all" onClick={() => { setSelectedPatientId(p.id); setPrescriptionToEdit(null); setView('NEW_PRESCRIPTION'); }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-mono">{p.code}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">فرزند: {p.fatherName} | {p.phone}</div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'NEW_PATIENT' && <PatientForm onSubmit={handleAddPatient} onCancel={() => setView('HOME')} />}

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && db && (
          <PrescriptionForm 
            db={db}
            patient={currentSelectedPatient || patients.find(p => p.id === selectedPatientId) || patients[0]}
            previousPrescriptions={prescriptions.filter(pr => pr.patientId === selectedPatientId)}
            initialData={prescriptionToEdit}
            onSubmit={handleSavePrescription}
            onCancel={() => setView('PATIENTS')}
            onCopy={handleCopyPrescription}
          />
        )}

        {view === 'PRESCRIPTION_HISTORY' && (
          <div className="space-y-3 animate-in fade-in">
            {prescriptions.map(pr => {
              const p = patients.find(x => x.id === pr.patientId);
              return (
                <div key={pr.id} onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:border-indigo-200 cursor-pointer transition-all">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-700 text-sm">{p?.name || 'مریض نامعلوم'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(pr.date).toLocaleDateString('fa-AF')}</span>
                  </div>
                  <div className="text-xs text-indigo-600 font-medium mt-1 truncate">تشخیص: {pr.diagnosis}</div>
                </div>
              );
            })}
          </div>
        )}

        {view === 'DRUGS' && db && <DrugSettings db={db} />}
        {view === 'SETTINGS' && (
          <ClinicSettingsForm 
            settings={clinicSettings} 
            onSave={setClinicSettings} 
            storedPin={storedPin} 
            onSavePin={setStoredPin} 
            onBack={() => setView('HOME')} 
          />
        )}
        {view === 'VIEW_PDF' && selectedPrescription && (
          <PrescriptionPrintView 
            settings={clinicSettings}
            prescription={selectedPrescription} 
            patient={patients.find(p => p.id === selectedPrescription.patientId)!}
            onEdit={() => {
              setPrescriptionToEdit(selectedPrescription);
              setSelectedPatientId(selectedPrescription.patientId);
              setView('NEW_PRESCRIPTION');
            }}
            onBack={() => setView('HOME')}
          />
        )}
      </main>

      <nav className="bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 max-w-lg mx-auto flex justify-around items-center py-2 z-30 no-print shadow-inner">
        <NavBtn active={view === 'HOME'} icon={<Home />} label="اصلی" onClick={() => setView('HOME')} />
        <NavBtn active={view === 'PATIENTS' || view === 'NEW_PATIENT'} icon={<Users />} label="مریضان" onClick={() => setView('PATIENTS')} />
        <NavBtn active={view === 'PRESCRIPTION_HISTORY'} icon={<History />} label="تاریخچه" onClick={() => setView('PRESCRIPTION_HISTORY')} />
        <NavBtn active={view === 'SETTINGS'} icon={<Settings />} label="تنظیمات" onClick={() => setView('SETTINGS')} />
      </nav>
    </div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, bg: string, title: string, onClick: () => void }> = ({ icon, bg, title, onClick }) => (
  <button onClick={onClick} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-right w-full">
    <div className={`${bg} p-2 rounded-md`}>{React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}</div>
    <div className="font-bold text-slate-700 text-sm">{title}</div>
  </button>
);

const NavBtn: React.FC<{ active: boolean, icon: React.ReactNode, label: string, onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    <span className="text-[9px] font-bold">{label}</span>
  </button>
);

const PatientForm: React.FC<{ onSubmit: (p: any) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [data, setData] = useState({ name: '', fatherName: '', phone: '', age: '', gender: 'male' as const });
  const isFormValid = data.name.trim().length >= 2;
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4 animate-in slide-in-from-bottom duration-300">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2">ثبت هویت مریض</h2>
      <div className="space-y-3">
        <FormInput label="نام مریض" value={data.name} onChange={v => setData({...data, name: v})} placeholder="احمد ..." />
        <FormInput label="نام پدر" value={data.fatherName} onChange={v => setData({...data, fatherName: v})} />
        <FormInput label="موبایل" value={data.phone} onChange={v => setData({...data, phone: v})} />
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="سن" value={data.age} type="number" onChange={v => setData({...data, age: v})} />
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 pr-1">جنسیت</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none font-bold" value={data.gender} onChange={e => setData({...data, gender: e.target.value as any})}>
              <option value="male">مرد</option>
              <option value="female">زن</option>
            </select>
          </div>
        </div>
      </div>
      <button disabled={!isFormValid} onClick={() => onSubmit(data)} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold shadow-md disabled:opacity-50 transition-all">تأیید و شروع نسخه</button>
    </div>
  );
};

const FormInput: React.FC<{ label: string, value: string, placeholder?: string, type?: string, onChange: (v: string) => void }> = ({ label, value, placeholder, type = 'text', onChange }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 pr-1">{label}</label>
    <input 
      type={type}
      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all font-bold"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const PrescriptionForm: React.FC<{
  db: IDBDatabase, patient: Patient, previousPrescriptions: Prescription[],
  initialData?: Prescription | null,
  onSubmit: (p: any) => void, onCancel: () => void, onCopy: (old: Prescription, newId: string) => void
}> = ({ db, patient, previousPrescriptions, initialData, onSubmit, onCancel, onCopy }) => {
  const [cc, setCc] = useState(initialData?.cc || '');
  const [diagnosis, setDiagnosis] = useState(initialData?.diagnosis || '');
  const [diagSearch, setDiagSearch] = useState(initialData?.diagnosis || '');
  const [showDiagList, setShowDiagList] = useState(false);
  const [meds, setMeds] = useState<Medication[]>(initialData?.medications || []);
  const [records, setRecords] = useState<ClinicalRecords>(initialData?.clinicalRecords || { bp: '', hr: '', pr: '', spo2: '', temp: '' });
  const [showDrugList, setShowDrugList] = useState(false);
  const [showCcModal, setShowCcModal] = useState(false);

  const filteredDiagnoses = useMemo(() => {
    if (!diagSearch) return ICD_DIAGNOSES.slice(0, 10);
    const q = diagSearch.toLowerCase();
    return ICD_DIAGNOSES.filter(d => d.title.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)).slice(0, 20);
  }, [diagSearch]);

  const toggleCc = (val: string) => {
    const ccList = cc ? cc.split(',').map(s => s.trim()).filter(Boolean) : [];
    if (ccList.includes(val)) {
      setCc(ccList.filter(v => v !== val).join(', '));
    } else {
      setCc(ccList.length > 0 ? `${cc}, ${val}` : val);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-slate-800 p-4 rounded-xl text-white shadow-sm flex justify-between items-center">
        <div>
          <div className="font-bold text-sm">{patient.name}</div>
          <div className="text-[10px] text-slate-400">{patient.age} ساله | {patient.code}</div>
        </div>
        {!initialData && previousPrescriptions.length > 0 && (
          <button onClick={() => onCopy(previousPrescriptions[0], patient.id)} className="bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"><Copy className="w-3 h-3" /> کاپی نسخه قبلی</button>
        )}
        {initialData && (
          <span className="bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-bold">در حال ویرایش</span>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
           <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">شکایه مریض (Chief Complaint)</h3>
           <button onClick={() => setShowCcModal(true)} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:bg-indigo-100">
             <Search className="w-3 h-3" /> انتخاب سریع
           </button>
        </div>
        <input 
          className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold text-slate-800 outline-none focus:border-indigo-500" 
          placeholder="مثلاً: Fever, Cough..." 
          value={cc} 
          onChange={e => setCc(e.target.value)} 
        />
      </div>

      {showCcModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                 <span className="font-bold text-slate-700">ساختار شکایه مریض (CC)</span>
                 <button onClick={() => setShowCcModal(false)} className="p-1 hover:bg-slate-200 rounded-full transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 overflow-y-auto space-y-6">
                {MEDICAL_CC_CATEGORIES.map(category => (
                  <div key={category.cat} className="space-y-2">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest border-b pb-1">{category.cat}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {category.items.map(item => {
                        const isSelected = cc.split(',').map(s => s.trim()).includes(item);
                        return (
                          <button 
                            key={item} 
                            onClick={() => toggleCc(item)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300'}`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-slate-50 border-t flex gap-2">
                 <button onClick={() => setShowCcModal(false)} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm">تأیید</button>
              </div>
           </div>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">علایم حیاتی (Vital Signs)</h3>
        <div className="grid grid-cols-5 gap-1.5">
          <RecordInput label="BP" value={records.bp} onChange={v => setRecords({...records, bp: v})} />
          <RecordInput label="HR" value={records.hr} onChange={v => setRecords({...records, hr: v})} />
          <RecordInput label="PR" value={records.pr} onChange={v => setRecords({...records, pr: v})} />
          <RecordInput label="SpO2" value={records.spo2} onChange={v => setRecords({...records, spo2: v})} />
          <RecordInput label="Temp" value={records.temp} onChange={v => setRecords({...records, temp: v})} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 relative z-30">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تشخیص (Diagnosis)</h3>
        <div className="relative">
          <input className="w-full p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-sm font-bold outline-none" placeholder="جستجوی بیماری..." value={diagSearch} onFocus={() => setShowDiagList(true)} onChange={e => setDiagSearch(e.target.value)} />
          {showDiagList && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-y-auto max-h-48 z-40 animate-in fade-in slide-in-from-top-1">
              {filteredDiagnoses.map((d, i) => (
                <div key={i} onClick={() => { setDiagnosis(d.title); setDiagSearch(d.title); setShowDiagList(false); }} className="p-2 border-b last:border-0 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 flex justify-between">
                  <span>{d.title}</span>
                  <span className="text-[9px] text-slate-300 font-mono">{d.code}</span>
                </div>
              ))}
              <div className="p-2 bg-slate-50 text-[10px] text-indigo-600 font-bold text-center cursor-pointer" onClick={() => { setDiagnosis(diagSearch); setShowDiagList(false); }}>استفاده از متن تایپ شده</div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm">لیست دواها (Rx)</h3>
          <button onClick={() => setShowDrugList(true)} className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:bg-indigo-100"><PlusCircle className="w-3.5 h-3.5" /> افزودن دوا</button>
        </div>
        <div className="space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group animate-in slide-in-from-right duration-200">
               <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="absolute top-2 left-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
               <div className="font-bold text-indigo-700 text-sm">{m.name} <span className="text-[10px] text-slate-400 ml-2">{m.strength}</span></div>
               <div className="text-[10px] text-slate-500 mt-1">{m.instructions} | تعداد: {m.quantity}</div>
            </div>
          ))}
          {meds.length === 0 && <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg text-slate-300 text-xs">هنوز دوایی اضافه نشده است.</div>}
        </div>
      </div>

      <button onClick={() => onSubmit({ id: initialData?.id, patientId: patient.id, cc, diagnosis, clinicalRecords: records, medications: meds })} disabled={!diagnosis || meds.length === 0} className="w-full bg-indigo-600 text-white p-3.5 rounded-lg font-bold shadow-lg disabled:opacity-50 transition-all hover:bg-indigo-700">{initialData ? 'ذخیره تغییرات' : 'تکمیل و مشاهده نسخه'}</button>

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
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const cursor = store.openCursor();
    const found: DrugTemplate[] = [];
    const query = q.toLowerCase();
    cursor.onsuccess = (e) => {
      const cur = (e.target as any).result;
      if (cur && found.length < 30) {
        const val = cur.value;
        if (!query || val.name.toLowerCase().includes(query) || val.brandNames?.toLowerCase().includes(query)) found.push(val);
        cur.continue();
      } else setResults(found);
    };
  }, [q, db]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <span className="font-bold text-slate-700">انتخاب دوا</span>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-all"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <input className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold outline-none mb-3" placeholder="نام دوا را تایپ کنید..." value={q} onChange={e => setQ(e.target.value)} autoFocus />
          <button onClick={() => onAdd()} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold mb-3 hover:bg-indigo-700">دوای جدید (دستی)</button>
          <div className="overflow-y-auto max-h-64 space-y-1">
            {results.map(t => (
              <div key={t.id} onClick={() => onAdd(t)} className="p-2.5 hover:bg-indigo-50 border-b border-slate-50 cursor-pointer rounded-md group">
                <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{t.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{t.brandNames || t.category}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RecordInput: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[8px] font-bold text-slate-400 text-center">{label}</label>
    <input className="w-full p-1.5 bg-slate-50 border border-slate-100 rounded-md text-center text-[10px] font-bold outline-none focus:border-indigo-400" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

type Language = 'en' | 'dr' | 'ps';
type PaperSize = 'A4' | 'A5' | 'Custom';

const TRANSLATIONS: Record<Language, any> = {
  en: { dir: 'ltr', header: 'PRESCRIPTION', date: 'Date', code: 'Code', name: 'Patient', age: 'Age', gender: 'Gender', phone: 'Phone', cc: 'C.C', diagnosis: 'Diagnosis', qty: 'Qty', address: 'Contact', signature: 'Signature', male: 'Male', female: 'Female' },
  dr: { dir: 'rtl', header: 'نسخه طبی', date: 'تاریخ', code: 'کد', name: 'نام مریض', age: 'سن', gender: 'جنسیت', phone: 'موبایل', cc: 'شکایه اصلی', diagnosis: 'تشخیص', qty: 'تعداد', address: 'آدرس و تماس', signature: 'امضای داکتر', male: 'مرد', female: 'زن' },
  ps: { dir: 'rtl', header: 'نسخه', date: 'نیټه', code: 'کوډ', name: 'د ناروغ نوم', age: 'عمر', gender: 'جنسیت', phone: 'تلیفون', cc: 'شکایت', diagnosis: 'تشخیص', qty: 'شمیر', address: 'پته', signature: 'لاسلیک', male: 'نارینه', female: 'ښځینه' }
};

const PrescriptionPrintView: React.FC<{ settings: ClinicSettings, prescription: Prescription, patient: Patient, onEdit: () => void, onBack: () => void }> = ({ settings, prescription, patient, onEdit, onBack }) => {
  const [fontSize, setFontSize] = useState(14);
  const [lang, setLang] = useState<Language>('dr');
  const [paperSize, setPaperSize] = useState<PaperSize>('A4');
  const [customWidth, setCustomWidth] = useState(210);
  const [customHeight, setCustomHeight] = useState(297);
  const t = TRANSLATIONS[lang];

  const handlePrint = () => {
    window.print();
  };

  const PRESET_SIZES = [
    { name: 'A6', w: 105, h: 148 },
    { name: 'B5', w: 176, h: 250 },
    { name: 'Note S', w: 100, h: 150 },
    { name: 'Note M', w: 148, h: 210 },
  ];

  return (
    <div className="space-y-4 pb-20 no-print-container animate-in fade-in">
      <div className="flex flex-col gap-3 no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-[11px]">
        <div className="flex justify-between items-center flex-row-reverse border-b pb-2">
          <span className="font-bold text-slate-600 flex items-center gap-1 flex-row-reverse"><Type className="w-3.5 h-3.5" /> قلم: {fontSize}px</span>
          <div className="flex items-center gap-2">
            <input type="range" min="10" max="40" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <input type="number" value={fontSize} onChange={e => setFontSize(parseInt(e.target.value) || 10)} className="w-10 p-1 bg-slate-50 border rounded text-center font-bold" />
          </div>
        </div>
        
        <div className="flex justify-between items-center flex-row-reverse border-b pb-2">
           <span className="font-bold text-slate-600">زبان:</span>
           <div className="flex bg-slate-100 p-0.5 rounded-lg">
             {(['en', 'dr', 'ps'] as Language[]).map(l => (
               <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 rounded-md text-[10px] font-bold ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{l.toUpperCase()}</button>
             ))}
           </div>
        </div>

        <div className="flex justify-between items-center flex-row-reverse border-b pb-2">
           <span className="font-bold text-slate-600">کاغذ:</span>
           <div className="flex bg-slate-100 p-0.5 rounded-lg">
             {(['A4', 'A5', 'Custom'] as PaperSize[]).map(s => (
               <button key={s} onClick={() => setPaperSize(s)} className={`px-3 py-1 rounded-md text-[10px] font-bold ${paperSize === s ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{s === 'Custom' ? 'دلخواه' : s}</button>
             ))}
           </div>
        </div>

        {paperSize === 'Custom' && (
          <div className="space-y-3 animate-in slide-in-from-top-1 px-1 border-t pt-2">
             <div className="flex flex-col gap-1">
               <span className="text-[9px] font-bold text-slate-400">اندازه‌های پیشنهادی (کلیک کنید):</span>
               <div className="flex gap-2 overflow-x-auto pb-1">
                 {PRESET_SIZES.map(sz => (
                   <button 
                     key={sz.name} 
                     onClick={() => { setCustomWidth(sz.w); setCustomHeight(sz.h); }}
                     className={`px-2 py-1.5 rounded-md text-[9px] font-bold whitespace-nowrap border transition-all ${customWidth === sz.w && customHeight === sz.h ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-400'}`}
                   >
                     {sz.name} ({sz.w}x{sz.h})
                   </button>
                 ))}
               </div>
             </div>
             <div className="flex justify-between items-center gap-2">
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[9px] text-slate-400">ارتفاع (mm):</span>
                 <div className="flex items-center gap-1">
                   <button onClick={() => setCustomHeight(prev => Math.max(0, prev - 1))} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                   <input type="number" value={customHeight} onChange={e => setCustomHeight(parseInt(e.target.value) || 0)} className="w-16 p-1 bg-slate-50 border rounded text-center text-[10px] font-bold outline-none" />
                   <button onClick={() => setCustomHeight(prev => prev + 1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                 </div>
               </div>
               <div className="flex flex-col items-center gap-1">
                 <span className="text-[9px] text-slate-400">عرض (mm):</span>
                 <div className="flex items-center gap-1">
                   <button onClick={() => setCustomWidth(prev => Math.max(0, prev - 1))} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                   <input type="number" value={customWidth} onChange={e => setCustomWidth(parseInt(e.target.value) || 0)} className="w-16 p-1 bg-slate-50 border rounded text-center text-[10px] font-bold outline-none" />
                   <button onClick={() => setCustomWidth(prev => prev + 1)} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                 </div>
               </div>
             </div>
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handlePrint} 
            className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Printer className="w-4 h-4" /> چاپ A4
          </button>
          <button 
            onClick={onEdit} 
            className="flex-1 bg-amber-500 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Edit className="w-4 h-4" /> ویرایش نسخه
          </button>
          <button onClick={onBack} className="bg-slate-100 text-slate-500 px-4 rounded-lg"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* The guaranteed printArea container */}
      <div 
        id="printArea"
        dir="ltr"
        style={{ 
          fontSize: `${fontSize}px`,
          boxSizing: 'border-box',
        }}
        className="bg-white border border-slate-200 shadow-xl flex flex-col p-8 text-left print:shadow-none print:border-none"
      >
        <div className={`border-b-2 border-slate-800 pb-2 mb-4 flex justify-between items-end flex-row-reverse`}>
          <div className="text-right">
            <h1 className="text-lg font-black text-slate-900">{settings.name}</h1>
            <p className="text-xs font-bold text-indigo-700">{settings.doctor} | {settings.specialty}</p>
          </div>
          <div className="text-left">
            <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">{t.header}</span>
            <p className="text-[9px] text-slate-400 mt-1">{t.date}: {new Date(prescription.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fa-AF')}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg mb-6 text-[10px] text-left">
           <InfoItem label={t.name} value={patient.name} />
           <InfoItem label={t.age} value={patient.age} />
           <InfoItem label={t.gender} value={patient.gender === 'male' ? t.male : t.female} />
           <InfoItem label={t.phone} value={patient.phone} />
        </div>

        <div className={`flex gap-4 flex-1 flex-row`}>
          <div className={`w-16 border-dashed border-slate-100 space-y-4 pt-2 border-r`}>
             <SidebarRecord label="BP" value={prescription.clinicalRecords.bp} />
             <SidebarRecord label="HR" value={prescription.clinicalRecords.hr} />
             <SidebarRecord label="PR" value={prescription.clinicalRecords.pr} />
             <SidebarRecord label="SpO2" value={prescription.clinicalRecords.spo2} />
             <SidebarRecord label="Temp" value={prescription.clinicalRecords.temp} />
          </div>
          <div className={`flex-1 pt-2 text-left`}>
            {prescription.cc && (
              <div className="mb-4">
                <span className="text-[9px] font-bold text-slate-300 uppercase">{t.cc}:</span>
                <div className="mt-1 space-y-0.5">
                  {prescription.cc.split(',').map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                       <span className="text-slate-400 mt-1.5">•</span>
                       <p className="text-sm font-bold text-slate-700">{item.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mb-6">
              <span className="text-[9px] font-bold text-slate-300 uppercase">{t.diagnosis}:</span>
              <p className="text-md font-black text-slate-900">{prescription.diagnosis}</p>
            </div>
            <div className="text-4xl font-serif text-slate-200 italic mb-4">Rx</div>
            <div className="space-y-4">
              {prescription.medications.map((m, idx) => (
                <div key={idx} className="border-b border-slate-50 pb-2">
                   <div className={`flex justify-between items-center flex-row`}>
                      <span className="text-sm font-black text-slate-800">{idx + 1}. {m.name}</span>
                      <span className="text-[10px] font-bold text-indigo-600">{m.strength}</span>
                   </div>
                   <div className={`flex justify-between mt-1 flex-row`}>
                      <p className="text-[10px] text-slate-500">{m.instructions}</p>
                      <span className="text-[9px] text-slate-400">{t.qty}: {m.quantity}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end text-[9px] text-slate-400">
          <div className="text-left">
             <p className="font-bold text-slate-600">{t.address}</p>
             <p>{settings.address} | {settings.phone}</p>
          </div>
          <div className="text-center w-20 border-t border-slate-100 pt-1 uppercase tracking-tighter">{t.signature}</div>
        </div>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="text-left">
    <span className="text-[8px] text-slate-300 font-bold block">{label}</span>
    <span className="font-bold text-slate-700 block">{value || '-'}</span>
  </div>
);

const SidebarRecord: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex flex-col items-start">
    <span className="text-[8px] font-bold text-slate-300">{label}</span>
    <span className="text-[10px] font-black text-slate-800">{value || '--'}</span>
  </div>
);

const DrugSettings: React.FC<{ db: IDBDatabase }> = ({ db }) => {
  const [newDrug, setNewDrug] = useState({ name: '', brandNames: '', form: 'Tablet', strength: '', instructions: '', category: 'General' });
  const [drugs, setDrugs] = useState<DrugTemplate[]>([]);

  const fetchDrugs = async () => {
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const cursor = store.openCursor();
    const found: DrugTemplate[] = [];
    cursor.onsuccess = (e) => {
      const cur = (e.target as any).result;
      if (cur) { found.push(cur.value); cur.continue(); }
      else setDrugs(found);
    };
  };

  useEffect(() => { fetchDrugs(); }, [db]);

  const handleAdd = () => {
    if (!newDrug.name) return;
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).add({ id: Math.random().toString(36).substr(2, 9), ...newDrug, defaultStrength: newDrug.strength, defaultInstructions: newDrug.instructions });
    tx.oncomplete = () => { setNewDrug({ name: '', brandNames: '', form: 'Tablet', strength: '', instructions: '', category: 'General' }); fetchDrugs(); };
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-slate-700 text-sm flex items-center gap-2 flex-row-reverse"><PlusCircle className="w-4 h-4 text-indigo-600" /> افزودن به بانک دایمی</h3>
        <input className="w-full p-2.5 bg-slate-50 rounded-lg text-sm text-right border border-slate-100 outline-none" placeholder="نام ژنریک دوا" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
        <input className="w-full p-2.5 bg-slate-50 rounded-lg text-sm text-right border border-slate-100 outline-none" placeholder="نام تجارتی (برند)" value={newDrug.brandNames} onChange={e => setNewDrug({...newDrug, brandNames: e.target.value})} />
        <div className="grid grid-cols-2 gap-2">
           <input className="w-full p-2.5 bg-slate-50 rounded-lg text-sm text-right border border-slate-100" placeholder="دوز" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
           <input className="w-full p-2.5 bg-slate-50 rounded-lg text-sm text-right border border-slate-100" placeholder="هدایات" value={newDrug.instructions} onChange={e => setNewDrug({...newDrug, instructions: e.target.value})} />
        </div>
        <button onClick={handleAdd} className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold">ثبت دوا</button>
      </div>
      <div className="space-y-2">
        {drugs.map(t => (
          <div key={t.id} className="bg-white p-3 rounded-lg flex justify-between items-center border border-slate-50 flex-row-reverse">
            <div className="text-right">
              <div className="font-bold text-slate-800 text-sm">{t.name}</div>
              <div className="text-[10px] text-slate-400">{t.brandNames || t.category}</div>
            </div>
            <button onClick={() => {
              const tx = db.transaction(DRUG_STORE, 'readwrite');
              tx.objectStore(DRUG_STORE).delete(t.id);
              tx.oncomplete = fetchDrugs;
            }} className="text-red-200 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClinicSettingsForm: React.FC<{ 
  settings: ClinicSettings, onSave: (s: ClinicSettings) => void, 
  storedPin: string, onSavePin: (p: string) => void,
  onBack: () => void 
}> = ({ settings, onSave, storedPin, onSavePin, onBack }) => {
  const [data, setData] = useState(settings);
  const [newPin, setNewPin] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6 text-right animate-in slide-in-from-right">
      <h2 className="text-lg font-bold flex items-center justify-end gap-2 text-slate-800 border-b pb-2"><Settings className="w-5 h-5" /> تنظیمات پروفایل</h2>
      
      <div className="space-y-3">
        <FormInput label="نام کلینیک" value={data.name} onChange={v => setData({...data, name: v})} />
        <FormInput label="نام داکتر" value={data.doctor} onChange={v => setData({...data, doctor: v})} />
        <FormInput label="تخصص" value={data.specialty} onChange={v => setData({...data, specialty: v})} />
        <FormInput label="آدرس" value={data.address} onChange={v => setData({...data, address: v})} />
        <FormInput label="تماس" value={data.phone} onChange={v => setData({...data, phone: v})} />
      </div>

      <div className="border-t pt-4 mt-4">
        <button 
          onClick={() => setShowPinChange(!showPinChange)} 
          className="text-[11px] font-bold text-indigo-600 flex items-center justify-end gap-1 mb-3"
        >
          {showPinChange ? 'بستن تنظیمات امنیت' : 'تغییر رمز عبور ورود'} <Key className="w-3.5 h-3.5" />
        </button>
        
        {showPinChange && (
          <div className="bg-slate-50 p-4 rounded-xl space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 pr-1">رمز عبور جدید</label>
              <input 
                type="password" 
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-center font-bold tracking-widest outline-none focus:ring-2 focus:ring-indigo-500" 
                placeholder="****" 
                value={newPin} 
                onChange={e => setNewPin(e.target.value)}
              />
            </div>
            <button 
              onClick={() => {
                if (newPin.length > 0) {
                  onSavePin(newPin);
                  setNewPin('');
                  setShowPinChange(false);
                  alert('رمز عبور با موفقیت تغییر کرد.');
                }
              }} 
              className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
            >
              تأیید تغییر رمز
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button onClick={() => { onSave(data); onBack(); }} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-md"><Save className="w-4 h-4" /> ذخیره</button>
        <button onClick={onBack} className="bg-slate-100 text-slate-500 px-6 rounded-lg font-bold">لغو</button>
      </div>
    </div>
  );
};

export default App;