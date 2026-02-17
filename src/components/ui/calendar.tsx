import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex justify-center pt-2 relative items-center h-10",
        caption_label: "text-base font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 p-0",
          "hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20 hover:border-primary/50",
          "hover:shadow-lg hover:shadow-primary/10 hover:scale-105",
          "active:scale-95 transition-all duration-200 rounded-xl",
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse",
        head_row: "flex mb-2",
        head_cell: cn(
          "text-primary rounded-lg w-11 h-8 font-bold text-[0.7rem] uppercase",
          "flex items-center justify-center"
        ),
        row: "flex w-full gap-0.5",
        cell: cn(
          "relative h-11 w-11 text-center text-sm p-0.5 focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-gradient-to-r [&:has([aria-selected])]:from-primary/15 [&:has([aria-selected])]:to-accent/15",
          "[&:has([aria-selected])]:rounded-xl",
          "[&:has([aria-selected].day-outside)]:bg-primary/5",
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-semibold aria-selected:opacity-100 rounded-xl",
          "hover:bg-gradient-to-r hover:from-primary/15 hover:to-accent/15 hover:text-primary",
          "hover:shadow-md hover:shadow-primary/10 hover:scale-110",
          "active:scale-95 transition-all duration-200"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-gradient-to-br from-primary to-accent text-white font-bold",
          "hover:from-primary hover:to-accent hover:text-white",
          "focus:from-primary focus:to-accent focus:text-white",
          "rounded-xl shadow-lg shadow-primary/30",
          "ring-2 ring-white/50"
        ),
        day_today: cn(
          "bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold",
          "ring-2 ring-primary/40 rounded-xl",
          "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2",
          "after:w-1.5 after:h-1.5 after:rounded-full after:bg-primary"
        ),
        day_outside: cn(
          "day-outside text-muted-foreground/40 opacity-50",
          "aria-selected:bg-primary/10 aria-selected:text-muted-foreground/60"
        ),
        day_disabled: "text-muted-foreground/30 opacity-30 cursor-not-allowed",
        day_range_middle: cn(
          "aria-selected:bg-gradient-to-r aria-selected:from-primary/10 aria-selected:to-accent/10",
          "aria-selected:text-primary aria-selected:rounded-none"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => (
          <ChevronLeft className="h-5 w-5 text-primary transition-transform group-hover:-translate-x-0.5" />
        ),
        IconRight: ({ ..._props }) => (
          <ChevronRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-0.5" />
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
