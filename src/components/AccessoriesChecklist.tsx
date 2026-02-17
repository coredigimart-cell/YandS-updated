import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Package, Check } from 'lucide-react';

export interface AccessoriesData {
  engineOil: boolean;
  battery: boolean;
  carCharger: boolean;
  petrol: boolean;
  brakeOil: boolean;
  tapLcd: boolean;
  spareWheel: boolean;
  wheelCap: boolean;
  lights: boolean;
  jackPana: boolean;
  shades: boolean;
}

interface AccessoriesChecklistProps {
  value: AccessoriesData;
  onChange: (data: AccessoriesData) => void;
}

const accessoriesItems: { key: keyof AccessoriesData; label: string; icon: string }[] = [
  { key: 'engineOil', label: 'Engine Oil', icon: '🛢️' },
  { key: 'battery', label: 'Battery', icon: '🔋' },
  { key: 'carCharger', label: 'Car Charger', icon: '🔌' },
  { key: 'petrol', label: 'Petrol', icon: '⛽' },
  { key: 'brakeOil', label: 'Brake Oil', icon: '🛑' },
  { key: 'tapLcd', label: 'Tap/LCD', icon: '📺' },
  { key: 'spareWheel', label: 'Spare Wheel', icon: '🛞' },
  { key: 'wheelCap', label: 'Wheel Cap', icon: '⚙️' },
  { key: 'lights', label: 'Lights', icon: '💡' },
  { key: 'jackPana', label: 'Jack / Pana', icon: '🔧' },
  { key: 'shades', label: 'Shades', icon: '🕶️' },
];

export const defaultAccessories: AccessoriesData = {
  engineOil: false,
  battery: false,
  carCharger: false,
  petrol: false,
  brakeOil: false,
  tapLcd: false,
  spareWheel: false,
  wheelCap: false,
  lights: false,
  jackPana: false,
  shades: false,
};

export function AccessoriesChecklist({ value, onChange }: AccessoriesChecklistProps) {
  const checkedCount = Object.values(value).filter(Boolean).length;

  const handleChange = (key: keyof AccessoriesData, checked: boolean) => {
    onChange({ ...value, [key]: checked });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Accessories Checklist</h3>
            <p className="text-xs text-muted-foreground">Select items included with the vehicle</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{checkedCount}/{accessoriesItems.length}</span>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {accessoriesItems.map((item) => {
          const isChecked = value[item.key];
          return (
            <label
              key={item.key}
              className={`
                relative flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                transition-all duration-200 group
                ${isChecked 
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' 
                  : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }
              `}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={(checked) => handleChange(item.key, checked as boolean)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{item.icon}</span>
                <span className={`text-sm font-medium truncate ${isChecked ? 'text-primary' : 'text-foreground'}`}>
                  {item.label}
                </span>
              </div>
              {isChecked && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export const getSelectedAccessoriesLabels = (accessories: AccessoriesData): string[] => {
  return accessoriesItems
    .filter((item) => accessories[item.key])
    .map((item) => item.label);
};
