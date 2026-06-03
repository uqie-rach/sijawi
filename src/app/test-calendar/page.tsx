"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { BasicScheduler, CalendarEvent, ViewType } from 'calendarkit-basic';
import { toast } from 'sonner';

export default function TestCalendarPage() {
  const router = useRouter();
  const { sessions, mapelList, widyaswaras } = useWTMS();

  // Calendar scheduler state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState<Date>(new Date(2026, 2, 1)); // Set focus to March 2026 pre-seeded data

  // Initialize and translate WTMS sessions into CalendarKit compatible events
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      const mappedEvents = sessions.map(s => {
        const mapel = mapelList.find(m => m.id === s.mapelId);
        const wi = widyaswaras.find(w => w.id === s.wiId);
        
        // Safely parse date and time strings
        const startStr = `${s.date}T${s.startTime}`;
        const endStr = `${s.date}T${s.endTime}`;

        return {
          id: s.id,
          title: `${mapel?.name || 'Subject'} - ${wi?.name || 'Widyaiswara'} (${s.jpCount} JP)`,
          start: new Date(startStr),
          end: new Date(endStr),
        };
      });
      setEvents(mappedEvents);
    }
  }, [sessions, mapelList, widyaswaras]);

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
            <p className="text-xs text-slate-400">Powered by calendarkit-basic Scheduler</p>
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
            <h3 className="font-bold text-blue-300 font-semibold text-sm">Interactive Sandbox Scheduler Rules</h3>
            <p className="text-xs text-slate-300">
              Double-click or drag on empty slots in the scheduler below to dynamically test new mock events. All WTMS constraints are mapped directly to mock event timestamps inside the standard scheduling feed.
            </p>
          </div>
        </div>

        {/* Scheduler Widget Container */}
        <Card className="shadow-2xl border-slate-800 bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base font-bold">Standard Scheduler Grid Engine</CardTitle>
            <CardDescription className="text-slate-400 text-xs">Switch between month, week or day schedules seamlessly.</CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-slate-900 text-slate-900 rounded-b-xl">
            {/* calendarkit-basic component wrapper with dark styles wrapper */}
            <div className="bg-white p-4 rounded-lg shadow-inner min-h-[600px]">
              <BasicScheduler
                events={events}
                view={view}
                onViewChange={setView}
                date={date}
                onDateChange={setDate}
                onEventCreate={(newEvent) => {
                  const id = `test-sess-${Date.now()}`;
                  setEvents(prev => [...prev, { ...newEvent, id }]);
                  toast.success(`Successfully drafted temporary session: "${newEvent.title || 'Draft Session'}"`);
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