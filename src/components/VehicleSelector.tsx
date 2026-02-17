import { useState, useRef, useEffect, useMemo } from 'react';
import { Check, ChevronDown, Search, Car, Palette, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

// Vehicle data for suggestions
const vehicleDatabase = [
  // Toyota
  { brand: 'Toyota', model: 'Corolla', logo: 'toyota' },
  { brand: 'Toyota', model: 'Camry', logo: 'toyota' },
  { brand: 'Toyota', model: 'Yaris', logo: 'toyota' },
  { brand: 'Toyota', model: 'Land Cruiser', logo: 'toyota' },
  { brand: 'Toyota', model: 'Hilux', logo: 'toyota' },
  { brand: 'Toyota', model: 'Prius', logo: 'toyota' },
  { brand: 'Toyota', model: 'Fortuner', logo: 'toyota' },
  // Honda
  { brand: 'Honda', model: 'Civic', logo: 'honda' },
  { brand: 'Honda', model: 'City', logo: 'honda' },
  { brand: 'Honda', model: 'Accord', logo: 'honda' },
  { brand: 'Honda', model: 'BR-V', logo: 'honda' },
  { brand: 'Honda', model: 'HR-V', logo: 'honda' },
  { brand: 'Honda', model: 'Vezel', logo: 'honda' },
  // Suzuki
  { brand: 'Suzuki', model: 'Cultus', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Swift', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Wagon R', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Alto', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Mehran', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Bolan', logo: 'suzuki' },
  { brand: 'Suzuki', model: 'Jimny', logo: 'suzuki' },
  // Hyundai
  { brand: 'Hyundai', model: 'Elantra', logo: 'hyundai' },
  { brand: 'Hyundai', model: 'Sonata', logo: 'hyundai' },
  { brand: 'Hyundai', model: 'Tucson', logo: 'hyundai' },
  { brand: 'Hyundai', model: 'Santa Fe', logo: 'hyundai' },
  { brand: 'Hyundai', model: 'Accent', logo: 'hyundai' },
  // Kia
  { brand: 'Kia', model: 'Sportage', logo: 'kia' },
  { brand: 'Kia', model: 'Picanto', logo: 'kia' },
  { brand: 'Kia', model: 'Sorento', logo: 'kia' },
  { brand: 'Kia', model: 'Stonic', logo: 'kia' },
  // Nissan
  { brand: 'Nissan', model: 'Sunny', logo: 'nissan' },
  { brand: 'Nissan', model: 'Dayz', logo: 'nissan' },
  { brand: 'Nissan', model: 'Juke', logo: 'nissan' },
  { brand: 'Nissan', model: 'Patrol', logo: 'nissan' },
  // BMW
  { brand: 'BMW', model: '3 Series', logo: 'bmw' },
  { brand: 'BMW', model: '5 Series', logo: 'bmw' },
  { brand: 'BMW', model: '7 Series', logo: 'bmw' },
  { brand: 'BMW', model: 'X5', logo: 'bmw' },
  { brand: 'BMW', model: 'X7', logo: 'bmw' },
  // Mercedes
  { brand: 'Mercedes', model: 'C-Class', logo: 'mercedes' },
  { brand: 'Mercedes', model: 'E-Class', logo: 'mercedes' },
  { brand: 'Mercedes', model: 'S-Class', logo: 'mercedes' },
  { brand: 'Mercedes', model: 'GLC', logo: 'mercedes' },
  { brand: 'Mercedes', model: 'GLE', logo: 'mercedes' },
  // Audi
  { brand: 'Audi', model: 'A4', logo: 'audi' },
  { brand: 'Audi', model: 'A6', logo: 'audi' },
  { brand: 'Audi', model: 'Q5', logo: 'audi' },
  { brand: 'Audi', model: 'Q7', logo: 'audi' },
  // MG
  { brand: 'MG', model: 'HS', logo: 'mg' },
  { brand: 'MG', model: 'ZS', logo: 'mg' },
  { brand: 'MG', model: '5', logo: 'mg' },
  // Changan
  { brand: 'Changan', model: 'Alsvin', logo: 'changan' },
  { brand: 'Changan', model: 'Oshan X7', logo: 'changan' },
  // Proton
  { brand: 'Proton', model: 'Saga', logo: 'proton' },
  { brand: 'Proton', model: 'X70', logo: 'proton' },
];

const colorSuggestions = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#1a1a1a' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Grey', hex: '#808080' },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Blue', hex: '#2563EB' },
  { name: 'Green', hex: '#16A34A' },
  { name: 'Brown', hex: '#78350F' },
  { name: 'Beige', hex: '#D4C4A8' },
  { name: 'Burgundy', hex: '#722F37' },
  { name: 'Navy Blue', hex: '#1E3A5F' },
  { name: 'Pearl White', hex: '#F8F6F0' },
  { name: 'Metallic Grey', hex: '#6B7280' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Golden', hex: '#D4AF37' },
];

// Brand logos configuration
const brandLogos: Record<string, { svg: React.ReactNode; bgColor: string; textColor: string }> = {
  toyota: {
    bgColor: '#EB0A1E',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <ellipse cx="50" cy="30" rx="45" ry="25" fill="none" stroke="currentColor" strokeWidth="3"/>
        <ellipse cx="50" cy="30" rx="28" ry="16" fill="none" stroke="currentColor" strokeWidth="3"/>
        <ellipse cx="50" cy="30" rx="12" ry="8" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  honda: {
    bgColor: '#CC0000',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="36" fontWeight="bold" fill="currentColor" fontFamily="Arial">H</text>
      </svg>
    ),
  },
  suzuki: {
    bgColor: '#004990',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="36" fontWeight="bold" fill="currentColor" fontFamily="Arial">S</text>
      </svg>
    ),
  },
  hyundai: {
    bgColor: '#002C5F',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="36" fontWeight="bold" fontStyle="italic" fill="currentColor" fontFamily="Arial">H</text>
      </svg>
    ),
  },
  kia: {
    bgColor: '#05141F',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="28" fontWeight="bold" fill="currentColor" fontFamily="Arial">KIA</text>
      </svg>
    ),
  },
  nissan: {
    bgColor: '#C3002F',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <circle cx="50" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="3"/>
        <text x="50" y="36" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor">NISSAN</text>
      </svg>
    ),
  },
  bmw: {
    bgColor: '#0066B1',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <circle cx="50" cy="30" r="26" fill="none" stroke="currentColor" strokeWidth="3"/>
        <line x1="50" y1="4" x2="50" y2="56" stroke="currentColor" strokeWidth="2"/>
        <line x1="24" y1="30" x2="76" y2="30" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  mercedes: {
    bgColor: '#1A1A1A',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <circle cx="50" cy="30" r="24" fill="none" stroke="currentColor" strokeWidth="2"/>
        <line x1="50" y1="6" x2="50" y2="30" stroke="currentColor" strokeWidth="2"/>
        <line x1="50" y1="30" x2="29" y2="50" stroke="currentColor" strokeWidth="2"/>
        <line x1="50" y1="30" x2="71" y2="50" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  audi: {
    bgColor: '#1A1A1A',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 120 60" className="w-full h-full">
        <circle cx="25" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="45" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="65" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
        <circle cx="85" cy="30" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
  },
  mg: {
    bgColor: '#BF0000',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="28" fontWeight="bold" fill="currentColor" fontFamily="serif">MG</text>
      </svg>
    ),
  },
  changan: {
    bgColor: '#003366',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="Arial">CHANGAN</text>
      </svg>
    ),
  },
  proton: {
    bgColor: '#004C3F',
    textColor: '#FFFFFF',
    svg: (
      <svg viewBox="0 0 100 60" className="w-full h-full">
        <text x="50" y="42" textAnchor="middle" fontSize="14" fontWeight="bold" fill="currentColor" fontFamily="Arial">PROTON</text>
      </svg>
    ),
  },
};

export interface VehicleSelection {
  brand: string;
  model: string;
  year: string;
  color: string;
  logo: string;
}

interface VehicleSelectorProps {
  value: VehicleSelection;
  onChange: (selection: VehicleSelection) => void;
}

export const VehicleSelector = ({ value, onChange }: VehicleSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState(
    value.brand && value.model ? `${value.brand} ${value.model}` : ''
  );
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [showColorSuggestions, setShowColorSuggestions] = useState(false);
  const [colorQuery, setColorQuery] = useState(value.color || '');
  const [yearQuery, setYearQuery] = useState(value.year || '');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const vehicleInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const yearInputRef = useRef<HTMLInputElement>(null);
  const vehicleDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // Generate years from 2010 to current year + 1
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const yearList = [];
    for (let y = currentYear + 1; y >= 2010; y--) {
      yearList.push(y.toString());
    }
    return yearList;
  }, []);

  // Filter vehicles based on search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicleDatabase.slice(0, 10);
    const query = searchQuery.toLowerCase();
    return vehicleDatabase.filter(v => 
      `${v.brand} ${v.model}`.toLowerCase().includes(query) ||
      v.brand.toLowerCase().includes(query) ||
      v.model.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [searchQuery]);

  // Filter colors based on search
  const filteredColors = useMemo(() => {
    if (!colorQuery.trim()) return colorSuggestions;
    const query = colorQuery.toLowerCase();
    return colorSuggestions.filter(c => 
      c.name.toLowerCase().includes(query)
    );
  }, [colorQuery]);

  // Filter years based on search
  const filteredYears = useMemo(() => {
    if (!yearQuery.trim()) return years;
    return years.filter(y => y.includes(yearQuery));
  }, [yearQuery, years]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (vehicleDropdownRef.current && !vehicleDropdownRef.current.contains(e.target as Node) &&
          vehicleInputRef.current && !vehicleInputRef.current.contains(e.target as Node)) {
        setShowVehicleSuggestions(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node) &&
          colorInputRef.current && !colorInputRef.current.contains(e.target as Node)) {
        setShowColorSuggestions(false);
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(e.target as Node) &&
          yearInputRef.current && !yearInputRef.current.contains(e.target as Node)) {
        setShowYearDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVehicleSelect = (vehicle: typeof vehicleDatabase[0]) => {
    setSearchQuery(`${vehicle.brand} ${vehicle.model}`);
    setShowVehicleSuggestions(false);
    onChange({
      ...value,
      brand: vehicle.brand,
      model: vehicle.model,
      logo: vehicle.logo,
    });
    // Focus next input
    setTimeout(() => yearInputRef.current?.focus(), 100);
  };

  const handleColorSelect = (color: typeof colorSuggestions[0]) => {
    setColorQuery(color.name);
    setShowColorSuggestions(false);
    onChange({
      ...value,
      color: color.name,
    });
  };

  const handleYearSelect = (year: string) => {
    setYearQuery(year);
    setShowYearDropdown(false);
    onChange({
      ...value,
      year: year,
    });
    // Focus next input
    setTimeout(() => colorInputRef.current?.focus(), 100);
  };

  const validateYear = (yearStr: string): boolean => {
    const year = parseInt(yearStr);
    return !isNaN(year) && year >= 2010 && year <= new Date().getFullYear() + 1;
  };

  const handleYearBlur = () => {
    if (yearQuery && validateYear(yearQuery)) {
      onChange({ ...value, year: yearQuery });
    }
  };

  const handleColorBlur = () => {
    if (colorQuery.trim()) {
      onChange({ ...value, color: colorQuery });
    }
  };

  // Keyboard navigation for vehicle suggestions
  const handleVehicleKeyDown = (e: React.KeyboardEvent) => {
    if (!showVehicleSuggestions) {
      if (e.key === 'ArrowDown') {
        setShowVehicleSuggestions(true);
        setHighlightedIndex(0);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredVehicles.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleVehicleSelect(filteredVehicles[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setShowVehicleSuggestions(false);
    }
  };

  const currentLogo = value.logo && brandLogos[value.logo];

  return (
    <div className="space-y-6">
      {/* Premium Header with Logo */}
      <div className="flex items-start gap-6">
        {/* Brand Logo Display */}
        <div 
          className={cn(
            "flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
            currentLogo ? "" : "bg-gradient-to-br from-muted/50 to-muted border-2 border-dashed border-border"
          )}
          style={currentLogo ? { 
            backgroundColor: currentLogo.bgColor,
            color: currentLogo.textColor 
          } : undefined}
        >
          {currentLogo ? (
            <div className="w-16 h-10 animate-fade-in">
              {currentLogo.svg}
            </div>
          ) : (
            <Car className="w-10 h-10 text-muted-foreground/50" />
          )}
        </div>

        {/* Selected Vehicle Summary */}
        <div className="flex-1 min-w-0">
          {value.brand && value.model ? (
            <div className="animate-fade-in">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Selected Vehicle</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {value.brand} {value.model}
              </h3>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {value.year && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {value.year}
                  </span>
                )}
                {value.color && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    <span 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: colorSuggestions.find(c => c.name === value.color)?.hex || '#888' }}
                    />
                    {value.color}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="py-2">
              <p className="text-muted-foreground">Start typing to search for a vehicle...</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-6">
        {/* Step 1: Brand & Model */}
        <div className="relative">
          <Label htmlFor="vehicle-search" className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Brand & Model
          </Label>
          <div className="relative mt-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <Input
              ref={vehicleInputRef}
              id="vehicle-search"
              placeholder="Search brand and model (e.g., Toyota Corolla)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowVehicleSuggestions(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => setShowVehicleSuggestions(true)}
              onKeyDown={handleVehicleKeyDown}
              className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <ChevronDown className={cn(
              "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-transform duration-200",
              showVehicleSuggestions && "rotate-180"
            )} />
          </div>
          
          {/* Vehicle Suggestions Dropdown */}
          {showVehicleSuggestions && (
            <div 
              ref={vehicleDropdownRef}
              className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-xl shadow-xl overflow-hidden animate-fade-in"
            >
              <div className="max-h-72 overflow-y-auto">
                {filteredVehicles.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No vehicles found. Try a different search.
                  </div>
                ) : (
                  filteredVehicles.map((vehicle, index) => (
                    <button
                      key={`${vehicle.brand}-${vehicle.model}`}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 text-left transition-all duration-150",
                        highlightedIndex === index 
                          ? "bg-primary/10 border-l-4 border-primary" 
                          : "hover:bg-muted/50 border-l-4 border-transparent"
                      )}
                    >
                      {/* Mini Logo */}
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ 
                          backgroundColor: brandLogos[vehicle.logo]?.bgColor || '#888',
                          color: brandLogos[vehicle.logo]?.textColor || '#fff' 
                        }}
                      >
                        <div className="w-7 h-5">
                          {brandLogos[vehicle.logo]?.svg}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-muted-foreground">{vehicle.brand}</p>
                      </div>
                      {value.brand === vehicle.brand && value.model === vehicle.model && (
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2 & 3: Year and Color Side by Side */}
        <div className="grid sm:grid-cols-2 gap-6">
          {/* Step 2: Year */}
          <div className="relative">
            <Label htmlFor="vehicle-year" className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
              Manufacturing Year
            </Label>
            <div className="relative mt-2">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                ref={yearInputRef}
                id="vehicle-year"
                placeholder="e.g., 2024"
                value={yearQuery}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setYearQuery(val);
                  setShowYearDropdown(true);
                }}
                onFocus={() => setShowYearDropdown(true)}
                onBlur={handleYearBlur}
                className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <ChevronDown className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-transform duration-200",
                showYearDropdown && "rotate-180"
              )} />
            </div>
            
            {/* Year Dropdown */}
            {showYearDropdown && (
              <div 
                ref={yearDropdownRef}
                className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-xl shadow-xl overflow-hidden animate-fade-in"
              >
                <div className="max-h-48 overflow-y-auto">
                  {filteredYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => handleYearSelect(year)}
                      className={cn(
                        "w-full p-3 text-left transition-all duration-150 hover:bg-muted/50",
                        value.year === year && "bg-primary/10 font-semibold text-primary"
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Color */}
          <div className="relative">
            <Label htmlFor="vehicle-color" className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
              Car Color
            </Label>
            <div className="relative mt-2">
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                ref={colorInputRef}
                id="vehicle-color"
                placeholder="e.g., White, Silver"
                value={colorQuery}
                onChange={(e) => {
                  setColorQuery(e.target.value);
                  setShowColorSuggestions(true);
                }}
                onFocus={() => setShowColorSuggestions(true)}
                onBlur={handleColorBlur}
                className="pl-12 pr-10 h-14 text-base rounded-xl border-2 border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {value.color && (
                <span 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: colorSuggestions.find(c => c.name === value.color)?.hex || '#888' }}
                />
              )}
            </div>
            
            {/* Color Suggestions Dropdown */}
            {showColorSuggestions && (
              <div 
                ref={colorDropdownRef}
                className="absolute z-50 w-full mt-2 bg-background border-2 border-border rounded-xl shadow-xl overflow-hidden animate-fade-in"
              >
                <div className="max-h-48 overflow-y-auto">
                  {filteredColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 text-left transition-all duration-150 hover:bg-muted/50",
                        value.color === color.name && "bg-primary/10"
                      )}
                    >
                      <span 
                        className="w-6 h-6 rounded-full border-2 border-border shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className={cn(
                        "flex-1",
                        value.color === color.name && "font-semibold text-primary"
                      )}>
                        {color.name}
                      </span>
                      {value.color === color.name && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Status */}
      {value.brand && value.model && value.year && value.color && (
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-xl animate-fade-in">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-success text-success-foreground">
            <Check className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-success">
            Vehicle selection complete! Ready to proceed.
          </p>
        </div>
      )}
    </div>
  );
};
