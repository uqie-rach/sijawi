"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, User, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Session } from '@/context/wtms-context';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  sessions: any[]; // Expecting sessions with details (mapelName, wiName, etc.)
}

export function CalendarView({ sessions }: CalendarViewProps) {
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Start at March 2026

  const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(currentDate.getDate() - 7);
    else newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(currentDate.getDate() + 7);
    else newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'Klasikal': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
      case 'Virtual': return 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
      case 'Asinkron': return 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const renderMonth = () => {
    const numDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const days = [];
    
    // Empty cells for first day padding
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
      days.push(<div key={`pad-${i}`} className="h-32 border bg-slate-50/50"></div>);
    }

    for (let d = 1; d <= numDays; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const daySessions = sessions.filter(s => s.date === dateStr);

      days.push(
        <div key={d} className="h-32 border bg-white p-1 overflow-y-auto group">
          <div className="text-xs font-bold text-slate-400 mb-1">{d}</div>
          <div className="space-y-1">
            {daySessions.map(session => (
              <Popover key={session.id}>
                <PopoverTrigger asChild>
                  <button className={cn(
                    "w-full text-[10px] p-1 rounded border truncate text-left transition-colors",
                    getFormatColor(session.format)
                  )}>
                    <span className="font-bold">{session.startTime}</span> {session.mapelName}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm">{session.mapelName}</h4>
                      <Badge className={getFormatColor(session.format)}>{session.format}</Badge>
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <p className="flex items-center gap-2"><BookOpen className="h-3 w-3" /> {session.batchName} ({session.kelompok})</p>
                      <p className="flex items-center gap-2"><User className="h-3 w-3" /> {session.wiName}</p>
                      <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {session.lokasiName}</p>
                      <p className="flex items-center gap-2"><Clock className="h-3 w-3" /> {session.startTime} - {session.endTime} ({session.jpCount} JP)</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 border rounded-lg overflow-hidden">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-slate-100 p-2 text-center text-xs font-bold text-slate-600 border-b">{day}</div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-bold text-slate-900">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" onClick={handlePrev}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" onClick={handleNext}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['month', 'week', 'day'] as const).map(v => (
              <Button
                key={v}
                variant={view === v ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView(v)}
                className={cn("capitalize h-8 px-4", view === v && "bg-white shadow-sm")}
              >
                {v}
              </Button>
            ))}
          </div>
        </div>

        {view === 'month' ? renderMonth() : (
          <div className="py-20 text-center text-slate-400 border rounded-lg border-dashed">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
            Week and Day views are available in the production upgrade.
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div> Klasikal</div>
          <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div> Virtual</div>
          <div className="flex items-center gap-2 text-xs font-medium"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200"></div> Asinkron</div>
        </div>
      </CardContent>
    </Card>
  );
}