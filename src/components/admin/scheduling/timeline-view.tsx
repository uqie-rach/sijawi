'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, MapPin, UserCheck, Edit, Trash2, Filter } from 'lucide-react';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';

interface TimelineViewProps {
  selectedDayDate: string;
  daySessions: Session[];
  activeMapels: Mapel[];
  activeWis: Widyaiswara[];
  activeLokasis: Lokasi[];
  onEditSession: (session: Session) => void;
  onDeleteSession: (sessionId: string) => void;
}

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
const HOUR_HEIGHT = 72; // px per hour
const TIME_LABEL_WIDTH = 56; // w-14 = 3.5rem = 56px
const MIN_COLUMN_WIDTH = 120; // minimum px per column

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Group overlapping sessions into columns (side-by-side),
 * adapting the algorithm from Calendar Kit Pro's groupEvents().
 * Sessions that don't overlap go into the same column.
 */
function groupOverlappingSessions(sessions: Session[]): Session[][] {
  if (sessions.length === 0) return [];

  const sorted = [...sessions].sort((a, b) => {
    // Sort by start time first, then by duration (longer first) for better packing
    if (a.startTime !== b.startTime) return a.startTime.localeCompare(b.startTime);
    const durA = timeToMinutes(a.endTime) - timeToMinutes(a.startTime);
    const durB = timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
    return durB - durA;
  });

  const columns: Session[][] = [];

  for (const session of sorted) {
    const sessionStart = timeToMinutes(session.startTime);
    let placed = false;

    // Try to place in existing column
    for (const column of columns) {
      const lastSession = column[column.length - 1];
      const lastEnd = timeToMinutes(lastSession.endTime);

      // If session starts after or at last session's end, it fits in this column
      if (sessionStart >= lastEnd) {
        column.push(session);
        placed = true;
        break;
      }
    }

    // If no column fits, create a new column
    if (!placed) {
      columns.push([session]);
    }
  }

  return columns;
}

export function TimelineView({
  selectedDayDate, daySessions, activeMapels, activeWis, activeLokasis,
  onEditSession, onDeleteSession,
}: TimelineViewProps) {
  const [filterWiId, setFilterWiId] = useState<string>('ALL');
  const containerStartMin = 8 * 60; // 08:00
  const containerEndMin = 17 * 60; // 17:00
  const totalMinutes = containerEndMin - containerStartMin;

  const filteredSessions = useMemo(() => {
    if (filterWiId === 'ALL') return daySessions;
    return daySessions.filter(s => (s.wiIds || []).includes(filterWiId));
  }, [daySessions, filterWiId]);

  // Group overlapping sessions into columns for side-by-side display
  const groupedSessions = useMemo(() => {
    return groupOverlappingSessions(filteredSessions);
  }, [filteredSessions]);

  // Flatten with group info for rendering
  const sessionsWithLayout = useMemo(() => {
    const result: Array<{
      session: Session;
      groupIndex: number;
      totalGroups: number;
    }> = [];

    for (const session of filteredSessions) {
      // Find which group/column this session belongs to
      let groupIndex = 0;
      let totalGroups = groupedSessions.length;

      for (let g = 0; g < groupedSessions.length; g++) {
        if (groupedSessions[g].some(s => s.id === session.id)) {
          groupIndex = g;
          totalGroups = groupedSessions.length;
          break;
        }
      }

      result.push({ session, groupIndex, totalGroups });
    }

    return result;
  }, [filteredSessions, groupedSessions]);

  // Collect all unique WIs from day's sessions
  const dayWis = useMemo(() => {
    const wiSet = new Set<string>();
    daySessions.forEach(s => (s.wiIds || []).forEach(id => wiSet.add(id)));
    return Array.from(wiSet).map(id => activeWis.find(w => w.id === id)).filter(Boolean) as Widyaiswara[];
  }, [daySessions, activeWis]);

  const formatBadgeClass = (format: string) => {
    switch (format) {
      case 'Klasikal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Virtual': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Asinkron': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatBorderClass = (format: string) => {
    switch (format) {
      case 'Klasikal': return 'border-l-blue-500';
      case 'Virtual': return 'border-l-purple-500';
      case 'Asinkron': return 'border-l-amber-500';
      default: return 'border-l-slate-400';
    }
  };

  // Calculate the available width for session blocks
  const containerWidth = '100%'; // We'll use percentage-based calculation

  return (
    <div>
      {/* Header with WI Filter */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
          <Clock className="h-4 w-4 text-blue-600" />
          Lini Masa {selectedDayDate}
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
            {filteredSessions.length} sesi
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <Select value={filterWiId} onValueChange={setFilterWiId}>
            <SelectTrigger className="h-8 text-[11px] w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Semua WI" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="ALL">Semua Widyaiswara</SelectItem>
              {dayWis.map(wi => (
                <SelectItem key={wi.id} value={wi.id} className="text-[11px]">
                  {wi.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="relative border border-slate-200 rounded-lg bg-white overflow-hidden" style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}>
        {/* Hour rows */}
        {HOURS.map(hour => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-b border-slate-100 flex items-start"
            style={{ top: `${(hour - 8) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
          >
            <div className="w-14 shrink-0 flex items-start justify-end pr-3 pt-1">
              <span className="text-[10px] font-semibold text-slate-400">
                {String(hour).padStart(2, '0')}:00
              </span>
            </div>
            <div className="flex-1 border-l border-slate-100 relative">
              {/* Half-hour dashed line */}
              <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-slate-100" />
            </div>
          </div>
        ))}

        {/* Session blocks — side-by-side for overlapping sessions */}
        {sessionsWithLayout.map(({ session, groupIndex, totalGroups }) => {
          const mapel = activeMapels.find(m => m.id === session.mapelId);
          const resolvedWis = (session.wiIds || [])
            .map((id: string) => activeWis.find(w => w.id === id))
            .filter(Boolean) as Widyaiswara[];
          const wiNames = resolvedWis.map(w => w.name.split(' ')[0]).join(', ');
          const lok = activeLokasis.find(l => l.id === session.lokasiId);

          const startMin = timeToMinutes(session.startTime);
          const endMin = timeToMinutes(session.endTime);
          const clampedStart = Math.max(startMin, containerStartMin);
          const clampedEnd = Math.min(endMin, containerEndMin);

          if (clampedStart >= clampedEnd) return null;

          const topPx = ((clampedStart - containerStartMin) / totalMinutes) * (HOURS.length * HOUR_HEIGHT);
          const heightPx = ((clampedEnd - clampedStart) / totalMinutes) * (HOURS.length * HOUR_HEIGHT);

          // Side-by-side positioning
          const columnWidthPercent = 100 / totalGroups;
          const leftPercent = columnWidthPercent * groupIndex;

          return (
            <div
              key={session.id}
              className={`absolute rounded-r-lg border-l-4 bg-white shadow-sm hover:shadow-md transition-shadow z-10 ${formatBorderClass(session.format)}`}
              style={{
                top: `${topPx}px`,
                height: `${Math.max(heightPx, 28)}px`,
                left: `calc(${TIME_LABEL_WIDTH}px + ${leftPercent}%)`,
                width: `calc(${columnWidthPercent}% - ${TIME_LABEL_WIDTH / totalGroups}px - 4px)`,
              }}
            >
              <div className="p-1.5 h-full flex flex-col justify-between overflow-hidden">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-extrabold text-slate-800 truncate max-w-[120px]">
                    {mapel?.name || 'Subject'}
                  </span>
                  <Badge className={`text-[8px] font-bold shrink-0 ${formatBadgeClass(session.format)}`}>
                    {session.format}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 flex-wrap">
                  <span className="flex items-center gap-0.5 truncate max-w-[80px]">
                    <UserCheck className="h-3 w-3 shrink-0" />
                    {wiNames}
                  </span>
                  <span className="flex items-center gap-0.5 shrink-0">
                    <Clock className="h-3 w-3" />
                    {session.startTime}-{session.endTime}
                  </span>
                  {session.format === 'Klasikal' && lok && (
                    <span className="flex items-center gap-0.5 truncate max-w-[60px]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {lok.name}
                    </span>
                  )}
                  <span className="font-semibold shrink-0">{session.jpCount} JP</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEditSession(session)}
                    className="h-5 w-5 text-blue-600 shrink-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteSession(session.id)}
                    className="h-5 w-5 text-red-500 shrink-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredSessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-xs">
            Tidak ada sesi pada tanggal ini.
          </div>
        )}
      </div>
    </div>
  );
}