"use client";

import React, { useState } from 'react';
import { useWTMS } from '@/context/wtms-context';
import { Scheduler, CalendarEvent, ViewType } from 'calendarkit-pro';
import { toast } from '@/lib/toast';

export function SandboxScheduler() {
  const {
    widyaswaras,
    mapelList,
    lokasiList,
    batches,
    sessions,
    addSession,
    updateSession,
  } = useWTMS();

  const [view, setView] = useState<ViewType>('week');
  const [date, setDate] = useState<Date>(new Date(2026, 2, 1)); // March 2026

  // Map real sessions from context to CalendarEvent format
  const events: CalendarEvent[] = sessions.map((s) => {
    const mapel = mapelList.find((m) => m.id === s.mapelId);
    // Use first Widyaiswara in wiIds array for display
    const wi = widyaswaras.find((w) => s.wiIds && s.wiIds.length > 0 && w.id === s.wiIds[0]);
    const lokasi = lokasiList.find((l) => l.id === s.lokasiId);

    const title = `${mapel ? mapel.name : 'Subject'} - ${wi ? wi.name : 'WI'} (${lokasi ? lokasi.name : s.format})`;
    
    const start = new Date(`${s.date}T${s.startTime}`);
    const end = new Date(`${s.date}T${s.endTime}`);

    return {
      id: s.id,
      title,
      start,
      end,
    };
  });

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

  // Handle event creation – adapted to match Scheduler's expected type
  const handleEventCreate = (newEvent: Partial<CalendarEvent>) => {
    // Ensure required fields are present
    if (!newEvent.start || !newEvent.end) {
      toast.error("Invalid event: missing start or end.");
      return;
    }
    const isValid = validateSessionConstraints(newEvent.start, newEvent.end);
    if (!isValid) return;

    // Pick first available batch, mapel, wi, and lokasi for demo creation
    const defaultBatch = batches[0];
    const defaultMapel = mapelList[0];
    const defaultWi = widyaswaras[0];
    const defaultLokasi = lokasiList[0];

    if (!defaultBatch || !defaultMapel || !defaultWi) {
      toast.error("Cannot create session: Missing master data (Batch, Subject, or Widyaiswara).");
      return;
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const formatTime = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

    const res = addSession({
      batchId: defaultBatch.id,
      mapelId: defaultMapel.id,
      wiIds: [defaultWi.id],
      date: formatDate(newEvent.start),
      startTime: formatTime(newEvent.start),
      endTime: formatTime(newEvent.end),
      format: 'Klasikal',
      lokasiId: defaultLokasi?.id,
      jpKe: '1-2',
      jpCount: 2
    });

    if (res.success) {
      toast.success(`Successfully scheduled session: "${defaultMapel.name}"`);
    }
  };

  // Handle event drop/move
  const handleEventDrop = (event: CalendarEvent, newStart: Date, newEnd: Date) => {
    const isValid = validateSessionConstraints(newStart, newEnd, event.id);
    if (!isValid) return;

    const originalSession = sessions.find((s) => s.id === event.id);
    if (!originalSession) {
      toast.error("Original session not found.");
      return;
    }

    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    const formatTime = (d: Date) => d.toTimeString().split(' ')[0].substring(0, 5);

    const res = updateSession(event.id, {
      batchId: originalSession.batchId,
      mapelId: originalSession.mapelId,
      wiIds: originalSession.wiIds,
      date: formatDate(newStart),
      startTime: formatTime(newStart),
      endTime: formatTime(newEnd),
      format: originalSession.format,
      lokasiId: originalSession.lokasiId,
      jpKe: originalSession.jpKe,
      jpCount: originalSession.jpCount
    });

    if (res.success) {
      toast.success("Session rescheduled successfully!");
    }
  };

  return (
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
  );
}