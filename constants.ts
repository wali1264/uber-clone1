
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
  { id: 'n1', name: 'Nimesulide', brandNames: 'Aulin', form: 'Tablet', defaultStrength: '100mg', defaultInstructions: '۱۲ ساعته بعد از غذا', category: 'NSAID', company: 'Helsinn' },

  // --- ANTIBIOTICS & ANTI-INFECTIVES ---
  { id: '6', name: 'Amoxicillin', brandNames: 'Amoxil, Moxypen', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'قبل از غذا - ۸ ساعته', category: 'Antibiotic', company: 'GSK' },
  { id: '7', name: 'Co-amoxiclav', brandNames: 'Augmentin, Curam, Klavox', form: 'Tablet', defaultStrength: '625mg', defaultInstructions: 'بعد از غذا - ۱۲ ساعته', category: 'Antibiotic', company: 'GSK' },
  { id: '7s', name: 'Co-amoxiclav Syrup', brandNames: 'Augmentin, Curam', form: 'Suspension', defaultStrength: '312mg/5ml', defaultInstructions: '۱۲ ساعته', category: 'Pediatrics', company: 'Sandoz' },
  { id: '8', name: 'Ciprofloxacin', brandNames: 'Cipro, Novidat, Ciprobay', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic', company: 'Bayer' },
  { id: '9', name: 'Azithromycin', brandNames: 'Zithromax, Azomax', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد - ۵ روز متواتر', category: 'Antibiotic', company: 'Pfizer' },
  { id: '10', name: 'Ceftriaxone', brandNames: 'Rocephin', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'وریدی - روزانه', category: 'Antibiotic', company: 'Roche' },
  { id: '11', name: 'Metronidazole', brandNames: 'Flagyl, Metrogyl', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Anti-amoebic', company: 'Sanofi' },
  { id: '12', name: 'Levofloxacin', brandNames: 'Levaquin, Leflox, Tavanic', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic', company: 'Sanofi' },
  { id: '13', name: 'Clarithromycin', brandNames: 'Klacid, Klaricid', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic', company: 'Abbott' },
  { id: 'd1', name: 'Doxycycline', brandNames: 'Vibramycin', form: 'Capsule', defaultStrength: '100mg', defaultInstructions: 'بعد از غذا - ۱۲ ساعته', category: 'Antibiotic', company: 'Pfizer' },
  { id: 'm2', name: 'Meropenem', brandNames: 'Meronem', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'وریدی - ۸ ساعته', category: 'Antibiotic', company: 'AstraZeneca' },
  { id: 'f1', name: 'Fluconazole', brandNames: 'Diflucan', form: 'Capsule', defaultStrength: '150mg', defaultInstructions: 'یک عدد - هفته‌وار', category: 'Antifungal', company: 'Pfizer' },
  { id: 'v1', name: 'Vancomycin', brandNames: 'Vancocin', form: 'Injection', defaultStrength: '500mg', defaultInstructions: 'وریدی - ۱۲ ساعته', category: 'Antibiotic', company: 'Lilly' },
  { id: 'c2', name: 'Cefixime', brandNames: 'Caricef, Supraks', form: 'Capsule', defaultStrength: '400mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic', company: 'Sanofi' },
  { id: 'c3', name: 'Cefradine', brandNames: 'Velosef', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: '۶ تا ۸ ساعته', category: 'Antibiotic', company: 'BMS' },

  // --- CARDIOVASCULAR ---
  { id: '19', name: 'Amlodipine', brandNames: 'Norvasc, Amcard', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Antihypertensive', company: 'Pfizer' },
  { id: '20', name: 'Losartan', brandNames: 'Cozaar, Angizar', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihypertensive', company: 'MSD' },
  { id: 'v2', name: 'Valsartan', brandNames: 'Diovan', form: 'Tablet', defaultStrength: '80mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihypertensive', company: 'Novartis' },
  { id: '21', name: 'Atorvastatin', brandNames: 'Lipitor, Lipiget', form: 'Tablet', defaultStrength: '20mg', defaultInstructions: 'شبانه یک عدد قبل از خواب', category: 'Statin', company: 'Pfizer' },
  { id: 'r1', name: 'Rosuvastatin', brandNames: 'Crestor', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد', category: 'Statin', company: 'AstraZeneca' },
  { id: 'c5', name: 'Bisoprolol', brandNames: 'Concor', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Beta-blocker', company: 'Merck' },
  { id: 'l3', name: 'Furosemide', brandNames: 'Lasix', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Diuretic', company: 'Sanofi' },
  { id: 'p2', name: 'Clopidogrel', brandNames: 'Plavix', form: 'Tablet', defaultStrength: '75mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'Antiplatelet', company: 'Sanofi' },

  // --- GASTROINTESTINAL ---
  { id: '14', name: 'Omeprazole', brandNames: 'Risek, Omega, Prilosec', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro', company: 'AstraZeneca' },
  { id: '15', name: 'Esomeprazole', brandNames: 'Nexium, Esomax', form: 'Capsule', defaultStrength: '40mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro', company: 'AstraZeneca' },
  { id: 'p1', name: 'Pantoprazole', brandNames: 'Protonix, Zantac', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'ناشتا - روزانه یک عدد', category: 'Gastro', company: 'Takeda' },
  { id: '18', name: 'Hyoscine', brandNames: 'Buscopan', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'در صورت درد شکم - ۸ ساعته', category: 'Antispasmodic', company: 'Sanofi' },

  // --- DIABETES ---
  { id: '22', name: 'Metformin', brandNames: 'Glucophage', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'بعد از غذا', category: 'Anti-diabetic', company: 'Merck' },
  { id: '23', name: 'Glibenclamide', brandNames: 'Daonil', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'قبل از صبحانه', category: 'Anti-diabetic', company: 'Sanofi' },
  { id: 'j1', name: 'Sitagliptin', brandNames: 'Januvia', form: 'Tablet', defaultStrength: '100mg', defaultInstructions: 'روزانه یک عدد', category: 'Anti-diabetic', company: 'MSD' },

  // --- RESPIRATORY ---
  { id: '25', name: 'Salbutamol', brandNames: 'Ventolin', form: 'Inhaler', defaultStrength: '100mcg', defaultInstructions: 'در صورت تنگی نفس - ۲ پف', category: 'Respiratory', company: 'GSK' },
  { id: '26', name: 'Montelukast', brandNames: 'Singulair', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد', category: 'Anti-asthmatic', company: 'MSD' },
  { id: '27', name: 'Cetirizine', brandNames: 'Zyrtec', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد (در صورت حساسیت)', category: 'Antihistamine', company: 'UCB' },

  // --- PSYCHIATRY ---
  { id: 'z2', name: 'Sertraline', brandNames: 'Zoloft', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'روزانه یک عدد', category: 'Antidepressant', company: 'Pfizer' },
  { id: 'p6', name: 'Fluoxetine', brandNames: 'Prozac', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'صبحانه یک عدد', category: 'Antidepressant', company: 'Lilly' },
  { id: 'x1', name: 'Alprazolam', brandNames: 'Xanax', form: 'Tablet', defaultStrength: '0.5mg', defaultInstructions: 'در صورت اضطراب شدید', category: 'Benzodiazepine', company: 'Pfizer' }
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
  tagline: 'تداوی با استندردهای جهانی و مراقبت‌های ویژه'
};
