"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import ProScheduler, { CalendarEvent, ViewType } from 'calendarkit-pro';
import { toast } from 'sonner';

// Mock data matching WTMS business logic structures
const mockWidyaswaras = [
  { id: 'wi-1', name: 'Uqie Rachmadie', level: 5, levelLabel: 'PKN' },
  { id: 'wi-2', name: 'Americo Block', level: 2, levelLabel: 'Latsar' },
  { id: 'wi-3', name: 'Dr. H. Ahmad Yani', level: 4, levelLabel: 'PKA' },
];

const mockMapels = [
  { id: 'mapel-1', name: 'Kepemimpinan Pancasila & Nasionalisme', jpTotal: 4, minWeight: 4 },
  { id: 'mapel-2', name: 'Manajemen Perubahan Sektor Publik', jpTotal: 6, minWeight: 4 },
  { id: 'mapel-3', name: 'Agenda Bela Negara', jpTotal: 2, minWeight: 2 },
];

const mockLokasis = [
  { id: 'lok-1', name: 'Aula Utama' },
  { id: 'lok-2', name: 'Lab Komputer' },
];

export default function TestCalendarPage() {
  const router = useRouter();

  // Calendar scheduler state
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'sess-1',
      title: 'Kepemimpinan Pancasila - Dr. H. Ahmad Yani (Aula Utama)',
      start: new Date(2026, 2, 2, 8, 0),
      end: new Date(2026, 2, 2, 9, 30),
    },
    {
      id: 'sess-2',
      title: 'Agenda Bela Negara - Americo Block (Lab Komputer)',
      start: new Date(2026, 2, 3, 10, 0),
      end: new Date(2026, 2, 3, 11, 30),
    }
  ]);
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState<Date>(new Date(2026, 2, 1)); // March 2026

  // Business logic validation helper
  const validateSessionConstraints = (title: string, start: Date, end: Date): boolean => {
    const startHour = start.getHours();
    const endHour = end.getHours();

    // 1. Operational Hours Restriction (08:00 - 17:00)
    if (startHour < 8 || endHour > 17 || (endHour === 17 && end.getMinutes() > 0)) {
      toast.error("Operational Hours Restriction: Sessions must be scheduled between 08:00 and 17:00.");
      return false;
    }

    // 2. Check for time overlaps with existing events
    const hasOverlap = events.some(event => {
      return (
        (start >= event.start && start < event.end) ||
        (end > event.start && end <= event.end) ||
        (start <= event.start && end >= event.end)
      );
    });

    if (hasOverlap) {
      toast.error("Collision Warning: This slot overlaps with an existing scheduled session.");
      return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">WTMS Calendar Sandbox</h1>
            <p className="text-xs text-slate-400">Powered by calendarkit-pro Scheduler</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/admin')}
          className="border-slate-800 text-slate-300 hover:bg-slate-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
      </header>

      {/* Main Container */}
      <main className="flex-1 container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        {/* Core Constraints Alert Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex gap-4 text-blue-200">
          <ShieldAlert className="h-6 w-6 shrink-0 text-blue-400 mt-1" />
          <div className="space-y-1">
            <h3 className="font-bold text-blue-300 font-semibold text-sm">Interactive Pro Sandbox Scheduler Rules</h3>
            <p className="text-xs text-slate-300">
              Double-click or drag on empty slots in the scheduler below to dynamically test new mock events. All WTMS constraints (08:00 - 17:00 operational hours, collision checks) are validated in real-time.
            </p>
          </div>
        </div>

        {/* Scheduler Widget Container */}
        <Card className="shadow-2xl border-slate-800 bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base font-bold">Pro Scheduler Grid Engine</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Switch between month, week or day schedules seamlessly with advanced drag-and-drop capabilities.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-slate-900 text-slate-900 rounded-b-xl">
            {/* calendarkit-pro component wrapper with dark styles wrapper */}
            <div className="bg-white p-4 rounded-lg shadow-inner min-h-[600px]">
              <ProScheduler
                events={events}
                view={view}
                onViewChange={setView}
                date={date}
                onDateChange={setDate}
                onEventCreate={(newEvent) => {
                  const isValid = validateSessionConstraints(
                    newEvent.title || 'Draft Session',
                    newEvent.start,
                    newEvent.end
                  );

                  if (isValid) {
                    const id = `test-sess-${Date.now()}`;
                    setEvents(prev => [...prev, { ...newEvent, id }]);
                    toast.success(`Successfully scheduled session: "${newEvent.title || 'Draft Session'}"`);
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
        <MadeWithDyad />
      </footer>
    </div>
  );
}