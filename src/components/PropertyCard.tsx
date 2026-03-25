import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, LandPlot, Building2, Home as HomeIcon } from 'lucide-react';
import { Property } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const Icon = property.type === 'land' ? LandPlot : property.type === 'house' ? HomeIcon : Building2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group bg-white rounded-3xl overflow-hidden border border-ink/5 shadow-sm hover:shadow-xl transition-all"
    >
      <Link to={`/property/${property.id}`} className="block relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images?.[0] || `https://picsum.photos/seed/${property.id}/800/600`}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md",
            property.category === 'sale' ? "bg-accent/80" : "bg-blue-600/80"
          )}>
            {property.category === 'sale' ? 'للبيع' : 'للإيجار'}
          </span>
          {property.isVerified && (
            <span className="bg-green-500/80 backdrop-blur-md p-1 rounded-full text-white">
              <CheckCircle size={14} />
            </span>
          )}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl flex justify-between items-center">
            <span className="font-serif font-bold text-lg text-accent">
              {formatCurrency(property.price)}
            </span>
            <div className="flex items-center gap-1 text-ink/60 text-xs">
              <Icon size={14} />
              <span>
                {property.type === 'land' ? 'قطعة أرض' : property.type === 'house' ? 'منزل' : 'شقة'}
              </span>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <h3 className="font-serif text-xl font-bold mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {property.title}
        </h3>
        <div className="flex items-center gap-1 text-ink/40 text-sm mb-4">
          <MapPin size={14} />
          <span>{property.location} - {property.neighborhood}</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {property.features?.slice(0, 3).map((feature) => (
            <span key={feature} className="px-2 py-1 bg-paper rounded-lg text-[10px] text-ink/60 font-medium">
              {feature}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
