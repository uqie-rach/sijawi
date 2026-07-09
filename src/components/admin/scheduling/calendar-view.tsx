'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { formatDateString } from '@/lib/scheduling-utils';
import type { Session, Mapel } from '@/context/wtms-context';

interface CalendarViewProps {
  year: number;
  month: number;
  monthName: string;
  calendarDaysList: (Date | null)[];
  batchSessions: Session[];
  activeMapels: Mapel[];
  activeBatch?: { name?: string; startDate?: string; endDate?: string } | null;
  batchId?: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (dateStr: string) => void;
}

export function CalendarView({
  year, month, monthName, calendarDaysList,
  batchSessions, activeMapels, activeBatch, batchId,
  onPrevMonth, onNextMonth, onDayClick,
}: CalendarViewProps) {
  const [selectedMapelId, setSelectedMapelId] = useState<string>('ALL');

  const filteredSessions = useMemo(() => {
    if (selectedMapelId === 'ALL') return batchSessions;
    return batchSessions.filter(s => s.mapelId === selectedMapelId);
  }, [batchSessions, selectedMapelId]);

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/50 px-6 py-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
          <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
          Tampilan Kalender Bulanan{' '}
          {batchId ? `(${activeBatch?.name || ''})` : '(Semua Angkatan)'}
        </CardTitle>

        <div className="flex items-center gap-3">
          {/* Mata Pelatihan Filter */}
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <Select value={selectedMapelId} onValueChange={setSelectedMapelId}>
              <SelectTrigger className="h-8 text-[11px] w-[170px] bg-white border-slate-200">
                <SelectValue placeholder="Semua Mapel" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200 max-h-52">
                <SelectItem value="ALL" className="text-[11px]">Semua Mapel</SelectItem>
                {activeMapels.map(mapel => (
                  <SelectItem key={mapel.id} value={mapel.id} className="text-[11px]">
                    {mapel.name} ({mapel.jpTotal} JP)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Month Navigator */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPrevMonth}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-700 min-w-[100px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={onNextMonth}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase mb-2">
          <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 min-h-[300px]">
          {calendarDaysList.map((day, index) => {
            if (!day)
              return (
                <div
                  key={`empty-${index}`}
                  className="bg-slate-50/40 rounded border border-slate-100/50"
                />
              );

            const dateStr = formatDateString(day);
            const dayEvents = filteredSessions.filter(s => s.date === dateStr);
            const isDayInBatchRange = batchId
              ? dateStr >= (activeBatch?.startDate || '') && dateStr <= (activeBatch?.endDate || '')
              : true;

            return (
              <div
                key={dateStr}
                onClick={() => onDayClick(dateStr)}
                className={`min-h-[75px] border rounded p-1.5 flex flex-col justify-between transition-all cursor-pointer ${
                  isDayInBatchRange
                    ? 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/30'
                    : 'bg-slate-50/50 border-slate-100 opacity-40 hover:bg-slate-100/40'
                }`}
              >
                <span
                  className={`text-[11px] font-extrabold ${
                    isDayInBatchRange ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {day.getDate()}
                </span>
                <div className="space-y-1 max-h-[50px] overflow-y-auto">
                  {dayEvents.map(ev => {
                    const mapel = activeMapels.find(m => m.id === ev.mapelId);
                    return (
                      <div
                        key={ev.id}
                        onClick={e => {
                          e.stopPropagation();
                          onDayClick(dateStr);
                        }}
                        className={`text-[9px] px-1 py-0.5 rounded truncate font-medium border ${
                          ev.format === 'Klasikal'
                            ? 'bg-blue-50 text-blue-800 border-blue-100'
                            : ev.format === 'Virtual'
                            ? 'bg-purple-50 text-purple-800 border-purple-100'
                            : 'bg-amber-50 text-amber-800 border-amber-100'
                        }`}
                        title={`${mapel?.name || 'Mata Pelajaran'} (${ev.startTime} - ${ev.endTime})`}
                      >
                        {mapel?.name || 'Mata Pelajaran'}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
