import { useState, useEffect, useRef } from 'react';
import brandLogo from '@/assets/brand-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [animationPhase, setAnimationPhase] = useState(0);
  const hasCompletedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  
  // Keep ref updated
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Phase 1: Logo enters immediately
    const timer1 = setTimeout(() => setAnimationPhase(1), 100);
    // Phase 2: Show loading dots
    const timer2 = setTimeout(() => setAnimationPhase(2), 800);
    // Phase 3: Logo pulses
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500);
    // Phase 4: Fade out
    const timer4 = setTimeout(() => setAnimationPhase(4), 3500);
    // Complete
    const timer5 = setTimeout(() => {
      if (!hasCompletedRef.current) {
        hasCompletedRef.current = true;
        onCompleteRef.current();
      }
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
        animationPhase >= 4 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo Animation - Clean on light background */}
      <div 
        className={`relative z-10 transition-all duration-700 ${
          animationPhase >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
      >
        <img 
          src={brandLogo} 
          alt="Yousif & Sons Rent A Car" 
          className="w-80 md:w-[450px] h-auto object-contain"
        />
      </div>

      {/* Loading Dots */}
      <div 
        className={`mt-10 transition-all duration-500 ${
          animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};
