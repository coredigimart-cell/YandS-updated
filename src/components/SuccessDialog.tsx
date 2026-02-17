import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  subtitle?: string;
  autoClose?: number;
}

export const SuccessDialog = ({
  open,
  onOpenChange,
  title = 'ALL DONE',
  subtitle = 'Your booking has been saved successfully!',
  autoClose = 2000,
}: SuccessDialogProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [open, onOpenChange, autoClose]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-0 bg-transparent shadow-none">
        <div className="relative flex flex-col items-center justify-center p-8">
          {/* Animated Background Circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className={`w-64 h-64 rounded-full bg-gradient-to-br from-success/20 to-accent/20 blur-2xl transition-all duration-700 ${
                showConfetti ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
              }`}
            />
          </div>

          {/* Success Content */}
          <div 
            className={`relative z-10 flex flex-col items-center transition-all duration-500 ${
              showConfetti ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-4'
            }`}
          >
            {/* Animated Check Icon */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-emerald-400 flex items-center justify-center shadow-2xl shadow-success/50 animate-bounce">
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Sparkle Effects */}
              <Sparkles 
                className={`absolute -top-2 -right-2 w-6 h-6 text-yellow-400 transition-all duration-500 ${
                  showConfetti ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ animationDelay: '200ms' }}
              />
              <Sparkles 
                className={`absolute -bottom-1 -left-3 w-5 h-5 text-accent transition-all duration-500 ${
                  showConfetti ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ animationDelay: '400ms' }}
              />
              <Sparkles 
                className={`absolute top-1/2 -right-6 w-4 h-4 text-primary transition-all duration-500 ${
                  showConfetti ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                }`}
                style={{ animationDelay: '300ms' }}
              />
            </div>

            {/* Title */}
            <h2 
              className={`font-display text-3xl font-bold text-foreground mb-2 transition-all duration-500 delay-200 ${
                showConfetti ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {title}
            </h2>

            {/* Subtitle */}
            <p 
              className={`text-muted-foreground text-center transition-all duration-500 delay-300 ${
                showConfetti ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              {subtitle}
            </p>

            {/* Loading bar */}
            <div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-success to-accent transition-all duration-1000 ease-linear"
                style={{ 
                  width: showConfetti ? '100%' : '0%',
                  transitionDuration: `${autoClose}ms`
                }}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
