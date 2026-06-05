"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Scheduler, CalendarEvent, ViewType } from 'calendarkit-pro';
import { toast } from 'sonner';

interface Widyaiswara {
  id: string;
  name: string;
  gelar: string;
  email: string;
  nip: string;
  jabatan: string;
  level: number;
  levelLabel: string;
}

interface Mapel {
  id: string;
  name: string;
  kategoriId: string;
  jpTotal: number;
}

interface Lokasi {
  id: string;
  name: string;
}

interface Batch {
  id: string;
  name: string;
  kategoriId: string;
  pola: string;
  startDate: string;
  endDate: string;
}

export default function TestCalendarPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [widyaswaras, setWidyaswaras] = useState<Widyaiswara[]>([]);
  const [mapels, setMapels] = useState<Mapel[]>([]);
  const [lokasis, setLokasis] = useState<Lokasi[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState<Date>(new Date(2026, 2, 1)); // March 2026

  // Fetch real data from API
  const loadData = async () => {
    try {
      setLoading(true);
      const [resWi, resMapel, resLok, resBatches, resSessions] = await Promise.all([
        fetch('/api/widyaswara').then(r => r.ok ? r.json() : []),
        fetch('/api/mata-pelatihan').then(r => r.ok ? r.json() : []),
        fetch('/api/lokasi').then(r => r.ok ? r.json() : []),
        fetch('/api/batches').then(r => r.ok ? r.json() : []),
        fetch('/api/sessions').then(r => r.ok ? r.json() : [])
      ]);

      setWidyaswaras(resWi);
      setMapels(resMapel);
      setLokasis(resLok);
      setBatches(resBatches);

      // Map real sessions to CalendarEvent format
      const mappedEvents: CalendarEvent[] = resSessions.map((s: any) => {
        const mapel = resMapel.find((m: any) => m.id === s.mapelId);
        const wi = resWi.find((w: any) => w.id === s.wiId);
        const lokasi = resLok.find((l: any) => l.id === s.lokasiId);

        const title = `${mapel ? mapel.name : 'Subject'} - ${wi ? wi.name : 'WI'} (${lokasi ? lokasi.name : s.format})`;
        
        // Parse date and times safely
        const start = new Date(`${s.date}T${s.startTime}`);
        const end = new Date(`${s.date}T${s.endTime}`);

        return {
          id: s.id,
          title,
          start,
          end,
        };
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Failed to load API data:", err);
      toast.error("Failed to load real database schedules.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Business logic validation helper
  const validateSessionConstraints = (start: Date, end: Date, excludeId?: string): boolean => {
    const startHour = start.getHours();
    const endHour = end.getHours();

    // 1. Operational Hours Restriction (08:00 - 17:00)
    if (startHour < 8 || endHour > 17 || (endHour === 17 && end.getMinutes() > 0)) {
      toast.error("Operational Hours Restriction: Sessions must be scheduled between 08:00 and 17:00.");
      return false;
    }

    // 2. Check for time overlaps with existing events
    const hasOverlap = events.some(event => {
      if (excludeId && event.id === excludeId) return false;
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

  // Handle event creation
  const handleEventCreate = async (newEvent: CalendarEvent) => {
    const isValid = validateSessionConstraints(newEvent.start, newEvent.end);
    if (!isValid) return;

    // Pick first available batch, mapel, wi, and lokasi for demo creation
    const defaultBatch = batches[0];
    const defaultMapel = mapels[0];
    const defaultWi = widyaswaras[0];
    const defaultLokasi = lokasis[0];

    if (!defaultBatch || !defaultMapel || !defaultWi) {
      toast.error("Cannot create session: Missing master data (Batch, Subject, or Widyaiswara).");
      return;
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const formatTime = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

    const sessionPayload = {
      id: `sess-${Date.now()}`,
      batchId: defaultBatch.id,
      mapelId: defaultMapel.id,
      wiId: defaultWi.id,
      date: formatDate(newEvent.start),
      startTime: formatTime(newEvent.start),
      endTime: formatTime(newEvent.end),
      format: 'Klasikal',
      lokasiId: defaultLokasi?.id,
      jpKe: '1-2',
      jpCount: 2
    };

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionPayload)
      });

      if (res.ok) {
        toast.success(`Successfully scheduled session: "${defaultMapel.name}"`);
        loadData(); // Reload to get fresh mapped titles and details
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to save session to database.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error saving session.");
    }
  };

  // Handle event drop/move
  const handleEventDrop = async (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    const isValid = validateSessionConstraints(newStart, newEnd, event.id);
    if (!isValid) return;

    // Fetch the original session details to preserve other fields
    try {
      const resSessions = await fetch('/api/sessions').then(r => r.ok ? r.json() : []);
      const originalSession = resSessions.find((s: any) => s.id === event.id);

      if (!originalSession) {
        toast.error("Original session not found.");
        return;
      }

      const formatDate = (d: Date) => d.toISOString().split('T')[0];
      const formatTime = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

      const updatedPayload = {
        ...originalSession,
        date: formatDate(newStart),
        startTime: formatTime(newStart),
        endTime: formatTime(newEnd),
      };

      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload)
      });

      if (res.ok) {
        toast.success("Session rescheduled successfully!");
        loadData();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Failed to update session.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error updating session.");
    }
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
          <CardContent className="p-6 bg-slate-900 text-slate-900 rounded-b-xl relative min-h-[600px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 rounded-b-xl z-10">
                <div className="flex flex-col items-center gap-2 text-white">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-sm font-medium">Loading database schedules...</p>
                </div>
              </div>
            ) : null}

            {/* calendarkit-pro component wrapper with dark styles wrapper */}
            <div className="bg-white p-4 rounded-lg shadow-inner min-h-[600px]">
              <Scheduler
                events={events}
                view={view}
                onViewChange={setView}
                date={date}
                onDateChange={setDate}
                onEventCreate={handleEventCreate}
                onEventDrop={handleEventDrop}
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