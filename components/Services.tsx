
import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Info, 
  TrendingUp, 
  Box, 
  Plane, 
  Building2, 
  UtensilsCrossed, 
  X,
  Save,
  Check,
  UserCheck
} from 'lucide-react';

const SAR_RATE = 3.75;

interface Package {
  id: string;
  title: string;
  type: 'حج' | 'عمره';
  visa: { type: string; cost: string };
  representative: { name: string; fee: string };
  hotel: { name: string; nights: string; rooms: string };
  food: { type: string; duration: string };
  flight: { route: string; sellingPrice: string };
  profit: string;
  totalPrice: string;
  color: string;
}

const Services: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [packages, setPackages] = useState<Package[]>([
    {
      id: '1',
      title: 'پکیج حج VIP (1403)',
      type: 'حج',
      visa: { type: 'سعودی الکترونیک', cost: '400' },
      representative: { name: 'شرکت مکه للفنادق', fee: '60' },
      hotel: { name: 'زمزم پولمن', nights: '15 شب', rooms: 'اتاق 2 نفره' },
      food: { type: 'سه وقت', duration: '15 روز' },
      flight: { route: 'کابل-جده-کابل', sellingPrice: '750' },
      profit: '300',
      totalPrice: '2,500',
      color: 'emerald'
    },
    {
      id: '2',
      title: 'عمره اقتصادی (14 روزه)',
      type: 'عمره',
      visa: { type: 'عمره انفرادی', cost: '320' },
      representative: { name: 'گروه مدینه ترانسپورت', fee: '45' },
      hotel: { name: 'انوار مدینه', nights: '14 شب', rooms: 'اتاق 4 نفره' },
      food: { type: 'دو وقت', duration: '14 روز' },
      flight: { route: 'هرات-مدینه-هرات', sellingPrice: '600' },
      profit: '180',
      totalPrice: '1,450',
      color: 'blue'
    }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    type: 'عمره' as 'حج' | 'عمره',
    visaType: '',
    visaCost: '',
    repName: '',
    repFee: '',
    hotelName: '',
    hotelNights: '',
    hotelRooms: '',
    foodType: 'سه وقت',
    foodDuration: '',
    flightRoute: '',
    flightPrice: '',
    profit: '',
    totalPrice: ''
  });

  const formatWithSAR = (usdVal: string) => {
    const usd = parseFloat(usdVal.replace(/,/g, '')) || 0;
    return (usd * SAR_RATE).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const startEdit = (pkg: Package) => {
    setEditingPackageId(pkg.id);
    setFormData({
      title: pkg.title,
      type: pkg.type,
      visaType: pkg.visa.type,
      visaCost: pkg.visa.cost,
      repName: pkg.representative.name,
      repFee: pkg.representative.fee,
      hotelName: pkg.hotel.name,
      hotelNights: pkg.hotel.nights.replace(' شب', ''),
      hotelRooms: pkg.hotel.rooms,
      foodType: pkg.food.type,
      foodDuration: pkg.food.duration.replace(' روز', ''),
      flightRoute: pkg.flight.route,
      flightPrice: pkg.flight.sellingPrice,
      profit: pkg.profit,
      totalPrice: pkg.totalPrice
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPackageId) {
      setPackages(prev => prev.map(p => 
        p.id === editingPackageId 
          ? { 
              ...p, 
              title: formData.title,
              type: formData.type,
              visa: { type: formData.visaType, cost: formData.visaCost },
              representative: { name: formData.repName, fee: formData.repFee },
              hotel: { name: formData.hotelName, nights: `${formData.hotelNights} شب`, rooms: formData.hotelRooms },
              food: { type: formData.foodType, duration: `${formData.foodDuration} روز` },
              flight: { route: formData.flightRoute, sellingPrice: formData.flightPrice },
              profit: formData.profit,
              totalPrice: formData.totalPrice,
              color: formData.type === 'حج' ? 'emerald' : 'blue'
            } 
          : p
      ));
    } else {
      const newPkg: Package = {
        id: Date.now().toString(),
        title: formData.title,
        type: formData.type,
        visa: { type: formData.visaType, cost: formData.visaCost },
        representative: { name: formData.repName, fee: formData.repFee },
        hotel: { name: formData.hotelName, nights: `${formData.hotelNights} شب`, rooms: formData.hotelRooms },
        food: { type: formData.foodType, duration: `${formData.foodDuration} روز` },
        flight: { route: formData.flightRoute, sellingPrice: formData.flightPrice },
        profit: formData.profit,
        totalPrice: formData.totalPrice,
        color: formData.type === 'حج' ? 'emerald' : 'blue'
      };
      setPackages([newPkg, ...packages]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPackageId(null);
    setFormData({
      title: '', type: 'عمره', visaType: '', visaCost: '',
      repName: '', repFee: '',
      hotelName: '', hotelNights: '', hotelRooms: '',
      foodType: 'سه وقت', foodDuration: '',
      flightRoute: '', flightPrice: '', profit: '', totalPrice: ''
    });
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-6">
      <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
      <h4 className="text-indigo-700 font-bold text-base">{title}</h4>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1 text-right">
          <h2 className="text-3xl font-black text-slate-800">مدیریت پکیج‌های خدماتی</h2>
          <p className="text-slate-500 font-medium">تعریف و تنظیم پکیج‌های استاندارد حج و عمره (USD/SAR)</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white w-32 h-32 rounded-3xl shadow-xl shadow-indigo-200 flex flex-col items-center justify-center gap-3 transition-all active:scale-95 group"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform">
            <Plus size={24} />
          </div>
          <span className="font-bold text-sm">ایجاد پکیج جدید</span>
        </button>
      </div>

      {/* Packages List */}
      <div className="grid grid-cols-1 gap-8 pb-12">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-md text-right">
            
            {/* Card Header */}
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pkg.color === 'emerald' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'}`}>
                  <Box size={28} />
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-black text-slate-800">{pkg.title}</h3>
                  <span className="text-xs font-bold text-slate-400 uppercase">{pkg.type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPackages(packages.filter(p => p.id !== pkg.id))}
                  className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button 
                  onClick={() => startEdit(pkg)}
                  className="p-3 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-2xl transition-all"
                >
                  <Edit3 size={20} />
                </button>
              </div>
            </div>

            {/* Card Body - Details Grid */}
            <div className="px-8 py-6 border-y border-slate-50 grid grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-12" dir="rtl">
              <div className="flex items-start justify-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold text-sm">ویژه:</span>
                    <Info size={14} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs leading-5">{pkg.visa.type}</p>
                  <p className="text-slate-400 text-[10px] font-bold">({pkg.visa.cost} $)</p>
                </div>
              </div>

              <div className="flex items-start justify-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold text-sm">نماینده عربستان:</span>
                    <UserCheck size={14} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs leading-5">{pkg.representative.name}</p>
                  <p className="text-slate-400 text-[10px] font-bold">هزینه خدمات: {pkg.representative.fee} $</p>
                </div>
              </div>

              <div className="flex items-start justify-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold text-sm">هوتل و اقامت:</span>
                    <Building2 size={14} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs leading-5">{pkg.hotel.name} - {pkg.hotel.nights}</p>
                  <p className="text-slate-400 text-[10px] font-bold">{pkg.hotel.rooms}</p>
                </div>
              </div>

              <div className="flex items-start justify-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold text-sm">تکت:</span>
                    <Plane size={14} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs leading-5">{pkg.flight.route}</p>
                  <p className="text-emerald-500 text-[10px] font-black">قیمت فروش: $ {pkg.flight.sellingPrice}</p>
                </div>
              </div>

              <div className="flex items-start justify-start gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-800 font-bold text-sm">غذا:</span>
                    <UtensilsCrossed size={14} className="text-slate-300" />
                  </div>
                  <p className="text-slate-500 text-xs leading-5">{pkg.food.type} - {pkg.food.duration}</p>
                </div>
              </div>
            </div>

            {/* Card Footer - Summary */}
            <div className="p-8 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center">
                   <TrendingUp size={16} className="text-emerald-500" />
                   <span className="text-[10px] font-bold text-emerald-500">سود خالص پکیج</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-lg font-black text-slate-800">$ {pkg.profit}</span>
                    <span className="text-[10px] font-bold text-slate-300">≈ {formatWithSAR(pkg.profit)} SAR</span>
                </div>
              </div>

              <div className="text-left flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 mb-1">قیمت نهایی برای مشتری</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-indigo-400">$</span>
                  <span className="text-2xl font-black text-indigo-600">{pkg.totalPrice}</span>
                </div>
                <span className="text-xs font-bold text-slate-300 mt-1">≈ {formatWithSAR(pkg.totalPrice)} SAR</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Package Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex items-center justify-between p-8 border-b border-slate-50">
              <h3 className="text-2xl font-black text-slate-800">
                {editingPackageId ? 'ویرایش پکیج خدماتی' : 'تعریف پکیج جدید'}
              </h3>
              <button 
                onClick={closeModal}
                className="p-3 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar text-right" dir="rtl">
              
              <SectionHeader title="اطلاعات اصلی" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">نام پکیج</label>
                  <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="مثال: عمره VIP بهاره" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">نوع پکیج</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold">
                    <option value="عمره">عمره</option>
                    <option value="حج">حج</option>
                  </select>
                </div>
              </div>

              <SectionHeader title="ویزه و نماینده عربستان" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">نوع ویزه</label>
                  <input required name="visaType" value={formData.visaType} onChange={handleInputChange} placeholder="سعودی الکترونیک" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">هزینه ویزه ($)</label>
                  <input required name="visaCost" type="text" value={formData.visaCost} onChange={handleInputChange} placeholder="400" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-center" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">نام نماینده / شرکت طرف قرارداد</label>
                  <input required name="repName" value={formData.repName} onChange={handleInputChange} placeholder="نام شرکت عربی" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">هزینه خدمات نماینده ($)</label>
                  <input required name="repFee" type="text" value={formData.repFee} onChange={handleInputChange} placeholder="60" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-center" />
                </div>
              </div>

              <SectionHeader title="هوتل و اقامت" />
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">نام هوتل</label>
                  <input required name="hotelName" value={formData.hotelName} onChange={handleInputChange} placeholder="نام هوتل در مدینه یا مکه" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block text-right">تعداد شب</label>
                    <input required name="hotelNights" type="number" value={formData.hotelNights} onChange={handleInputChange} placeholder="15" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-center" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 block text-right">نوع اتاق</label>
                    <input required name="hotelRooms" value={formData.hotelRooms} onChange={handleInputChange} placeholder="اتاق 2 نفره" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                  </div>
                </div>
              </div>

              <SectionHeader title="غذا و ترانسپورت" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">وعده غذایی</label>
                  <select name="foodType" value={formData.foodType} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none">
                    <option value="سه وقت">سه وقت</option>
                    <option value="دو وقت">دو وقت</option>
                    <option value="یک وقت">فقط صبحانه</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">مدت (روز)</label>
                  <input required name="foodDuration" type="number" value={formData.foodDuration} onChange={handleInputChange} placeholder="15" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-center" />
                </div>
              </div>

              <SectionHeader title="تکت و پرواز" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">مسیر پرواز</label>
                  <input required name="flightRoute" value={formData.flightRoute} onChange={handleInputChange} placeholder="کابل-جده-کابل" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 block text-right">قیمت فروش تکت ($)</label>
                  <input required name="flightPrice" type="text" value={formData.flightPrice} onChange={handleInputChange} placeholder="750" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-center" />
                </div>
              </div>

              <div className="mt-12 bg-indigo-50/50 p-8 rounded-[32px] border border-indigo-100 grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-xs font-black text-indigo-400 block text-right uppercase">سود خالص ($)</label>
                  <input required name="profit" value={formData.profit} onChange={handleInputChange} placeholder="300" className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-2xl text-xl font-black text-emerald-600 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-black text-indigo-400 block text-left uppercase">قیمت کل برای مشتری ($)</label>
                  <input required name="totalPrice" value={formData.totalPrice} onChange={handleInputChange} placeholder="2,500" className="w-full px-4 py-3 bg-white border border-indigo-100 rounded-2xl text-xl font-black text-indigo-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-left" />
                </div>
              </div>

              <div className="mt-10 flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 rounded-[24px] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <Check size={24} />
                  {editingPackageId ? 'بروزرسانی پکیج' : 'ذخیره و انتشار پکیج'}
                </button>
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-10 py-5 bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold rounded-[24px] transition-all"
                >
                  انصراف
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
