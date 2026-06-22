"use client";

import React, { useState } from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface MultiComboboxProps {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
}

export function MultiCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi...",
}: MultiComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (itemValue: string) => {
    if (value.includes(itemValue)) {
      onValueChange(value.filter(v => v !== itemValue));
    } else {
      onValueChange([...value, itemValue]);
    }
  };

  const handleRemove = (itemValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange(value.filter(v => v !== itemValue));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between hover:bg-slate-50 border-slate-200 h-auto min-h-[40px] px-3 text-left py-2 font-semibold text-slate-800"
          >
            <span className="truncate text-xs text-slate-500 font-medium">
              {placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[340px] p-0 bg-white border border-slate-200 shadow-lg rounded-xl z-50">
          <Command className="bg-white">
            <CommandInput placeholder="Cari..." className="border-none focus:ring-0 text-xs" />
            <CommandEmpty className="text-slate-400 text-xs text-center py-4">Opsi tidak ditemukan.</CommandEmpty>
            <CommandList className="max-h-[220px] overflow-y-auto">
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        "flex items-center justify-between text-xs py-2 px-3 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors focus:bg-slate-100",
                        option.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                      )}
                    >
                      <span className="truncate max-w-[260px] font-semibold text-slate-800">{option.label}</span>
                      <div className="flex h-4 w-4 items-center justify-center border border-slate-300 rounded-md bg-white">
                        {isSelected && <Check className="h-3 w-3 text-blue-600 stroke-[3px]" />}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items Rendered as Dismissible Badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map(val => {
            const opt = options.find(o => o.value === val);
            if (!opt) return null;
            return (
              <Badge
                key={val}
                variant="secondary"
                className="bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100 flex items-center gap-1 py-1 px-2.5 text-xs font-bold rounded-lg shadow-sm"
              >
                <span>{opt.label.split(' (')[0]}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemove(val, e)}
                  className="rounded-full hover:bg-blue-200 p-0.5 transition-colors shrink-0"
                >
                  <X className="h-3 w-3 text-blue-600 stroke-[3px]" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}