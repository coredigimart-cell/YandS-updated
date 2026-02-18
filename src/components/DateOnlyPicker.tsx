import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DateOnlyPickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  label: string;
  minDate?: Date;
  className?: string;
}

function DateOnlyPicker({
  date,
  onDateChange,
  label,
  minDate,
  className,
}: DateOnlyPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempDate, setTempDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    if (isOpen) {
      setTempDate(date);
    }
  }, [isOpen, date]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Create a date at noon local time to avoid timezone shifts
      const localDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
      setTempDate(localDate);
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
    setIsOpen(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
          "bg-gradient-to-br from-card via-card to-muted/30 border-2",
          date ? "border-primary/40" : "border-border/50",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
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
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            📅 Select Date
          </span>
          {date ? (
            <span className="text-lg font-bold text-foreground truncate">
              {format(date, "EEEE, d MMM yyyy")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Tap to select date</span>
          )}
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-primary to-accent p-4 text-white">
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {label}
            </DialogTitle>
            <p className="text-white/80 text-sm">
              {tempDate ? format(tempDate, "EEEE, MMMM d, yyyy") : "Select a date"}
            </p>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={tempDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                className="rounded-xl border border-border pointer-events-auto"
              />
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
                disabled={!tempDate}
                className="flex-1 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
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

export default DateOnlyPicker;
