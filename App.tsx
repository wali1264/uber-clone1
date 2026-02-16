
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
  FolderEdit,
  Calendar
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
  const [searchQuery, setSearchQuery] = useState('');
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
          const TARGET_COUNT = 500000; // Updated to 500,000 as requested
          
          if (currentCount < TARGET_COUNT) {
            setIsDbPopulating(true);
            INITIAL_DRUGS.forEach(d => store.put({ ...d, name_lower: d.name.toLowerCase() }));
            
            const forms = ['Tab ', 'Syr ', 'Inj ', 'Cap ', 'Drops ', 'Cream ', 'Oint ', 'Spray ', 'Susp ', 'Gel ', 'Vial ', 'Amp ', 'Powder ', 'Sachet ', 'Lotion ', 'Solution '];
            const stems = ['Amoxi', 'Cipro', 'Levo', 'Atorva', 'Omepra', 'Paraceta', 'Ibupro', 'Azithro', 'Ceftri', 'Metroni', 'Losar', 'Amlodi', 'Bisopro', 'Panto', 'Esomep', 'Diclo', 'Napro', 'Mefena', 'Celeco', 'Trana', 'Keto', 'Melo', 'Indo', 'Fluco', 'Clarithro', 'Roxy', 'Terbi', 'Ketoco', 'Predni', 'Dexa', 'Hydro', 'Betame', 'Valsar', 'Olme', 'Irbes', 'Telmi', 'Ramip', 'Enala', 'Lisino', 'Metfor', 'Sitagl', 'Rosuva', 'Simva', 'Feno', 'Gemfi', 'Warfa', 'Clopido', 'Aspirin'];
            const suffixes = ['cillin', 'floxacin', 'statin', 'zole', 'mol', 'fen', 'mycin', 'axone', 'dazole', 'tan', 'pine', 'lol', 'prazole', 'nac', 'xen', 'mic', 'nib', 'mab', 'sone', 'lone', 'line', 'zine', 'mine', 'pril', 'sartan', 'grel', 'ban', 'tide', 'gliflo', 'vudine', 'vir'];
            const categories = ['Analgesic', 'Antibiotic', 'Gastro', 'Cardiac', 'Dermatology', 'Neurology', 'Vitamin', 'Respiratory', 'Pediatric', 'Endocrine', 'Urology', 'Orthopaedic'];
            
            let i = currentCount;
            const populateBatch = () => {
              const txBatch = database.transaction(DRUG_STORE, 'readwrite');
              const storeBatch = txBatch.objectStore(DRUG_STORE);
              const batchLimit = Math.min(i + 8000, TARGET_COUNT); 
              
              for (; i < batchLimit; i++) {
                const form = forms[i % forms.length];
                const stem = stems[i % stems.length];
                const suffix = suffixes[i % suffixes.length];
                const name = `${form}${stem}${suffix}`;
                
                storeBatch.put({
                  id: `gen-${i}`,
                  name: name,
                  name_lower: name.toLowerCase(),
                  category: categories[i % categories.length],
                  defaultStrength: `${((i % 20) + 1) * 25}mg`,
                  defaultInstructions: 'Once daily'
                });
              }
              
              if (i < TARGET_COUNT) {
                setTimeout(populateBatch, 5);
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

  const handleUpdateTemplatePrescription = (prid: string, updates: Partial<Prescription>) => {
    setTemplatePrescriptions(prev => prev.map(t => t.id === prid ? { ...t, ...updates } : t));
  };

  const handleTemplatePatientClone = (templateId: string, oldPatientId: string, updates: Partial<Patient>) => {
    const originalPatient = patients.find(p => p.id === oldPatientId);
    if (!originalPatient) return;

    const newId = Math.random().toString(36).substr(2, 9);
    const newPatient: Patient = { 
      ...originalPatient, 
      ...updates, 
      id: newId, 
      code: `P-${1000 + patients.length + 1}`,
      createdAt: getAdjustedTime() 
    };

    setPatients(prev => [newPatient, ...prev]);
    setTemplatePrescriptions(prev => prev.map(t => t.id === templateId ? { ...t, patientId: newId } : t));
  };

  const handleSaveToTemplates = (pr: Prescription) => {
    const isDuplicate = templatePrescriptions.some(t => 
      t.diagnosis === pr.diagnosis && 
      JSON.stringify(t.medications) === JSON.stringify(pr.medications)
    );

    if (isDuplicate) {
      alert('این نسخه با همین مشخصات قبلاً در پوشه نسخه‌های قابل ویرایش موجود است.');
      return;
    }

    const newTmpl = { ...pr, id: `tmpl-${pr.id}`, date: pr.date };
    setTemplatePrescriptions([newTmpl, ...templatePrescriptions]);
    alert('نسخه با موفقیت به پوشه نسخه‌های قابل ویرایش اضافه شد.');
  };

  const handleRemoveTemplate = (id: string) => {
    setTemplatePrescriptions(templatePrescriptions.filter(t => t.id !== id));
  };

  const handleDeletePrescription = (id: string) => {
    if (window.confirm('آیا از حذف این نسخه اطمینان دارید؟ این عمل قابل بازگشت نیست.')) {
      setPrescriptions(prescriptions.filter(pr => pr.id !== id));
    }
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
          در حال آماده‌سازی قلم‌های داروی متنوع... لطفاً کمی صبر کنید.
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
              <input className="w-full bg-white border rounded-2xl py-4 pr-12 pl-4 text-right" placeholder="جستجوی مریض (نام یا کد)..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
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
              const newId = Math.random().toString(36).substr(2, 9);
              const newPr = { ...pr, id: newId, date: getAdjustedTime() };
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
                        <div className="flex gap-1.5">
                           <button onClick={() => { setSelectedPrescription(pr); setView('VIEW_PDF'); }} className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors" title="مشاهده"><Eye className="w-4 h-4" /></button>
                           <button onClick={() => handleSaveToTemplates(pr)} className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all" title="افزودن به پوشه الگوها"><Star className="w-4 h-4" /></button>
                           <button onClick={() => { setDraftPrescription(pr); setView('PATIENTS'); }} className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1" title="استفاده مجدد"><Copy className="w-4 h-4" /><span className="text-[10px] font-bold">تکرار</span></button>
                           <button onClick={() => handleDeletePrescription(pr.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all" title="حذف نسخه"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <div className="flex-1 pr-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {new Date(pr.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                            </span>
                            <b className="font-bold text-indigo-900">{p?.name}</b>
                          </div>
                          <div className="text-xs text-slate-500">{pr.diagnosis || 'بدون تشخیص'}</div>
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
                {templatePrescriptions.map(pr => {
                  const p = patients.find(x => x.id === pr.patientId);
                  return (
                    <div key={pr.id} className="bg-white p-5 rounded-3xl shadow-sm text-right border-2 border-indigo-100/30 hover:border-indigo-500 transition-all group">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-2">
                           <button onClick={() => handleRemoveTemplate(pr.id)} className="p-2.5 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                           <button onClick={() => { setDraftPrescription(pr); setView('PATIENTS'); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center gap-2 font-bold text-xs"><PlusCircle className="w-4 h-4" /> استفاده از این الگو</button>
                        </div>
                        <div className="flex-1 pr-4">
                          <b className="text-indigo-900 block mb-3">{pr.diagnosis || 'نسخه آماده'}</b>
                          
                          <div className="bg-gray-50/50 p-3 rounded-2xl border border-dashed border-indigo-100 space-y-2 mb-3">
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-indigo-400 font-bold whitespace-nowrap">اسم مریض:</span>
                                <TemplatePatientInput 
                                   initialValue={p?.name || ''} 
                                   templateId={pr.id} 
                                   patientId={pr.patientId} 
                                   field="name" 
                                   onClone={handleTemplatePatientClone}
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-indigo-400 font-bold whitespace-nowrap">جنسیت:</span>
                                <select 
                                   className="flex-1 text-right text-xs font-bold text-indigo-700 bg-white rounded-lg px-2 py-1.5 border border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                                   value={p?.gender || 'male'}
                                   onChange={(e) => handleTemplatePatientClone(pr.id, pr.patientId, { gender: e.target.value as any })}
                                >
                                   <option value="male">مذکر (Male)</option>
                                   <option value="female">مونث (Female)</option>
                                </select>
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-indigo-400 font-bold whitespace-nowrap">سن:</span>
                                <TemplatePatientInput 
                                   initialValue={p?.age || ''} 
                                   templateId={pr.id} 
                                   patientId={pr.patientId} 
                                   field="age" 
                                   onClone={handleTemplatePatientClone}
                                />
                             </div>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] text-indigo-400 font-bold whitespace-nowrap">تاریخ:</span>
                                <input 
                                   type="date"
                                   className="flex-1 text-right text-xs font-bold text-indigo-700 bg-white rounded-lg px-2 py-1.5 border border-indigo-200 focus:border-indigo-500 outline-none transition-all"
                                   value={new Date(pr.date).toISOString().split('T')[0]}
                                   onChange={(e) => handleUpdateTemplatePrescription(pr.id, { date: new Date(e.target.value).getTime() })}
                                />
                             </div>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-1 justify-end">
                            {pr.medications.slice(0, 3).map((m, idx) => (
                              <span key={idx} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[8px]">{m.name}</span>
                            ))}
                            {pr.medications.length > 3 && <span className="text-[8px] text-gray-300">...</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

// --- Helper for Template Patient Inputs to prevent global corruption during typing ---
const TemplatePatientInput = ({ initialValue, templateId, patientId, field, onClone }: any) => {
  const [val, setVal] = useState(initialValue);
  
  useEffect(() => { setVal(initialValue); }, [initialValue]);

  const commit = () => {
    if (val !== initialValue) {
      onClone(templateId, patientId, { [field]: val });
    }
  };

  return (
    <input 
      className="flex-1 text-right text-xs font-bold text-indigo-700 bg-white rounded-lg px-2 py-1.5 border border-indigo-200 focus:border-indigo-500 outline-none transition-all"
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === 'Enter' && commit()}
    />
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
  const [showCustomOnly, setShowCustomOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [manualDrug, setManualDrug] = useState({ name: '', strength: '', instructions: 'Once daily', category: 'General' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [customCCs, setCustomCCs] = useState<string[]>(() => JSON.parse(localStorage.getItem('customCCs') || '[]'));
  const [customDiagnoses, setCustomDiagnoses] = useState<string[]>(() => JSON.parse(localStorage.getItem('customDiagnoses') || '[]'));
  const [newCCInput, setNewCCInput] = useState('');
  const [newDiagInput, setNewDiagInput] = useState('');
  
  const [allCustomDrugs, setAllCustomDrugs] = useState<any[]>(INITIAL_DRUGS);

  useEffect(() => {
    localStorage.setItem('customCCs', JSON.stringify(customCCs));
  }, [customCCs]);

  useEffect(() => {
    localStorage.setItem('customDiagnoses', JSON.stringify(customDiagnoses));
  }, [customDiagnoses]);

  useEffect(() => {
    if (!db) return;
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const results: any[] = [...INITIAL_DRUGS];
    const prefixes = ['custom-', 'man-', 'file-import-'];
    let completed = 0;
    
    prefixes.forEach(pref => {
      const range = IDBKeyRange.bound(pref, pref + '\uffff');
      store.openCursor(range).onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor) {
          if (!results.find(r => r.id === cursor.value.id)) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          completed++;
          if (completed === prefixes.length) {
            setAllCustomDrugs(results);
          }
        }
      };
    });
  }, [db, refreshTrigger]);

  const filteredCustomDrugs = useMemo(() => {
    const searchLower = search.toLowerCase();
    let base = allCustomDrugs;
    if (showFavoritesOnly) {
      base = base.filter(d => d.isFavorite);
    }
    return base
      .filter(d => !searchLower || (d.name_lower && d.name_lower.includes(searchLower)) || (d.name && d.name.toLowerCase().includes(searchLower)))
      .sort((a, b) => {
        if (a.id.startsWith('custom') && !b.id.startsWith('custom')) return -1;
        if (b.id.startsWith('custom') && !a.id.startsWith('custom')) return 1;
        return b.id.localeCompare(a.id);
      })
      .slice(0, 50);
  }, [allCustomDrugs, search, showFavoritesOnly]);

  useEffect(() => {
    if (!db) return;
    const searchLower = search.toLowerCase();

    if (showCustomOnly || showFavoritesOnly) {
      setDrugResults(filteredCustomDrugs);
      return;
    }

    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const index = store.index('name_lower');
    const results: any[] = [];
    
    if (searchLower) {
      const range = IDBKeyRange.bound(searchLower, searchLower + '\uffff');
      index.openCursor(range).onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor && results.length < 50) { 
          results.push(cursor.value);
          cursor.continue();
        } else {
          setDrugResults(results);
        }
      };
    } else {
      setDrugResults([]);
    }
  }, [search, db, refreshTrigger, showCustomOnly, showFavoritesOnly, filteredCustomDrugs]);

  const toggleCC = (item: string) => {
    setCc(prev => {
      const items = prev ? prev.split(', ').filter(x => x) : [];
      if (items.includes(item)) return items.filter(x => x !== item).join(', ');
      return [...items, item].join(', ');
    });
  };

  const toggleDiag = (item: string) => {
    setDiag(prev => {
      const items = prev ? prev.split(', ').filter(x => x) : [];
      if (items.includes(item)) return items.filter(x => x !== item).join(', ');
      return [...items, item].join(', ');
    });
  };

  const addCustomCC = () => {
    if (newCCInput && !customCCs.includes(newCCInput)) {
      setCustomCCs([...customCCs, newCCInput]);
      setNewCCInput('');
    }
  };

  const addCustomDiag = () => {
    if (newDiagInput && !customDiagnoses.includes(newDiagInput)) {
      setCustomDiagnoses([...customDiagnoses, newDiagInput]);
      setNewDiagInput('');
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, drug: any) => {
    e.stopPropagation();
    const updated = { ...drug, isFavorite: !drug.isFavorite };
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).put(updated).onsuccess = () => {
      setRefreshTrigger(prev => prev + 1);
    };
  };

  const handleAddManualDrug = async () => {
    if (!manualDrug.name) return;
    const newId = `custom-${Date.now()}`;
    const drugData = { 
      id: newId,
      name: manualDrug.name,
      name_lower: manualDrug.name.toLowerCase(),
      defaultStrength: manualDrug.strength,
      defaultInstructions: manualDrug.instructions,
      category: manualDrug.category,
      isFavorite: false
    };
    
    try {
      const tx = db.transaction(DRUG_STORE, 'readwrite');
      const store = tx.objectStore(DRUG_STORE);
      store.put(drugData).onsuccess = () => {
        setMeds([...meds, { ...drugData, strength: manualDrug.strength, quantity: '1', instructions: manualDrug.instructions }]);
        setIsAddingManual(false);
        setManualDrug({ name: '', strength: '', instructions: 'Once daily', category: 'General' });
        setSearch('');
        setRefreshTrigger(prev => prev + 1);
      };
    } catch (e) { console.error(e); }
  };

  const updateMed = (index: number, field: string, value: string) => {
    const newMedsList = [...meds];
    newMedsList[index] = { ...newMedsList[index], [field]: value };
    setMeds(newMedsList);
  };

  const appendInstructionPart = (index: number, opt: string) => {
    const current = meds[index].instructions || '';
    if (current.includes(opt)) return; 
    const next = current ? `${current} - ${opt}` : opt;
    updateMed(index, 'instructions', next);
  };

  const QUICK_INSTRUCTIONS = [
    'Once daily',
    'Twice daily (q12h)',
    'Three times daily (q8h)',
    'Four times daily (q6h)',
    'At bedtime',
    'Morning (fasting)',
    'After meal',
    'Before meal',
    'As needed (PRN)'
  ];
  const QUICK_DOSES = ['1 Tablet', '1/2 Tablet', '2 Tablets', '5 ml', '10 ml', '1 Ampoule', '1 Teaspoon', 'As directed'];
  const ADMINISTRATION_ROUTES = ['PO', 'IM', 'IV'];

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
        
        <div className="flex gap-2 justify-end mb-2">
           <input className="flex-1 max-w-[150px] p-2 bg-gray-50 border rounded-xl text-[10px] outline-none" placeholder="شکایت جدید..." value={newCCInput} onChange={e => setNewCCInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomCC()} />
           <button onClick={addCustomCC} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-wrap gap-1 justify-end">
          {MEDICAL_CC_CATEGORIES.flatMap(cat => cat.items).concat(customCCs).map(item => (
            <button key={item} onClick={() => toggleCC(item)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${cc.includes(item) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <label className="font-bold text-indigo-700 flex items-center justify-end gap-2">
          تشخیص مریض (Diagnosis) <FileText className="w-4 h-4" />
        </label>
        <input className="w-full p-4 bg-gray-50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Diagnosis..." value={diag} onChange={e => setDiag(e.target.value)} />
        
        <div className="flex gap-2 justify-end mb-2">
           <input className="flex-1 max-w-[150px] p-2 bg-gray-50 border rounded-xl text-[10px] outline-none" placeholder="تشخیص جدید..." value={newDiagInput} onChange={e => setNewDiagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomDiag()} />
           <button onClick={addCustomDiag} className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
        </div>

        <div className="flex flex-wrap gap-1 justify-end">
          {MEDICAL_DIAGNOSES.flatMap(cat => cat.items).concat(customDiagnoses).map(item => (
            <button key={item} onClick={() => toggleDiag(item)} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${diag.includes(item) ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{item}</button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4 text-right border border-gray-100">
        <div className="flex flex-col border-b pb-3 mb-2 gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-indigo-700 flex items-center gap-2">دواهای تجویزی <Database className="w-4 h-4" /></h3>
            <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => { setShowCustomOnly(false); setShowFavoritesOnly(false); setSearch('Tab '); }} className="whitespace-nowrap px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-[9px] font-bold border border-blue-100">سرچ تابلیت</button>
              <button onClick={() => { setShowCustomOnly(false); setShowFavoritesOnly(false); setSearch('Cap '); }} className="whitespace-nowrap px-2.5 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-bold border border-amber-100">سرچ کپسول</button>
              <button onClick={() => { setShowCustomOnly(false); setShowFavoritesOnly(false); setSearch('Syp '); }} className="whitespace-nowrap px-2.5 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-bold border border-emerald-100">سرچ شربت</button>
              <button onClick={() => setIsAddingManual(true)} className="whitespace-nowrap px-2.5 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[9px] font-bold border border-rose-100">افزودن دارو خود ما</button>
              <button onClick={() => { setShowCustomOnly(!showCustomOnly); setShowFavoritesOnly(false); }} className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${showCustomOnly ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}>انتخاب دارو خود ما</button>
              <button onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowCustomOnly(false); }} className={`whitespace-nowrap px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${showFavoritesOnly ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>انتخاب دوای دلخواه</button>
            </div>
          </div>
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input id="drug-search-input" className="text-sm w-full py-3 pr-10 pl-3 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100" placeholder={showFavoritesOnly ? "جستجو در داروهای دلخواه..." : showCustomOnly ? "جستجو در داروهای شخصی شما..." : "جستجوی دوا..."} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {isAddingManual && (
          <div className="bg-emerald-50 p-4 rounded-2xl space-y-3 border border-emerald-100 fade-in">
            <div className="text-xs font-bold text-emerald-800">ثبت داروی جدید</div>
            <input className="w-full p-3 bg-white border-0 rounded-xl text-xs" placeholder="نام دوا" value={manualDrug.name} onChange={e => setManualDrug({...manualDrug, name: e.target.value})} />
            <div className="flex gap-2">
              <input className="flex-1 p-3 bg-white border-0 rounded-xl text-xs" placeholder="دوز (e.g. 500mg)" value={manualDrug.strength} onChange={e => setManualDrug({...manualDrug, strength: e.target.value})} />
              <input className="flex-1 p-3 bg-white border-0 rounded-xl text-xs" placeholder="کتگوری" value={manualDrug.category} onChange={e => setManualDrug({...manualDrug, category: e.target.value})} />
            </div>
            <input className="w-full p-3 bg-white border-0 rounded-xl text-xs" placeholder="طریقه مصرف" value={manualDrug.instructions} onChange={e => setManualDrug({...manualDrug, instructions: e.target.value})} />
            <div className="flex flex-wrap gap-1">
              {QUICK_DOSES.map(opt => (
                <button key={opt} onClick={() => setManualDrug({...manualDrug, instructions: manualDrug.instructions ? `${manualDrug.instructions} - ${opt}` : opt})} className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-200 transition-colors">{opt}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 border-t border-emerald-100 pt-1">
              {QUICK_INSTRUCTIONS.map(opt => (
                <button key={opt} onClick={() => setManualDrug({...manualDrug, instructions: manualDrug.instructions ? `${manualDrug.instructions} - ${opt}` : opt})} className="text-[9px] bg-white px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors">{opt}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleAddManualDrug} className="flex-1 bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs">ثبت و اضافه</button>
              <button onClick={() => setIsAddingManual(false)} className="bg-white text-gray-400 p-3 rounded-xl font-bold text-xs border border-emerald-100">لغو</button>
            </div>
          </div>
        )}

        <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
          {drugResults.map(d => (
            <div key={d.id} className="relative group">
              <button onClick={() => setMeds([...meds, { ...d, strength: d.defaultStrength, quantity: '1', instructions: d.defaultInstructions }])} className="w-full p-3 bg-gray-50 hover:bg-indigo-50 transition-all rounded-xl text-right text-sm border border-transparent hover:border-indigo-100 flex justify-between items-center pr-10">
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-indigo-400 font-mono">{d.category}</span>
                <span className="font-bold">{d.name} <span className="text-gray-400 text-xs font-normal">({d.defaultStrength})</span></span>
              </button>
              <button onClick={(e) => handleToggleFavorite(e, d)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white rounded-full transition-all">
                <Star className={`w-4 h-4 ${d.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2">
          {meds.map((m, i) => (
            <div key={i} className="flex flex-col p-3 bg-indigo-50 rounded-2xl ltr shadow-sm space-y-2 border border-indigo-100/50">
              <div className="flex justify-between items-center">
                <button onClick={() => setMeds(meds.filter((_, idx) => idx !== i))} className="p-2 hover:bg-red-50 rounded-full"><Trash2 className="w-4 h-4 text-red-500" /></button>
                <div className="text-left flex-1 px-4"><b className="text-indigo-900 font-bold">{m.name}</b></div>
              </div>
              <div className="flex gap-2 items-center px-4">
                <input className="w-24 p-2 text-[10px] rounded-lg bg-white/70 outline-none" placeholder="Dose" value={m.strength || ''} onChange={e => updateMed(i, 'strength', e.target.value)} />
                <input className="w-14 p-2 text-[10px] rounded-lg bg-white/70 outline-none text-center" placeholder="Qty" value={m.quantity || ''} onChange={e => updateMed(i, 'quantity', e.target.value)} />
                <div className="flex-1 flex flex-col gap-1">
                  <input className="w-full p-2 text-[10px] rounded-lg bg-white/70 outline-none" placeholder="Instructions" value={m.instructions || ''} onChange={e => updateMed(i, 'instructions', e.target.value)} />
                  <div className="flex flex-wrap gap-1 items-center rtl">
                     <span className="text-[9px] text-indigo-700 font-bold ml-1">Dose:</span>
                    {QUICK_DOSES.map(opt => (
                      <button key={opt} onClick={() => appendInstructionPart(i, opt)} className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200 hover:bg-indigo-200 transition-colors font-bold">{opt}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 border-t border-indigo-100 pt-1 items-center rtl">
                     <span className="text-[9px] text-indigo-700 font-bold ml-1">Timing:</span>
                    {QUICK_INSTRUCTIONS.map(opt => (
                      <button key={opt} onClick={() => appendInstructionPart(i, opt)} className="text-[8px] bg-white/80 px-1.5 py-0.5 rounded border border-indigo-100 hover:bg-white transition-colors">{opt}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1 border-t border-indigo-100 pt-1">
                    {ADMINISTRATION_ROUTES.map(opt => {
                      const nameLower = m.name.toLowerCase();
                      const isPill = nameLower.includes('tab') || nameLower.includes('cap');
                      const isOintment = nameLower.includes('cream') || nameLower.includes('oint');
                      const hide = (opt === 'IM' && isPill) || (opt === 'IV' && isOintment);
                      if (hide) return null;
                      return (
                        <button key={opt} onClick={() => appendInstructionPart(i, opt)} className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded border border-indigo-700 hover:bg-indigo-700 transition-colors">{opt}</button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={() => onSubmit({ patientId: patient.id, cc, diagnosis: diag, medications: meds, clinicalRecords: vitals })} className="w-full bg-indigo-700 text-white p-5 rounded-[2rem] font-bold shadow-xl flex items-center justify-center gap-3">
        <Save className="w-5 h-5" /> ذخیره و چاپ نسخه
      </button>
    </div>
  );
};

const DrugSettings = ({ db }: any) => {
  const [drugs, setDrugs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newDrug, setNewDrug] = useState({ name: '', strength: '', instructions: 'Once daily', category: 'General' });

  const loadDrugs = () => {
    if (!db) return;
    const tx = db.transaction(DRUG_STORE, 'readonly');
    const store = tx.objectStore(DRUG_STORE);
    const searchLower = search.toLowerCase();

    if (searchLower) {
      const index = store.index('name_lower');
      const results: any[] = [];
      const range = IDBKeyRange.bound(searchLower, searchLower + '\uffff');
      index.openCursor(range).onsuccess = (e: any) => {
        const cursor = e.target.result;
        if (cursor && results.length < 50) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          setDrugs(results);
        }
      };
    } else {
      store.getAll(null, 50).onsuccess = (e: any) => setDrugs(e.target.result);
    }
  };

  useEffect(() => { loadDrugs(); }, [db, search, refreshTrigger]);

  const handleToggleFavorite = async (e: React.MouseEvent, drug: any) => {
    e.stopPropagation();
    const updated = { ...drug, isFavorite: !drug.isFavorite };
    const tx = db.transaction(DRUG_STORE, 'readwrite');
    tx.objectStore(DRUG_STORE).put(updated).onsuccess = () => {
      setRefreshTrigger(prev => prev + 1);
    };
  };

  const handleSaveNewDrug = async () => {
    if (!newDrug.name) return;
    const drugData = {
      id: `man-${Date.now()}`,
      name: newDrug.name,
      name_lower: newDrug.name.toLowerCase(),
      defaultStrength: newDrug.strength,
      defaultInstructions: newDrug.instructions,
      category: newDrug.category,
      isFavorite: false
    };
    try {
      const tx = db.transaction(DRUG_STORE, 'readwrite');
      tx.objectStore(DRUG_STORE).put(drugData).onsuccess = () => {
        setIsAdding(false);
        setNewDrug({ name: '', strength: '', instructions: 'Once daily', category: 'General' });
        setSearch('');
        loadDrugs();
      };
    } catch (e) { console.error(e); }
  };

  const QUICK_OPTS = [
    'Once daily',
    'Twice daily (q12h)',
    'Three times daily (q8h)',
    'Four times daily (q6h)',
    'At bedtime',
    'Morning (fasting)',
    'After meal',
    'Before meal',
    'As needed (PRN)'
  ];
  const QUICK_DOSES = ['1 Tablet', '1/2 Tablet', '2 Tablets', '5 ml', '10 ml', '1 Ampoule', '1 Teaspoon', 'As directed'];

  return (
    <div className="space-y-4 fade-in">
      <h2 className="font-bold text-center text-indigo-900 border-b pb-4">بانک دواها</h2>
      
      <div className="flex flex-col gap-3">
        {!isAdding ? (
          <button onClick={() => setIsAdding(true)} className="w-full p-5 bg-indigo-50 text-indigo-700 rounded-3xl font-bold flex items-center justify-center gap-2 border border-indigo-100">
            <PlusCircle className="w-5 h-5" /> افزودن دوا جدید
          </button>
        ) : (
          <div id="add-manual-section" className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 space-y-4 fade-in">
            <div className="flex justify-between items-center mb-1">
              <button onClick={() => setIsAdding(false)} className="text-gray-400 p-1"><X className="w-5 h-5" /></button>
              <div className="text-xs font-bold text-indigo-800">ثبت داروی جدید در بانک شخصی</div>
            </div>
            <input className="w-full p-4 rounded-2xl bg-gray-50 border outline-none" placeholder="نام دوا" value={newDrug.name} onChange={e => setNewDrug({...newDrug, name: e.target.value})} />
            <div className="flex gap-2">
              <input className="flex-1 p-4 rounded-2xl bg-gray-50 border outline-none" placeholder="دوز" value={newDrug.strength} onChange={e => setNewDrug({...newDrug, strength: e.target.value})} />
              <input className="flex-1 p-4 rounded-2xl bg-gray-50 border outline-none" placeholder="کتگوری" value={newDrug.category} onChange={e => setNewDrug({...newDrug, category: e.target.value})} />
            </div>
            <input className="w-full p-4 rounded-2xl bg-gray-50 border outline-none" placeholder="طریقه مصرف" value={newDrug.instructions} onChange={e => setNewDrug({...newDrug, instructions: e.target.value})} />
            <div className="flex flex-wrap gap-2">
              {QUICK_DOSES.map(opt => (
                <button key={opt} onClick={() => setNewDrug({...newDrug, instructions: newDrug.instructions ? `${newDrug.instructions} - ${opt}` : opt})} className="text-[10px] bg-indigo-50 text-indigo-700 px-3 py-2 rounded border border-indigo-100 hover:bg-indigo-100 font-bold">{opt}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 border-t border-indigo-100 pt-2">
              {QUICK_OPTS.map(opt => (
                <button key={opt} onClick={() => setNewDrug({...newDrug, instructions: newDrug.instructions ? `${newDrug.instructions} - ${opt}` : opt})} className="text-[10px] bg-white px-3 py-2 rounded border border-indigo-100 hover:bg-indigo-50">{opt}</button>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSaveNewDrug} className="flex-2 bg-indigo-600 text-white p-4 rounded-2xl font-bold">ذخیره در بانک</button>
              <button onClick={() => setIsAdding(false)} className="bg-white text-gray-400 p-4 rounded-2xl font-bold">لغو</button>
            </div>
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input className="w-full p-4 pr-10 rounded-2xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm text-sm" placeholder="جستجو در بانک دواها..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid gap-2">
        {drugs.map(d => (
          <div key={d.id} className="bg-white p-4 rounded-2xl shadow-sm text-right border border-gray-50 flex justify-between items-center group">
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  setNewDrug({
                    name: d.name,
                    strength: d.defaultStrength || '',
                    instructions: d.defaultInstructions || 'Once daily',
                    category: d.category || 'General'
                  });
                  setIsAdding(true);
                  document.getElementById('add-manual-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1.5"
                title="کپی به بخش افزودن"
              >
                <Copy className="w-4 h-4" />
                <span className="text-[9px] font-bold">استفاده</span>
              </button>
              <button onClick={(e) => handleToggleFavorite(e, d)} className="p-2.5 bg-amber-50 rounded-xl hover:bg-amber-100 transition-all">
                <Star className={`w-4 h-4 ${d.isFavorite ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
              </button>
            </div>
            <div className="flex flex-col items-end">
              <b className="text-gray-800 font-bold">{d.name}</b>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">{d.defaultStrength}</span>
                <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-indigo-300 font-mono uppercase">{d.category}</span>
              </div>
            </div>
          </div>
        ))}
        {drugs.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">دارویی یافت نشد</div>}
      </div>
    </div>
  );
};

const ClinicSettingsForm = ({ settings, onSave, storedPin, onSavePin, onBack }: any) => {
  const [d, setD] = useState<ClinicSettings>(settings);
  const [newPin, setNewPin] = useState(storedPin);
  const handleSave = () => { onSave(d); onSavePin(newPin); alert('ذخیره شد!'); };
  return (
    <div className="space-y-6 text-right fade-in">
      <div className="flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-full"><ChevronLeft /></button>
        <h2 className="text-xl font-bold text-indigo-900">تنظیمات کلینیک</h2>
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border space-y-4">
        <input className="w-full p-4 rounded-2xl border bg-gray-50" placeholder="نام کلینیک" value={d.name} onChange={e => setD({...d, name: e.target.value})} />
        <input className="w-full p-4 rounded-2xl border bg-gray-50" placeholder="نام داکتر" value={d.doctor} onChange={e => setD({...d, doctor: e.target.value})} />
        <input className="w-full p-4 rounded-2xl border bg-gray-50" placeholder="آدرس" value={d.address} onChange={e => setD({...d, address: e.target.value})} />
        <div className="flex gap-4">
          <button onClick={() => setD({...d, printLayout: {...d.printLayout, pageSize: 'A4'}})} className={`flex-1 p-4 rounded-2xl font-bold border-2 ${d.printLayout.pageSize === 'A4' ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50'}`}>A4</button>
          <button onClick={() => setD({...d, printLayout: {...d.printLayout, pageSize: 'A5'}})} className={`flex-1 p-4 rounded-2xl font-bold border-2 ${d.printLayout.pageSize === 'A5' ? 'bg-indigo-50 border-indigo-600' : 'bg-gray-50'}`}>A5</button>
        </div>
        <input type="password" className="w-full p-4 rounded-2xl border bg-gray-50 text-center" placeholder="رمز جدید PIN" value={newPin} onChange={e => setNewPin(e.target.value)} />
      </div>
      <button onClick={handleSave} className="w-full bg-indigo-700 text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-2"><Save /> ذخیره تغییرات</button>
    </div>
  );
};

const PrescriptionPrintStudio = ({ settings, prescription, patient, onBack }: any) => {
  return (
    <div className="preview-modal-overlay no-print">
      <div className="preview-header-ui">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
        <button onClick={() => window.print()} className="bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Printer className="w-4 h-4" /> چاپ نسخه</button>
      </div>
      <div className="preview-content">
        <div id="print-area" className="shadow-2xl" style={{ 
          width: settings.printLayout.pageSize === 'A5' ? '148mm' : '210mm', 
          minHeight: settings.printLayout.pageSize === 'A5' ? '210mm' : '297mm' 
        }}>
          <div className="rx-header">
            <div className={`${settings.printLayout.pageSize === 'A5' ? 'h-[2.5cm]' : 'h-[4cm]'} w-full`}></div>
            <div className={`flex justify-between items-center pb-2 mb-2 text-[11pt] font-bold ${settings.printLayout.pageSize === 'A5' ? 'mt-4' : 'mt-8'}`} style={{ direction: 'ltr' }}>
              {settings.printLayout.pageSize === 'A4' ? (
                <div className="flex justify-between w-full px-8">
                  <span>Name: {patient.name}</span>
                  <span>Age: {patient.age}</span>
                  <span>Gender: {patient.gender === 'male' ? 'Male' : 'Female'}</span>
                  <span>Date: {new Date(prescription.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
                </div>
              ) : (
                <>
                  <div className="flex gap-20 pl-8">
                    <span>Name: {patient.name}</span>
                    <span>Age: {patient.age}</span>
                    <span className="relative -top-[4px]">Gender: {patient.gender === 'male' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="pr-8 relative -top-[4px]">Date: {new Date(prescription.date).toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                </>
              )}
            </div>
          </div>
          <div className="rx-body">
            <div className="rx-sidebar">
              <div className="text-[8pt] font-bold mb-1">Clinical Record</div>
              <div className="text-[8pt] space-y-1.5 text-left w-full pl-5 pr-1 flex flex-col items-start" style={{ direction: 'ltr' }}>
                <div>BP: {prescription.clinicalRecords.bp || '-'}</div>
                <div>HR: {prescription.clinicalRecords.hr || '-'}</div>
                <div>PR: {prescription.clinicalRecords.pr || '-'}</div>
                <div>SpO2: {prescription.clinicalRecords.spo2 || '-'}</div>
                <div>Temp: {prescription.clinicalRecords.temp || '-'}</div>
                <div>Wt: {prescription.clinicalRecords.wt || '-'}</div>
                <div className="pt-3 font-bold">Chief Complain</div>
                <div className="pl-1">{prescription.cc || '-'}</div>
                {settings.printLayout.pageSize === 'A4' ? (
                  <div className="pt-24 flex flex-col items-start w-full">
                    <div className="font-bold">Diagnosis</div>
                    <div className="text-left w-full px-1 pt-1">{prescription.diagnosis || '-'}</div>
                  </div>
                ) : (
                  <>
                    <div className="pt-14 font-bold">Diagnosis</div>
                    <div className="text-center w-full px-1">{prescription.diagnosis || '-'}</div>
                  </>
                )}
              </div>
              <div className={`${settings.printLayout.pageSize === 'A5' ? 'mt-40' : 'mt-auto'} mb-12`}>
                <div className="text-[7pt] text-gray-400">CODE</div>
                <div className="font-bold text-[9pt]">{patient.code}</div>
              </div>
            </div>
            <div className="rx-main">
              <ul className="meds-list" style={{ 
                marginTop: settings.printLayout.pageSize === 'A5' ? '0' : '14mm', // Adjusted margin to 14mm for A4 to prevent drug list from starting higher than BP
                paddingLeft: settings.printLayout.pageSize === 'A4' ? '15ch' : '0'
              }}>
                {prescription.medications.map((m: any, idx: number) => (
                  <li key={idx} className="med-item mb-5">
                    <div className="font-bold text-[12pt] flex items-baseline w-full justify-between">
                      <span className="flex-1">
                        {m.name} {m.strength}
                      </span>
                      {m.quantity && m.quantity !== '1' && (
                        <span className={`font-normal text-[11pt] whitespace-nowrap text-right ${settings.printLayout.pageSize === 'A4' ? 'w-[40mm]' : 'w-[25mm]'}`}>
                          N {m.quantity}
                        </span>
                      )}
                    </div>
                    <div className="text-[10pt] text-gray-600 italic ml-8 mt-1">-- {m.instructions}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
