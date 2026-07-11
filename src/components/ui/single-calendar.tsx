"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import type { DayPickerSingleProps } from "react-day-picker";

type DayIndicator = 'klasikal' | 'virtual' | 'asinkron';

interface SingleCalendarProps extends DayPickerSingleProps {
  /** Optional: returns which format indicators to show for a given date.
   *  Used to render colored dots (blue/purple/amber) below the day number. */
  dayIndicators?: (date: Date) => DayIndicator[];
}

function SingleCalendar({
  className,
  classNames,
  showOutsideDays = true,
  selected,
  dayIndicators,
  ...props
}: SingleCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(
    selected instanceof Date ? selected : undefined,
  );

  // Custom DayContent that renders indicator dots when dayIndicators is provided
  const customComponents = React.useMemo(() => {
    if (!dayIndicators) return undefined;

    return {
      DayContent: ({ date, activeModifiers, displayMonth }: any) => {
        const day = date.getDate();
        const isToday = activeModifiers?.today;
        const isSelected = activeModifiers?.selected;
        const isOutside = activeModifiers?.outside;

        const indicators = dayIndicators(date);
        const showIndicators = indicators.length > 0 && !isOutside;

        return (
          <span className="flex flex-col items-center justify-center h-full">
            <span className={cn(
              "flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
              isToday && !isSelected && "bg-accent text-accent-foreground",
              isSelected && "bg-primary text-primary-foreground",
              isOutside && "text-muted-foreground opacity-50"
            )}>
              {day}
            </span>
            {showIndicators && (
              <span className="flex items-center justify-center gap-0.5 absolute bottom-0.5 left-1/2 -translate-x-1/2">
                {indicators.map((fmt, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-1.5 rounded-full",
                      fmt === 'klasikal' && "bg-blue-600",
                      fmt === 'virtual' && "bg-purple-600",
                      fmt === 'asinkron' && "bg-amber-600",
                    )}
                  />
                ))}
              </span>
            )}
          </span>
        );
      },
    };
  }, [dayIndicators]);

  // Merge custom DayButton with default icon components
  const mergedComponents = React.useMemo(() => ({
    IconLeft: ({ className: iconCls, ...iconProps }: any) => (
      <ChevronLeft className={cn("h-4 w-4", iconCls)} {...iconProps} />
    ),
    IconRight: ({ className: iconCls, ...iconProps }: any) => (
      <ChevronRight className={cn("h-4 w-4", iconCls)} {...iconProps} />
    ),
    ...customComponents,
  }), [customComponents]);

  return (
    <DayPicker
      selected={selected}
      showOutsideDays={showOutsideDays}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100 relative"),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected: "bg-gray-200 text-black hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={mergedComponents}
      {...props}
    />
  );
}
SingleCalendar.displayName = "Calendar";

export { SingleCalendar };