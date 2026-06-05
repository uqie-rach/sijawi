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

      <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
        <MadeWithDyad />
      </footer>
    </div>
  );
}