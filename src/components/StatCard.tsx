import { forwardRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'success' | 'warning' | 'accent';
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon: Icon, trend, variant = 'default' }, ref) => {
    const variantStyles = {
      default: 'before:bg-primary',
      success: 'before:bg-emerald-500',
      warning: 'before:bg-amber-500',
      accent: 'before:bg-orange-600',
    };

    return (
      <div ref={ref} className={`stat-card ${variantStyles[variant]} animate-slide-up border-none shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
            {trend && (
              <p className="text-sm text-slate-400 mt-2">{trend}</p>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            <Icon className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
