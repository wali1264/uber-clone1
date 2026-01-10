
import { DrugTemplate, ClinicSettings } from './types';

export const INITIAL_DRUGS: DrugTemplate[] = [
  { id: '1', name: 'Paracetamol', defaultStrength: '500mg', defaultInstructions: 'بعد از غذا - ۸ ساعته' },
  { id: '2', name: 'Amoxicillin', defaultStrength: '500mg', defaultInstructions: 'قبل از غذا - ۸ ساعته' },
  { id: '3', name: 'Omeprazole', defaultStrength: '20mg', defaultInstructions: 'ناشتا - ۳۰ دقیقه قبل از غذا' },
  { id: '4', name: 'Metronidazole', defaultStrength: '400mg', defaultInstructions: 'بعد از غذا - ۸ ساعته' },
  { id: '5', name: 'Ciprofloxacin', defaultStrength: '500mg', defaultInstructions: '۱۲ ساعته' },
  { id: '6', name: 'Ceftriaxone Inj', defaultStrength: '1gm', defaultInstructions: 'وریدی - روزانه' }
];

export const DEFAULT_CLINIC_SETTINGS: ClinicSettings = {
  name: 'کلینیک تخصصی معالجوی آریانا',
  doctor: 'داکتر احمد فرید صدیقی',
  specialty: 'متخصص امراض داخله عمومی و جراحی',
  address: 'کابل، چهارراهی صدارت، کابل - افغانستان',
  phone: '۰۷۸۸۸۸۸۸۸۸ / ۰۷۹۹۹۹۹۹۹۹',
  tagline: 'تداوی با استندردهای جهانی و مراقبت‌های ویژه'
};
