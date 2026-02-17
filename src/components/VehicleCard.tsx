import { useState } from 'react';
import { Vehicle } from '@/types/rental';
import { formatCurrency } from '@/lib/storage';
import { Check, Clock, Sun, CalendarDays, CalendarRange, Edit2, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VehicleCardProps {
  vehicle: Vehicle;
  selected: boolean;
  onSelect: (vehicle: Vehicle) => void;
  onUpdateRates?: (vehicle: Vehicle, newRates: { hourlyRate: number; dailyRate: number; weeklyRate: number; monthlyRate: number }) => void;
  editable?: boolean;
}

// Brand logos using professional SVG-based approach with brand colors
const brandConfig: Record<string, { 
  color: string; 
  bgColor: string; 
  gradient: string;
  textColor: string;
}> = {
  Toyota: { 
    color: '#EB0A1E', 
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/40 dark:to-rose-950/40', 
    gradient: 'from-red-500 to-red-600',
    textColor: 'text-red-600 dark:text-red-400'
  },
  Honda: { 
    color: '#CC0000', 
    bgColor: 'bg-gradient-to-br from-red-50 to-orange-100 dark:from-red-950/40 dark:to-orange-950/40', 
    gradient: 'from-red-600 to-red-700',
    textColor: 'text-red-600 dark:text-red-400'
  },
  Suzuki: { 
    color: '#003399', 
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40', 
    gradient: 'from-blue-600 to-blue-700',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  Hyundai: { 
    color: '#002C5F', 
    bgColor: 'bg-gradient-to-br from-blue-50 to-slate-100 dark:from-blue-950/40 dark:to-slate-950/40', 
    gradient: 'from-blue-700 to-blue-800',
    textColor: 'text-blue-700 dark:text-blue-400'
  },
  Kia: { 
    color: '#05141F', 
    bgColor: 'bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-800/50 dark:to-slate-800/50', 
    gradient: 'from-gray-700 to-gray-800',
    textColor: 'text-gray-700 dark:text-gray-300'
  },
  Nissan: { 
    color: '#C3002F', 
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-100 dark:from-red-950/40 dark:to-pink-950/40', 
    gradient: 'from-red-600 to-red-700',
    textColor: 'text-red-600 dark:text-red-400'
  },
  BMW: { 
    color: '#0066B1', 
    bgColor: 'bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950/40 dark:to-sky-950/40', 
    gradient: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  Mercedes: { 
    color: '#333333', 
    bgColor: 'bg-gradient-to-br from-gray-100 to-zinc-200 dark:from-gray-800/50 dark:to-zinc-800/50', 
    gradient: 'from-gray-600 to-gray-700',
    textColor: 'text-gray-700 dark:text-gray-300'
  },
};

// Professional SVG Brand Logos - High Quality
const BrandLogo = ({ brand }: { brand: string }) => {
  switch (brand) {
    case 'Toyota':
      return (
        <svg viewBox="0 0 200 130" className="w-14 h-10">
          <ellipse cx="100" cy="65" rx="90" ry="55" fill="none" stroke="#EB0A1E" strokeWidth="8"/>
          <ellipse cx="100" cy="65" rx="50" ry="30" fill="none" stroke="#EB0A1E" strokeWidth="6"/>
          <ellipse cx="100" cy="65" rx="90" ry="30" fill="none" stroke="#EB0A1E" strokeWidth="6"/>
          <line x1="100" y1="10" x2="100" y2="35" stroke="#EB0A1E" strokeWidth="6"/>
        </svg>
      );
    case 'Honda':
      return (
        <svg viewBox="0 0 200 120" className="w-14 h-9">
          <rect x="15" y="10" width="170" height="100" fill="none" stroke="#CC0000" strokeWidth="8" rx="10"/>
          <text x="100" y="78" textAnchor="middle" fill="#CC0000" fontWeight="bold" fontSize="72" fontFamily="Arial Black, sans-serif">H</text>
        </svg>
      );
    case 'Suzuki':
      return (
        <svg viewBox="0 0 200 100" className="w-14 h-7">
          <path d="M30 70 Q50 20, 100 50 Q150 80, 170 30" fill="none" stroke="#003399" strokeWidth="12" strokeLinecap="round"/>
          <path d="M30 30 Q50 80, 100 50 Q150 20, 170 70" fill="none" stroke="#003399" strokeWidth="12" strokeLinecap="round"/>
        </svg>
      );
    case 'Hyundai':
      return (
        <svg viewBox="0 0 200 120" className="w-14 h-9">
          <ellipse cx="100" cy="60" rx="90" ry="50" fill="none" stroke="#002C5F" strokeWidth="8"/>
          <text x="100" y="80" textAnchor="middle" fill="#002C5F" fontWeight="bold" fontSize="60" fontFamily="Arial, sans-serif" fontStyle="italic">H</text>
        </svg>
      );
    case 'Nissan':
      return (
        <svg viewBox="0 0 200 100" className="w-14 h-7">
          <circle cx="100" cy="50" r="45" fill="none" stroke="#C3002F" strokeWidth="6"/>
          <rect x="25" y="40" width="150" height="20" fill="#C3002F"/>
          <text x="100" y="56" textAnchor="middle" fill="#FFFFFF" fontWeight="bold" fontSize="14" fontFamily="Arial, sans-serif">NISSAN</text>
        </svg>
      );
    case 'Kia':
      return (
        <svg viewBox="0 0 200 80" className="w-14 h-6">
          <text x="100" y="58" textAnchor="middle" fill="#05141F" fontWeight="900" fontSize="52" fontFamily="Arial Black, sans-serif" letterSpacing="4">KIA</text>
          <line x1="20" y1="68" x2="180" y2="68" stroke="#05141F" strokeWidth="4"/>
        </svg>
      );
    case 'BMW':
      return (
        <svg viewBox="0 0 200 200" className="w-12 h-12">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#0066B1" strokeWidth="8"/>
          <circle cx="100" cy="100" r="70" fill="none" stroke="#0066B1" strokeWidth="2"/>
          <path d="M100 30 A70 70 0 0 1 170 100 L100 100 Z" fill="#0066B1"/>
          <path d="M100 170 A70 70 0 0 1 30 100 L100 100 Z" fill="#0066B1"/>
          <path d="M100 30 A70 70 0 0 0 30 100 L100 100 Z" fill="#FFFFFF"/>
          <path d="M100 170 A70 70 0 0 0 170 100 L100 100 Z" fill="#FFFFFF"/>
        </svg>
      );
    case 'Mercedes':
      return (
        <svg viewBox="0 0 200 200" className="w-12 h-12">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#333333" strokeWidth="6"/>
          <circle cx="100" cy="100" r="15" fill="#333333"/>
          <line x1="100" y1="100" x2="100" y2="20" stroke="#333333" strokeWidth="8"/>
          <line x1="100" y1="100" x2="30" y2="155" stroke="#333333" strokeWidth="8"/>
          <line x1="100" y1="100" x2="170" y2="155" stroke="#333333" strokeWidth="8"/>
        </svg>
      );
    default:
      const config = brandConfig[brand] || { gradient: 'from-gray-500 to-gray-600' };
      return (
        <div 
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base bg-gradient-to-br ${config.gradient} text-white shadow-lg`}
        >
          {brand?.substring(0, 2).toUpperCase() || 'CA'}
        </div>
      );
  }
};

// Vehicle type badge colors
const typeColors: Record<string, string> = {
  Sedan: 'from-blue-500 to-blue-600',
  SUV: 'from-purple-500 to-purple-600',
  Hatchback: 'from-green-500 to-green-600',
  Truck: 'from-orange-500 to-orange-600',
  Van: 'from-teal-500 to-teal-600',
};

export const VehicleCard = ({ vehicle, selected, onSelect, onUpdateRates, editable = false }: VehicleCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRates, setEditedRates] = useState({
    hourlyRate: vehicle.hourlyRate || 0,
    dailyRate: vehicle.dailyRate || 0,
    weeklyRate: vehicle.weeklyRate || 0,
    monthlyRate: vehicle.monthlyRate || 0,
  });

  // Safely get brand name with fallback
  const brandName = vehicle.brand || vehicle.name?.split(' ')[0] || 'Car';
  const modelName = vehicle.model || vehicle.name?.split(' ').slice(1).join(' ') || '';
  const vehicleType = vehicle.type || 'Vehicle';
  const config = brandConfig[brandName] || { 
    color: '#6B7280', 
    bgColor: 'bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-800/50 dark:to-slate-800/50', 
    gradient: 'from-gray-500 to-gray-600',
    textColor: 'text-gray-600 dark:text-gray-400'
  };
  const typeGradient = typeColors[vehicleType] || 'from-gray-500 to-gray-600';

  const handleSaveRates = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateRates) {
      onUpdateRates(vehicle, editedRates);
      toast.success('Rates updated successfully!');
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedRates({
      hourlyRate: vehicle.hourlyRate || 0,
      dailyRate: vehicle.dailyRate || 0,
      weeklyRate: vehicle.weeklyRate || 0,
      monthlyRate: vehicle.monthlyRate || 0,
    });
    setIsEditing(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  return (
    <div
      onClick={() => !isEditing && onSelect(vehicle)}
      className={`relative cursor-pointer overflow-hidden rounded-2xl bg-card border-2 transition-all duration-300 hover:-translate-y-1 ${
        selected 
          ? 'border-primary ring-4 ring-primary/20 shadow-xl shadow-primary/15' 
          : 'border-border hover:border-primary/40 hover:shadow-xl'
      }`}
    >
      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-primary/30 animate-scale-in">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}

      {/* Edit button */}
      {editable && !isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-3 left-3 z-10 w-8 h-8 bg-muted/80 backdrop-blur-sm hover:bg-primary hover:text-white rounded-full flex items-center justify-center shadow-md transition-all duration-200"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {/* Brand & Model Header */}
      <div className={`p-4 ${config.bgColor} border-b border-border/50`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-2 bg-white/60 dark:bg-black/20 rounded-xl shadow-sm backdrop-blur-sm">
            <BrandLogo brand={brandName} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-xl ${config.textColor} truncate`}>{brandName}</h3>
            <p className="text-sm text-muted-foreground truncate font-medium">{modelName} {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>

      {/* Vehicle Type Badge */}
      <div className="px-4 pt-3 flex items-center justify-between">
        <span className={`inline-flex items-center text-xs font-bold text-white bg-gradient-to-r ${typeGradient} px-4 py-1.5 rounded-full shadow-md uppercase tracking-wide`}>
          {vehicleType}
        </span>
        {isEditing && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleCancelEdit} className="h-7 w-7 p-0 rounded-full">
              <X className="w-4 h-4 text-destructive" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleSaveRates} className="h-7 w-7 p-0 rounded-full">
              <Save className="w-4 h-4 text-success" />
            </Button>
          </div>
        )}
      </div>

      {/* Rates Grid - Premium Design */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2">
          {/* Hourly Rate */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40 rounded-xl p-3 border border-orange-200/60 dark:border-orange-800/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
                <Clock className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Hourly</p>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={editedRates.hourlyRate}
                onChange={(e) => setEditedRates({ ...editedRates, hourlyRate: parseInt(e.target.value) || 0 })}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-sm font-bold"
              />
            ) : (
              <p className="font-bold text-foreground text-base">{formatCurrency(vehicle.hourlyRate || 0)}</p>
            )}
          </div>
          
          {/* Daily Rate */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/40 rounded-xl p-3 border border-blue-200/60 dark:border-blue-800/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-sm">
                <Sun className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Daily</p>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={editedRates.dailyRate}
                onChange={(e) => setEditedRates({ ...editedRates, dailyRate: parseInt(e.target.value) || 0 })}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-sm font-bold"
              />
            ) : (
              <p className="font-bold text-foreground text-base">{formatCurrency(vehicle.dailyRate || 0)}</p>
            )}
          </div>
          
          {/* Weekly Rate */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/40 dark:to-violet-950/40 rounded-xl p-3 border border-purple-200/60 dark:border-purple-800/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center shadow-sm">
                <CalendarDays className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Weekly</p>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={editedRates.weeklyRate}
                onChange={(e) => setEditedRates({ ...editedRates, weeklyRate: parseInt(e.target.value) || 0 })}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-sm font-bold"
              />
            ) : (
              <p className="font-bold text-foreground text-base">{formatCurrency(vehicle.weeklyRate || 0)}</p>
            )}
          </div>
          
          {/* Monthly Rate */}
          <div className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 rounded-xl p-3 border border-green-200/60 dark:border-green-800/40 transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-sm">
                <CalendarRange className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide">Monthly</p>
            </div>
            {isEditing ? (
              <Input
                type="number"
                value={editedRates.monthlyRate}
                onChange={(e) => setEditedRates({ ...editedRates, monthlyRate: parseInt(e.target.value) || 0 })}
                onClick={(e) => e.stopPropagation()}
                className="h-8 text-sm font-bold"
              />
            ) : (
              <p className="font-bold text-foreground text-base">{formatCurrency(vehicle.monthlyRate || 0)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Selected shimmer effect */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        </div>
      )}
    </div>
  );
};
