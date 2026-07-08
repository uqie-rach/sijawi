'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { TimelineView } from '@/components/admin/scheduling/timeline-view';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';

interface DayViewProps {
  selectedDayDate: string;
  setSelectedDayDate: (date: string) => void;
  daySessions: Session[];
  activeMapels: Mapel[];
  activeWis: Widyaiswara[];
  activeLokasis: Lokasi[];
  activeBatch?: { startDate?: string; endDate?: string } | null;
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function DayView({
  selectedDayDate, setSelectedDayDate, daySessions,
  activeMapels, activeWis, activeLokasis, activeBatch,
  onEditSession, onDeleteSession,
}: DayViewProps) {
  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 py-4 px-6">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4 text-blue-600" />
            Tampilan Lini Masa Jam Detail
          </CardTitle>
          <p className="text-xs text-slate-500">Periksa alokasi jam operasional secara berdampingan.</p>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs font-bold text-slate-500 whitespace-nowrap">Pilih Tanggal:</Label>
          <Input
            type="date"
            min={activeBatch?.startDate}
            max={activeBatch?.endDate}
            value={selectedDayDate}
            onChange={e => setSelectedDayDate(e.target.value)}
            className="h-8 py-0 px-2 text-xs w-[140px] bg-slate-50 border-slate-200"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {daySessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold">
              Tidak ada sesi yang dijadwalkan pada {selectedDayDate}.
            </p>
          </div>
        ) : (
          <TimelineView
            selectedDayDate={selectedDayDate}
            daySessions={daySessions}
            activeMapels={activeMapels}
            activeWis={activeWis}
            activeLokasis={activeLokasis}
            onEditSession={onEditSession}
            onDeleteSession={onDeleteSession}
          />
        )}
      </CardContent>
    </Card>
  );
}