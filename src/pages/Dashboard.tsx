import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, logout } from '../firebase';
import { Property, UserProfile, Commission } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, PlusSquare, LogOut, Trash2, Edit2, Share2, CheckCircle, Clock, DollarSign, Building2, User, Settings, Phone, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'commissions' | 'profile'>('listings');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const q = query(collection(db, 'properties'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(docs);
      setLoading(false);
    });

    const cq = query(collection(db, 'commissions'), where('marketerId', '==', user.uid));
    const unsubscribeCommissions = onSnapshot(cq, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Commission));
      setCommissions(docs);
    });

    return () => {
      unsubscribe();
      unsubscribeCommissions();
    };
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العقار؟')) {
      try {
        await deleteDoc(doc(db, 'properties', id));
        toast.success('تم حذف العقار بنجاح');
      } catch (error) {
        console.error(error);
        toast.error('فشل في حذف العقار');
      }
    }
  };

  const handleShare = (id: string) => {
    const shareUrl = `${window.location.origin}/property/${id}?m=${user?.uid}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('تم نسخ رابط التسويق الخاص بك!');
  };

  if (!user) return null;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight leading-tight">
            لوحة <span className="italic text-accent">التحكم</span>
          </h1>
          <p className="text-ink/40 font-medium">أهلاً بك، {user.displayName}</p>
        </div>
        <div className="flex gap-4">
          <Link
            to="/add-property"
            className="flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-2xl font-bold hover:bg-accent/90 transition-all shadow-lg active:scale-95"
          >
            <PlusSquare size={20} />
            <span>إضافة عقار</span>
          </Link>
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 bg-ink text-white px-6 py-3 rounded-2xl font-bold hover:bg-ink/90 transition-all shadow-lg active:scale-95"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<Building2 className="text-accent" />}
          label="عقاراتي"
          value={properties.length.toString()}
          subLabel="عقار منشور"
        />
        <StatCard
          icon={<DollarSign className="text-green-600" />}
          label="العمولات"
          value={formatCurrency(commissions.reduce((acc, curr) => acc + curr.amount, 0))}
          subLabel="إجمالي العمولات"
        />
        <StatCard
          icon={<CheckCircle className="text-blue-600" />}
          label="الحالة"
          value={user.role === 'marketer' ? 'مسوق' : user.role === 'admin' ? 'مدير' : 'مشتري'}
          subLabel="نوع الحساب"
        />
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border border-ink/5 shadow-sm max-w-md mx-auto">
        <TabButton active={activeTab === 'listings'} onClick={() => setActiveTab('listings')} label="عقاراتي" />
        <TabButton active={activeTab === 'commissions'} onClick={() => setActiveTab('commissions')} label="العمولات" />
        <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} label="الملف الشخصي" />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-ink/5"
        >
          {activeTab === 'listings' && (
            <div className="space-y-8">
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {properties.map((p) => (
                    <div key={p.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-paper rounded-3xl border border-ink/5 gap-6">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                          <img src={p.images?.[0] || `https://picsum.photos/seed/${p.id}/200/200`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-serif text-xl font-bold">{p.title}</h3>
                          <p className="text-accent font-bold">{formatCurrency(p.price)}</p>
                          <div className="flex items-center gap-2 text-ink/40 text-xs mt-1">
                            <Clock size={12} />
                            <span>{p.createdAt?.toDate?.()?.toLocaleDateString('ar-MR') || 'اليوم'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto">
                        <button
                          onClick={() => handleShare(p.id)}
                          className="flex-1 md:flex-none p-4 bg-white text-accent rounded-2xl border border-accent/20 hover:bg-accent hover:text-white transition-all active:scale-95"
                          title="نسخ رابط التسويق"
                        >
                          <Share2 size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="flex-1 md:flex-none p-4 bg-white text-red-500 rounded-2xl border border-red-100 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          title="حذف"
                        >
                          <Trash2 size={20} />
                        </button>
                        <Link
                          to={`/property/${p.id}`}
                          className="flex-1 md:flex-none p-4 bg-ink text-white rounded-2xl hover:bg-ink/90 transition-all active:scale-95"
                        >
                          عرض
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <PlusSquare size={48} className="mx-auto text-ink/10" />
                  <p className="text-ink/40 font-medium">لم تقم بإضافة أي عقارات بعد</p>
                  <Link to="/add-property" className="inline-block text-accent font-bold border-b-2 border-accent">أضف عقارك الأول الآن</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-8">
              <div className="p-6 bg-accent/5 rounded-3xl border border-accent/10 flex items-center gap-4">
                <div className="p-3 bg-accent text-white rounded-2xl">
                  <DollarSign size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">سجل العمولات</h3>
                  <p className="text-sm text-ink/40">تتبع مستحقاتك المالية من عمليات التسويق</p>
                </div>
              </div>
              
              {commissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-right">
                    <thead>
                      <tr className="border-b border-ink/5">
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">العقار</th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">المبلغ</th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">الحالة</th>
                        <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-ink/40">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {commissions.map((c) => (
                        <tr key={c.id} className="border-b border-ink/5 hover:bg-paper transition-colors">
                          <td className="py-4 px-4 font-bold">عقار #{c.propertyId.slice(0, 5)}</td>
                          <td className="py-4 px-4 font-serif font-bold text-accent">{formatCurrency(c.amount)}</td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                              c.status === 'paid' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                              {c.status === 'paid' ? 'مدفوعة' : 'قيد الانتظار'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-ink/40 text-xs">{c.createdAt?.toDate?.()?.toLocaleDateString('ar-MR') || 'اليوم'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 space-y-4">
                  <DollarSign size={48} className="mx-auto text-ink/10" />
                  <p className="text-ink/40 font-medium">لا توجد عمولات مسجلة حالياً</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-accent shadow-2xl">
                    <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-ink text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Settings size={16} />
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-serif font-bold">{user.displayName}</h2>
                  <p className="text-ink/40 font-medium">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <Phone size={12} />
                    <span>رقم الهاتف</span>
                  </label>
                  <div className="p-4 bg-paper rounded-2xl font-bold">{user.phone || 'غير مسجل'}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-ink/40 flex items-center gap-2">
                    <MessageCircle size={12} />
                    <span>واتساب</span>
                  </label>
                  <div className="p-4 bg-paper rounded-2xl font-bold">{user.whatsapp || 'غير مسجل'}</div>
                </div>
              </div>

              <div className="p-6 bg-ink/5 rounded-3xl border border-ink/10 flex items-center gap-4">
                <div className="p-3 bg-ink text-white rounded-2xl">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold">نوع الحساب: {user.role === 'marketer' ? 'مسوق عقاري' : 'مشتري'}</h3>
                  <p className="text-sm text-ink/40 italic">يمكنك تغيير نوع الحساب من خلال التواصل مع الإدارة</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, subLabel }: { icon: any, label: string, value: string, subLabel: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] shadow-xl border border-ink/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-paper rounded-2xl">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{label}</span>
      </div>
      <div>
        <p className="text-3xl font-serif font-bold">{value}</p>
        <p className="text-xs text-ink/40 font-medium">{subLabel}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-3 rounded-xl text-sm font-bold transition-all",
        active ? "bg-accent text-white shadow-lg" : "text-ink/40 hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
