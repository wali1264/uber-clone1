
import { Doctor, Patient, DrugInfo, DrugForm, Gender, Specialty } from './types';

export const INITIAL_DOCTOR: Doctor = {
  id: 'doc-001',
  name: 'دکتر احمد رضایی',
  specialty: Specialty.GASTROENTEROLOGY,
  licenseNumber: '۱۲۳۴۵-کابل',
  clinicName: 'مرکز طبی شفا',
  signature: 'https://picsum.photos/100/50?grayscale',
  stamp: 'https://picsum.photos/80/80?sepia'
};

export const GASTRO_SYMPTOMS = [
  { id: 'dysphagia', label: 'Dysphagia' },
  { id: 'odynophagia', label: 'Odynophagia' },
  { id: 'dyspepsia', label: 'Dyspepsia' },
  { id: 'heart_burn', label: 'Heart burn' },
  { id: 'pyrosis', label: 'Pyrosis' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'flatulence', label: 'Flatulence' },
  { id: 'epigastric_pain', label: 'Epigastric Pain' },
  { id: 'postprandial_fullness', label: 'Postprandial Fullness' },
  { id: 'constipation', label: 'Constipation' },
  { id: 'melena', label: 'Melena' },
  { id: 'nausea_vomiting', label: 'Vomiting & Nausea' },
  { id: 'diarrhea', label: 'Diarrhea (acute & chronic)' },
  { id: 'tenesmus', label: 'Tenesmus' },
  { id: 'abdominal_pain', label: 'Abdominal Pain' },
  { id: 'gi_bleeding', label: 'GI Bleeding (upper & lower)' },
];

export const GASTRO_HISTORY = [
  { id: 'htn', label: 'فشار خون دارد؟ (HTN)' },
  { id: 'anemia', label: 'کم‌خونی دارد؟ (Anemia)' },
  { id: 'heart_dis', label: 'مریضی قلبی دارد؟' },
  { id: 'resp_dis', label: 'مریضی تنفسی دارد؟' },
  { id: 'neuro_dis', label: 'مریضی عصبی دارد؟' },
  { id: 'inf_dis', label: 'مریضی ساری دارد؟' },
  { id: 'coag_dis', label: 'اختلالات انعقادی دارد؟' },
  { id: 'prev_endo', label: 'قبلاً اندوسکوپی شده؟' },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'p-001',
    code: '1',
    name: 'عبدالله رحمانی',
    age: 45,
    gender: Gender.MALE,
    phone: '0789123456',
    allergies: ['پنی‌سیلین'],
    medicalHistory: ['فشار خون']
  },
  {
    id: 'p-002',
    code: '2',
    name: 'ناجیه کریمی',
    age: 22,
    gender: Gender.FEMALE,
    phone: '0777555444',
    allergies: [],
    medicalHistory: []
  }
];

export const DRUG_DATABASE: DrugInfo[] = [
  {
    id: 'd-001',
    tradeName: 'Panadol',
    genericName: 'Paracetamol',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['500mg', '1000mg'],
    contraindications: ['نارسایی شدید کبدی', 'حساسیت به استامینوفن'],
    alternatives: ['Tylenol', 'Acetaminophen']
  },
  {
    id: 'd-002',
    tradeName: 'Amoxiclav',
    genericName: 'Amoxicillin + Clavulanate',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['625mg', '1g'],
    contraindications: ['حساسیت به پنی‌سیلین', 'یرقان ناشی از آموکسی‌کلاو'],
    alternatives: ['Azithromycin', 'Cefixime']
  },
  {
    id: 'd-003',
    tradeName: 'Ceftriaxone',
    genericName: 'Ceftriaxone',
    defaultForm: DrugForm.INJECTION,
    standardDoses: ['1g', '500mg', '2g'],
    contraindications: ['نوزادان با زردی', 'همزمان با کلسیم وریدی'],
    alternatives: ['Cefotaxime', 'Cefuroxime']
  },
  {
    id: 'd-004',
    tradeName: 'Omeprazole',
    genericName: 'Omeprazole',
    defaultForm: DrugForm.CAPSULE,
    standardDoses: ['20mg', '40mg'],
    contraindications: ['حساسیت مفرط'],
    alternatives: ['Pantoprazole', 'Esomeprazole']
  },
  {
    id: 'd-005',
    tradeName: 'Metformin',
    genericName: 'Metformin HCl',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['500mg', '850mg', '1000mg'],
    contraindications: ['نارسایی کلیوی شدید', 'اسیدوز متابولیک'],
    alternatives: ['Gliclazide', 'Sitagliptin']
  },
  {
    id: 'd-006',
    tradeName: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['5mg', '10mg'],
    contraindications: ['شوک قلبی', 'تنگی آئورت شدید'],
    alternatives: ['Nifedipine', 'Felodipine']
  },
  {
    id: 'd-007',
    tradeName: 'Azithromycin',
    genericName: 'Azithromycin',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['250mg', '500mg'],
    contraindications: ['نارسایی کبدی شدید'],
    alternatives: ['Clarithromycin', 'Erythromycin']
  },
  {
    id: 'd-008',
    tradeName: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['250mg', '500mg', '750mg'],
    contraindications: ['کودکان (مگر در موارد خاص)', 'بارداری'],
    alternatives: ['Levofloxacin', 'Ofloxacin']
  },
  {
    id: 'd-009',
    tradeName: 'Diclofenac',
    genericName: 'Diclofenac Sodium',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['500mg', '1000mg'],
    contraindications: ['زخم معده فعال', 'آسم ناشی از NSAID'],
    alternatives: ['Ibuprofen', 'Naproxen']
  },
  {
    id: 'd-010',
    tradeName: 'Ventolin',
    genericName: 'Salbutamol',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['2mg', '4mg'],
    contraindications: ['تپش قلب شدید'],
    alternatives: ['Terbutaline', 'Ipratropium']
  },
  {
    id: 'd-011',
    tradeName: 'Brufen',
    genericName: 'Ibuprofen',
    defaultForm: DrugForm.SYRUP,
    standardDoses: ['100mg/5ml', '200mg/5ml'],
    contraindications: ['خونریزی گوارشی', 'نارسایی قلبی'],
    alternatives: ['Paracetamol', 'Mefenamic Acid']
  },
  {
    id: 'd-012',
    tradeName: 'Flagyl',
    genericName: 'Metronidazole',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['250mg', '500mg'],
    contraindications: ['سه ماه اول بارداری'],
    alternatives: ['Tinidazole']
  },
  {
    id: 'd-013',
    tradeName: 'Losartan',
    genericName: 'Losartan Potassium',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['25mg', '50mg', '100mg'],
    contraindications: ['بارداری (سه ماه دوم و سوم)'],
    alternatives: ['Valsartan', 'Candesartan']
  },
  {
    id: 'd-014',
    tradeName: 'Cefixime',
    genericName: 'Cefixime',
    defaultForm: DrugForm.SYRUP,
    standardDoses: ['100mg/5ml'],
    contraindications: ['حساسیت به سفالوسپورین‌ها'],
    alternatives: ['Cefpodoxime', 'Amoxiclav']
  },
  {
    id: 'd-015',
    tradeName: 'Dexamethasone',
    genericName: 'Dexamethasone',
    defaultForm: DrugForm.INJECTION,
    standardDoses: ['4mg/ml', '8mg/2ml'],
    contraindications: ['عفونت‌های قارچی سیستمیک'],
    alternatives: ['Hydrocortisone', 'Prednisolone']
  },
  {
    id: 'd-016',
    tradeName: 'Zantac',
    genericName: 'Ranitidine',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['150mg', '300mg'],
    contraindications: ['پورفیری'],
    alternatives: ['Famotidine', 'Cimetidine']
  },
  {
    id: 'd-017',
    tradeName: 'Plavix',
    genericName: 'Clopidogrel',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['75mg'],
    contraindications: ['خونریزی فعال'],
    alternatives: ['Ticagrelor', 'Aspirin']
  },
  {
    id: 'd-018',
    tradeName: 'Atorvastatin',
    genericName: 'Atorvastatin Calcium',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['10mg', '20mg', '40mg'],
    contraindications: ['بیماری کبدی فعال', 'بارداری'],
    alternatives: ['Rosuvastatin', 'Simvastatin']
  },
  {
    id: 'd-019',
    tradeName: 'Glibenclamide',
    genericName: 'Glibenclamide',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['5mg'],
    contraindications: ['دیابت نوع ۱', 'کتواسیدوز'],
    alternatives: ['Glimepiride', 'Gliclazide']
  },
  {
    id: 'd-020',
    tradeName: 'B-Complex',
    genericName: 'Vitamin B1, B6, B12',
    defaultForm: DrugForm.INJECTION,
    standardDoses: ['2ml', '3ml'],
    contraindications: ['حساسیت به اجزاء'],
    alternatives: ['Neurobion']
  },
  {
    id: 'd-021',
    tradeName: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['80mg', '100mg', '325mg'],
    contraindications: ['سندرم ری در کودکان', 'خونریزی گوارشی'],
    alternatives: ['Clopidogrel']
  },
  {
    id: 'd-022',
    tradeName: 'Prednisolone',
    genericName: 'Prednisolone',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['5mg', '20mg', '50mg'],
    contraindications: ['عفونت‌های ویروسی کنترل نشده'],
    alternatives: ['Methylprednisolone']
  },
  {
    id: 'd-023',
    tradeName: 'Salbutamol Inhaler',
    genericName: 'Salbutamol',
    defaultForm: DrugForm.DROPS, 
    standardDoses: ['100mcg/dose'],
    contraindications: ['تپش قلب شدید'],
    alternatives: ['Ipratropium Inhaler']
  },
  {
    id: 'd-024',
    tradeName: 'Buscopan',
    genericName: 'Hyoscine Butylbromide',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['10mg'],
    contraindications: ['گلوکوم زاویه بسته', 'میاستنی گراویس'],
    alternatives: ['Dicyclomine']
  },
  {
    id: 'd-025',
    tradeName: 'Lasix',
    genericName: 'Furosemide',
    defaultForm: DrugForm.TABLET,
    standardDoses: ['40mg'],
    contraindications: ['آنوری (عدم دفع ادرار)', 'کمبود شدید سدیم'],
    alternatives: ['Torsemide', 'Hydrochlorothiazide']
  }
];
