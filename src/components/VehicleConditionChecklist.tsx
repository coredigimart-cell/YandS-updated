import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ClipboardCheck, Check, X } from 'lucide-react';

export interface VehicleConditionData {
  tyresCondition: 'good' | 'bad' | '';
  tyrePressure: 'good' | 'bad' | '';
  scratchesDents: 'yes' | 'no' | '';
  frontBumper: 'good' | 'bad' | '';
  backBumper: 'good' | 'bad' | '';
  sideMirrors: 'good' | 'bad' | '';
  windowsGlass: 'good' | 'bad' | '';
  acWorking: 'yes' | 'no' | '';
  heaterWorking: 'yes' | 'no' | '';
  horn: 'good' | 'bad' | '';
  wipers: 'good' | 'bad' | '';
  seatCondition: 'good' | 'bad' | '';
  seatBelts: 'good' | 'bad' | '';
  fuelLevel: 'empty' | 'half' | 'full' | '';
  mileage: string;
  radiator: 'good' | 'bad' | '';
}

interface VehicleConditionChecklistProps {
  value: VehicleConditionData;
  onChange: (data: VehicleConditionData) => void;
}

export const defaultVehicleCondition: VehicleConditionData = {
  tyresCondition: '',
  tyrePressure: '',
  scratchesDents: '',
  frontBumper: '',
  backBumper: '',
  sideMirrors: '',
  windowsGlass: '',
  acWorking: '',
  heaterWorking: '',
  horn: '',
  wipers: '',
  seatCondition: '',
  seatBelts: '',
  fuelLevel: '',
  mileage: '',
  radiator: '',
};

type GoodBadField = 'tyresCondition' | 'tyrePressure' | 'frontBumper' | 'backBumper' | 
  'sideMirrors' | 'windowsGlass' | 'horn' | 'wipers' | 'seatCondition' | 'seatBelts' | 'radiator';

type YesNoField = 'scratchesDents' | 'acWorking' | 'heaterWorking';

const goodBadItems: { key: GoodBadField; label: string; icon: string }[] = [
  { key: 'tyresCondition', label: 'Tyres Condition', icon: '🛞' },
  { key: 'tyrePressure', label: 'Tyre Pressure', icon: '💨' },
  { key: 'frontBumper', label: 'Front Bumper', icon: '🚗' },
  { key: 'backBumper', label: 'Back Bumper', icon: '🚙' },
  { key: 'sideMirrors', label: 'Side Mirrors', icon: '🪞' },
  { key: 'windowsGlass', label: 'Windows / Glass', icon: '🪟' },
  { key: 'horn', label: 'Horn', icon: '📢' },
  { key: 'wipers', label: 'Wipers', icon: '🧹' },
  { key: 'seatCondition', label: 'Seat Condition', icon: '💺' },
  { key: 'seatBelts', label: 'Seat Belts', icon: '🔒' },
  { key: 'radiator', label: 'Radiator', icon: '♨️' },
];

const yesNoItems: { key: YesNoField; label: string; icon: string }[] = [
  { key: 'scratchesDents', label: 'Scratches / Dents', icon: '⚠️' },
  { key: 'acWorking', label: 'AC Working', icon: '❄️' },
  { key: 'heaterWorking', label: 'Heater Working', icon: '🔥' },
];

export function VehicleConditionChecklist({ value, onChange }: VehicleConditionChecklistProps) {
  const handleGoodBadChange = (key: GoodBadField, val: 'good' | 'bad') => {
    onChange({ ...value, [key]: val });
  };

  const handleYesNoChange = (key: YesNoField, val: 'yes' | 'no') => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <ClipboardCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Vehicle Condition Checklist</h3>
          <p className="text-xs text-muted-foreground">Record the condition of vehicle before handover</p>
        </div>
      </div>

      {/* Good/Bad Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {goodBadItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleGoodBadChange(item.key, 'good')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${value[item.key] === 'good' 
                    ? 'bg-emerald-500 text-white shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-emerald-100 hover:text-emerald-700'
                  }
                `}
              >
                <Check className="w-3 h-3" />
                Good
              </button>
              <button
                type="button"
                onClick={() => handleGoodBadChange(item.key, 'bad')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${value[item.key] === 'bad' 
                    ? 'bg-red-500 text-white shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-700'
                  }
                `}
              >
                <X className="w-3 h-3" />
                Bad
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Yes/No Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {yesNoItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleYesNoChange(item.key, 'yes')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${value[item.key] === 'yes' 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-blue-100 hover:text-blue-700'
                  }
                `}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => handleYesNoChange(item.key, 'no')}
                className={`
                  flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${value[item.key] === 'no' 
                    ? 'bg-gray-500 text-white shadow-md' 
                    : 'bg-muted text-muted-foreground hover:bg-gray-100 hover:text-gray-700'
                  }
                `}
              >
                No
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fuel Level & Mileage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <span className="text-lg">⛽</span>
            Fuel Level
          </Label>
          <Select
            value={value.fuelLevel}
            onValueChange={(val) => onChange({ ...value, fuelLevel: val as 'empty' | 'half' | 'full' })}
          >
            <SelectTrigger className="input-styled">
              <SelectValue placeholder="Select fuel level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="empty">
                <span className="flex items-center gap-2">🔴 Empty</span>
              </SelectItem>
              <SelectItem value="half">
                <span className="flex items-center gap-2">🟡 Half</span>
              </SelectItem>
              <SelectItem value="full">
                <span className="flex items-center gap-2">🟢 Full</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            Mileage (Odometer Reading)
          </Label>
          <Input
            type="number"
            placeholder="e.g., 45000"
            value={value.mileage}
            onChange={(e) => onChange({ ...value, mileage: e.target.value })}
            className="input-styled"
          />
        </div>
      </div>
    </div>
  );
}
