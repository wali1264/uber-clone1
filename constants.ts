import { DrugTemplate, ClinicSettings, DiagnosisTemplate } from './types';

export const INITIAL_DRUGS: DrugTemplate[] = [
  // --- ANALGESICS, NSAIDs & ANTIPYRETICS ---
  { id: '1', name: 'Paracetamol', brandNames: 'Panadol, Calpol, Febrol, Tylenol', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Analgesic', company: 'GSK' },
  { id: '1s', name: 'Paracetamol Syrup', brandNames: 'Panadol, Febrol', form: 'Syrup', defaultStrength: '120mg/5ml', defaultInstructions: 'مطابق وزن طفل - ۸ ساعته', category: 'Pediatrics', company: 'GSK' },
  { id: '1i', name: 'Paracetamol IV', brandNames: 'Perfalgan', form: 'Infusion', defaultStrength: '1gm/100ml', defaultInstructions: 'وریدی - در صورت ضرورت', category: 'Emergency', company: 'BMS' },
  { id: '2', name: 'Ibuprofen', brandNames: 'Brufen, Advil, Motrin', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'NSAID', company: 'Abbott' },
  { id: '3', name: 'Diclofenac Sodium', brandNames: 'Voren, Voltral, Cataflam', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'بعد از غذا - در صورت درد شدید', category: 'NSAID', company: 'Novartis' },
  { id: '4', name: 'Mefenamic Acid', brandNames: 'Ponstan', form: 'Capsule', defaultStrength: '250mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Analgesic', company: 'Pfizer' },
  { id: '5', name: 'Naproxen', brandNames: 'Naprosyn, Aleve', form: 'Tablet', defaultStrength: '250mg', defaultInstructions: '۱۲ ساعته - بعد از غذا', category: 'NSAID', company: 'Roche' },
  { id: 'a1', name: 'Aspirin', brandNames: 'Loprin, Aspec, Cardiprin', form: 'Tablet', defaultStrength: '75mg', defaultInstructions: 'بعد از غذا - روزانه یک عدد', category: 'Antiplatelet', company: 'Bayer' },
  { id: 'c1', name: 'Celecoxib', brandNames: 'Celebrex', form: 'Capsule', defaultStrength: '200mg', defaultInstructions: 'روزانه یک عدد - بعد از غذا', category: 'NSAID', company: 'Pfizer' },
  { id: 't1', name: 'Tramadol', brandNames: 'Tramal, Ultram', form: 'Capsule', defaultStrength: '50mg', defaultInstructions: 'در صورت درد شدید - ۸ ساعته', category: 'Opioid Analgesic', company: 'Grünenthal' },
  { id: 'k1', name: 'Ketorolac', brandNames: 'Toradol', form: 'Injection', defaultStrength: '30mg', defaultInstructions: 'عضلانی - در صورت ضرورت', category: 'NSAID', company: 'Roche' },
  { id: 'm1', name: 'Meloxicam', brandNames: 'Mobic', form: 'Tablet', defaultStrength: '15mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'NSAID', company: 'Boehringer Ingelheim' },
  { id: 'i1', name: 'Indomethacin', brandNames: 'Indocin', form: 'Capsule', defaultStrength: '25mg', defaultInstructions: '۸ تا ۱۲ ساعته بعد از غذا', category: 'NSAID', company: 'MSD' },

  // --- ANTIBIOTICS ---
  { id: '6', name: 'Amoxicillin', brandNames: 'Amoxil, Moxypen', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'قبل از غذا - ۸ ساعته', category: 'Antibiotic', company: 'GSK' },
  { id: '7', name: 'Co-amoxiclav', brandNames: 'Augmentin, Curam, Klavox', form: 'Tablet', defaultStrength: '625mg', defaultInstructions: 'بعد از غذا - ۱۲ ساعته', category: 'Antibiotic', company: 'GSK' },
  { id: '8', name: 'Ciprofloxacin', brandNames: 'Cipro, Novidat, Ciprobay', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic', company: 'Bayer' },
  { id: '9', name: 'Azithromycin', brandNames: 'Zithromax, Azomax', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد - ۵ روز متواتر', category: 'Antibiotic', company: 'Pfizer' },
  { id: '10', name: 'Ceftriaxone', brandNames: 'Rocephin', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'وریدی - روزانه', category: 'Antibiotic', company: 'Roche' },
  { id: '11', name: 'Metronidazole', brandNames: 'Flagyl, Metrogyl', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Anti-amoebic', company: 'Sanofi' },
  { id: '12', name: 'Levofloxacin', brandNames: 'Levaquin, Leflox, Tavanic', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic', company: 'Sanofi' },
  { id: 'c2', name: 'Cefixime', brandNames: 'Caricef, Supraks', form: 'Capsule', defaultStrength: '400mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic', company: 'Sanofi' },

  // --- CARDIOVASCULAR ---
  { id: '19', name: 'Amlodipine', brandNames: 'Norvasc, Amcard', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Antihypertensive', company: 'Pfizer' },
  { id: '20', name: 'Losartan', brandNames: 'Cozaar, Angizar', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihypertensive', company: 'MSD' },
  { id: '21', name: 'Atorvastatin', brandNames: 'Lipitor, Lipiget', form: 'Tablet', defaultStrength: '20mg', defaultInstructions: 'شبانه یک عدد قبل از خواب', category: 'Statin', company: 'Pfizer' },
  { id: 'c5', name: 'Bisoprolol', brandNames: 'Concor', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Beta-blocker', company: 'Merck' },
  { id: 'l3', name: 'Furosemide', brandNames: 'Lasix', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Diuretic', company: 'Sanofi' },

  // --- GASTROINTESTINAL ---
  { id: '14', name: 'Omeprazole', brandNames: 'Risek, Omega, Prilosec', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro', company: 'AstraZeneca' },
  { id: '15', name: 'Esomeprazole', brandNames: 'Nexium, Esomax', form: 'Capsule', defaultStrength: '40mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro', company: 'AstraZeneca' },
  { id: 'p1', name: 'Pantoprazole', brandNames: 'Protonix, Zantac', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'ناشتا - روزانه یک عدد', category: 'Gastro', company: 'Takeda' },

  // --- DERMATOLOGY ---
  { id: 'd-1', name: 'Hydrocortisone', brandNames: 'Elica', form: 'Cream', defaultStrength: '1%', defaultInstructions: 'روزی ۲ بار موضعی', category: 'Dermatology', company: 'Bayer' },
  { id: 'd-2', name: 'Clotrimazole', brandNames: 'Canesten', form: 'Cream', defaultStrength: '1%', defaultInstructions: '۱۲ ساعته موضعی', category: 'Dermatology', company: 'Bayer' },
  { id: 'd-3', name: 'Mupirocin', brandNames: 'Bactroban', form: 'Ointment', defaultStrength: '2%', defaultInstructions: '۸ ساعته موضعی', category: 'Dermatology', company: 'GSK' },

  // --- VITAMINS & SUPPLEMENTS ---
  { id: 'v-1', name: 'Vitamin D3', brandNames: 'D-Rise', form: 'Capsule', defaultStrength: '20000 IU', defaultInstructions: 'هفته‌وار یک عدد', category: 'Supplements', company: 'Sun' },
  { id: 'v-2', name: 'Calcium + Vit D', brandNames: 'Calcivita', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'Supplements', company: 'Searle' },
  { id: 'v-3', name: 'B-Complex', brandNames: 'Neurobion', form: 'Tablet', defaultStrength: 'High', defaultInstructions: 'روزانه یک عدد', category: 'Supplements', company: 'Merck' }
];

export const ICD_DIAGNOSES: DiagnosisTemplate[] = [
  { code: 'A09', title: 'Acute diarrhea and gastroenteritis', category: 'Gastrointestinal' },
  { code: 'A01', title: 'Typhoid and paratyphoid fevers', category: 'Infectious' },
  { code: 'E11.9', title: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'I10', title: 'Essential (primary) hypertension', category: 'Cardiology' },
  { code: 'J00', title: 'Acute nasopharyngitis (Common cold)', category: 'Respiratory' },
  { code: 'J45.9', title: 'Asthma, unspecified', category: 'Respiratory' },
  { code: 'N39.0', title: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'M54.5', title: 'Low back pain', category: 'Orthopaedic' }
];

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  name: 'کلینیک تخصصی معالجوی آریانا',
  doctor: 'داکتر احمد فرید صدیقی',
  specialty: 'متخصص امراض داخله عمومی و جراحی',
  address: 'کابل، چهارراهی صدارت، کابل - افغانستان',
  phone: '۰۷۸۸۸۸۸۸۸۸ / ۰۷۹۹۹۹۹۹۹۹',
  tagline: 'تداوی با استندردهای جهانی و مراقبت‌های ویژه',
  language: 'fa',
  printLayout: {
    pageSize: 'A4',
    showPatientName: true,
    showAge: true,
    showWeight: true,
    showDate: true,
    showBP: true,
    showPulse: true,
    showResp: true,
    showTemp: true,
    showDiagnosis: true,
    showDrugList: true,
  }
};