
import React, { useState, useEffect, useRef } from 'react';
import { Patient, Doctor, Medication, Prescription, DrugForm, DrugInfo, ClinicalRecord, Specialty } from '../types';
import { GASTRO_SYMPTOMS, GASTRO_HISTORY } from '../constants';
import { getAiPrescriptionAdvice, parseVoicePrescription } from '../services/gemini';

interface PrescriptionFormProps {
  doctor: Doctor;
  patient: Patient | null;
  recentPrescriptions: Prescription[];
  allDrugs: DrugInfo[];
  onSave: (p: Prescription) => void;
  onCancel: () => void;
  onAddDrug?: (d: DrugInfo) => void;
  fontConfig: { family: string, size: number, direction: 'rtl' | 'ltr' };
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ doctor, patient, recentPrescriptions, allDrugs, onSave, onCancel, onAddDrug, fontConfig }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [nextVisit, setNextVisit] = useState('');
  const [meds, setMeds] = useState<Medication[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [drugSearch, setDrugSearch] = useState('');
  
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Quick Add Drug Modal State
  const [showQuickAddDrug, setShowQuickAddDrug] = useState(false);
  const [newQuickDrug, setNewQuickDrug] = useState<Partial<DrugInfo>>({
    tradeName: '', genericName: '', defaultForm: DrugForm.TABLET, standardDoses: ['500mg']
  });

  const [printSize, setPrintSize] = useState<'A4' | 'A5' | 'Custom'>('A5');
  const [customDimensions, setCustomDimensions] = useState({ width: 148, height: 210 });
  const [margins, setMargins] = useState({ top: 10, bottom: 10, left: 15, right: 15 });
  
  const [clinicalRecord, setClinicalRecord] = useState<ClinicalRecord>({
    bp: '', hr: '', pr: '', spo2: '', temp: '', cc: '',
    specialtyData: {}
  });

  const [newMed, setNewMed] = useState<Partial<Medication>>({
    name: '', form: DrugForm.TABLET, dosage: '1', frequency: '1x1', duration: '5 روز', quantity: '', instructions: ''
  });

  const patientHistory = recentPrescriptions.filter(p => p.patientId === patient?.id);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('WebkitSpeechRecognition' in window || 'speechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'fa-IR';

      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsAiLoading(true);
        try {
          const parsedMeds = await parseVoicePrescription(transcript);
          if (parsedMeds && parsedMeds.length > 0) {
            const newMeds = parsedMeds.map((m: any) => ({
              ...m, 
              id: Math.random().toString(), 
              form: DrugForm.TABLET,
              timing: { morning: true, noon: false, night: true, beforeFood: false },
              instructions: m.instructions || '',
              quantity: m.quantity || ''
            }));
            setMeds(prev => [...prev, ...newMeds]);
          }
        } catch (e) {
          console.error("Voice parse error", e);
        } finally {
          setIsAiLoading(false);
          setIsRecording(false);
        }
      };
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) recognitionRef.current?.stop();
    else { setIsRecording(true); recognitionRef.current?.start(); }
  };

  const handleAiCheck = async () => {
    if (!patient || meds.length === 0) return;
    setIsAiLoading(true);
    const advice = await getAiPrescriptionAdvice(diagnosis, patient, meds);
    setAiAdvice(advice);
    setIsAiLoading(false);
  };

  const handleSizePreset = (size: 'A4' | 'A5' | 'Custom') => {
    setPrintSize(size);
    if (size === 'A4') setCustomDimensions({ width: 210, height: 297 });
    else if (size === 'A5') setCustomDimensions({ width: 148, height: 210 });
  };

  const handleQuickAddDrug = () => {
    if (!newQuickDrug.tradeName || !onAddDrug) return;
    const drug: DrugInfo = {
      ...newQuickDrug as DrugInfo,
      id: `d-quick-${Date.now()}`,
      standardDoses: Array.isArray(newQuickDrug.standardDoses) ? newQuickDrug.standardDoses : [(newQuickDrug.standardDoses as any) || '500mg'],
      contraindications: [],
      alternatives: []
    };
    onAddDrug(drug);
    setShowQuickAddDrug(false);
    setNewQuickDrug({ tradeName: '', genericName: '', defaultForm: DrugForm.TABLET, standardDoses: ['500mg'] });
  };

  const addMed = (drugFromDb?: any) => {
    const medToAdd = drugFromDb ? {
      id: Math.random().toString(), name: drugFromDb.tradeName, form: drugFromDb.defaultForm,
      dosage: '1', frequency: '1x2', duration: '7 روز',
      timing: { morning: true, noon: false, night: true, beforeFood: false },
      quantity: '', instructions: ''
    } : { ...newMed, id: Math.random().toString() } as Medication;
    
    setMeds([...meds, medToAdd as Medication]);
    setNewMed({ name: '', form: DrugForm.TABLET, dosage: '1', frequency: '1x1', duration: '5 روز', quantity: '', instructions: '' });
    setDrugSearch('');
  };

  const toggleSpecialtyData = (field: string) => {
    setClinicalRecord(prev => ({
      ...prev,
      specialtyData: {
        ...prev.specialtyData,
        [field]: !prev.specialtyData?.[field]
      }
    }));
  };

  const setHistoryResponse = (field: string, value: boolean) => {
    setClinicalRecord(prev => ({
      ...prev,
      specialtyData: {
        ...prev.specialtyData,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    if (!patient) return;
    onSave({
      id: `rx-${Date.now()}`, patientId: patient.id, patientName: patient.name,
      doctorId: doctor.id, date: new Date().toLocaleDateString('fa-AF'),
      diagnosis, medications: meds, clinicalRecord, nextVisit
    });
  };

  const autoCalculateQty = (index: number) => {
    const med = meds[index];
    const dose = med.dosage.includes('½') ? 0.5 : med.dosage.includes('¼') ? 0.25 : parseFloat(med.dosage) || 1;
    const freqMatch = med.frequency.match(/(\d+)/g);
    const freq = freqMatch ? (freqMatch.length > 1 ? parseInt(freqMatch[1]) : parseInt(freqMatch[0])) : 1;
    const durMatch = med.duration.match(/(\d+)/);
    const dur = durMatch ? parseInt(durMatch[0]) : 1;
    
    const total = Math.ceil(dose * freq * dur);
    const updated = [...meds];
    updated[index].quantity = `${total} عدد`;
    setMeds(updated);
  };

  const quickDoses = ["¼", "½", "1", "2"];
  const quickFreqs = ["1×1", "1×2", "1×3", "1×4", "q8h", "q12h", "PRN"];
  const quickDurations = ["3 روز", "5 روز", "7 روز", "10 روز", "14 روز", "1 ماه"];
  const quickTimings = ["قبل از غذا", "بعد از غذا", "همراه با غذا", "شب وقت خواب"];

  const vitalPlaceholders: Record<string, string> = {
    bp: '120/80',
    hr: '72',
    pr: '72',
    temp: '37°C'
  };

  if (!patient) return <div className="text-center p-12 text-slate-500">لطفاً ابتدا مریض را انتخاب کنید.</div>;

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Sidebar - Vital Signs & Patient Info */}
      <div className="w-full lg:w-80 space-y-4 no-print">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
            <i className="fa-solid fa-heart-pulse text-red-500"></i> Vital Signs (ثابت)
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {['bp', 'hr', 'pr', 'temp'].map(f => (
              <div key={f}>
                <label className="text-[10px] text-slate-400 font-bold uppercase">{f}</label>
                <input 
                  type="text" 
                  placeholder={vitalPlaceholders[f]}
                  className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  value={(clinicalRecord as any)[f]} 
                  onChange={e => setClinicalRecord({...clinicalRecord, [f]: e.target.value})} 
                />
              </div>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-[10px] text-slate-400 font-bold uppercase">SPO2</label>
            <input 
              type="text" 
              placeholder="98%"
              className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
              value={clinicalRecord.spo2} 
              onChange={e => setClinicalRecord({...clinicalRecord, spo2: e.target.value})} 
            />
          </div>
          <div className="mt-3">
            <label className="text-[10px] text-slate-400 font-bold uppercase">CC (شکایت اصلی)</label>
            <textarea 
              className="w-full px-2 py-1.5 bg-slate-50 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500" 
              rows={2}
              placeholder="مثلاً درد شکم شدید..."
              value={clinicalRecord.cc} 
              onChange={e => setClinicalRecord({...clinicalRecord, cc: e.target.value})} 
            />
          </div>
        </div>

        {/* Dynamic Specialty Form Sidebar (e.g., Gastro) */}
        {doctor.specialty === Specialty.GASTROENTEROLOGY && (
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center gap-2">
                <i className="fa-solid fa-clipboard-list text-blue-500"></i> ارزیابی تخصصی گوارش
              </h3>
              <div className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">علایم (Checklist)</label>
                   <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                      {GASTRO_SYMPTOMS.map(s => (
                        <label key={s.id} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 hover:bg-slate-50 p-1 rounded cursor-pointer">
                          <input type="checkbox" checked={!!clinicalRecord.specialtyData?.[s.id]} onChange={() => toggleSpecialtyData(s.id)} className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                          {s.label}
                        </label>
                      ))}
                   </div>
                 </div>
                 
                 <div className="pt-4 border-t border-slate-50">
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">سابقه بیماری (History)</label>
                   <div className="space-y-2">
                      {GASTRO_HISTORY.map(h => (
                        <div key={h.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-600 font-medium">{h.label}</span>
                          <div className="flex gap-1">
                             <button 
                               onClick={() => setHistoryResponse(h.id, true)}
                               className={`px-2 py-0.5 rounded border text-[10px] font-bold ${clinicalRecord.specialtyData?.[h.id] === true ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>بلی</button>
                             <button 
                               onClick={() => setHistoryResponse(h.id, false)}
                               className={`px-2 py-0.5 rounded border text-[10px] font-bold ${clinicalRecord.specialtyData?.[h.id] === false ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-200 text-slate-400'}`}>خیر</button>
                          </div>
                        </div>
                      ))}
                   </div>
                 </div>
              </div>
           </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-[280px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-sm">بانک دوا</h3>
            <button onClick={() => setShowQuickAddDrug(true)} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-bold hover:bg-blue-100 transition-all">
               <i className="fa-solid fa-plus ml-1"></i> افزودن به بانک
            </button>
          </div>
          <input type="text" placeholder="نام دوا..." className="w-full px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none mb-2"
            value={drugSearch} onChange={(e) => setDrugSearch(e.target.value)} />
          <div className="overflow-y-auto flex-1 space-y-1 custom-scrollbar">
            {allDrugs.filter(d => d.tradeName.toLowerCase().includes(drugSearch.toLowerCase())).slice(0, 15).map(drug => (
              <button key={drug.id} onClick={() => addMed(drug)} className="w-full text-right p-2 rounded-lg bg-slate-50 hover:bg-blue-50 text-[11px] font-bold text-slate-700 flex justify-between border border-transparent hover:border-blue-100">
                <span>{drug.tradeName}</span><i className="fa-solid fa-plus text-slate-300"></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Prescription Entry */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
             <div>
               <h3 className="text-xl font-black text-slate-800">نسخه جدید: {patient.name}</h3>
               <p className="text-xs text-slate-400 mt-1 font-bold">کد مریض: {patient.code} | سن: {patient.age}</p>
             </div>
             <div className="flex items-center gap-3">
               <button onClick={toggleRecording} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                  <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'} text-xl`}></i>
               </button>
               <span className="text-4xl font-serif italic text-slate-200">Rx</span>
             </div>
          </div>

          <div className="space-y-8">
            {meds.map((m, i) => (
              <div key={m.id} className="p-6 bg-slate-50 rounded-[2rem] border border-transparent hover:border-slate-200 hover:bg-white transition-all shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">{i+1}</div>
                  <span className="font-black text-slate-800 text-lg">{m.name} <span className="text-[10px] font-normal opacity-50">({m.form})</span></span>
                  <div className="flex-1"></div>
                  <button onClick={() => autoCalculateQty(i)} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold hover:bg-blue-100 transition-all">محاسبه خودکار تعداد</button>
                  <button onClick={() => setMeds(meds.filter(x => x.id !== m.id))} className="text-red-300 hover:text-red-500 transition-colors p-2"><i className="fa-solid fa-trash-can"></i></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">مقدار دوز (Dose)</label>
                    <input className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 font-bold" value={m.dosage} onChange={e => {
                      const u = [...meds]; u[i].dosage = e.target.value; setMeds(u);
                    }} />
                    <div className="flex flex-wrap gap-1">
                      {quickDoses.map(d => (
                        <button key={d} onClick={() => { const u = [...meds]; u[i].dosage = d; setMeds(u); }} className="text-[9px] px-2 py-0.5 bg-white border border-slate-100 rounded-md hover:bg-blue-50">{d}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">دفعات (Freq)</label>
                    <input className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 font-bold" value={m.frequency} onChange={e => {
                      const u = [...meds]; u[i].frequency = e.target.value; setMeds(u);
                    }} />
                    <div className="flex flex-wrap gap-1">
                      {quickFreqs.map(f => (
                        <button key={f} onClick={() => { const u = [...meds]; u[i].frequency = f; setMeds(u); }} className="text-[9px] px-2 py-0.5 bg-white border border-slate-100 rounded-md hover:bg-blue-50">{f}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">مدت (Dur)</label>
                    <input className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 font-bold" value={m.duration} onChange={e => {
                      const u = [...meds]; u[i].duration = e.target.value; setMeds(u);
                    }} />
                    <div className="flex flex-wrap gap-1">
                      {quickDurations.map(dur => (
                        <button key={dur} onClick={() => { const u = [...meds]; u[i].duration = dur; setMeds(u); }} className="text-[9px] px-2 py-0.5 bg-white border border-slate-100 rounded-md hover:bg-blue-50">{dur}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">تعداد کل (Qty)</label>
                    <input className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 font-bold" placeholder="مثلاً ۲۰ عدد" value={m.quantity || ''} onChange={e => {
                      const u = [...meds]; u[i].quantity = e.target.value; setMeds(u);
                    }} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-1 block">دستور مصرف (Instr)</label>
                    <input className="w-full text-xs bg-white border border-slate-200 rounded-xl py-2.5 px-3 outline-none focus:border-blue-500 font-bold" value={m.instructions || ''} onChange={e => {
                      const u = [...meds]; u[i].instructions = e.target.value; setMeds(u);
                    }} />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-black text-slate-300 uppercase">انتخاب زمان:</span>
                  {quickTimings.map(qi => (
                    <button key={qi} onClick={() => { const u = [...meds]; u[i].instructions = u[i].instructions ? `${u[i].instructions}، ${qi}` : qi; setMeds(u); }} className="text-[10px] bg-white border border-slate-200 rounded-full px-3 py-1 text-slate-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all font-bold">
                      {qi}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {meds.length === 0 && (
              <div className="h-64 border-2 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 gap-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-prescription text-4xl opacity-20"></i>
                </div>
                <p className="text-sm font-bold">دواها را انتخاب کنید تا دستور مصرف ظاهر شود</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Diagnosis (تشخیص نهایی)</label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-black focus:ring-1 focus:ring-blue-500 shadow-inner" rows={3} value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="..." />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Follow up / توصیه</label>
                <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm focus:ring-1 focus:ring-blue-500 shadow-inner" rows={3} value={nextVisit} onChange={e => setNextVisit(e.target.value)} placeholder="..." />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button onClick={() => setShowPreview(true)} className="flex-1 min-w-[150px] bg-white border-2 border-slate-100 text-slate-700 py-4.5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
            <i className="fa-solid fa-print text-xl"></i> تنظیمات چاپ
          </button>
          <button onClick={handleAiCheck} disabled={isAiLoading || meds.length === 0} className="flex-1 min-w-[150px] bg-amber-500 text-white py-4.5 rounded-2xl font-black shadow-lg shadow-amber-50 hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2">
            <i className="fa-solid fa-robot"></i> بررسی هوشمند
          </button>
          <button onClick={handleSave} className="flex-1 min-w-[150px] bg-blue-600 text-white py-4.5 rounded-2xl font-black shadow-lg shadow-blue-50">ثبت نهایی و ذخیره</button>
        </div>
      </div>

      {/* Advanced Print Preview */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 no-print animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-[95vw] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[95vh]">
            
            <div className="w-full md:w-80 bg-slate-50 border-l border-slate-200 p-8 overflow-y-auto flex flex-col">
              <h3 className="font-black text-slate-800 text-xl mb-8 flex items-center gap-2">
                <i className="fa-solid fa-sliders text-blue-600"></i> Page Setup
              </h3>
              <div className="space-y-8 flex-1">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-3">اندازه کاغذ</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['A4', 'A5', 'Custom'].map(size => (
                      <button key={size} onClick={() => handleSizePreset(size as any)} className={`py-3 rounded-xl text-xs font-bold border transition-all ${printSize === size ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-400 border-slate-200'}`}>{size}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-blue-500" value={customDimensions.width} onChange={e => setCustomDimensions({...customDimensions, width: parseInt(e.target.value) || 0})} />
                  <input type="number" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-black outline-none focus:ring-1 focus:ring-blue-500" value={customDimensions.height} onChange={e => setCustomDimensions({...customDimensions, height: parseInt(e.target.value) || 0})} />
                </div>
                <div className="pt-8 space-y-3">
                  <button onClick={() => window.print()} className="w-full bg-blue-600 text-white py-4.5 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">چاپ نهایی</button>
                  <button onClick={() => setShowPreview(false)} className="w-full bg-white border border-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold">بازگشت</button>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-slate-200 p-6 md:p-12 overflow-y-auto flex flex-col items-center custom-scrollbar">
              <div id="printable-prescription" className="bg-white shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] transition-all duration-300 text-slate-900 origin-top mb-10" dir={fontConfig.direction}
                style={{ 
                  width: `${customDimensions.width}mm`, 
                  minHeight: `${customDimensions.height}mm`, 
                  paddingTop: `${margins.top}mm`, 
                  paddingBottom: `${margins.bottom}mm`, 
                  paddingLeft: `${margins.left}mm`, 
                  paddingRight: `${margins.right}mm`,
                  fontFamily: fontConfig.family,
                  fontSize: `${fontConfig.size}px`
                }}>
                <style>{`@media print { @page { size: ${customDimensions.width}mm ${customDimensions.height}mm; margin: 0; } body { margin: 0; padding: 0; } #printable-prescription { width: 100% !important; height: 100% !important; box-shadow: none !important; margin: 0 !important; } .no-print { display: none !important; } * { -webkit-print-color-adjust: exact !important; } }`}</style>
                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start pb-6 mb-8 border-b-2 border-slate-900">
                    <div>
                      <h1 className="text-2xl font-black leading-tight text-slate-900">{doctor.name}</h1>
                      <p className="text-sm font-bold text-slate-600">{doctor.specialty}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5">{doctor.clinicName}</p>
                    </div>
                    <div className="text-end text-[11px] font-bold leading-relaxed text-slate-700">
                      <p>کابل، افغانستان</p>
                      <p>تماس: {doctor.phone || '۰۷۸۹۰۰۰۰۰۰'}</p>
                      <p className="text-slate-900 mt-1 font-black">{new Date().toLocaleDateString('fa-AF')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6 text-xs mb-10 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <p>نام مریض: <span className="font-black">{patient.name}</span></p>
                    <p className="text-center">سن: <span className="font-black">{patient.age} سال</span></p>
                    <p className="text-end">شناسه: <span className="font-black">{patient.code}</span></p>
                  </div>
                  <div className="flex gap-10 flex-grow">
                    <div className="w-1/4 pe-6 space-y-4 text-[11px] border-e border-slate-200">
                      <h4 className="font-black border-b border-slate-900 pb-1.5 uppercase tracking-tighter">Observations</h4>
                      {['bp', 'hr', 'temp', 'spo2'].map(s => <div key={s} className="flex justify-between border-b border-dotted border-slate-300 pb-1.5 uppercase"><span className="opacity-50 font-bold">{s}:</span><span className="font-black">{(clinicalRecord as any)[s] || '---'}</span></div>)}
                      {clinicalRecord.cc && <div className="mt-6 pt-4 border-t border-slate-100"><span className="opacity-30 block mb-1 text-[9px] font-black uppercase">Chief Complaint:</span><p className="italic leading-relaxed font-medium">{clinicalRecord.cc}</p></div>}
                    </div>
                    <div className="flex-1">
                      <span className="text-7xl font-serif italic mb-8 block leading-none font-black text-slate-900">Rx</span>
                      <div className="space-y-8">
                        {meds.map((m, i) => (
                          <div key={m.id} className="ps-4 border-s-2 border-slate-50">
                            <p className="font-black text-xl mb-2 text-slate-900">{i+1}. {m.name} <span className="text-xs font-normal opacity-40">({m.form})</span></p>
                            <div className="ms-6 space-y-1">
                                <div className="flex flex-wrap gap-x-10 text-[13px] font-black text-slate-800">
                                  <span>{m.dosage} <span className="text-[10px] font-bold opacity-30">({m.frequency})</span></span>
                                  {m.instructions && <span className="text-blue-900">{m.instructions}</span>}
                                </div>
                                <div className="text-[11px] font-bold text-slate-500">
                                  <span>مدت: {m.duration}</span>
                                  {m.quantity && <span className="mr-6 bg-slate-100 px-2 rounded-sm text-slate-900">تعداد کل: {m.quantity}</span>}
                                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-16 pt-8 border-t-2 border-slate-900 flex justify-between items-end">
                    <div className="max-w-[70%] space-y-6">
                      <div>
                        <p className="text-[10px] font-black underline mb-2 uppercase tracking-[0.2em] text-slate-400">Diagnosis:</p>
                        <p className="text-2xl font-black text-slate-900 leading-tight">{diagnosis || '---'}</p>
                      </div>
                      {nextVisit && (
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black opacity-30 mb-1 uppercase tracking-widest">Medical Advice:</p>
                            <p className="text-xs font-bold leading-relaxed">{nextVisit}</p>
                        </div>
                      )}
                    </div>
                    <div className="text-center w-48">
                      <p className="text-[10px] font-black mb-12 uppercase tracking-widest text-slate-400">مهر و امضای داکتر</p>
                      <div className="relative flex items-center justify-center">
                        {doctor.signature && <img src={doctor.signature} className="h-16 mx-auto mix-blend-multiply opacity-80 grayscale contrast-125" />}
                        <div className="absolute border-2 border-slate-100 rounded-full w-24 h-24 border-dashed scale-125 opacity-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Add Drug Modal */}
      {showQuickAddDrug && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-pills text-blue-600"></i> افزودن دوای جدید به دیتابیس
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">نام تجاری (Trade Name)</label>
                <input required className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={newQuickDrug.tradeName} onChange={e => setNewQuickDrug({...newQuickDrug, tradeName: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">نام جنریک (Generic Name)</label>
                <input className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={newQuickDrug.genericName} onChange={e => setNewQuickDrug({...newQuickDrug, genericName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">شکل (Form)</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" value={newQuickDrug.defaultForm} onChange={e => setNewQuickDrug({...newQuickDrug, defaultForm: e.target.value as DrugForm})}>
                    {Object.values(DrugForm).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">دوز استاندارد</label>
                  <input className="w-full px-4 py-2.5 bg-slate-50 border rounded-xl" value={newQuickDrug.standardDoses?.[0]} onChange={e => setNewQuickDrug({...newQuickDrug, standardDoses: [e.target.value]})} />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button onClick={handleQuickAddDrug} className="flex-1 bg-blue-600 text-white py-3.5 rounded-2xl font-black shadow-xl shadow-blue-100 active:scale-95 transition-all">ذخیره در بانک</button>
                <button onClick={() => setShowQuickAddDrug(false)} className="flex-1 bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-bold">انصراف</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionForm;
