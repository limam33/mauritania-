import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, PropertyType, PropertyCategory } from '../types';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Building2, Plus, X, LandPlot, Home as HomeIcon, MapPin, DollarSign, Info } from 'lucide-react';
import { cn } from '../lib/utils';

const propertySchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  price: z.number().min(0, 'السعر يجب أن يكون موجباً'),
  type: z.enum(['land', 'house', 'apartment', 'commercial']),
  category: z.enum(['sale', 'rent']),
  location: z.string().min(3, 'الموقع مطلوب'),
  neighborhood: z.string().min(3, 'الحي مطلوب'),
});

type PropertyFormData = z.infer<typeof propertySchema>;

export default function AddProperty({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'land',
      category: 'sale',
    }
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  const onSubmit = async (data: PropertyFormData) => {
    try {
      const propertyData = {
        ...data,
        images,
        features,
        ownerId: user.uid,
        isVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'properties'), propertyData);
      toast.success('تمت إضافة العقار بنجاح');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('فشل في إضافة العقار');
    }
  };

  const addImage = () => {
    if (imageUrl && !images.includes(imageUrl)) {
      setImages([...images, imageUrl]);
      setImageUrl('');
    }
  };

  const addFeature = () => {
    if (featureInput && !features.includes(featureInput)) {
      setFeatures([...features, featureInput]);
      setFeatureInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif font-bold tracking-tight leading-tight">إضافة <span className="italic text-accent">عقار جديد</span></h1>
        <p className="text-ink/40 font-medium">املأ البيانات التالية لإدراج عقارك في المنصة</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-ink/5 space-y-12">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
              <Info size={14} />
              <span>عنوان العقار</span>
            </label>
            <input
              {...register('title')}
              className="w-full p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="مثال: قطعة أرض في تفرغ زينة"
            />
            {errors.title && <p className="text-red-500 text-xs font-bold">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
              <DollarSign size={14} />
              <span>السعر (أوقية جديدة)</span>
            </label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="0"
            />
            {errors.price && <p className="text-red-500 text-xs font-bold">{errors.price.message}</p>}
          </div>
        </div>

        {/* Type & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60">نوع العقار</label>
            <div className="grid grid-cols-2 gap-2">
              {['land', 'house', 'apartment', 'commercial'].map((t) => (
                <label key={t} className="cursor-pointer">
                  <input type="radio" {...register('type')} value={t} className="hidden peer" />
                  <div className="p-3 text-center rounded-xl bg-paper border border-transparent peer-checked:bg-accent peer-checked:text-white transition-all text-xs font-bold uppercase tracking-widest">
                    {t === 'land' ? 'أرض' : t === 'house' ? 'منزل' : t === 'apartment' ? 'شقة' : 'تجاري'}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60">الفئة</label>
            <div className="grid grid-cols-2 gap-2">
              {['sale', 'rent'].map((c) => (
                <label key={c} className="cursor-pointer">
                  <input type="radio" {...register('category')} value={c} className="hidden peer" />
                  <div className="p-3 text-center rounded-xl bg-paper border border-transparent peer-checked:bg-accent peer-checked:text-white transition-all text-xs font-bold uppercase tracking-widest">
                    {c === 'sale' ? 'للبيع' : 'للإيجار'}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
              <MapPin size={14} />
              <span>المدينة / المنطقة</span>
            </label>
            <input
              {...register('location')}
              className="w-full p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="مثال: نواكشوط"
            />
            {errors.location && <p className="text-red-500 text-xs font-bold">{errors.location.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-widest text-ink/60 flex items-center gap-2">
              <MapPin size={14} />
              <span>الحي</span>
            </label>
            <input
              {...register('neighborhood')}
              className="w-full p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="مثال: تفرغ زينة"
            />
            {errors.neighborhood && <p className="text-red-500 text-xs font-bold">{errors.neighborhood.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-widest text-ink/60">وصف العقار</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
            placeholder="تفاصيل أكثر عن العقار..."
          />
          {errors.description && <p className="text-red-500 text-xs font-bold">{errors.description.message}</p>}
        </div>

        {/* Images */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-ink/60">صور العقار (روابط)</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="أدخل رابط الصورة..."
            />
            <button
              type="button"
              onClick={addImage}
              className="p-4 bg-ink text-white rounded-2xl hover:bg-ink/90 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                <img src={img} alt="Property" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-widest text-ink/60">المميزات (ماء، كهرباء، زفت...)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={featureInput}
              onChange={(e) => setFeatureInput(e.target.value)}
              className="flex-1 p-4 rounded-2xl bg-paper border-none focus:ring-2 focus:ring-accent transition-all font-medium"
              placeholder="مثال: كهرباء"
            />
            <button
              type="button"
              onClick={addFeature}
              className="p-4 bg-ink text-white rounded-2xl hover:bg-ink/90 transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((f, i) => (
              <span key={i} className="px-4 py-2 bg-paper rounded-xl text-xs font-bold flex items-center gap-2">
                {f}
                <button type="button" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}>
                  <X size={12} className="text-red-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 rounded-3xl bg-accent text-white font-bold text-xl hover:bg-accent/90 transition-all shadow-xl disabled:opacity-50 active:scale-95"
        >
          {isSubmitting ? 'جاري الحفظ...' : 'نشر العقار'}
        </button>
      </form>
    </motion.div>
  );
}
