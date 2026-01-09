
import React, { useState } from 'react';
import { DrugInfo, DrugForm } from '../types';

interface DrugDatabaseProps {
  drugs: DrugInfo[];
  onAddDrug: (drug: DrugInfo) => void;
  onExit: () => void;
}

const DrugDatabase: React.FC<DrugDatabaseProps> = ({ drugs, onAddDrug, onExit }) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDrug, setNewDrug] = useState<Partial<DrugInfo>>({
    tradeName: '', genericName: '', defaultForm: DrugForm.TABLET, standardDoses: [], contraindications: [], alternatives: []
  });

  const filtered = drugs.filter(d => 
    d.tradeName.toLowerCase().includes(search.toLowerCase()) || 
    d.genericName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrug.tradeName) return;
    
    const drug: DrugInfo = {
      ...newDrug as DrugInfo,
      id: `d-custom-${Date.now()}`,
      standardDoses: (newDrug.standardDoses as any).toString().split(',').map((s: string) => s.trim()),
      contraindications: (newDrug.contraindications as any).toString().split(',').map((s: string) => s.trim()),
      alternatives: (newDrug.alternatives as any).toString().split(',').map((s: string) => s.trim()),
    };
    
    onAddDrug(drug);
    setShowAddModal(false);
    setNewDrug({ tradeName: '', genericName: '', defaultForm: DrugForm.TABLET, standardDoses: [], contraindications: [], alternatives: [] });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">بانک دارویی</h2>
          <p className="text-sm text-slate-500">مشاهده تداخلات و افزودن داروهای جدید</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <i className="fa-solid fa-search absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="جستجوی نام یا جنریک..." 
              className="w-full pr-12 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i>
            افزودن دوای جدید
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(drug => (
          <div key={drug.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-blue-600">{drug.tradeName}</h3>
                <p className="text-slate-500 font-medium">{drug.genericName}</p>
              </div>
              <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">FDA Approved</span>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">دوزهای معمول:</span>
                <div className="flex gap-2">
                  {drug.standardDoses.map((dose, i) => (
                    <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{dose}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">موارد منع مصرف:</span>
                <p className="text-sm text-red-500">{drug.contraindications.length > 0 ? drug.contraindications.join('، ') : 'موردی ثبت نشده است'}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1">جایگزین‌ها (Alternatives):</span>
                <div className="flex flex-wrap gap-1">
                  {drug.alternatives.length > 0 ? drug.alternatives.map((alt, i) => (
                    <span key={i} className="text-sm text-slate-700 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">{alt}</span>
                  )) : 'موردی ثبت نشده است'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6">افزودن دوای جدید به بانک</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">نام تجاری (Trade Name)</label>
                <input required className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, tradeName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">نام جنریک (Generic Name)</label>
                <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, genericName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">نوع (Form)</label>
                  <select className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, defaultForm: e.target.value as DrugForm})}>
                    {Object.values(DrugForm).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">دوزها (با کاما جدا کنید)</label>
                  <input placeholder="500mg, 1000mg" className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, standardDoses: e.target.value as any})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">موارد منع مصرف (با کاما جدا کنید)</label>
                <textarea className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, contraindications: e.target.value as any})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">جایگزین‌ها (با کاما جدا کنید)</label>
                <input className="w-full px-4 py-2 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setNewDrug({...newDrug, alternatives: e.target.value as any})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-bold">ذخیره در بانک</button>
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold">انصراف</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugDatabase;
