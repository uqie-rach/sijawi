'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import type { Widyaiswara, Mapel, Lokasi } from '@/context/wtms-context';

interface FilterBarProps {
  filterDateStart: string;
  setFilterDateStart: (v: string) => void;
  filterDateEnd: string;
  setFilterDateEnd: (v: string) => void;
  filterFormat: string;
  setFilterFormat: (v: string) => void;
  filterWIId: string;
  setFilterWIId: (v: string) => void;
  filterMapelId: string;
  setFilterMapelId: (v: string) => void;
  filterLokasiId: string;
  setFilterLokasiId: (v: string) => void;
  filterJpMin: string;
  setFilterJpMin: (v: string) => void;
  filterJpMax: string;
  setFilterJpMax: (v: string) => void;

  activeWis: Widyaiswara[];
  activeMapels: Mapel[];
  activeLokasis: Lokasi[];

  batchStartDate?: string;
  batchEndDate?: string;

  activeFilterCount: number;
  totalFiltered: number;
  totalSessions: number;
}

export function FilterBar({
  filterDateStart, setFilterDateStart,
  filterDateEnd, setFilterDateEnd,
  filterFormat, setFilterFormat,
  filterWIId, setFilterWIId,
  filterMapelId, setFilterMapelId,
  filterLokasiId, setFilterLokasiId,
  filterJpMin, setFilterJpMin,
  filterJpMax, setFilterJpMax,
  activeWis, activeMapels, activeLokasis,
  batchStartDate, batchEndDate,
  activeFilterCount, totalFiltered, totalSessions,
}: FilterBarProps) {
  return (
    <div className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200 shadow-sm">
      {/* Baris Pertama: Tanggal & Format */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Tanggal Mulai</Label>
          <Input
            type="date"
            min={batchStartDate}
            max={batchEndDate}
            value={filterDateStart}
            onChange={e => setFilterDateStart(e.target.value)}
            className="h-9 text-xs bg-slate-50 border-slate-200"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Tanggal Akhir</Label>
          <Input
            type="date"
            min={batchStartDate}
            max={batchEndDate}
            value={filterDateEnd}
            onChange={e => setFilterDateEnd(e.target.value)}
            className="h-9 text-xs bg-slate-50 border-slate-200"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Format</Label>
          <Select value={filterFormat} onValueChange={setFilterFormat}>
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
          <Label className="text-[10px] font-bold uppercase text-slate-400">Rentang JP</Label>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              placeholder="Min"
              min="1"
              max="10"
              value={filterJpMin}
              onChange={e => setFilterJpMin(e.target.value)}
              className="h-9 w-16 text-xs bg-slate-50 border-slate-200"
            />
            <span className="text-xs text-slate-400">-</span>
            <Input
              type="number"
              placeholder="Max"
              min="1"
              max="10"
              value={filterJpMax}
              onChange={e => setFilterJpMax(e.target.value)}
              className="h-9 w-16 text-xs bg-slate-50 border-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Baris Kedua: Widyaiswara, Mapel, Lokasi */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Widyaiswara</Label>
          <Select value={filterWIId} onValueChange={setFilterWIId}>
            <SelectTrigger className="h-9 text-xs bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua Widyaiswara" />
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
          <Select value={filterMapelId} onValueChange={setFilterMapelId}>
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

        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-slate-400">Lokasi</Label>
          <Select value={filterLokasiId} onValueChange={setFilterLokasiId}>
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
          {filterDateStart && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterDateStart('')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              Dari {filterDateStart}
            </Badge>
          )}
          {filterDateEnd && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterDateEnd('')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              Sampai {filterDateEnd}
            </Badge>
          )}
          {filterFormat !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterFormat('ALL')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {filterFormat}
            </Badge>
          )}
          {filterWIId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterWIId('ALL')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeWis.find(w => w.id === filterWIId)?.name || 'WI'}
            </Badge>
          )}
          {filterMapelId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterMapelId('ALL')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeMapels.find(m => m.id === filterMapelId)?.name || 'Mapel'}
            </Badge>
          )}
          {filterLokasiId !== 'ALL' && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button onClick={() => setFilterLokasiId('ALL')} className="mr-1 hover:text-red-500">
                <X className="h-2.5 w-2.5 inline" />
              </button>
              {activeLokasis.find(l => l.id === filterLokasiId)?.name || 'Lokasi'}
            </Badge>
          )}
          {(filterJpMin || filterJpMax) && (
            <Badge variant="secondary" className="text-[9px] bg-white text-slate-600 border-slate-200 font-medium">
              <button
                onClick={() => { setFilterJpMin(''); setFilterJpMax(''); }}
                className="mr-1 hover:text-red-500"
              >
                <X className="h-2.5 w-2.5 inline" />
              </button>
              JP: {filterJpMin || '1'}-{filterJpMax || '10'}
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
