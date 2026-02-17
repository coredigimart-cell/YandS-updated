import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Sparkles, Sun, Sunset, Moon, CloudSun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
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

function DateTimePicker({
  date,
  onDateChange,
  time,
  onTimeChange,
  label,
  dateLabel = "Date",
  timeLabel = "Time",
  minDate,
  className,
}: DateTimePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  // Get current period based on time
  const getCurrentPeriod = (): string => {
    if (!time) return 'morning';
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  };

  // Format time for display
  const formatTimeDisplay = (timeValue: string): string => {
    if (!timeValue) return '';
    const [hours, minutes] = timeValue.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Handle date selection with proper date handling
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a date that represents the start of the day in local time
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();
      const localDate = new Date(year, month, day);
      onDateChange(localDate);
    } else {
      onDateChange(undefined);
    }
    setIsCalendarOpen(false);
  };

  // Check if a date should be disabled
  const isDateDisabled = (d: Date): boolean => {
    if (!minDate) return false;
    const checkDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const minDateNormalized = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    return checkDate < minDateNormalized;
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{label}</h3>
      </div>

      {/* Combined Date + Time Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-card via-card to-muted/30 p-4 shadow-lg shadow-primary/5">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex flex-col sm:flex-row gap-4">
          {/* Date Section */}
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex-1 flex items-center gap-3 p-3 rounded-xl transition-all duration-300",
                  "bg-background/50 hover:bg-background/80 border border-border/50",
                  "hover:border-primary/30 hover:shadow-md hover:shadow-primary/10",
                  "group cursor-pointer text-left"
                )}
              >
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
                    <span className="text-sm text-muted-foreground">
                      Select date
                    </span>
                  )}
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-auto p-0 border-2 border-primary/20 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden z-50" 
              align="start"
              sideOffset={8}
            >
              <div className="bg-gradient-to-r from-primary to-accent p-4">
                <p className="text-white/80 text-sm font-medium">Select Date</p>
                <p className="text-white text-lg font-bold">
                  {date ? format(date, "EEEE, MMMM d, yyyy") : "No date selected"}
                </p>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                initialFocus
                className="p-4 pointer-events-auto bg-card"
              />
            </PopoverContent>
          </Popover>

          {/* Divider */}
          <div className="hidden sm:flex items-center">
            <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
          </div>
          <div className="sm:hidden w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Time Section - Free Manual Input */}
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl transition-all duration-300 bg-background/50 border border-border/50">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              time 
                ? `bg-gradient-to-br ${getPeriodGradient(getCurrentPeriod())} text-white shadow-lg` 
                : "bg-muted"
            )}>
              {time ? getPeriodIcon(getCurrentPeriod()) : <Clock className="h-5 w-5" />}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                ⏰ {timeLabel}
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => onTimeChange(e.target.value)}
                className="text-base font-bold text-foreground bg-transparent border-none outline-none w-full cursor-pointer"
                placeholder="HH:MM"
              />
            </div>
          </div>
        </div>

        {/* Summary Display */}
        {date && time && (
          <div className="relative mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-muted-foreground">Selected:</span>
              <span className="font-semibold text-foreground bg-primary/10 px-3 py-1 rounded-full">
                📅 {format(date, "d MMM")} | ⏰ {formatTimeDisplay(time)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateTimePicker;