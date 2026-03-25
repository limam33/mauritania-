import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, UserProfile } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CheckCircle, LandPlot, Building2, Home as HomeIcon, Share2, Phone, MessageCircle, ArrowRight, Info, ShieldCheck, User } from 'lucide-react';
import { toast } from 'sonner';

export default function PropertyDetails({ user }: { user: UserProfile | null }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [marketer, setMarketer] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const marketerId = searchParams.get('m');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const propDoc = await getDoc(doc(db, 'properties', id));
        if (propDoc.exists()) {
          const propData = { id: propDoc.id, ...propDoc.data() } as Property;
          setProperty(propData);

          // Fetch owner
          const ownerDoc = await getDoc(doc(db, 'users', propData.ownerId));
          if (ownerDoc.exists()) {
            setOwner(ownerDoc.data() as UserProfile);
          }

          // Fetch marketer if present in URL
          if (marketerId) {
            const marketerDoc = await getDoc(doc(db, 'users', marketerId));
            if (marketerDoc.exists()) {
              setMarketer(marketerDoc.data() as UserProfile);
            }
          }
        } else {
          toast.error('العقار غير موجود');
          navigate('/');
        }
      } catch (error) {
        console.error(error);
        toast.error('فشل في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, marketerId, navigate]);

  const handleShareAsMarketer = () => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }
    
    const shareUrl = `${window.location.origin}/property/${id}?m=${user.uid}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('تم نسخ رابط التسويق الخاص بك! يمكنك الآن مشاركته مع زبائنك وسيظهر رقمك بدلاً من رقم المالك.');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">جاري التحميل...</div>;
  if (!property) return null;

  const contactPerson = marketer || owner;
  const Icon = property.type === 'land' ? LandPlot : property.type === 'house' ? HomeIcon : Building2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white",
              property.category === 'sale' ? "bg-accent" : "bg-blue-600"
            )}>
              {property.category === 'sale' ? 'للبيع' : 'للإيجار'}
            </span>
            {property.isVerified && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck size={16} />
                <span>موثق</span>
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
            {property.title}
          </h1>
          <div className="flex items-center gap-2 text-ink/40 font-medium">
            <MapPin size={18} />
            <span>{property.location} - {property.neighborhood}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-[32px] shadow-xl border border-ink/5 text-center min-w-[200px]">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/40 mb-1">السعر المطلوب</p>
          <p className="text-3xl font-serif font-bold text-accent">{formatCurrency(property.price)}</p>
        </div>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="aspect-video rounded-[40px] overflow-hidden bg-ink/5 border border-ink/5 shadow-2xl">
            <img
              src={property.images?.[activeImage] || `https://picsum.photos/seed/${property.id}/1200/800`}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {property.images?.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all",
                  activeImage === i ? "border-accent scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Contact Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-ink/5 space-y-8 sticky top-24">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-paper overflow-hidden border border-ink/5">
                <img
                  src={contactPerson?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${contactPerson?.displayName}`}
                  alt={contactPerson?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">{contactPerson?.displayName}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
                  {marketer ? 'مسوق عقاري' : 'المالك المباشر'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`tel:${contactPerson?.phone || '00222'}`}
                className="w-full flex items-center justify-center gap-3 bg-ink text-white py-4 rounded-2xl font-bold hover:bg-ink/90 transition-all shadow-lg active:scale-95"
              >
                <Phone size={20} />
                <span>اتصال هاتفي</span>
              </a>
              <a
                href={`https://wa.me/${contactPerson?.whatsapp || contactPerson?.phone || '222'}`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg active:scale-95"
              >
                <MessageCircle size={20} />
                <span>واتساب</span>
              </a>
            </div>

            {/* Marketer Tool */}
            {!marketer && user && (
              <div className="pt-6 border-t border-ink/5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ink/40 text-center">أدوات المسوقين</p>
                <button
                  onClick={handleShareAsMarketer}
                  className="w-full flex items-center justify-center gap-3 border-2 border-accent text-accent py-4 rounded-2xl font-bold hover:bg-accent hover:text-white transition-all active:scale-95"
                >
                  <Share2 size={20} />
                  <span>تسويق هذا العقار</span>
                </button>
                <p className="text-[10px] text-ink/30 text-center italic">
                  سيتم إنشاء رابط خاص بك يظهر معلومات تواصلك للزبائن بدلاً من المالك.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
              <Info className="text-accent" />
              <span>التفاصيل</span>
            </h2>
            <p className="text-lg text-ink/70 leading-relaxed font-medium">
              {property.description}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-bold flex items-center gap-3">
              <CheckCircle className="text-accent" />
              <span>المميزات</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {property.features?.map((feature) => (
                <div key={feature} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-ink/5 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span className="font-bold text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
