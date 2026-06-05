"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MadeWithDyad } from "@/components/made-with-dyad";
import { SandboxHeader } from '@/components/calendar-sandbox/sandbox-header';
import { SandboxBanner } from '@/components/calendar-sandbox/sandbox-banner';
import { SandboxScheduler } from '@/components/calendar-sandbox/sandbox-scheduler';

export default function TestCalendarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <SandboxHeader />

      <main className="flex-1 container mx-auto px-6 py-8 space-y-8 max-w-7xl">
        <SandboxBanner />

        <Card className="shadow-2xl border-slate-800 bg-slate-900 text-white">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-base font-bold">Pro Scheduler Grid Engine</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Switch between month, week or day schedules seamlessly with advanced drag-and-drop capabilities.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-slate-900 text-slate-900 rounded-b-xl relative min-h-[600px]">
            <SandboxScheduler />
          </CardContent>
        </Card>
      </main>

      
    </div>
  );
}

import { ProScheduler } from '@calendarkit/react';
import { useState } from 'react';
import { fr } from 'date-fns/locale';

export default function AdvancedCalendar() {
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('America/New_York');

  const calendars = [
    { id: 'work', label: 'Work', color: '#3b82f6', active: true },
    { id: 'personal', label: 'Personal', color: '#10b981', active: true },
  ];

  return (
    <ProScheduler
      events={events}
      view={view}
      onViewChange={setView}
      date={date}
      onDateChange={setDate}
      calendars={calendars}
      // Timezone support
      timezone={timezone}
      onTimezoneChange={setTimezone}
      // i18n
      language={language}
      onLanguageChange={setLanguage}
      locale={language === 'fr' ? fr : undefined}
      // Theme
      isDarkMode={isDark}
      onThemeToggle={() => setIsDark(!isDark)}
      // Event handlers
      onEventCreate={(event) => {
        setEvents(prev => [...prev, { ...event, id: Date.now().toString() }]);
      }}
      onEventUpdate={(updated) => {
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      }}
      onEventDelete={(id) => {
        setEvents(prev => prev.filter(e => e.id !== id));
      }}
      // Drag & drop
      onEventDrop={(event, newStart, newEnd) => {
        setEvents(prev => prev.map(e =>
          e.id === event.id ? { ...e, start: newStart, end: newEnd } : e
        ));
      }}
    />
  );
}