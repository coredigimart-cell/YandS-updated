import * as React from "react";
import { Clock, Sun, Sunset, Moon, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TimeOnlyPickerProps {
  time: string;
  onTimeChange: (time: string) => void;
  label: string;
  className?: string;
}

const quickTimes = [
  { label: '9:00 AM', value: '09:00', period: 'morning' },
  { label: '10:00 AM', value: '10:00', period: 'morning' },
  { label: '11:00 AM', value: '11:00', period: 'morning' },
  { label: '12:00 PM', value: '12:00', period: 'afternoon' },
  { label: '1:00 PM', value: '13:00', period: 'afternoon' },
  { label: '2:00 PM', value: '14:00', period: 'afternoon' },
  { label: '3:00 PM', value: '15:00', period: 'afternoon' },
  { label: '4:00 PM', value: '16:00', period: 'afternoon' },
  { label: '5:00 PM', value: '17:00', period: 'evening' },
  { label: '6:00 PM', value: '18:00', period: 'evening' },
  { label: '7:00 PM', value: '19:00', period: 'evening' },
  { label: '8:00 PM', value: '20:00', period: 'evening' },
  { label: '9:00 PM', value: '21:00', period: 'night' },
  { label: '10:00 PM', value: '22:00', period: 'night' },
];

const getPeriodIcon = (period: string) => {
  switch (period) {
    case "morning":
      return <Sun className="w-4 h-4" />;
    case "afternoon":
      return <CloudSun className="w-4 h-4" />;
    case "evening":
      return <Sunset className="w-4 h-4" />;
    case "night":
      return <Moon className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getPeriodGradient = (period: string) => {
  switch (period) {
    case "morning":
      return "from-amber-400 to-orange-500";
    case "afternoon":
      return "from-yellow-400 to-amber-500";
    case "evening":
      return "from-purple-400 to-pink-500";
    case "night":
      return "from-indigo-500 to-purple-600";
    default:
      return "from-primary to-accent";
  }
};

function TimeOnlyPicker({
  time,
  onTimeChange,
  label,
  className,
}: TimeOnlyPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempTime, setTempTime] = React.useState(time);

  React.useEffect(() => {
    if (isOpen) {
      setTempTime(time);
    }
  }, [isOpen, time]);

  const getCurrentPeriod = (timeValue: string): string => {
    if (!timeValue) return 'morning';
    const hour = parseInt(timeValue.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  const formatTimeDisplay = (timeValue: string): string => {
    if (!timeValue) return '';
    const [hours, minutes] = timeValue.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleConfirm = () => {
    onTimeChange(tempTime);
    setIsOpen(false);
  };

  const currentPeriod = getCurrentPeriod(time);
  const tempPeriod = getCurrentPeriod(tempTime);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
          "bg-gradient-to-br from-card via-card to-muted/30 border-2",
          time ? "border-primary/40" : "border-border/50",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
          "group cursor-pointer text-left"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
          time 
            ? `bg-gradient-to-br ${getPeriodGradient(currentPeriod)} text-white shadow-lg` 
            : "bg-muted group-hover:bg-primary/10"
        )}>
          {time ? getPeriodIcon(currentPeriod) : <Clock className="h-5 w-5" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            ⏰ Select Time
          </span>
          {time ? (
            <span className="text-lg font-bold text-foreground">
              {formatTimeDisplay(time)}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Tap to select time</span>
          )}
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className={cn(
            "p-4 text-white bg-gradient-to-r",
            getPeriodGradient(tempPeriod)
          )}>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {label}
            </DialogTitle>
            <p className="text-white/80 text-sm">
              {tempTime ? formatTimeDisplay(tempTime) : "Select a time"}
            </p>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Manual Time Input */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Custom Time:</span>
              <input
                type="time"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                className="flex-1 bg-background border-2 border-border rounded-lg px-4 py-3 text-lg font-bold focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Quick Select Times */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick Select:</p>
              <div className="grid grid-cols-4 gap-2">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTempTime(qt.value)}
                    className={cn(
                      "py-2.5 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                      tempTime === qt.value
                        ? `bg-gradient-to-r ${getPeriodGradient(qt.period)} text-white shadow-lg scale-105`
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground hover:scale-102"
                    )}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!tempTime}
                className={cn(
                  "flex-1 text-white hover:opacity-90 bg-gradient-to-r",
                  getPeriodGradient(tempPeriod)
                )}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TimeOnlyPicker;
