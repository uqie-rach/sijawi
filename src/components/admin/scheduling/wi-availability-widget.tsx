'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ChevronDown, ChevronUp, UserPlus, UserCheck, Eye } from 'lucide-react';
import type { Widyaiswara } from '@/context/wtms-context';
import type { BusyWiDetail } from '@/hooks/use-wi-availability';

interface WiAvailabilityWidgetProps {
  date: string;
  availableWis: Widyaiswara[];
  busyWis: BusyWiDetail[];
  onAssignWi: (wiId: string) => void;
  onViewWiDetail: (wiId: string) => void;
  selectedWiId: string | null;
}

export function WiAvailabilityWidget({
  date, availableWis, busyWis, onAssignWi, onViewWiDetail, selectedWiId,
}: WiAvailabilityWidgetProps) {
  const [showAvailable, setShowAvailable] = useState(true);
  const [showBusy, setShowBusy] = useState(true);

  const formattedDate = date
    ? new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '';

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-blue-600 flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Ketersediaan WI
          </CardTitle>
          {formattedDate && (
            <Badge variant="outline" className="text-[10px] bg-white text-slate-600 border-slate-200 font-medium">
              {formattedDate}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!date ? (
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
                  <span className="text-xs font-bold text-slate-700">
                    Tersedia
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">
                    {availableWis.length}
                  </Badge>
                </div>
                {showAvailable ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {showAvailable && (
                <div className="max-h-[180px] overflow-y-auto">
                  {availableWis.length === 0 ? (
                    <p className="text-[11px] text-slate-400 px-4 py-3 text-center italic">
                      Tidak ada WI yang tersedia.
                    </p>
                  ) : (
                    availableWis.map(wi => (
                      <div
                        key={wi.id}
                        className="px-4 py-2 flex items-center justify-between hover:bg-emerald-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-slate-800 truncate">
                            {wi.name}, {wi.gelar}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            Level {wi.level} &middot; {wi.jabatan.replace('WI ', '')}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onAssignWi(wi.id)}
                          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-[10px] font-bold h-7 px-2 ml-2 shrink-0"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1" />
                          Assign
                        </Button>
                      </div>
                    ))
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
                  <span className="text-xs font-bold text-slate-700">
                    Sudah Terjadwal
                  </span>
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                    {busyWis.length}
                  </Badge>
                </div>
                {showBusy ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {showBusy && (
                <div className="max-h-[200px] overflow-y-auto">
                  {busyWis.length === 0 ? (
                    <p className="text-[11px] text-slate-400 px-4 py-3 text-center italic">
                      Belum ada WI yang terjadwal.
                    </p>
                  ) : (
                    busyWis.map(item => {
                      const isSelected = selectedWiId === item.wi.id;
                      return (
                        <div
                          key={item.wi.id}
                          className={`px-4 py-2.5 hover:bg-amber-50/30 transition-colors ${isSelected ? 'bg-blue-50/60 border-l-2 border-blue-500' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[11px] font-semibold text-slate-800 truncate flex-1">
                              {item.wi.name}, {item.wi.gelar}
                            </p>
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[9px] font-bold ml-2">
                              {item.sessions.length} sesi
                            </Badge>
                          </div>
                          <div className="space-y-0.5 mb-1.5">
                            {item.sessions.slice(0, 2).map(s => (
                              <div key={s.id} className="flex items-center gap-1.5 text-[10px] text-slate-600">
                                <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="font-mono">{s.startTime}-{s.endTime}</span>
                                <span className="truncate">{s.mapelName}</span>
                              </div>
                            ))}
                            {item.sessions.length > 2 && (
                              <p className="text-[10px] text-slate-400 pl-4">
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}