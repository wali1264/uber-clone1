
import { DrugTemplate, ClinicSettings, DiagnosisTemplate } from './types';

export const INITIAL_DRUGS: DrugTemplate[] = [
  // --- ANALGESICS, NSAIDs & ANTIPYRETICS ---
  { id: '1', name: 'Paracetamol', brandNames: 'Panadol, Calpol, Febrol, Tylenol', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Analgesic' },
  { id: '1s', name: 'Paracetamol Syrup', brandNames: 'Panadol, Febrol', form: 'Syrup', defaultStrength: '120mg/5ml', defaultInstructions: 'مطابق وزن طفل - ۸ ساعته', category: 'Pediatrics' },
  { id: '1i', name: 'Paracetamol IV', brandNames: 'Perfalgan', form: 'Infusion', defaultStrength: '1gm/100ml', defaultInstructions: 'وریدی - در صورت ضرورت', category: 'Emergency' },
  { id: '2', name: 'Ibuprofen', brandNames: 'Brufen, Advil, Motrin', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'NSAID' },
  { id: '3', name: 'Diclofenac Sodium', brandNames: 'Voren, Voltral, Cataflam', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'بعد از غذا - در صورت درد شدید', category: 'NSAID' },
  { id: '4', name: 'Mefenamic Acid', brandNames: 'Ponstan', form: 'Capsule', defaultStrength: '250mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Analgesic' },
  { id: '5', name: 'Naproxen', brandNames: 'Naprosyn, Aleve', form: 'Tablet', defaultStrength: '250mg', defaultInstructions: '۱۲ ساعته - بعد از غذا', category: 'NSAID' },
  { id: 'a1', name: 'Aspirin', brandNames: 'Loprin, Aspec, Cardiprin', form: 'Tablet', defaultStrength: '75mg', defaultInstructions: 'بعد از غذا - روزانه یک عدد', category: 'Antiplatelet' },
  { id: 'c1', name: 'Celecoxib', brandNames: 'Celebrex', form: 'Capsule', defaultStrength: '200mg', defaultInstructions: 'روزانه یک عدد - بعد از غذا', category: 'NSAID' },
  { id: 't1', name: 'Tramadol', brandNames: 'Tramal, Ultram', form: 'Capsule', defaultStrength: '50mg', defaultInstructions: 'در صورت درد شدید - ۸ ساعته', category: 'Opioid Analgesic' },
  { id: 'k1', name: 'Ketorolac', brandNames: 'Toradol', form: 'Injection', defaultStrength: '30mg', defaultInstructions: 'عضلانی - در صورت ضرورت', category: 'NSAID' },
  { id: 'm1', name: 'Meloxicam', brandNames: 'Mobic', form: 'Tablet', defaultStrength: '15mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'NSAID' },
  { id: 'i1', name: 'Indomethacin', brandNames: 'Indocin', form: 'Capsule', defaultStrength: '25mg', defaultInstructions: '۸ تا ۱۲ ساعته بعد از غذا', category: 'NSAID' },
  { id: 'n1', name: 'Nimesulide', brandNames: 'Aulin', form: 'Tablet', defaultStrength: '100mg', defaultInstructions: '۱۲ ساعته بعد از غذا', category: 'NSAID' },

  // --- ANTIBIOTICS & ANTI-INFECTIVES ---
  { id: '6', name: 'Amoxicillin', brandNames: 'Amoxil, Moxypen', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'قبل از غذا - ۸ ساعته', category: 'Antibiotic' },
  { id: '7', name: 'Co-amoxiclav', brandNames: 'Augmentin, Curam, Klavox', form: 'Tablet', defaultStrength: '625mg', defaultInstructions: 'بعد از غذا - ۱۲ ساعته', category: 'Antibiotic' },
  { id: '7s', name: 'Co-amoxiclav Syrup', brandNames: 'Augmentin, Curam', form: 'Suspension', defaultStrength: '312mg/5ml', defaultInstructions: '۱۲ ساعته', category: 'Pediatrics' },
  { id: '8', name: 'Ciprofloxacin', brandNames: 'Cipro, Novidat, Ciprobay', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic' },
  { id: '9', name: 'Azithromycin', brandNames: 'Zithromax, Azomax', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد - ۵ روز متواتر', category: 'Antibiotic' },
  { id: '10', name: 'Ceftriaxone', brandNames: 'Rocephin', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'وریدی - روزانه', category: 'Antibiotic' },
  { id: '11', name: 'Metronidazole', brandNames: 'Flagyl, Metrogyl', form: 'Tablet', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته', category: 'Anti-amoebic' },
  { id: '12', name: 'Levofloxacin', brandNames: 'Levaquin, Leflox, Tavanic', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic' },
  { id: '13', name: 'Clarithromycin', brandNames: 'Klacid, Klaricid', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic' },
  { id: 'd1', name: 'Doxycycline', brandNames: 'Vibramycin', form: 'Capsule', defaultStrength: '100mg', defaultInstructions: 'بعد از غذا - ۱۲ ساعته', category: 'Antibiotic' },
  { id: 'm2', name: 'Meropenem', brandNames: 'Meronem', form: 'Injection', defaultStrength: '1gm', defaultInstructions: 'وریدی - ۸ ساعته', category: 'Antibiotic' },
  { id: 'f1', name: 'Fluconazole', brandNames: 'Diflucan', form: 'Capsule', defaultStrength: '150mg', defaultInstructions: 'یک عدد - هفته‌وار', category: 'Antifungal' },
  { id: 'v1', name: 'Vancomycin', brandNames: 'Vancocin', form: 'Injection', defaultStrength: '500mg', defaultInstructions: 'وریدی - ۱۲ ساعته', category: 'Antibiotic' },
  { id: 'c2', name: 'Cefixime', brandNames: 'Caricef, Supraks', form: 'Capsule', defaultStrength: '400mg', defaultInstructions: 'روزانه یک عدد', category: 'Antibiotic' },
  { id: 'c3', name: 'Cefradine', brandNames: 'Velosef', form: 'Capsule', defaultStrength: '500mg', defaultInstructions: '۶ تا ۸ ساعته', category: 'Antibiotic' },
  { id: 'e1', name: 'Erythromycin', brandNames: 'Erythrocin', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۶ ساعته قبل از غذا', category: 'Antibiotic' },
  { id: 'n2', name: 'Nitrofurantoin', brandNames: 'Macrodantin', form: 'Capsule', defaultStrength: '100mg', defaultInstructions: '۶ ساعته برای عفونت ادراری', category: 'Antibiotic' },
  { id: 'l1', name: 'Linezolid', brandNames: 'Zyvox', form: 'Tablet', defaultStrength: '600mg', defaultInstructions: '۱۲ ساعته', category: 'Antibiotic' },
  { id: 'g1', name: 'Gentamicin', brandNames: 'Gentic', form: 'Injection', defaultStrength: '80mg', defaultInstructions: 'وریدی یا عضلانی - روزانه', category: 'Antibiotic' },
  { id: 'c4', name: 'Clindamycin', brandNames: 'Dalacin', form: 'Capsule', defaultStrength: '300mg', defaultInstructions: '۸ ساعته', category: 'Antibiotic' },

  // --- GASTROINTESTINAL SYSTEM ---
  { id: '14', name: 'Omeprazole', brandNames: 'Risek, Omega, Prilosec', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro' },
  { id: '15', name: 'Esomeprazole', brandNames: 'Nexium, Esomax', form: 'Capsule', defaultStrength: '40mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro' },
  { id: 'l2', name: 'Lansoprazole', brandNames: 'Prevacid', form: 'Capsule', defaultStrength: '30mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا', category: 'Gastro' },
  { id: 'p1', name: 'Pantoprazole', brandNames: 'Protonix, Zantac', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'ناشتا - روزانه یک عدد', category: 'Gastro' },
  { id: '16', name: 'Famotidine', brandNames: 'Pepcid', form: 'Tablet', defaultStrength: '20mg', defaultInstructions: 'شبانه یک عدد قبل از خواب', category: 'Gastro' },
  { id: '17', name: 'Domperidone', brandNames: 'Motilium', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'نیم ساعت قبل از غذا - ۸ ساعته', category: 'Antiemetic' },
  { id: '18', name: 'Hyoscine', brandNames: 'Buscopan', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'در صورت درد شکم - ۸ ساعته', category: 'Antispasmodic' },
  { id: 'i2', name: 'Imodium', brandNames: 'Loperamide', form: 'Capsule', defaultStrength: '2mg', defaultInstructions: 'بعد از هر بار اسهال', category: 'Antidiarrheal' },
  { id: 'z1', name: 'Ondansetron', brandNames: 'Zofran', form: 'Tablet', defaultStrength: '8mg', defaultInstructions: 'نیم ساعت قبل از غذا - ۱۲ ساعته', category: 'Antiemetic' },
  { id: 'd2', name: 'Lactulose', brandNames: 'Duphalac', form: 'Syrup', defaultStrength: '120ml', defaultInstructions: 'دو قاشق نان‌خوری شبانه', category: 'Laxative' },
  { id: 'd3', name: 'Bisacodyl', brandNames: 'Dulcolax', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'شبانه ۲ عدد قبل از خواب', category: 'Laxative' },
  { id: 'm3', name: 'Mebeverine', brandNames: 'Colofac', form: 'Tablet', defaultStrength: '135mg', defaultInstructions: '۲۰ دقیقه قبل از غذا - ۸ ساعته', category: 'Antispasmodic' },
  { id: 's1', name: 'Sucralfate', brandNames: 'Ulcogant', form: 'Suspension', defaultStrength: '1gm/5ml', defaultInstructions: 'قبل از غذا - ۸ ساعته', category: 'Gastro' },

  // --- CARDIOVASCULAR SYSTEM ---
  { id: '19', name: 'Amlodipine', brandNames: 'Norvasc, Amcard', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Antihypertensive' },
  { id: '20', name: 'Losartan', brandNames: 'Cozaar, Angizar', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihypertensive' },
  { id: 'v2', name: 'Valsartan', brandNames: 'Diovan', form: 'Tablet', defaultStrength: '80mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihypertensive' },
  { id: '21', name: 'Atorvastatin', brandNames: 'Lipitor, Lipiget', form: 'Tablet', defaultStrength: '20mg', defaultInstructions: 'شبانه یک عدد قبل از خواب', category: 'Statin' },
  { id: 'r1', name: 'Rosuvastatin', brandNames: 'Crestor', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد', category: 'Statin' },
  { id: 'c5', name: 'Bisoprolol', brandNames: 'Concor', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Beta-blocker' },
  { id: 'e2', name: 'Enalapril', brandNames: 'Renitec', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'روزانه یک عدد', category: 'ACE Inhibitor' },
  { id: 'l3', name: 'Furosemide', brandNames: 'Lasix', form: 'Tablet', defaultStrength: '40mg', defaultInstructions: 'صبحانه - روزانه یک عدد', category: 'Diuretic' },
  { id: 'p2', name: 'Clopidogrel', brandNames: 'Plavix', form: 'Tablet', defaultStrength: '75mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'Antiplatelet' },
  { id: 'w1', name: 'Warfarin', brandNames: 'Coumadin', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'مطابق دوز تعیین شده', category: 'Anticoagulant' },
  { id: 'd4', name: 'Digoxin', brandNames: 'Lanoxin', form: 'Tablet', defaultStrength: '0.25mg', defaultInstructions: 'روزانه یک عدد', category: 'Cardiac Glycoside' },
  { id: 's2', name: 'Spironolactone', brandNames: 'Aldactone', form: 'Tablet', defaultStrength: '25mg', defaultInstructions: 'روزانه یک عدد', category: 'Diuretic' },
  { id: 'h1', name: 'Hydralazine', brandNames: 'Apresoline', form: 'Tablet', defaultStrength: '25mg', defaultInstructions: '۸ ساعته', category: 'Antihypertensive' },
  { id: 'c6', name: 'Carvedilol', brandNames: 'Dilatrend', form: 'Tablet', defaultStrength: '6.25mg', defaultInstructions: '۱۲ ساعته', category: 'Beta-blocker' },
  { id: 'n3', name: 'Nitroglycerin', brandNames: 'GTN, Angised', form: 'Sublingual', defaultStrength: '0.5mg', defaultInstructions: 'زیر زبانی - در صورت درد قفسه سینه', category: 'Cardiology' },

  // --- ENDOCRINE & DIABETES ---
  { id: '22', name: 'Metformin', brandNames: 'Glucophage', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'بعد از غذا', category: 'Anti-diabetic' },
  { id: '23', name: 'Glibenclamide', brandNames: 'Daonil', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'قبل از صبحانه', category: 'Anti-diabetic' },
  { id: 'j1', name: 'Sitagliptin', brandNames: 'Januvia', form: 'Tablet', defaultStrength: '100mg', defaultInstructions: 'روزانه یک عدد', category: 'Anti-diabetic' },
  { id: 'l4', name: 'Insulin Glargine', brandNames: 'Lantus', form: 'Injection', defaultStrength: '100 IU/ml', defaultInstructions: 'زیر جلدی - شبانه', category: 'Insulin' },
  { id: 't2', name: 'Levothyroxine', brandNames: 'Thyroxin, Euthyrox', form: 'Tablet', defaultStrength: '50mcg', defaultInstructions: 'ناشتا - صبحانه', category: 'Thyroid' },
  { id: 'p3', name: 'Prednisolone', brandNames: 'Deltacortril', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'بعد از صبحانه', category: 'Corticosteroid' },
  { id: 'd5', name: 'Diamicron', brandNames: 'Gliclazide', form: 'Tablet', defaultStrength: '60mg', defaultInstructions: 'قبل از صبحانه', category: 'Anti-diabetic' },
  { id: 'v3', name: 'Vildagliptin', brandNames: 'Galvus', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: '۱۲ ساعته', category: 'Anti-diabetic' },
  { id: 'p4', name: 'Pioglitazone', brandNames: 'Actos', form: 'Tablet', defaultStrength: '30mg', defaultInstructions: 'روزانه یک عدد', category: 'Anti-diabetic' },

  // --- RESPIRATORY & ALLERGY ---
  { id: '25', name: 'Salbutamol', brandNames: 'Ventolin', form: 'Inhaler', defaultStrength: '100mcg', defaultInstructions: 'در صورت تنگی نفس - ۲ پف', category: 'Respiratory' },
  { id: '26', name: 'Montelukast', brandNames: 'Singulair', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد', category: 'Anti-asthmatic' },
  { id: '27', name: 'Cetirizine', brandNames: 'Zyrtec', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'شبانه یک عدد (در صورت حساسیت)', category: 'Antihistamine' },
  { id: '28', name: 'Loratadine', brandNames: 'Clarityn', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihistamine' },
  { id: '29', name: 'Dexamethasone', brandNames: 'Decadron', form: 'Tablet', defaultStrength: '0.5mg', defaultInstructions: 'بعد از غذا - روزانه', category: 'Corticosteroid' },
  { id: 'f2', name: 'Fluticasone', brandNames: 'Flixonase', form: 'Nasal Spray', defaultStrength: '50mcg', defaultInstructions: 'هر سوراخ بینی - یک پف روزانه', category: 'Corticosteroid' },
  { id: 'p5', name: 'Pulmicort', brandNames: 'Budesonide', form: 'Inhaler', defaultStrength: '200mcg', defaultInstructions: '۱۲ ساعته - ۲ پف', category: 'Corticosteroid' },
  { id: 't3', name: 'Fexofenadine', brandNames: 'Telfast', form: 'Tablet', defaultStrength: '120mg', defaultInstructions: 'روزانه یک عدد', category: 'Antihistamine' },
  { id: 'b1', name: 'Bromhexine', brandNames: 'Bisolvon', form: 'Syrup', defaultStrength: '120ml', defaultInstructions: 'یک قاشق ۸ ساعته', category: 'Mucolytic' },
  { id: 's3', name: 'Symbicort', brandNames: 'Budesonide+Formoterol', form: 'Inhaler', defaultStrength: '160/4.5mcg', defaultInstructions: '۱۲ ساعته - ۲ پف', category: 'Respiratory' },

  // --- NEUROLOGY & PSYCHIATRY ---
  { id: 'v4', name: 'Valium', brandNames: 'Diazepam', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'شبانه در صورت بی‌خوابی', category: 'Benzodiazepine' },
  { id: 'z2', name: 'Zoloft', brandNames: 'Sertraline', form: 'Tablet', defaultStrength: '50mg', defaultInstructions: 'روزانه یک عدد', category: 'Antidepressant' },
  { id: 'p6', name: 'Prozac', brandNames: 'Fluoxetine', form: 'Capsule', defaultStrength: '20mg', defaultInstructions: 'صبحانه یک عدد', category: 'Antidepressant' },
  { id: 't4', name: 'Tryptanol', brandNames: 'Amitriptyline', form: 'Tablet', defaultStrength: '25mg', defaultInstructions: 'شبانه یک عدد', category: 'TCA Antidepressant' },
  { id: 'n4', name: 'Neurontin', brandNames: 'Gabapentin', form: 'Capsule', defaultStrength: '300mg', defaultInstructions: '۸ ساعته', category: 'Anticonvulsant' },
  { id: 'l5', name: 'Lyrica', brandNames: 'Pregabalin', form: 'Capsule', defaultStrength: '75mg', defaultInstructions: 'شبانه یک عدد', category: 'Anticonvulsant' },
  { id: 'e3', name: 'Epival', brandNames: 'Valproate Sodium', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Anticonvulsant' },
  { id: 'k2', name: 'Keppra', brandNames: 'Levetiracetam', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته', category: 'Anticonvulsant' },
  { id: 'l6', name: 'Lexapro', brandNames: 'Escitalopram', form: 'Tablet', defaultStrength: '10mg', defaultInstructions: 'روزانه یک عدد', category: 'Antidepressant' },
  { id: 'x1', name: 'Xanax', brandNames: 'Alprazolam', form: 'Tablet', defaultStrength: '0.5mg', defaultInstructions: 'در صورت اضطراب شدید', category: 'Benzodiazepine' },
  { id: 'q1', name: 'Quetiapine', brandNames: 'Seroquel', form: 'Tablet', defaultStrength: '25mg', defaultInstructions: 'شبانه یک عدد', category: 'Antipsychotic' },
  { id: 'o1', name: 'Olanzapine', brandNames: 'Zyprexa', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'شبانه یک عدد', category: 'Antipsychotic' },

  // --- VITAMINS & SUPPLEMENTS ---
  { id: 's4', name: 'SunnyD', brandNames: 'Vitamin D3', form: 'Capsule', defaultStrength: '200,000 IU', defaultInstructions: 'ماهانه یک عدد', category: 'Vitamin' },
  { id: 'i3', name: 'Iberet', brandNames: 'Ferrous Sulfate', form: 'Tablet', defaultStrength: '200mg', defaultInstructions: 'بعد از غذا - روزانه یک عدد', category: 'Supplement' },
  { id: 'c7', name: 'Cal-C-Vita', brandNames: 'Calcium + Vit D3', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'Supplement' },
  { id: 'c8', name: 'Centrum', brandNames: 'Multivitamin', form: 'Tablet', defaultStrength: 'Standard', defaultInstructions: 'روزانه یک عدد بعد از غذا', category: 'Supplement' },
  { id: 'f3', name: 'Folvite', brandNames: 'Folic Acid', form: 'Tablet', defaultStrength: '5mg', defaultInstructions: 'روزانه یک عدد', category: 'Vitamin' },
  { id: 'n5', name: 'Neurobion', brandNames: 'Vitamin B-Complex', form: 'Tablet', defaultStrength: 'Standard', defaultInstructions: 'روزانه یک عدد', category: 'Vitamin' },
  { id: 'c9', name: 'Cevit', brandNames: 'Vitamin C', form: 'Tablet', defaultStrength: '500mg', defaultInstructions: 'روزانه یک عدد جویدنی', category: 'Vitamin' },

  // --- DERMATOLOGY & TOPICALS ---
  { id: 'c10', name: 'Cortiderm', brandNames: 'Hydrocortisone', form: 'Cream', defaultStrength: '1%', defaultInstructions: 'روزانه ۲ بار روی ناحیه حساس', category: 'Dermatological' },
  { id: 'n6', name: 'Nizoral', brandNames: 'Ketoconazole', form: 'Cream/Shampoo', defaultStrength: '2%', defaultInstructions: 'روزانه ۲ بار روی جلد', category: 'Antifungal' },
  { id: 'b2', name: 'Bactroban', brandNames: 'Mupirocin', form: 'Ointment', defaultStrength: '2%', defaultInstructions: '۸ ساعته روی زخم', category: 'Topical Antibiotic' },
  { id: 'c11', name: 'Canesten', brandNames: 'Clotrimazole', form: 'Cream', defaultStrength: '1%', defaultInstructions: '۱۲ ساعته', category: 'Antifungal' },
  { id: 'f4', name: 'Fucidin', brandNames: 'Fusidic Acid', form: 'Cream', defaultStrength: '2%', defaultInstructions: '۸ تا ۱۲ ساعته روی ناحیه ملوث', category: 'Topical Antibiotic' },
  { id: 'b3', name: 'Betnovate', brandNames: 'Betamethasone', form: 'Cream', defaultStrength: '0.1%', defaultInstructions: 'روزانه ۱ تا ۲ بار', category: 'Corticosteroid' },

  // --- OPHTHALMOLOGY & ENT ---
  { id: 't5', name: 'Timoptic', brandNames: 'Timolol', form: 'Eye Drops', defaultStrength: '0.5%', defaultInstructions: 'هر چشم - یک قطره ۱۲ ساعته', category: 'Anti-glaucoma' },
  { id: 'x2', name: 'Xalatan', brandNames: 'Latanoprost', form: 'Eye Drops', defaultStrength: '0.005%', defaultInstructions: 'شبانه یک قطره', category: 'Anti-glaucoma' },
  { id: 't6', name: 'Tobrex', brandNames: 'Tobramycin', form: 'Eye Drops', defaultStrength: '0.3%', defaultInstructions: 'هر ۴ ساعت یک قطره', category: 'Ophthalmic Antibiotic' },
  { id: 'c12', name: 'Ciloxan', brandNames: 'Ciprofloxacin', form: 'Ear Drops', defaultStrength: '0.3%', defaultInstructions: '۳ قطره ۸ ساعته در گوش', category: 'Otic Antibiotic' },
  { id: 't7', name: 'Tears Naturale', brandNames: 'Artificial Tears', form: 'Eye Drops', defaultStrength: 'Standard', defaultInstructions: 'در صورت خشکی چشم', category: 'Ophthalmic' },
  { id: 'o2', name: 'Otrivin', brandNames: 'Xylometazoline', form: 'Nasal Spray', defaultStrength: '0.1%', defaultInstructions: 'حداکثر ۳ بار در روز', category: 'ENT' }
];

export const ICD_DIAGNOSES: DiagnosisTemplate[] = [
  // --- INFECTIONS & PARASITIC (A00-B99) ---
  { code: 'A09', title: 'Acute diarrhea and gastroenteritis', category: 'Gastrointestinal' },
  { code: 'A01', title: 'Typhoid and paratyphoid fevers', category: 'Infectious' },
  { code: 'A06.0', title: 'Acute amoebic dysentery', category: 'Gastrointestinal' },
  { code: 'B15', title: 'Acute hepatitis A', category: 'Hepatobiliary' },
  { code: 'B35.4', title: 'Tinea corporis (Ringworm)', category: 'Dermatological' },
  { code: 'B00.9', title: 'Herpesviral infection, unspecified', category: 'Infectious' },
  { code: 'A63.0', title: 'Anogenital (venereal) warts', category: 'Infectious' },

  // --- ENDOCRINE & METABOLIC (E00-E90) ---
  { code: 'E11.9', title: 'Type 2 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E10.9', title: 'Type 1 diabetes mellitus without complications', category: 'Endocrine' },
  { code: 'E03.9', title: 'Hypothyroidism, unspecified', category: 'Endocrine' },
  { code: 'E05.9', title: 'Thyrotoxicosis, unspecified', category: 'Endocrine' },
  { code: 'E66.9', title: 'Obesity, unspecified', category: 'Metabolic' },
  { code: 'E55.9', title: 'Vitamin D deficiency, unspecified', category: 'Nutritional' },
  { code: 'E87.6', title: 'Hypokalaemia', category: 'Metabolic' },

  // --- NERVOUS SYSTEM (G00-G99) ---
  { code: 'G43.9', title: 'Migraine, unspecified', category: 'Neurological' },
  { code: 'G44.2', title: 'Tension-type headache', category: 'Neurological' },
  { code: 'G40.9', title: 'Epilepsy, unspecified', category: 'Neurological' },
  { code: 'G62.9', title: 'Polyneuropathy, unspecified', category: 'Neurological' },
  { code: 'G20', title: 'Parkinson disease', category: 'Neurological' },

  // --- CARDIOVASCULAR (I00-I99) ---
  { code: 'I10', title: 'Essential (primary) hypertension', category: 'Cardiology' },
  { code: 'I20.9', title: 'Angina pectoris, unspecified', category: 'Cardiology' },
  { code: 'I25.1', title: 'Atherosclerotic heart disease', category: 'Cardiology' },
  { code: 'I50.9', title: 'Heart failure, unspecified', category: 'Cardiology' },
  { code: 'I48.91', title: 'Unspecified atrial fibrillation', category: 'Cardiology' },
  { code: 'I83.9', title: 'Varicose veins of lower extremities', category: 'Vascular' },

  // --- RESPIRATORY (J00-J99) ---
  { code: 'J00', title: 'Acute nasopharyngitis (Common cold)', category: 'Respiratory' },
  { code: 'J02.9', title: 'Acute pharyngitis, unspecified', category: 'Respiratory' },
  { code: 'J03.9', title: 'Acute tonsillitis, unspecified', category: 'Respiratory' },
  { code: 'J01.9', title: 'Acute sinusitis, unspecified', category: 'Respiratory' },
  { code: 'J45.9', title: 'Asthma, unspecified', category: 'Respiratory' },
  { code: 'J44.9', title: 'Chronic obstructive pulmonary disease (COPD)', category: 'Respiratory' },
  { code: 'J18.9', title: 'Pneumonia, unspecified organism', category: 'Respiratory' },
  { code: 'J06.9', title: 'Acute upper respiratory infection, unspecified', category: 'Respiratory' },
  { code: 'J30.9', title: 'Allergic rhinitis, unspecified', category: 'Respiratory' },

  // --- DIGESTIVE (K00-K93) ---
  { code: 'K21.9', title: 'Gastro-oesophageal reflux disease (GERD)', category: 'Gastrointestinal' },
  { code: 'K29.7', title: 'Gastritis, unspecified', category: 'Gastrointestinal' },
  { code: 'K27.9', title: 'Peptic ulcer, site unspecified', category: 'Gastrointestinal' },
  { code: 'K58.9', title: 'Irritable bowel syndrome (IBS)', category: 'Gastrointestinal' },
  { code: 'K59.0', title: 'Constipation', category: 'Gastrointestinal' },
  { code: 'K80.8', title: 'Cholelithiasis (Gallstones)', category: 'Hepatobiliary' },
  { code: 'K40.9', title: 'Unilateral inguinal hernia', category: 'Surgery' },

  // --- GENITOURINARY (N00-N99) ---
  { code: 'N39.0', title: 'Urinary tract infection, site not specified', category: 'Genitourinary' },
  { code: 'N20.0', title: 'Calculus of kidney (Kidney stones)', category: 'Genitourinary' },
  { code: 'N40.0', title: 'Benign prostatic hyperplasia (BPH)', category: 'Urology' },
  { code: 'N91.2', title: 'Amenorrhoea, unspecified', category: 'Gynaecology' },
  { code: 'N95.1', title: 'Menopausal and female climacteric states', category: 'Gynaecology' },

  // --- MUSCULOSKELETAL (M00-M99) ---
  { code: 'M54.5', title: 'Low back pain', category: 'Orthopaedic' },
  { code: 'M17.9', title: 'Osteoarthritis of knee, unspecified', category: 'Orthopaedic' },
  { code: 'M10.9', title: 'Gout, unspecified', category: 'Rheumatology' },
  { code: 'M79.1', title: 'Myalgia', category: 'Orthopaedic' },
  { code: 'M25.5', title: 'Pain in joint', category: 'Orthopaedic' },

  // --- DERMATOLOGY (L00-L99) ---
  { code: 'L20.9', title: 'Atopic dermatitis, unspecified', category: 'Dermatological' },
  { code: 'L70.0', title: 'Acne vulgaris', category: 'Dermatological' },
  { code: 'L50.9', title: 'Urticaria, unspecified', category: 'Dermatological' },
  { code: 'L03.9', title: 'Cellulitis, unspecified', category: 'Dermatological' },
  { code: 'L40.9', title: 'Psoriasis, unspecified', category: 'Dermatological' },

  // --- PSYCHIATRY (F00-F99) ---
  { code: 'F41.1', title: 'Generalized anxiety disorder', category: 'Psychiatry' },
  { code: 'F32.9', title: 'Depressive episode, unspecified', category: 'Psychiatry' },
  { code: 'F51.0', title: 'Insomnia, nonorganic', category: 'Psychiatry' },
  { code: 'F43.1', title: 'Post-traumatic stress disorder (PTSD)', category: 'Psychiatry' },

  // --- EAR/EYE (H00-H95) ---
  { code: 'H66.9', title: 'Otitis media, unspecified', category: 'ENT' },
  { code: 'H10.9', title: 'Conjunctivitis, unspecified', category: 'Ophthalmology' },
  { code: 'H81.1', title: 'Benign paroxysmal positional vertigo', category: 'ENT' },
  { code: 'H90.3', title: 'Sensorineural hearing loss, bilateral', category: 'ENT' }
];

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  name: 'کلینیک تخصصی معالجوی آریانا',
  doctor: 'داکتر احمد فرید صدیقی',
  specialty: 'متخصص امراض داخله عمومی و جراحی',
  address: 'کابل، چهارراهی صدارت، کابل - افغانستان',
  phone: '۰۷۸۸۸۸۸۸۸۸ / ۰۷۹۹۹۹۹۹۹۹',
  tagline: 'تداوی با استندردهای جهانی و مراقبت‌های ویژه'
};
