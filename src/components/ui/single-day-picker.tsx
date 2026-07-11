"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";

import type { DayPickerSingleProps } from "react-day-picker";

type DayIndicator = 'klasikal' | 'virtual' | 'asinkron';

interface SingleDayPickerProps {
  value?: Date;
  onSelect?: (day: Date | undefined) => void;
  placeholder?: string;
  id?: string;
  /** Additional CSS for the trigger button (react-aria-components compat) */
  "data-invalid"?: boolean | string;

  // ---- NEW dot support ----
  /** Optional: returns which format indicators to show for a given date */
  dayIndicators?: (date: Date) => DayIndicator[];
}

export function SingleDayPicker({
  value,
  onSelect,
  placeholder = "Pilih tanggal",
  id,
  "data-invalid": dataInvalid,
  dayIndicators,
}: SingleDayPickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onSelect?.(day);
      setOpen(false);
    }
  };

  const isInvalid = dataInvalid === true;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-left font-normal",
            isInvalid && "border-destructive focus-visible:ring-destructive",
            !value && "text-muted-foreground",
          )}
        >
          {value ? format(value, "PPP", { locale: id }) : <span>{placeholder}</span>}
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white" align="start">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={handleSelect}
          locale={id}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: "text-sm font-medium",
            nav: "space-x-1 flex items-center",
            nav_button: cn(
              "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-input",
            ),
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              "[&:has([aria-selected])]:rounded-md"
            ),
            day: cn(
              "h-9 w-9 p-0 font-normal aria-selected:opacity-100 relative"
            ),
            day_selected:
              "bg-primary/20 text-primary-foreground hover:bg-primary/30 focus:bg-primary/30",
            day_today:
              "bg-accent text-accent-foreground",
            day_outside:
              "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
            day_disabled:
              "text-muted-foreground opacity-50",
            day_range_middle:
              "aria-selected:bg-accent aria-selected:text-accent-foreground",
            day_hidden: "invisible",
          }}
          components={{
            DayContent: ({ date, activeModifiers }: any) => {
              const dayNumber = date.getDate();
              const isOutside = activeModifiers?.outside;
              const indicators = dayIndicators ? dayIndicators(date) : [];
              const showIndicators = indicators.length > 0 && !isOutside;

              return (
                <span className="flex flex-col items-center justify-center h-full relative">
                  <span>{dayNumber}</span>
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
          }}
        />
      </PopoverContent>
    </Popover>
  );
}