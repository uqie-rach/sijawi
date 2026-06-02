"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, User, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalendarEvent {
  id: string;
  title: string;
  batchName: string;
  wiName: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiName: string;
  jpCount: number;
  jpKe: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  title?: string;
}

export function CalendarView({ events, onEventClick, title = "Training Schedule Calendar" }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // March 2026 as pre-seeded data is in March 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Get first day of month (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid
  const calendarCells = [];
  // Empty cells for previous month padding
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  // Days of current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(new Date(year, month, i));
  }

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Day View Timeline Hours (08:00 to 17:00)
  const timelineHours = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
  ];

  if (selectedDateStr) {
    const dayEvents = events.filter(e => e.date === selectedDateStr);
    const formattedDayTitle = new Date(selectedDateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return (
      <Card className="shadow-sm border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Agenda: {formattedDayTitle}
            </CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedDateStr(null)}
            className="flex items-center gap-2 border-slate-200 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Month View
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          {dayEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Clock className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="font-medium">No sessions scheduled for this day.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-8">
              {dayEvents.map((event) => (
                <div key={event.id} className="relative">
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[31px] top-1.5 h-4 w-4 rounded-full border-2 border-white shadow-sm ${
                    event.format === 'Klasikal' ? 'bg-blue-500' :
                    event.format === 'Virtual' ? 'bg-purple-500' :
                    'bg-amber-500'
                  }`} />
                  
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 transition-all duration-200">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`font-semibold ${
                          event.format === 'Klasikal' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          event.format === 'Virtual' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          'bg-amber-100 text-amber-800 border-amber-200'
                        }`}>
                          {event.format}
                        </Badge>
                        <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">
                          JP Ke: {event.jpKe} ({event.jpCount} JP)
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mb-2">{event.title}</h4>
                    
                    <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-slate-400" />
                        <span>WI: <strong>{event.wiName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-4 w-4 text-slate-400" />
                        <span>Batch: <strong>{event.batchName}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>Venue: <strong>{event.lokasiName}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200 bg-white">
      <CardHeader className="border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
        <div>
          <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="font-bold text-slate-800 min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Grid Body */}
        <div className="grid grid-cols-7 gap-2 min-h-[400px]">
          {calendarCells.map((cell, index) => {
            if (!cell) {
              return <div key={`empty-${index}`} className="bg-slate-50/50 rounded-lg border border-slate-100/50"></div>;
            }

            const dateStr = formatDateString(cell);
            const dayEvents = events.filter(e => e.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className="bg-white rounded-lg border border-slate-200 p-2 flex flex-col justify-between min-h-[100px] hover:border-blue-300 hover:bg-slate-50/30 cursor-pointer transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700">{cell.getDate()}</span>
                  {dayEvents.length > 0 && (
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0">
                      {dayEvents.length}
                    </Badge>
                  )}
                </div>

                <div className="flex-1 space-y-1 overflow-y-auto max-h-[120px] scrollbar-thin">
                  {dayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering day click
                        onEventClick?.(event);
                      }}
                      className={`p-1 rounded text-[10px] font-medium cursor-pointer transition-all duration-150 border ${
                        event.format === 'Klasikal' ? 'bg-blue-50 text-blue-800 border-blue-100 hover:bg-blue-100' :
                        event.format === 'Virtual' ? 'bg-purple-50 text-purple-800 border-purple-100 hover:bg-purple-100' :
                        'bg-amber-50 text-amber-800 border-amber-100 hover:bg-amber-100'
                      }`}
                      title={`${event.title} (${event.startTime} - ${event.endTime})`}
                    >
                      <div className="font-bold truncate">{event.title}</div>
                      <div className="text-[9px] opacity-80 truncate">{event.wiName}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}