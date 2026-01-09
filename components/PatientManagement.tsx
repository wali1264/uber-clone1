
import React, { useState } from 'react';
import { Patient, Gender } from '../types';

interface PatientManagementProps {
  patients: Patient[];
  onAddPatient: (p: Patient) => void;
  onPrescribe: (p: Patient) => void;
  onExit: () => void;
}

const PatientManagement: React.FC<PatientManagementProps> = ({ patients, onAddPatient, onPrescribe, onExit }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [newPatient, setNewPatient] = useState<Partial<Patient>>({
    name: '', age: 0, gender: Gender.MALE, phone: '', allergies: [], medicalHistory: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate code as a simple incremental number
    const nextCode = (patients.length + 1).toString();
    const p: Patient = {
      ...newPatient as Patient,
      id: `p-${Date.now()}`,
      code: nextCode,
    };
    onAddPatient(p);
    setShowAddModal(false);
    setNewPatient({ name: '', age: 0, gender: Gender.MALE, phone: '', allergies: [], medicalHistory: [] });
  };

  const filteredPatients = patients.filter(p => p.name.includes(search) || p.code.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
          <input 
            type="text" 
            placeholder="جستجوی نام یا کد مریض..." 
            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i>
            ثبت مریض جدید
          </button>
          <button 
            onClick={onExit}
            className="sm:hidden bg-white text-slate-600 px-4 py-3 rounded-2xl border border-slate-200 font-bold flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-slate-500 text-sm">کد</th>
              <th className="px-6 py-4 text-slate-500 text-sm">نام مریض</th>
              <th className="px-6 py-4 text-slate-500 text-sm">سن / جنسیت</th>
              <th className="px-6 py-4 text-slate-500 text-sm">تلفن</th>
              <th className="px-6 py-4 text-slate-500 text-sm">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredPatients.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-blue-600">{p.code}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{p.age} سال - {p.gender === Gender.MALE ? 'مرد' : 'زن'}</td>
                <td className="px-6 py-4 text-sm text-slate-500">{p.phone || '---'}</td>
                <td className="px-6 py-4">
                  <button onClick={() => onPrescribe(p)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700">ثبت نسخه</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 mb-6">ثبت اطلاعات مریض</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">نام کامل</label>
                <input required className="w-full px-4 py-2 bg-slate-50 border rounded-xl" onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">سن</label>
                  <input type="number" className="w-full px-4 py-2 bg-slate-50 border rounded-xl" onChange={e => setNewPatient({...newPatient, age: parseInt(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">جنسیت</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border rounded-xl" onChange={e => setNewPatient({...newPatient, gender: e.target.value as Gender})}>
                    <option value={Gender.MALE}>مرد</option>
                    <option value={Gender.FEMALE}>زن</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">شماره تماس (اختیاری)</label>
                <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl" onChange={e => setNewPatient({...newPatient, phone: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">ذخیره</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
