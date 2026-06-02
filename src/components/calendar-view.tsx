"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, BookOpen, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
                className="bg-white rounded-lg border border-slate-200 p-2 flex flex-col justify-between min-h-[100px] hover:border-blue-300 transition-all duration-200"
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
                      onClick={() => onEventClick?.(event)}
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