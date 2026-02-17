import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calculator, Clock, Sun, CalendarDays, CalendarRange, Calendar, Save, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/lib/storage';

export interface SmartPricingData {
  perDayPrice: number;
  customDays: number;
  savedPrices: number[];
}

interface SmartPricingCalculatorProps {
  value: SmartPricingData;
  onChange: (data: SmartPricingData) => void;
  onTotalSelect?: (total: number, rentType: string) => void;
}

export const defaultSmartPricing: SmartPricingData = {
  perDayPrice: 0,
  customDays: 0,
  savedPrices: [],
};

export function SmartPricingCalculator({ value, onChange, onTotalSelect }: SmartPricingCalculatorProps) {
  const { perDayPrice, customDays, savedPrices } = value;

  // Calculated prices
  const hourlyPrice = perDayPrice > 0 ? Math.round(perDayPrice / 24) : 0;
  const dailyPrice = perDayPrice;
  const weeklyPrice = perDayPrice * 7;
  const fifteenDaysPrice = perDayPrice * 15;
  const monthlyPrice = perDayPrice * 30;
  const customTotal = perDayPrice * customDays;

  const priceBreakdown = [
    { label: 'Hourly', value: hourlyPrice, icon: Clock, formula: '÷ 24', color: 'from-violet-500 to-purple-600' },
    { label: 'Daily', value: dailyPrice, icon: Sun, formula: '× 1', color: 'from-amber-500 to-orange-600' },
    { label: 'Weekly', value: weeklyPrice, icon: CalendarDays, formula: '× 7', color: 'from-blue-500 to-cyan-600' },
    { label: '15 Days', value: fifteenDaysPrice, icon: Calendar, formula: '× 15', color: 'from-emerald-500 to-teal-600' },
    { label: 'Monthly', value: monthlyPrice, icon: CalendarRange, formula: '× 30', color: 'from-pink-500 to-rose-600' },
  ];

  const handleSavePrice = () => {
    if (perDayPrice > 0 && !savedPrices.includes(perDayPrice)) {
      onChange({
        ...value,
        savedPrices: [...savedPrices, perDayPrice].slice(-5), // Keep last 5
      });
    }
  };

  const handleQuickSelect = (price: number) => {
    onChange({ ...value, perDayPrice: price });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
          <Calculator className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Smart Rent Pricing</h3>
          <p className="text-xs text-muted-foreground">Enter per-day price for auto calculations</p>
        </div>
      </div>

      {/* Per Day Price Input */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur-xl" />
        <div className="relative bg-card border-2 border-primary/20 rounded-2xl p-4 space-y-3">
          <Label className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Price Per Day (PKR)
          </Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary">Rs</span>
              <Input
                type="number"
                min="0"
                placeholder="Enter amount..."
                value={perDayPrice || ''}
                onChange={(e) => onChange({ ...value, perDayPrice: parseInt(e.target.value) || 0 })}
                className="pl-12 text-xl font-bold h-14 input-styled"
              />
            </div>
            <Button
              type="button"
              onClick={handleSavePrice}
              disabled={perDayPrice <= 0}
              className="h-14 px-4 bg-gradient-to-r from-primary to-accent text-white"
            >
              <Save className="w-5 h-5" />
            </Button>
          </div>

          {/* Saved Prices */}
          {savedPrices.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs text-muted-foreground">Quick:</span>
              {savedPrices.map((price, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleQuickSelect(price)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-semibold transition-all
                    ${perDayPrice === price 
                      ? 'bg-primary text-white' 
                      : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                >
                  Rs {price.toLocaleString()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      {perDayPrice > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 animate-fade-in">
          {priceBreakdown.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onTotalSelect?.(item.value, item.label.toLowerCase())}
                className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
              >
                <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${item.color} opacity-10 rounded-bl-full`} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.formula}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(item.value)}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom Days Calculator */}
      {perDayPrice > 0 && (
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-sm font-semibold">Custom Days</Label>
              <Input
                type="number"
                min="0"
                placeholder="Enter days..."
                value={customDays || ''}
                onChange={(e) => onChange({ ...value, customDays: parseInt(e.target.value) || 0 })}
                className="input-styled"
              />
            </div>
            {customDays > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-2xl text-muted-foreground">=</span>
                <button
                  type="button"
                  onClick={() => onTotalSelect?.(customTotal, 'custom')}
                  className="text-right p-3 rounded-xl hover:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/30"
                >
                  <p className="text-xs text-muted-foreground">{customDays} days total</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {formatCurrency(customTotal)}
                  </p>
                  <p className="text-xs text-primary mt-1">Click to apply</p>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
