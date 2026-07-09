'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { SingleCalendar } from '@/components/ui/single-calendar';
import { TimelineView } from '@/components/admin/scheduling/timeline-view';
import { formatDateString } from '@/lib/scheduling-utils';
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
  const selectedDate = useMemo(() => {
    if (!selectedDayDate) return undefined;
    const d = new Date(selectedDayDate);
    return isNaN(d.getTime()) ? undefined : d;
  }, [selectedDayDate]);

  const fromDate = useMemo(() => {
    if (!activeBatch?.startDate) return undefined;
    const d = new Date(activeBatch.startDate);
    return isNaN(d.getTime()) ? undefined : d;
  }, [activeBatch?.startDate]);

  const toDate = useMemo(() => {
    if (!activeBatch?.endDate) return undefined;
    const d = new Date(activeBatch.endDate);
    return isNaN(d.getTime()) ? undefined : d;
  }, [activeBatch?.endDate]);

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDayDate(formatDateString(date));
    }
  };

  return (
    <Card className="shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-slate-200 bg-white rounded-lg">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600">
            <Clock className="h-4 w-4 text-blue-600" />
            Tampilan Lini Masa Jam Detail
          </CardTitle>
          <p className="text-xs text-slate-500">Periksa alokasi jam operasional secara berdampingan.</p>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Mini Calendar — Left Side */}
          <div className="shrink-0">
            <div className="border border-slate-200 rounded-lg bg-white p-0 w-fit">
              <SingleCalendar
                mode="single"
                selected={selectedDate}
                onSelect={handleCalendarSelect}
                fromDate={fromDate}
                toDate={toDate}
                initialFocus
                className="p-2"
              />
            </div>
          </div>

          {/* Timeline — Right Side */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Transition wrapper: key changes trigger slide animation */}
            <div key={selectedDayDate} className="animate-slide-in-up">
              {daySessions.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <div className="text-center">
                    <Clock className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-semibold">
                      Tidak ada sesi yang dijadwalkan pada{' '}
                      <span className="text-slate-500">{selectedDayDate}</span>.
                    </p>
                  </div>
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
