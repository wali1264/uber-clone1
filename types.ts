
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum Specialty {
  INTERNAL = 'داخله (Internal)',
  GASTROENTEROLOGY = 'گوارش (Gastroenterology)',
  CARDIOLOGY = 'قلب (Cardiology)',
  PEDIATRICS = 'اطفال (Pediatrics)',
  SURGERY = 'جراحی (Surgery)'
}

export enum DrugForm {
  TABLET = 'قرص (Tab)',
  SYRUP = 'شربت (Syr)',
  INJECTION = 'آمپول (Inj)',
  CAPSULE = 'کپسول (Cap)',
  CREAM = 'کریم (Cream)',
  DROPS = 'قطره (Drops)',
  OINTMENT = 'پماد (Oint)',
  POWDER = 'پودر (Powder)'
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  form: DrugForm;
  dosage: string;
  timing: {
    morning: boolean;
    noon: boolean;
    night: boolean;
    beforeFood: boolean;
  };
  frequency: string;
  duration: string;
  quantity?: string;
  instructions?: string;
}

export interface SpecialtyFormData {
  [key: string]: boolean | string;
}

export interface ClinicalRecord {
  bp?: string;
  hr?: string;
  pr?: string;
  spo2?: string;
  temp?: string;
  cc?: string;
  specialtyData?: SpecialtyFormData;
}

export interface Patient {
  id: string;
  code: string;
  name: string;
  age?: number;
  gender: Gender;
  phone?: string;
  allergies: string[];
  medicalHistory: string[];
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  clinicalRecord?: ClinicalRecord;
  notes?: string;
  nextVisit?: string;
  isTemplate?: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: Specialty;
  licenseNumber: string;
  clinicName: string;
  phone?: string;
  address?: string;
  signature?: string;
  stamp?: string;
}

export interface DrugInfo {
  id: string;
  tradeName: string;
  genericName: string;
  defaultForm: DrugForm;
  standardDoses: string[];
  contraindications: string[];
  alternatives: string[];
}
