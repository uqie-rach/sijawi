'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Widyaiswara, Mapel, Lokasi } from '@/context/wtms-context';

export interface FilterState {
  year: string;
  format: string;
  wiId: string;
  mapelId: string;
  lokasiId: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  availableYears: string[];

  activeWis: Widyaiswara[];
  activeMapels: Mapel[];
  activeLokasis: Lokasi[];

  activeFilterCount: number;
  totalFiltered: number;
  totalSessions: number;
}

export function FilterBar({
  filters,
  onFilterChange,
  availableYears,
  activeWis,
  activeMapels,
  activeLokasis,
  activeFilterCount,
  totalFiltered,
  totalSessions,
}: FilterBarProps) {
  return (
    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-sm">
      {/* Row 1: Year & Format */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Tahun</Label>
          <Select
            value={filters.year}
            onValueChange={val => onFilterChange({ year: val })}
          >
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="ALL">Semua Tahun</SelectItem>
              {availableYears.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Format</Label>
          <Select value={filters.format} onValueChange={val => onFilterChange({ format: val })}>
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Format" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="ALL">Semua Format</SelectItem>
              <SelectItem value="Klasikal">Klasikal</SelectItem>
              <SelectItem value="Virtual">Virtual</SelectItem>
              <SelectItem value="Asinkron">Asinkron</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Widyaiswara</Label>
          <Select value={filters.wiId} onValueChange={val => onFilterChange({ wiId: val })}>
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua WI" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-52">
              <SelectItem value="ALL">Semua Widyaiswara</SelectItem>
              {activeWis.map(wi => (
                <SelectItem key={wi.id} value={wi.id} className="text-xs">
                  {wi.name}, {wi.gelar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Mata Pelajaran</Label>
          <Select value={filters.mapelId} onValueChange={val => onFilterChange({ mapelId: val })}>
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Mapel" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-52">
              <SelectItem value="ALL">Semua Mapel</SelectItem>
              {activeMapels.map(mapel => (
                <SelectItem key={mapel.id} value={mapel.id} className="text-xs">
                  {mapel.name} ({mapel.jpTotal} JP)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Lokasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Lokasi</Label>
          <Select value={filters.lokasiId} onValueChange={val => onFilterChange({ lokasiId: val })}>
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Lokasi" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 max-h-52">
              <SelectItem value="ALL">Semua Lokasi</SelectItem>
              {activeLokasis.map(lok => (
                <SelectItem key={lok.id} value={lok.id} className="text-xs">
                  {lok.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          <span className="text-[9px] font-bold text-slate-400 mr-1">Filter Aktif:</span>
          {filters.year !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => onFilterChange({ year: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              Tahun {filters.year}
            </Badge>
          )}
          {filters.format !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => onFilterChange({ format: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {filters.format}
            </Badge>
          )}
          {filters.wiId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => onFilterChange({ wiId: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeWis.find(w => w.id === filters.wiId)?.name || 'WI'}
            </Badge>
          )}
          {filters.mapelId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => onFilterChange({ mapelId: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeMapels.find(m => m.id === filters.mapelId)?.name || 'Mapel'}
            </Badge>
          )}
          {filters.lokasiId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => onFilterChange({ lokasiId: 'ALL' })} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeLokasis.find(l => l.id === filters.lokasiId)?.name || 'Lokasi'}
            </Badge>
          )}
        </div>
      )}

      <div className="text-[10px] font-medium text-slate-500">
        {totalFiltered} dari {totalSessions} sesi
        {activeFilterCount > 0 && ' • difilter'}
      </div>
    </div>
  );
}
