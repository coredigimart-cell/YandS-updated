import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, X, Check, Sun, Sunset, Moon, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DateTimePickerPopupProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  time: string;
  onTimeChange: (time: string) => void;
  label: string;
  dateLabel?: string;
  timeLabel?: string;
  minDate?: Date;
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

function DateTimePickerPopup({
  date,
  onDateChange,
  time,
  onTimeChange,
  label,
  dateLabel = "Date",
  timeLabel = "Time",
  minDate,
  className,
}: DateTimePickerPopupProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);
  const [tempTime, setTempTime] = React.useState(time);

  // Reset temp values when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setTempDate(date);
      setTempTime(time);
    }
  }, [isOpen, date, time]);

  const getCurrentPeriod = (): string => {
    if (!tempTime) return 'morning';
    const hour = parseInt(tempTime.split(':')[0]);
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

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const normalizedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      setTempDate(normalizedDate);
    } else {
      setTempDate(undefined);
    }
  };

  const isDateDisabled = (d: Date): boolean => {
    if (!minDate) return false;
    const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const minDateNormalized = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return checkDate < minDateNormalized;
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    onTimeChange(tempTime);
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getPeriodGradient(getCurrentPeriod())} flex items-center justify-center`}>
          {getPeriodIcon(getCurrentPeriod())}
        </div>
        <h3 className="font-semibold text-foreground">{label}</h3>
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300",
          "bg-gradient-to-br from-card via-card to-muted/30 border-2 border-primary/20",
          "hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10",
          "group cursor-pointer text-left"
        )}
      >
        {/* Date Section */}
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            date 
              ? "bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/30" 
              : "bg-muted group-hover:bg-primary/10"
          )}>
            <CalendarIcon className="h-5 w-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              📅 {dateLabel}
            </span>
            {date ? (
              <span className="text-base font-bold text-foreground truncate">
                {format(date, "d MMM yyyy")}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Select date</span>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-10 bg-border" />

        {/* Time Section */}
        <div className="flex items-center gap-3 flex-1">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            time 
              ? `bg-gradient-to-br ${getPeriodGradient(getCurrentPeriod())} text-white shadow-lg` 
              : "bg-muted group-hover:bg-primary/10"
          )}>
            {time ? getPeriodIcon(getCurrentPeriod()) : <Clock className="h-5 w-5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              ⏰ {timeLabel}
            </span>
            {time ? (
              <span className="text-base font-bold text-foreground">
                {formatTimeDisplay(time)}
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">Select time</span>
            )}
          </div>
        </div>
      </button>

      {/* Popup Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {label}
            </DialogTitle>
            <p className="text-white/80 text-sm">
              {tempDate ? format(tempDate, "EEEE, MMMM d, yyyy") : "Select date and time"}
              {tempTime && ` • ${formatTimeDisplay(tempTime)}`}
            </p>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Calendar */}
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-xl border border-border"
              />
            </div>

            {/* Time Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Select Time</span>
              </div>

              {/* Manual Time Input */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <span className="text-sm text-muted-foreground">Custom:</span>
                <input
                  type="time"
                  value={tempTime}
                  onChange={(e) => setTempTime(e.target.value)}
                  className="flex-1 bg-background border-2 border-border rounded-lg px-3 py-2 text-sm font-medium focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Quick Select Times */}
              <div className="grid grid-cols-4 gap-2">
                {quickTimes.map((qt) => (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => setTempTime(qt.value)}
                    className={cn(
                      "py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200",
                      tempTime === qt.value
                        ? `bg-gradient-to-r ${getPeriodGradient(qt.period)} text-white shadow-lg`
                        : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {qt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!tempDate || !tempTime}
                className="flex-1 btn-primary-gradient"
              >
                <Check className="w-4 h-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DateTimePickerPopup;
