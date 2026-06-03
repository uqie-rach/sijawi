"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar as CalendarIcon, Clock, MapPin, BookOpen, GraduationCap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { MadeWithDyad } from "@/components/made-with-dyad";

export default function TestCalendarPage() {
  const router = useRouter();
  const { sessions, mapelList, widyaswaras, lokasiList, batches } = useWTMS();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get total days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(year, month, i));
  }

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-950 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">WTMS Calendar Sandbox</h1>
            <p className="text-xs text-slate-400">Testing Sandbox Calendar Engine Integration</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => router.push('/admin')}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
            <h3 className="font-bold text-blue-300">Operational Constraints Engine Rules</h3>
            <p className="text-sm text-slate-300">
              This sandbox validates sessions using the **1 JP = 45 Minutes** formula, restricts Klasikal layouts to **08:00 – 17:00**, checks instructor compatibility matches, and prevents location room clashing.
            </p>
          </div>
        </div>

        {/* Calendar and Sessions Side-by-Side */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Month Calendar Grid (2 Cols) */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-slate-800 bg-slate-950 text-white">
              <CardHeader className="border-b border-slate-800 flex flex-row justify-between items-center py-4 px-6 bg-slate-950">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CalendarIcon className="h-4.5 w-4.5 text-blue-400" />
                  Schedules Monthly Grid View
                </CardTitle>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))} 
                    className="p-1 rounded border border-slate-700 hover:bg-slate-800"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                  <span className="text-xs font-bold text-slate-200 min-w-[100px] text-center">
                    {monthNames[month]} {year}
                  </span>
                  <button 
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))} 
                    className="p-1 rounded border border-slate-700 hover:bg-slate-800"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-500 uppercase mb-2">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1.5 min-h-[350px]">
                  {calendarCells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="bg-slate-900/40 rounded border border-slate-800/30"></div>;
                    const dateStr = formatDateStr(day);
                    const dayEvents = sessions.filter(s => s.date === dateStr);

                    return (
                      <div 
                        key={dateStr}
                        className="min-h-[85px] border border-slate-800 rounded bg-slate-900/50 p-2 flex flex-col justify-between hover:border-blue-500/50 transition-all cursor-pointer"
                      >
                        <span className="text-[11px] font-bold text-slate-400">{day.getDate()}</span>
                        <div className="space-y-1 max-h-[50px] overflow-y-auto">
                          {dayEvents.map(ev => {
                            const mapel = mapelList.find(m => m.id === ev.mapelId);
                            return (
                              <div
                                key={ev.id}
                                className={`text-[8px] px-1 py-0.5 rounded truncate font-medium border ${
                                  ev.format === 'Klasikal' ? 'bg-blue-950 text-blue-300 border-blue-900' :
                                  ev.format === 'Virtual' ? 'bg-purple-950 text-purple-300 border-purple-900' :
                                  'bg-amber-950 text-amber-300 border-amber-900'
                                }`}
                                title={`${mapel?.name || 'Subject'}`}
                              >
                                {mapel?.name || 'Subject'}
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
          </div>

          {/* Granular Active Session Feed (1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-xl border-slate-800 bg-slate-950 text-white">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-sm font-bold">Active Schedule Feed</CardTitle>
                <CardDescription className="text-slate-400 text-xs">Real-time validated calendar entries.</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {sessions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-12">No scheduled sessions recorded.</p>
                ) : (
                  sessions.map(s => {
                    const mapel = mapelList.find(m => m.id === s.mapelId);
                    const wi = widyaswaras.find(w => w.id === s.wiId);
                    const lok = lokasiList.find(l => l.id === s.lokasiId);
                    const b = batches.find(bt => bt.id === s.batchId);

                    return (
                      <div key={s.id} className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-850 space-y-2">
                        <div className="flex justify-between items-start gap-1">
                          <Badge className={`text-[9px] font-bold ${
                            s.format === 'Klasikal' ? 'bg-blue-900 text-blue-200' :
                            s.format === 'Virtual' ? 'bg-purple-900 text-purple-200' :
                            'bg-amber-900 text-amber-200'
                          }`}>
                            {s.format}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{mapel?.name || 'Subject'}</h4>
                        <div className="text-[10px] text-slate-400 space-y-1">
                          <p className="flex items-center gap-1 truncate"><GraduationCap className="h-3 w-3 shrink-0" /> WI: {wi?.name || 'N/A'}</p>
                          <p className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3 shrink-0" /> Room: {s.format === 'Klasikal' ? (lok?.name || 'Classroom') : s.format}</p>
                          <p className="flex items-center gap-1 truncate"><BookOpen className="h-3 w-3 shrink-0" /> Batch: {b?.name || 'Batch'}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-auto">
        <MadeWithDyad />
      </footer>
    </div>
  );
}

// Minimal icons wrapper for local calendar navigation simplicity
function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}