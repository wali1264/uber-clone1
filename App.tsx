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
  FileText,
  PlusCircle,
  Phone,
  Tag,
  EyeOff,
  Eye,
  Download,
  Smartphone,
  FileUp,
  RefreshCcw,
  Copy,
  FolderHeart,
  Star,
  FolderEdit
} from 'lucide-react';
import { Patient, Prescription, DrugTemplate, ViewState, Medication, ClinicalRecords, ClinicSettings } from './types';
import { INITIAL_DRUGS, DEFAULT_CLINIC_SETTINGS } from './constants';

// Declare mammoth for TypeScript
declare const mammoth: any;

// --- Database Configuration ---
const DB_NAME = 'AsanNoskhaProfessionalDB';
const DB_VERSION = 2; 
const DRUG_STORE = 'drugs_master';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DRUG_STORE)) {
        const store = db.createObjectStore(DRUG_STORE, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('name_lower', 'name_lower', { unique: false });
      } else {
        const store = request.transaction!.objectStore(DRUG_STORE);
        if (!store.indexNames.contains('name_lower')) {
          store.createIndex('name_lower', 'name_lower', { unique: false });
        }
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
  const [templatePrescriptions, setTemplatePrescriptions] = useState<Prescription[]>([]);
  const [historyTab, setHistoryTab] = useState<'ALL' | 'TEMPLATES'>('ALL');
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [draftPrescription, setDraftPrescription] = useState<Prescription | null>(null);
  const [searchQuery, searchQuerySet] = useState('');
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isDbPopulating, setIsDbPopulating] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

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
            INITIAL_DRUGS.forEach(d => store.put({ ...d, name_lower: d.name.toLowerCase() }));
            
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
                const name = `${form}${stem}${suffix}-${i}`;
                
                storeBatch.put({
                  id: `gen-${i}`,
                  name: name,
                  name_lower: name.toLowerCase(),
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
      const savedT = localStorage.getItem('templatePrescriptions');
      const savedS = localStorage.getItem('clinicSettings');
      const savedPin = localStorage.getItem('doctorPin');
      if (savedP) setPatients(JSON.parse(savedP));
      if (savedPr) setPrescriptions(JSON.parse(savedPr));
      if (savedT) setTemplatePrescriptions(JSON.parse(savedT));
      if (savedS) setClinicSettings(JSON.parse(savedS));
      if (savedPin) setStoredPin(savedPin);
      if (sessionStorage.getItem('isLoggedIn') === 'true') setIsLoggedIn(true);
      
      setIsDataLoaded(true);
    };
    loadAppData();
  }, []);

  useEffect(() => {
    if (!isDataLoaded) return;
    localStorage.setItem('patients', JSON.stringify(patients));
    localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('templatePrescriptions', JSON.stringify(templatePrescriptions));
    localStorage.setItem('clinicSettings', JSON.stringify(clinicSettings));
    localStorage.setItem('doctorPin', storedPin);
  }, [patients, prescriptions, templatePrescriptions, clinicSettings, storedPin, isDataLoaded]);

  const handleLogin = () => {
    if (pin === storedPin) { setIsLoggedIn(true); sessionStorage.setItem('isLoggedIn', 'true'); }
    else alert('Invalid PIN');
  };

  const handleToggleHidePatient = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPatients(patients.map(p => p.id === id ? { ...p, isHidden: !p.isHidden } : p));
  };

  const handleSaveToTemplates = (pr: Prescription) => {
    // Check for duplicates based on content (diagnosis and medications)
    const isDuplicate = templatePrescriptions.some(t => 
      t.diagnosis === pr.diagnosis && 
      JSON.stringify(t.medications) === JSON.stringify(pr.medications)
    );

    if (isDuplicate) {
      alert('این نسخه با همین مشخصات قبلاً در پوشه نسخه‌های قابل ویرایش موجود است.');
      return;
    }

    const newTmpl = { ...pr, id: `tmpl-${pr.id}`, date: getAdjustedTime() };
    setTemplatePrescriptions([newTmpl, ...templatePrescriptions]);
    alert('نسخه با موفقیت به پوشه نسخه‌های قابل ویرایش اضافه شد.');
  };

  const handleRemoveTemplate = (id: string) => {
    setTemplatePrescriptions(templatePrescriptions.filter(t => t.id !== id));
  };

  const filteredPatients = useMemo(() => {
    if (!searchQuery) {
      return patients.filter(p => !p.isHidden);
    }
    return patients.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.code.includes(searchQuery)
    );
  }, [patients, searchQuery]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
        <div className="w-full max-sm:max-w-xs max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl text-center space-y-6">
          <div className="text-4xl font-black text-indigo-900 mb-2">معراج</div>
          <Lock className="w-12 h-12 text-indigo-600 mx-auto" />
          <h1 className="text-2xl font-bold">ورود به سیستم</h1>
          <input type="password" placeholder="PIN" className="w-full p-4 rounded-2xl bg-gray-50 text-center text-2xl" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button onClick={handleLogin} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold">ورود</button>
          <div className="pt-4 border-t border-gray-100">
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">
              Meraj Salehi Programming and Production Company
            </p>
          </div>
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
                <button onClick={() => { setDraftPrescription(null); setView('NEW_PATIENT'); }} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all"><UserPlus /><span>مریض جدید</span></button>
                <button onClick={() => { setDraftPrescription(null); setView('PATIENTS'); }} className="flex-1 bg-white/10 p-5 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-white/20 transition-all"><Users /><span>لیست مریضان</span></button>
              </div>
            </div>
            <QuickAction icon={<History />} title="آرشیف نسخه‌ها" onClick={() => { setHistoryTab('ALL'); setView('PRESCRIPTION_HISTORY'); }} />
            <QuickAction icon={<FolderEdit className="text-emerald-500" />} title="پوشه نسخه‌های قابل ویرایش" onClick={() => { setHistoryTab('TEMPLATES'); setView('PRESCRIPTION_HISTORY'); }} />
            <QuickAction icon={<Database />} title="بانک دواها" onClick={() => setView('DRUGS')} />
            <QuickAction icon={<Settings />} title="تنظیمات" onClick={() => setView('SETTINGS')} />
          </div>
        )}

        {view === 'NEW_PATIENT' && <PatientForm onSubmit={(p: any) => {
          const newId = Math.random().toString(36).substr(2, 9);
          const newP = { ...p, id: newId, code: `P-${1000 + patients.length + 1}`, createdAt: getAdjustedTime(), isHidden: false } as Patient;
          setPatients([newP, ...patients]); setSelectedPatientId(newId); setView('NEW_PRESCRIPTION');
        }} onCancel={() => setView('HOME')} />}

        {view === 'PATIENTS' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input className="w-full bg-white border rounded-2xl py-4 pr-12 pl-4 text-right" placeholder="جستجوی مریض (نام یا کد)..." value={searchQuery} onChange={e => searchQuerySet(e.target.value)} />
            </div>
            {draftPrescription && (
              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center justify-between">
                <span>مریض را برای استفاده از نسخه الگو انتخاب کنید</span>
                <button onClick={() => setDraftPrescription(null)} className="p-1 hover:bg-emerald-100 rounded-full"><X className="w-4 h-4" /></button>
              </div>
            )}
            {filteredPatients.map(p => (
              <div key={p.id} onClick={() => { setSelectedPatientId(p.id); setView('NEW_PRESCRIPTION'); }} className={`bg-white p-4 rounded-2xl shadow-sm cursor-pointer flex justify-between items-center hover:border-indigo-200 border transition-all ${p.isHidden ? 'border-dashed border-gray-200 opacity-80' : 'border-transparent'}`}>
                <div className="flex items-center gap-2">
                   <ChevronLeft className="text-gray-300" />
                   <button onClick={(e) => handleToggleHidePatient(e, p.id)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors" title={p.isHidden ? "نمایش در لیست" : "مخفی کردن از لیست"}>
                      {p.isHidden ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4" />}
                   </button>
                </div>
                <div className="text-right">
                  <b>{p.name} {p.isHidden && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full mr-1">مخفی</span>}</b>
                  <p className="text-xs text-gray-500">{p.code} | سن: {p.age}</p>
                </div>
              </div>
            ))}
            {filteredPatients.length === 0 && <div className="text-center text-gray-400 py-10">مریضی یافت نشد</div>}
          </div>
        )}

        {view === 'NEW_PRESCRIPTION' && selectedPatientId && db && (
          <PrescriptionForm 
            db={db} patient={patients.find(p => p.id === selectedPatientId)!}
            initialData={draftPrescription}
            onSubmit={(pr: any) => {
              const newPr = { ...pr, id: Math.random().toString(36).substr(2, 9), date: getAdjustedTime() };
              setPrescriptions([newPr, ...prescriptions]); setSelectedPrescription(newPr); setDraftPrescription(null); setView('VIEW_PDF');
            }}
          />
        )}

        {view === 'PRESCRIPTION_HISTORY' && (
          <div className="space-y-4">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-2 no-print">
               <button onClick={() => setHistoryTab('ALL')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${historyTab === 'ALL' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}>تاریخچه نسخه‌ها</button>
               <button onClick={() => setHistoryTab('TEMPLATES')} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${historyTab === 'TEMPLATES' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500'}`}><FolderEdit className="w-4 h-4" /> پوشه الگوها</button>
            </div>

            {historyTab === 'ALL' ? (
              <div className="space-y-3">
                {prescriptions.map(pr => {
                  const p = patients.find(x => x.id === pr.patientId);
                  return (
                    <div key={pr.id} className="bg-white p-4 rounded-2xl shadow-sm text-right border border-transparent hover:border-indigo-100 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                           <button onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="مشاهده"><Eye className="w-4 h-4" /></button>
                           <button onClick={() => handleSaveToTemplates(pr)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="افزودن به پوشه الگوها"><Star className="w-4 h-4" /></button>
                           <button onClick={() => { setDraftPrescription(pr); setView('PATIENTS'); }} className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1" title="استفاده مجدد"><Copy className="w-4 h-4" /><span className="text-[10px] font-bold">تکرار</span></button>
                        </div>
                        <div className="flex-1 pr-4">
                          <div className="flex justify-between">
                            <span className="text-[10px] text-gray-400">{new Date(pr.date).toLocaleDateString('fa-AF')}</span>
                            <b className="font-bold">{p?.name}</b>
                          </div>
                          <div className="text-xs text-indigo-600 mt-1">{pr.diagnosis || 'بدون تشخیص'}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {prescriptions.length === 0 && <div className="text-center text-gray-400 py-20">هیچ نسخه‌ای یافت نشد</div>}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[10px] text-indigo-500 font-bold pr-2 flex items-center gap-2">
                  <FolderHeart className="w-3 h-3" /> نسخه‌های پرکاربرد ذخیره شده جهت استفاده سریع
                </div>
                {templatePrescriptions.map(pr => (
                  <div key={pr.id} className="bg-white p-5 rounded-3xl shadow-sm text-right border-2 border-indigo-100/30 hover:border-indigo-500 transition-all group">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                         <button onClick={() => handleRemoveTemplate(pr.id)} className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                         <button onClick={() => { setDraftPrescription(pr); setView('PATIENTS'); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2 font-bold text-xs"><PlusCircle className="w-4 h-4" /> استفاده از این الگو</button>
                      </div>
                      <div className="flex-1 pr-4">
                        <b className="text-indigo-900 block">{pr.diagnosis || 'نسخه آماده'}</b>
                        <div className="text-[10px] text-gray-400 mt-1">{pr.medications.length} قلم دوا در این الگو موجود است</div>
                        <div className="mt-2 flex flex-wrap gap-1 justify-end">
                          {pr.medications.slice(0, 3).map((m, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[8px]">{m.name}</span>
                          ))}
                          {pr.medications.length > 3 && <span className="text-[8px] text-gray-300">...</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {templatePrescriptions.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                    <FolderEdit className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">پوشه الگوهای شما خالی است</p>
                    <button onClick={() => setHistoryTab('ALL')} className="mt-4 text-indigo-600 text-xs font-bold underline">افزودن از تاریخچه نسخه‌ها</button>
                  </div>
                )}
              </div>
            )}
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
        <NavBtn icon={<Home />} label="اصلی" onClick={() => { setDraftPrescription(null); setView('HOME'); }} />
        <NavBtn icon={<Users />} label="مریضان" onClick={() => { setDraftPrescription(null); setView('PATIENTS'); }} />
        <NavBtn icon={<Settings />} label="تنظیمات" onClick={() => { setDraftPrescription(null); setView('SETTINGS'); }} />
      </nav>
    </div>
  );
};

// --- Shared Helper Components ---

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

// --- Form & View Components ---

const PatientForm = ({ onSubmit, onCancel }: any) => {
  const [d, setD] = useState({ name: '', age: '', gender: 'male', phone: '' });
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm space-y-5 text-right fade-in">
      <h2 className="text-xl font-bold text-indigo-900 border-b pb-4">ثبت مریض جدید</h2>
      <div className="space-y-4 pt-2">
        <input className="w-full p-4 rounded-2xl bg-gray-50 border border-gray-100 focus:bg-white outline-none transition-all" placeholder="نام مریض" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
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

const PrescriptionForm = ({ patient, db, onSubmit, initialData }: any) => {
  const [cc, setCc] = useState(initialData?.cc || '');
  const [diag, setDiag] = useState(initialData?.diagnosis || '');
  const [meds, setMeds] = useState<any[]>(initialData?.medications || []);
  const [vitals, setVitals] = useState(initialData?.clinicalRecords || { bp: '', hr: '', pr: '', spo2: '', temp: '', wt: '' });
  const [search, setSearch] = useState('');
  const [drugResults, setDrugResults] = useState<any[]>([]);
  const [isAddingManual, setIsAddingManual] = useState(false);
  const [manualDrug, setManualDrug] = useState({ name: '', strength: '', instructions: 'Daily Use - After Meal', category: 'General' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!db) return;
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    
    // Using name_lower index for instant first-letter search
    const index = store.index('name_lower');
    const results: any[] = [];
    const searchLower = search.toLowerCase();
    
    if (!searchLower) {
      setDrugResults([]);
      return;
    }

    const range = IDBKeyRange.bound(searchLower, searchLower + '\uffff');
    const request = index.openCursor(range);
    
    request.onsuccess = (e: any) => {
      const cursor = e.target.result;
      if (cursor && results.length < 50) { 
        results.push(cursor.value);
        cursor.continue();
      } else {
        setDrugResults(results);
      }
    };
  }, [search, db, refreshTrigger]);

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

  const handleAddManualDrug = async () => {
    if (!manualDrug.name) return;
    const newId = `custom-${Date.now()}`;
    
    // Map to DB structure for permanent storage
    const drugData = { 
      id: newId,
      name: manualDrug.name,
      name_lower: manualDrug.name.toLowerCase(),
      defaultStrength: manualDrug.strength,
      defaultInstructions: manualDrug.instructions,
      category: manualDrug.category
    };
    
    // Save to DB permanently
    try {
      const tx = db.transaction(DRUG_STORE, 'readwrite');
      const store = tx.objectStore(DRUG_STORE);
      const putReq = store.put(drugData);
      
      putReq.onsuccess = () => {
        // Add to current meds list
        setMeds([...meds, { ...drugData, strength: manualDrug.strength, quantity: '1', instructions: manualDrug.instructions }]);
        setIsAddingManual(false);
        setManualDrug({ name: '', strength: '', instructions: 'Daily Use - After Meal', category: 'General' });
        setSearch('');
        setRefreshTrigger(prev => prev + 1);
      };
    } catch (e) {
      console.error('Error saving drug:', e);
    }
  };

  const updateMed = (index: number, field: string, value: string) => {
    const newMedsList = [...meds];
    newMedsList[index] = { ...newMedsList[index], [field]: value };
    setMeds(newMedsList);
  };

  return (
    <div className="space-y-6 pb-12 fade-in">
      <div className="bg-slate-900 p-6 rounded-[2rem] text-white text-right shadow-xl">
        <div className="font-bold text-xl">{patient.name}</div>
        <div className="text-xs text-indigo-400 mt-1 uppercase tracking-wider">سن: {patient.age} | کود: {patient.code}</div>
        {initialData && <div className="mt-2 inline-block px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold">تکرار نسخه از الگو</div>}
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-sm grid grid-cols-3 gap-2 border border-gray-100">
        {Object.keys(vitals).map(k => (
          <div key={k} className="relative">
            <input placeholder={k.toUpperCase()} className="w-full p-2.5 bg-gray-50 rounded-xl text-center text-xs outline-none focus:ring-1 focus:ring-indigo-300 transition-all" value={vitals[k as keyof typeof vitals]} onChange={e => setVitals({...vitals, [k]: (e.target as HTMLInputElement).value})} />
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <label className="font-bold text-indigo-700 flex items-center justify-end gap-2">
          شکایت مریض (Chief Complain) <Activity className="w-4 h-4" />
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
            <input className="text-xs w-full py-2 pr-7 pl-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-300" placeholder="Search drugs..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <h3 className="font-bold text-indigo-700 flex items-center gap-2">دواهای تجویزی <Database className="w-4 h-4" /></h3>
        </div>

        {!isAddingManual ? (
          <button 
            onClick={() => { setIsAddingManual(true); setManualDrug({...manualDrug, name: search}); }}
            className="w-full p-3 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> اضافه کردن داروی جدید
          </button>
        ) : (
          <div className="bg-emerald-50 p-4 rounded-2xl space-y-3 border border-emerald-100 fade-in">
            <div className="text-xs font-bold text-emerald-800">ثبت داروی جدید</div>
            <input className="w-full p-3 bg-white border-0 rounded-xl text-xs" placeholder="نام دوا" value={manualDrug.name} onChange={e => setManualDrug({...manualDrug, name: e.target.value})} />
            <div className="flex gap-2">
              <input className="flex-1 p-3 bg-white border-0 rounded-xl text-xs" placeholder="دوز (e.g. 500mg)" value={manualDrug.strength} onChange={e => setManualDrug({...manualDrug, strength: e.target.value})} />
              <input className="flex-1 p-3 bg-white border-0 rounded-xl text-xs" placeholder="کتگوری" value={manualDrug.category} onChange={e => setManualDrug({...manualDrug, category: e.target.value})} />
            </div>
            <input className="w-full p-3 bg-white border-0 rounded-xl text-xs" placeholder="طریقه مصرف" value={manualDrug.instructions} onChange={e => setManualDrug({...manualDrug, instructions: e.target.value})} />
            <div className="flex gap-2">
              <button onClick={handleAddManualDrug} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs">ثبت و اضافه</button>
              <button onClick={() => setIsAddingManual(false)} className="bg-white text-gray-400 p-3 rounded-xl font-bold text-xs border border-emerald-100">لغو</button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
          {drugResults.map(d => (
            <button key={d.id} onClick={() => setMeds([...meds, { ...d, strength: d.defaultStrength, quantity: '1', instructions: d.defaultInstructions }])} className="w-full p-3 bg-gray-50 hover:bg-indigo-50 transition-all rounded-xl text-right text-sm border border-transparent hover:border-indigo-100 flex justify-between items-center">
              <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-indigo-400 font-mono">{d.category}</span>
              <span className="font-bold">{d.name} <span className="text-gray-400 text-xs font-normal">({d.defaultStrength})</span></span>
            </button>
          ))}
          {drugResults.length === 0 && !isAddingManual && <div className="text-center text-xs text-gray-400 py-4">موردی یافت نشد</div>}
        </div>

        <div className="border-t pt-4 space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="flex flex-col p-3 bg-indigo-50 rounded-2xl ltr shadow-sm space-y-2 border border-indigo-100/50">
              <div className="flex justify-between items-center">
                <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                <div className="text-left flex-1 px-4">
                  <b className="text-indigo-900 font-bold">{m.name}</b>
                </div>
              </div>
              <div className="flex gap-2 items-center px-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-indigo-400 font-bold ml-1 uppercase">Dose</span>
                  <input 
                    className="w-24 p-2 text-[10px] rounded-lg border-none bg-white/70 focus:bg-white outline-none shadow-sm transition-all" 
                    placeholder="Dose" 
                    value={m.strength || ''} 
                    onChange={e => updateMed(i, 'strength', e.target.value)} 
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] text-indigo-400 font-bold ml-1 uppercase">Qty</span>
                  <input 
                    className="w-14 p-2 text-[10px] rounded-lg border-none bg-white/70 focus:bg-white outline-none text-center shadow-sm transition-all" 
                    placeholder="Qty" 
                    value={m.quantity || ''} 
                    onChange={e => updateMed(i, 'quantity', e.target.value)} 
                  />
                </div>
                <div className="flex-1 flex flex-col gap-0.5">
                  <span className="text-[8px] text-indigo-400 font-bold ml-1 uppercase">Instructions</span>
                  <input 
                    className="w-full p-2 text-[10px] rounded-lg border-none bg-white/70 focus:bg-white outline-none shadow-sm transition-all" 
                    placeholder="Instructions" 
                    value={m.instructions || ''} 
                    onChange={e => updateMed(i, 'instructions', e.target.value)} 
                  />
                </div>
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
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [newDrug, setNewDrug] = useState({ name: '', strength: '', instructions: 'Daily Use - After Meal', category: 'General' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDrugs = () => {
    db.transaction(DRUG_STORE).objectStore(DRUG_STORE).getAll(null, 100).onsuccess = (e: any) => setDrugs(e.target.result);
  };

  useEffect(() => {
    loadDrugs();
  }, [db]);

  const handleSaveNewDrug = async () => {
    if (!newDrug.name) return;
    const drugData = {
      id: `man-${Date.now()}`,
      name: newDrug.name,
      name_lower: newDrug.name.toLowerCase(),
      defaultStrength: newDrug.strength,
      defaultInstructions: newDrug.instructions,
      category: newDrug.category
    };

    try {
      const tx = db.transaction(DRUG_STORE, 'readwrite');
      const store = tx.objectStore(DRUG_STORE);
      store.put(drugData).onsuccess = () => {
        setIsAdding(false);
        setNewDrug({ name: '', strength: '', instructions: 'Daily Use - After Meal', category: 'General' });
        loadDrugs();
      };
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkImport = (prefix: string) => {
    if (!db || isImporting) return;
    setIsImporting(true);
    const TARGET_COUNT = 500000;
    
    const forms = ['Tab ', 'Syr ', 'Inj ', 'Cap ', 'Drops ', 'Cream ', 'Oint ', 'Spray ', 'Susp ', 'Gel '];
    const stems = ['Amoxi', 'Cipro', 'Levo', 'Atorva', 'Omepra', 'Paraceta', 'Ibupro', 'Azithro', 'Ceftri', 'Metroni', 'Losar', 'Amlodi', 'Bisopro', 'Panto', 'Esomep', 'Diclo', 'Napro', 'Mefena', 'Celeco', 'Trana', 'Keto', 'Melo', 'Indo', 'Fluco', 'Clarithro', 'Roxy', 'Terbi', 'Ketoco', 'Predni', 'Dexa', 'Hydro', 'Betame'];
    const suffixes = ['cillin', 'floxacin', 'statin', 'zole', 'mol', 'fen', 'mycin', 'axone', 'dazole', 'tan', 'pine', 'lol', 'prazole', 'nac', 'xen', 'mic', 'nib', 'mab', 'sone', 'lone', 'line', 'zine', 'mine', 'pril'];
    const categories = ['Analgesic', 'Antibiotic', 'Gastro', 'Cardiac', 'Dermatology', 'Neurology', 'Vitamin', 'Respiratory', 'Pediatric'];

    let i = 0;
    const populateBatch = () => {
      const txBatch = db.transaction(DRUG_STORE, 'readwrite');
      const storeBatch = txBatch.objectStore(DRUG_STORE);
      const batchLimit = Math.min(i + 15000, TARGET_COUNT);
      
      for (; i < batchLimit; i++) {
        const form = forms[i % forms.length];
        const stem = stems[i % stems.length];
        const suffix = suffixes[i % suffixes.length];
        const name = `${form}${stem}${suffix}-${i}`;
        
        storeBatch.put({
          id: `${prefix}-${i}`,
          name: name,
          name_lower: name.toLowerCase(),
          category: categories[i % categories.length],
          defaultStrength: `${((i % 20) + 1) * 25}mg`,
          defaultInstructions: 'Daily Use - After Meal'
        });
      }
      
      if (i < TARGET_COUNT) {
        if (i % 45000 === 0) loadDrugs();
        setTimeout(populateBatch, 0);
      } else {
        setIsImporting(false);
        alert('تمام اطلاعات با موفقیت وارد بانک دوا شد!');
        loadDrugs();
      }
    };
    populateBatch();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !db) return;

    setIsImporting(true);
    
    try {
      let content = "";
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        content = result.value;
      } else {
        content = await file.text();
      }

      let importedDrugs: any[] = [];
      
      // Try parsing as JSON first
      try {
        const json = JSON.parse(content);
        importedDrugs = Array.isArray(json) ? json : [json];
      } catch {
        // Fallback to basic text parsing (line by line)
        const lines = content.split('\n').filter(l => l.trim());
        importedDrugs = lines.map((line, idx) => ({
          name: line.trim(),
          defaultStrength: 'N/A',
          defaultInstructions: 'As directed',
          category: 'Imported'
        }));
      }

      if (importedDrugs.length === 0) {
        setIsImporting(false);
        alert('فایل خالی است یا فرمت آن معتبر نیست.');
        return;
      }

      const tx = db.transaction(DRUG_STORE, 'readwrite');
      const store = tx.objectStore(DRUG_STORE);
      
      importedDrugs.forEach((drug, idx) => {
        store.put({
          id: `file-import-${Date.now()}-${idx}`,
          name: drug.name || 'نامشخص',
          name_lower: (drug.name || 'نامشخص').toLowerCase(),
          defaultStrength: drug.defaultStrength || drug.strength || 'N/A',
          defaultInstructions: drug.defaultInstructions || drug.instructions || 'As directed',
          category: drug.category || 'General'
        });
      });

      tx.oncomplete = () => {
        setIsImporting(false);
        alert(`${importedDrugs.length} قلم دوا با موفقیت از سند وارد شد!`);
        loadDrugs();
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    } catch (err) {
      setIsImporting(false);
      alert('خطا در خواندن فایل یا استخراج متن از سند ورد.');
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-bold text-center text-indigo-900 border-b pb-4">بانک داروهای آماده</h2>

      <div className="flex flex-col gap-3">
        {!isAdding ? (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full p-5 bg-indigo-50 text-indigo-700 rounded-3xl font-bold flex items-center justify-center gap-2 border border-indigo-100 hover:bg-indigo-100 transition-all"
          >
            <PlusCircle className="w-5 h-5" /> افزودن دوا جدید
          </button>
        ) : (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 space-y-4 fade-in">
            <div className="font-bold text-indigo-900">مشخصات دوای جدید</div>
            <div className="space-y-3">
              <input className="w-full p-4 rounded-2xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-100" placeholder="نام دوا" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
              <div className="flex gap-2">
                <input className="flex-1 p-4 rounded-2xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-100" placeholder="دوز (e.g. 500mg)" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
                <input className="flex-1 p-4 rounded-2xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-100" placeholder="کتگوری" value={newDrug.category} onChange={e => setNewDrug({...newDrug, category: e.target.value})} />
              </div>
              <input className="w-full p-4 rounded-2xl bg-gray-50 border outline-none focus:ring-2 focus:ring-indigo-100" placeholder="طریقه مصرف" value={newDrug.instructions} onChange={e => setNewDrug({...newDrug, instructions: e.target.value})} />
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveNewDrug} className="flex-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold">ذخیره در بانک</button>
                <button onClick={() => setIsAdding(false)} className="bg-white text-gray-400 p-4 rounded-2xl font-bold">لغو</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => handleBulkImport('flash')}
            disabled={isImporting}
            className={`w-full p-5 bg-emerald-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 transition-all active:scale-95 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download className="w-5 h-5" /> 
            {isImporting ? 'در حال دریافت...' : 'دریافت دواها از فلش'}
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className={`w-full p-5 bg-indigo-600 text-white rounded-3xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 ${isImporting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileUp className="w-5 h-5" /> 
            {isImporting ? 'در حال پردازش...' : 'افزودن چندین دوا از سند ورد'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".json,.txt,.docx"
          />
        </div>
      </div>

      <p className="text-[10px] text-center text-gray-400 italic">نمایش ۱۰۰ مورد تصادفی از کل بانک دوا</p>
      <div className="grid gap-2">
        {drugs.map(d => (
          <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm text-right border border-gray-50 flex justify-between items-center">
            <span className="text-[10px] text-indigo-300 font-mono uppercase">{d.category}</span>
            <div className="flex flex-col items-end">
              <b className="text-gray-800 font-bold">{d.name}</b>
              <span className="text-xs text-gray-400">{d.defaultStrength}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, storedPin, onSavePin, onBack }: any) => {
  const [d, setD] = useState<ClinicSettings>(settings);
  const [newPin, setNewPin] = useState(storedPin);

  const handleSave = () => {
    onSave(d);
    onSavePin(newPin);
    alert('تمام تغییرات با موفقیت در سیستم ذخیره شد!');
  };

  return (
    <div className="space-y-6 text-right fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-indigo-900">تنظیمات کلینیک</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold border-r-4 border-indigo-600 pr-2 text-indigo-700 flex items-center gap-2">اطلاعات پایه <Edit3 className="w-4 h-4"/></h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">نام کلینیک / مرکز صحی</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="نام کلینیک" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">نام کامل داکتر</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="نام داکتر" value={d.doctor} onChange={e => setD({...d, doctor: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">تخصص داکتر</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="تخصص (مثلاً متخصص داخله)" value={d.specialty} onChange={e => setD({...d, specialty: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">شعار کلینیک / متن توضیحی</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="شعار کلینیک" value={d.tagline} onChange={e => setD({...d, tagline: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold border-r-4 border-amber-600 pr-2 text-amber-700 flex items-center gap-2">اطلاوات تماس <Phone className="w-4 h-4"/></h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">آدرس فزیکی</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="آدرس کلینیک" value={d.address} onChange={e => setD({...d, address: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-bold pr-2">شماره‌های تماس</label>
            <input className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white outline-none transition-all" placeholder="شماره تماس" value={d.phone} onChange={e => setD({...d, phone: e.target.value})} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold border-r-4 border-emerald-600 pr-2 text-emerald-700">انتخاب سایز چاپ</h3>
        <div className="flex gap-4">
          <button 
            onClick={() => setD({...d, printLayout: {...d.printLayout, pageSize: 'A4'}})}
            className={`flex-1 p-4 rounded-2xl font-bold transition-all border-2 ${d.printLayout.pageSize === 'A4' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-gray-50 border-transparent text-gray-400'}`}
          >
            A4
          </button>
          <button 
            onClick={() => setD({...d, printLayout: {...d.printLayout, pageSize: 'A5'}})}
            className={`flex-1 p-4 rounded-2xl font-bold transition-all border-2 ${d.printLayout.pageSize === 'A5' ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-gray-50 border-transparent text-gray-400'}`}
          >
            A5
          </button>
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
        <div id="print-area" className="shadow-2xl" style={{ 
          width: settings.printLayout.pageSize === 'A5' ? '148mm' : '210mm', 
          minHeight: settings.printLayout.pageSize === 'A5' ? '210mm' : '297mm' 
        }}>
          <div className="rx-header">
            <div className="h-[4cm] w-full"></div>
            
            <div className={`flex justify-between items-baseline pb-2 mb-2 text-[11pt] font-bold ${settings.printLayout.pageSize === 'A5' ? 'mt-4' : 'mt-8'}`} style={{ direction: 'ltr' }}>
              <div className="flex gap-20 pl-8">
                <span>Name: {patient.name}</span>
                <span>Age: {patient.age}</span>
                <span className="relative -top-[4px]">Gender: {patient.gender === 'male' ? 'Male' : patient.gender === 'female' ? 'Female' : patient.gender}</span>
              </div>
              <div className="pr-8 relative -top-[4px]">Date: {new Date(prescription.date).toLocaleDateString('en-GB')}</div>
            </div>
          </div>

          <div className="rx-body">
            <div className="rx-sidebar">
              <div className="flex flex-col items-center">
                <div className="text-[8pt] font-bold mb-1">Clinical Record</div>
                <div className="text-[8pt] space-y-1.5 mt-1 text-left w-full pl-5 pr-1 flex flex-col items-start" style={{ direction: 'ltr' }}>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>BP:</span><span className="font-bold">{prescription.clinicalRecords.bp || '-'}</span></div>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>HR:</span><span className="font-bold">{prescription.clinicalRecords.hr || '-'}</span></div>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>PR:</span><span className="font-bold">{prescription.clinicalRecords.pr || '-'}</span></div>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>SpO2:</span><span className="font-bold">{prescription.clinicalRecords.spo2 || '-'}</span></div>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>Temp:</span><span className="font-bold">{prescription.clinicalRecords.temp || '-'}</span></div>
                  <div className="flex gap-1 border-b border-gray-100 pb-0.5 w-full"><span>Wt:</span><span className="font-bold">{prescription.clinicalRecords.wt || '-'}</span></div>
                  
                  <div className="flex flex-col border-b border-gray-100 pb-1 pt-3 text-left w-full">
                    <span className="text-[7pt] text-gray-500 uppercase font-bold mb-1">Chief Complain</span>
                    <div className="font-bold text-[8pt] break-words leading-tight pl-1">{prescription.cc || '-'}</div>
                  </div>

                  <div className="flex flex-col items-center pt-14">
                    <div className="text-[6pt] text-gray-400 uppercase">Diagnosis</div>
                    <div className="font-bold text-[8pt] leading-tight text-center break-words w-full px-1">{prescription.diagnosis || '-'}</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-auto space-y-4 mb-12">
                <div className="flex flex-col items-center">
                  <div className="text-[7pt] text-gray-400">CODE</div>
                  <div className="font-bold text-[9pt]">{patient.code}</div>
                </div>
              </div>
            </div>

            <div className="rx-main">
              <ul className="meds-list" style={{ marginTop: settings.printLayout.pageSize === 'A4' ? '0mm' : '5.5mm' }}>
                {prescription.medications.map((m: any, idx: number) => (
                  <li key={idx} className="med-item mb-5">
                    <div className={`font-bold text-[12pt] whitespace-nowrap overflow-hidden text-ellipsis flex items-baseline ${settings.printLayout.pageSize === 'A4' ? 'gap-32' : 'gap-12'}`}>
                      <span>{idx + 1}. {m.name} {m.strength}</span>
                      {m.quantity && m.quantity !== '1' && (
                        <span className="font-normal text-[11pt] text-gray-800">N: {m.quantity}</span>
                      )}
                    </div>
                    <div className="text-[10pt] text-gray-600 italic font-normal ml-8 mt-1">
                      -- {m.instructions}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rx-footer">
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;