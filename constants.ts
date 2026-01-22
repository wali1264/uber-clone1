
import { DrugTemplate, ClinicSettings, DiagnosisTemplate } from './types';

export const INITIAL_DRUGS: DrugTemplate[] = [
  // --- ANALGESICS, NSAIDs & ANTIPYRETICS ---
  { id: '1', name: 'Paracetamol', brandNames: 'Panadol, Calpol, Febrol, Tylenol', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'After meal - every 8 hours', category: 'Analgesic', company: 'GSK' },
  { id: '1s', name: 'Paracetamol Syrup', brandNames: 'Panadol, Febrol', form: 'Syrup', defaultStrength: '120mg/5ml', defaultInstructions: 'As per weight - every 8 hours', category: 'Pediatrics', company: 'GSK' },
  { id: '1i', name: 'Paracetamol IV', brandNames: 'Perfalgan', form: 'Infusion', defaultStrength: '1gm/100ml', defaultInstructions: 'IV - if needed', category: 'Emergency', company: 'BMS' },
  { id: '2', name: 'Ibuprofen', brandNames: 'Brufen, Advil, Motrin', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'After meal - every 8 hours', category: 'NSAID', company: 'Abbott' },
  { id: '3', name: 'Diclofenac Sodium', brandNames: 'Voren, Voltral, Cataflam', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'After meal - for severe pain', category: 'NSAID', company: 'Novartis' },
  { id: '4', name: 'Mefenamic Acid', brandNames: 'Ponstan', form: 'Capsule', defaultStrength: '250mg', defaultInstructions: 'After meal - every 8 hours', category: 'Analgesic', company: 'Pfizer' },
  { id: '5', name: 'Naproxen', brandNames: 'Naprosyn, Aleve', form: 'Tablet', defaultStrength: '250mg', defaultInstructions: 'Every 12 hours - after meal', category: 'NSAID', company: 'Roche' },
  { id: 'a1', name: 'Aspirin', brandNames: 'Loprin, Aspec, Cardiprin', form: 'Tablet', defaultStrength: '75mg', defaultInstructions: 'After meal - once daily', category: 'Antiplatelet', company: 'Bayer' },
  { id: 'c1', name: 'Celecoxib', brandNames: 'Celebrex', form: 'Capsule', defaultStrength: '200mg', defaultInstructions: 'Once daily - after meal', category: 'NSAID', company: 'Pfizer' },
  { id: 't1', name: 'Tramadol', brandNames: 'Tramal, Ultram', form: 'Capsule', defaultStrength: '50mg', defaultInstructions: 'For severe pain - every 8 hours', category: 'Opioid Analgesic', company: 'Grünenthal' },
  { id: 'k1', name: 'Ketorolac', brandNames: 'Toradol', form: 'Injection', defaultStrength: '30mg', defaultInstructions: 'IM - if needed', category: 'NSAID', company: 'Roche' },
  { id: 'm1', name: 'Meloxicam', brandNames: 'Mobic', form: 'Tablet', defaultStrength: '15mg', defaultInstructions: 'Once daily after meal', category: 'NSAID', company: 'Boehringer Ingelheim' },
  { id: 'i1', name: 'Indomethacin', brandNames: 'Indocin', form: 'Capsule', defaultStrength: '25mg', defaultInstructions: 'Every 8-12 hours after meal', category: 'NSAID', company: 'MSD' },

  // --- ANTIBIOTICS ---
  { id: '6', name: 'Amoxicillin', brandNames: 'Amoxil, Moxypen', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'Before meal - every 8 hours', category: 'Antibiotic', company: 'GSK' },
  { id: '7', name: 'Co-amoxiclav', brandNames: 'Augmentin, Curam, Klavox', form: 'Tablet', defaultStrength: '625mg', defaultInstructions: 'After meal - every 12 hours', category: 'Antibiotic', company: 'GSK' },
  { id: '8', name: 'Ciprofloxacin', brandNames: 'Cipro, Novidat, Ciprobay', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'Every 12 hours', category: 'Antibiotic', company: 'Bayer' },
  { id: '9', name: 'Azithromycin', brandNames: 'Zithromax, Azomax', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'Once daily - for 5 days', category: 'Antibiotic', company: 'Pfizer' },
  { id: '10', name: 'Ceftriaxone', brandNames: 'Rocephin', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'IV - daily', category: 'Antibiotic', company: 'Roche' },
  { id: '11', name: 'Metronidazole', brandNames: 'Flagyl, Metrogyl', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'After meal - every 8 hours', category: 'Anti-amoebic', company: 'Sanofi' },
  { id: '12', name: 'Levofloxacin', brandNames: 'Levaquin, Leflox, Tavanic', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'Once daily', category: 'Antibiotic', company: 'Sanofi' },
  { id: 'c2', name: 'Cefixime', brandNames: 'Caricef, Supraks', form: 'Capsule', defaultStrength: '400mg', defaultInstructions: 'Once daily', category: 'Antibiotic', company: 'Sanofi' },

  // --- CARDIOVASCULAR ---
  { id: '19', name: 'Amlodipine', brandNames: 'Norvasc, Amcard', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'Breakfast - once daily', category: 'Antihypertensive', company: 'Pfizer' },
  { id: '20', name: 'Losartan', brandNames: 'Cozaar, Angizar', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'Once daily', category: 'Antihypertensive', company: 'MSD' },
  { id: '21', name: 'Atorvastatin', brandNames: 'Lipitor, Lipiget', form: 'Tablet', defaultStrength: '20mg', defaultInstructions: 'Once daily at bedtime', category: 'Statin', company: 'Pfizer' },
  { id: 'c5', name: 'Bisoprolol', brandNames: 'Concor', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'Breakfast - once daily', category: 'Beta-blocker', company: 'Merck' },
  { id: 'l3', name: 'Furosemide', brandNames: 'Lasix', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'Breakfast - once daily', category: 'Diuretic', company: 'Sanofi' },

  // --- GASTROINTESTINAL ---
  { id: '14', name: 'Omeprazole', brandNames: 'Risek, Omega, Prilosec', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'Empty stomach - 30 mins before meal', category: 'Gastro', company: 'AstraZeneca' },
  { id: '15', name: 'Esomeprazole', brandNames: 'Nexium, Esomax', form: 'Capsule', defaultStrength: '40mg', defaultInstructions: 'Empty stomach - 30 mins before meal', category: 'Gastro', company: 'AstraZeneca' },
  { id: 'p1', name: 'Pantoprazole', brandNames: 'Protonix, Zantac', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'Empty stomach - once daily', category: 'Gastro', company: 'Takeda' },

  // --- DERMATOLOGY ---
  { id: 'd-1', name: 'Hydrocortisone', brandNames: 'Elica', form: 'Cream', defaultStrength: '1%', defaultInstructions: 'Twice daily topically', category: 'Dermatology', company: 'Bayer' },
  { id: 'd-2', name: 'Clotrimazole', brandNames: 'Canesten', form: 'Cream', defaultStrength: '1%', defaultInstructions: 'Every 12 hours topically', category: 'Dermatology', company: 'Bayer' },
  { id: 'd-3', name: 'Mupirocin', brandNames: 'Bactroban', form: 'Ointment', defaultStrength: '2%', defaultInstructions: 'Every 8 hours topically', category: 'Dermatology', company: 'GSK' },

  // --- VITAMINS & SUPPLEMENTS ---
  { id: 'v-1', name: 'Vitamin D3', brandNames: 'D-Rise', form: 'Capsule', defaultStrength: '20000 IU', defaultInstructions: 'Once weekly', category: 'Supplements', company: 'Sun' },
  { id: 'v-2', name: 'Calcium + Vit D', brandNames: 'Calcivita', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'Once daily after meal', category: 'Supplements', company: 'Searle' },
  { id: 'v-3', name: 'B-Complex', brandNames: 'Neurobion', form: 'Tablet', defaultStrength: 'High', defaultInstructions: 'Once daily', category: 'Supplements', company: 'Merck' }
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
