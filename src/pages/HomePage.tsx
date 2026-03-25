import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Property, PropertyType, PropertyCategory } from '../types';
import PropertyCard from '../components/PropertyCard';
import { Search, SlidersHorizontal, MapPin, LandPlot, Building2, Home as HomeIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<PropertyType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<PropertyCategory | 'all'>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'properties'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || p.type === filterType;
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <section className="relative h-[60vh] rounded-[40px] overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img
            src="https://picsum.photos/seed/nouakchott/1920/1080?blur=4"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-paper/20 via-paper/60 to-paper" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-8">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight"
          >
            ابحث عن <span className="italic text-accent">مستقبلك</span> في موريتانيا
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-ink/60 font-medium tracking-wide"
          >
            المنصة الأولى لبيع وتأجير العقارات والقطع الأرضية الموثقة.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative max-w-2xl mx-auto"
          >
            <div className="bg-white/80 backdrop-blur-xl p-2 rounded-full shadow-2xl border border-ink/5 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-3 px-6">
                <Search size={20} className="text-ink/40" />
                <input
                  type="text"
                  placeholder="ابحث عن مدينة، حي، أو نوع عقار..."
                  className="w-full bg-transparent border-none focus:ring-0 text-lg font-medium placeholder:text-ink/30"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-accent text-white px-8 py-4 rounded-full font-bold hover:bg-accent/90 transition-all">
                بحث
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="flex flex-wrap items-center justify-center gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-ink/5 shadow-sm">
          <FilterButton
            active={filterCategory === 'all'}
            onClick={() => setFilterCategory('all')}
            label="الكل"
          />
          <FilterButton
            active={filterCategory === 'sale'}
            onClick={() => setFilterCategory('sale')}
            label="للبيع"
          />
          <FilterButton
            active={filterCategory === 'rent'}
            onClick={() => setFilterCategory('rent')}
            label="للإيجار"
          />
        </div>

        <div className="flex bg-white p-1 rounded-2xl border border-ink/5 shadow-sm">
          <TypeButton
            active={filterType === 'all'}
            onClick={() => setFilterType('all')}
            icon={<SlidersHorizontal size={16} />}
            label="الكل"
          />
          <TypeButton
            active={filterType === 'land'}
            onClick={() => setFilterType('land')}
            icon={<LandPlot size={16} />}
            label="أرض"
          />
          <TypeButton
            active={filterType === 'house'}
            onClick={() => setFilterType('house')}
            icon={<HomeIcon size={16} />}
            label="منزل"
          />
          <TypeButton
            active={filterType === 'apartment'}
            onClick={() => setFilterType('apartment')}
            icon={<Building2 size={16} />}
            label="شقة"
          />
        </div>
      </section>

      {/* Listings Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[400px] bg-ink/5 rounded-3xl animate-pulse" />
            ))
          ) : filteredProperties.length > 0 ? (
            filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="text-6xl">🏜️</div>
              <h3 className="text-2xl font-serif font-bold">لا توجد نتائج</h3>
              <p className="text-ink/40">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-6 py-2 rounded-xl text-sm font-bold transition-all",
        active ? "bg-accent text-white shadow-lg" : "text-ink/40 hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

function TypeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
        active ? "bg-ink text-white shadow-lg" : "text-ink/40 hover:text-ink"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
