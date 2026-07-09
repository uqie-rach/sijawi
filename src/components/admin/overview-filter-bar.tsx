'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const MONTH_OPTIONS = [
  { value: 'ALL', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

const POLA_OPTIONS = [
  { value: 'ALL', label: 'Semua Pola' },
  { value: 'APBD', label: 'APBD' },
  { value: 'Kontribusi', label: 'Kontribusi' },
  { value: 'Kemitraan', label: 'Kemitraan' },
];

interface WisOption {
  id: string;
  name: string;
  gelar: string;
}

interface OverviewFilterBarProps {
  availableYears: string[];
  availableWis: WisOption[];
  selectedYear: string;
  selectedMonth: string;
  selectedPola: string;
  selectedWiId: string;
  activeFilterCount: number;
}

export function OverviewFilterBar({
  availableYears,
  availableWis,
  selectedYear,
  selectedMonth,
  selectedPola,
  selectedWiId,
  activeFilterCount,
}: OverviewFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const pushParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, val] of Object.entries(updates)) {
      if (val && val !== 'ALL') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    }
    // Reset page when filters change
    if (!('page' in updates)) {
      params.delete('page');
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-sm mt-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Year */}
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Tahun</Label>
          <Select
            value={selectedYear}
            onValueChange={(val) => pushParams({ year: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="ALL">Semua Tahun</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Month */}
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Bulan</Label>
          <Select
            value={selectedMonth}
            onValueChange={(val) => pushParams({ month: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pola */}
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Pola Anggaran</Label>
          <Select
            value={selectedPola}
            onValueChange={(val) => pushParams({ pola: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Pola" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {POLA_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Widyaiswara */}
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Widyaiswara</Label>
          <Select
            value={selectedWiId}
            onValueChange={(val) => pushParams({ wiId: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua WI" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-52">
              <SelectItem value="ALL">Semua Widyaiswara</SelectItem>
              {availableWis.map((wi) => (
                <SelectItem key={wi.id} value={wi.id} className="text-xs">
                  {wi.name}, {wi.gelar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Badges & Reset */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 mr-1">Filter Aktif:</span>
          {selectedYear !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => pushParams({ year: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              Tahun {selectedYear}
            </Badge>
          )}
          {selectedMonth !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => pushParams({ month: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {MONTH_OPTIONS.find((m) => m.value === selectedMonth)?.label}
            </Badge>
          )}
          {selectedPola !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => pushParams({ pola: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {selectedPola}
            </Badge>
          )}
          {selectedWiId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => pushParams({ wiId: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {availableWis.find((w) => w.id === selectedWiId)?.name || 'WI'}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-[10px] text-red-500 hover:text-red-600 font-semibold ml-2 h-7"
          >
            <X className="h-3 w-3 mr-1" />
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
