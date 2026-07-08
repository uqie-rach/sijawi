'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ChevronDown, ChevronUp, UserPlus, Eye } from 'lucide-react';
import type { Widyaiswara } from '@/context/wtms-context';
import type { BusyWiDetail } from '@/hooks/use-wi-availability';

interface WiAssignmentPanelProps {
  date: string;
  availableWis: Widyaiswara[];
  busyWis: BusyWiDetail[];
  filteredWisList: Widyaiswara[];
  selectedWiIds: string[];
  onToggleWi: (wiId: string, checked: boolean) => void;
  onViewWiDetail: (wiId: string) => void;
  selectedWiId: string | null;
}

export function WiAssignmentPanel({
  date,
  availableWis,
  busyWis,
  filteredWisList,
  selectedWiIds,
  onToggleWi,
  onViewWiDetail,
  selectedWiId,
}: WiAssignmentPanelProps) {
  const [showAvailable, setShowAvailable] = useState(true);
  const [showBusy, setShowBusy] = useState(true);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '';

  // Map available WI IDs for quick lookup
  const availableIds = new Set(availableWis.map(w => w.id));

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-blue-600 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Penugasan Pengajar
          </CardTitle>
          {formattedDate && (
            <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 font-medium">
              {formattedDate}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filteredWisList.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Pilih kategori untuk melihat daftar pengajar.
          </div>
        ) : !date ? (
          <div className="p-4 text-center text-xs text-slate-400">
            Pilih tanggal untuk melihat ketersediaan.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Available WIs */}
            <div>
              <button
                onClick={() => setShowAvailable(!showAvailable)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-700">Tersedia</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    {availableWis.length}
                  </Badge>
                </div>
                {showAvailable ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showAvailable && (
                <div className="max-h-[240px] overflow-y-auto">
                  {availableWis.length === 0 ? (
                    <p className="text-[11px] text-slate-400 px-4 py-3 text-center italic">
                      Tidak ada WI yang tersedia pada tanggal ini.
                    </p>
                  ) : (
                    availableWis.map(wi => {
                      const isChecked = selectedWiIds.includes(wi.id);
                      return (
                        <label
                          key={wi.id}
                          className="px-4 py-2.5 flex items-center justify-between hover:bg-emerald-50/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleWi(wi.id, !isChecked)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-slate-800 truncate">
                                {wi.name}, {wi.gelar}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Level {wi.level} &middot; {wi.jabatan.replace('WI ', '')}
                              </p>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Busy WIs */}
            <div>
              <button
                onClick={() => setShowBusy(!showBusy)}
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-700">Sudah Terjadwal</span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                    {busyWis.length}
                  </Badge>
                </div>
                {showBusy ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>

              {showBusy && (
                <div className="max-h-[240px] overflow-y-auto">
                  {busyWis.length === 0 ? (
                    <p className="text-[11px] text-slate-400 px-4 py-3 text-center italic">
                      Belum ada WI yang terjadwal pada tanggal ini.
                    </p>
                  ) : (
                    busyWis.map(item => {
                      const isSelected = selectedWiId === item.wi.id;
                      const isChecked = selectedWiIds.includes(item.wi.id);
                      return (
                        <div
                          key={item.wi.id}
                          className={`px-4 py-2.5 hover:bg-amber-50/30 transition-colors ${
                            isSelected ? 'bg-blue-50/60 border-l-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => onToggleWi(item.wi.id, !isChecked)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0"
                              />
                              <p className="text-[11px] font-semibold text-slate-800 truncate">
                                {item.wi.name}, {item.wi.gelar}
                              </p>
                            </div>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold ml-2 shrink-0">
                              {item.sessions.length} sesi
                            </Badge>
                          </div>
                          <div className="space-y-0.5 mb-2 ml-5">
                            {item.sessions.slice(0, 2).map(s => (
                              <div
                                key={s.id}
                                className="flex items-center gap-1.5 text-[10px] text-slate-600"
                              >
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="font-mono">
                                  {s.startTime}-{s.endTime}
                                </span>
                                <span className="truncate">{s.mapelName}</span>
                              </div>
                            ))}
                            {item.sessions.length > 2 && (
                              <p className="text-[10px] text-slate-400 ml-4">
                                +{item.sessions.length - 2} sesi lainnya
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewWiDetail(item.wi.id)}
                            className={`text-[10px] font-bold h-6 px-2 w-full justify-center ${
                              isSelected
                                ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                                : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                            }`}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {isSelected ? 'Tutup Detail' : 'Lihat Detail'}
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Selected badges summary */}
            {selectedWiIds.length > 0 && (
              <div className="px-4 py-2.5 bg-blue-50/50 border-t border-blue-100">
                <p className="text-[10px] font-bold text-blue-800 mb-1.5">
                  {selectedWiIds.length} pengajar ditugaskan:
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedWiIds.map(id => {
                    const wi = filteredWisList.find(w => w.id === id);
                    if (!wi) return null;
                    const isAvailable = availableIds.has(id);
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className={`text-[9px] font-bold rounded ${
                          isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {wi.name.split(' ')[0]}
                        <span className="ml-1 opacity-60">
                          {isAvailable ? '✓' : '⚠'}
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
