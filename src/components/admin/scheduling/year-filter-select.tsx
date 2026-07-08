'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface YearFilterSelectProps {
  availableYears: string[];
  selectedYear: string;
}

export function YearFilterSelect({ availableYears, selectedYear }: YearFilterSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-slate-500">Tahun:</span>
      <Select
        value={selectedYear}
        onValueChange={(year) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set('year', year);
          params.delete('page');
          router.push(`?${params.toString()}`);
        }}
      >
        <SelectTrigger className="h-9 w-[100px] text-xs bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {availableYears.map(y => (
            <SelectItem key={y} value={y}>{y}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
