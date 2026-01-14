export interface Patient {
  id: string;
  code: string;
  name: string;
  fatherName: string;
  phone: string;
  age: string;
  gender: 'male' | 'female' | 'other';
  createdAt: number;
}

export interface ClinicalRecords {
  bp: string;
  hr: string;
  pr: string;
  spo2: string;
  temp: string;
}

export interface Medication {
  id: string;
  name: string;
  strength: string;
  quantity: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  cc: string; 
  diagnosis: string;
  medications: Medication[];
  clinicalRecords: ClinicalRecords;
  date: number;
  drawingData?: string; 
}

export interface DrugTemplate {
  id: string;
  name: string;
  defaultStrength: string;
  defaultInstructions: string;
  // Added properties to match INITIAL_DRUGS in constants.ts
  brandNames?: string;
  form?: string;
  category?: string;
  company?: string;
}

// Added DiagnosisTemplate as it was missing and used in constants.ts
export interface DiagnosisTemplate {
  code: string;
  title: string;
  category: string;
}

export interface ClinicSettings {
  name: string;
  doctor: string;
  specialty: string;
  address: string;
  phone: string;
  tagline: string;
}

export type ViewState = 'HOME' | 'PATIENTS' | 'NEW_PATIENT' | 'NEW_PRESCRIPTION' | 'PRESCRIPTION_HISTORY' | 'DRUGS' | 'VIEW_PDF' | 'SETTINGS';