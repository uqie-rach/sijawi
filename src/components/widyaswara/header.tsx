"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWTMS } from '@/context/wtms-context';
import { BRANDING } from '@/lib/config';

export function WidyaswaraHeader() {
  const { widyaswaras, selectedWiId, setSelectedWiId, sessions } = useWTMS();

  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];
  const totalJp = sessions
    .filter(s => activeWi && (s.wiIds || []).includes(activeWi.id))
    .reduce((sum, s) => sum + s.jpCount, 0);

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
      <div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 w-fit border border-blue-200 text-blue-600">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          {BRANDING.fullName}
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          Portal {BRANDING.name}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">{BRANDING.tagline}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* WI selector */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Profil Aktif:</span>
          <Select value={activeWi?.id || ''} onValueChange={setSelectedWiId}>
            <SelectTrigger className="h-8 bg-white border border-slate-200 text-slate-800 font-bold focus:ring-0 px-2.5 py-1 gap-1 text-xs rounded-lg">
              <SelectValue placeholder="Pilih profil" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-800">
              {widyaswaras.map(w => (
                <SelectItem key={w.id} value={w.id} className="hover:bg-slate-100 focus:bg-slate-100 text-xs font-semibold">
                  {w.name}, {w.gelar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total JP card */}
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
          <div className="bg-blue-600 p-1.5 rounded-md text-white">
            <span className="text-xs font-black">JP</span>
          </div>
          <div>
            <p className="text-xs text-blue-900 font-bold">Total JP Aktif</p>
            <p className="text-lg font-black text-blue-900">
              {totalJp} JP <span className="text-xs font-normal text-slate-500">({totalJp * 45} Menit)</span>
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}