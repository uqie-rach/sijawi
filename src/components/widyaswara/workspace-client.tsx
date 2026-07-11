"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useWTMS } from '@/context/wtms-context';
import { ViewSwitcher } from '@/components/admin/scheduling/view-switcher';
import { CalendarView } from '@/components/admin/scheduling/calendar-view';
import { DayView } from '@/components/admin/scheduling/day-view';
import { TableView } from '@/components/admin/scheduling/table-view';
import { useCalendarNavigation } from '@/hooks/use-calendar-navigation';
import { formatDateString } from '@/lib/scheduling-utils';
import type { Session, Mapel, Widyaiswara, Lokasi } from '@/context/wtms-context';
import type { SortField, SortDirection } from '@/hooks/use-schedule-filters';

function sortSessions(
  sessions: Session[],
  field: SortField,
  direction: SortDirection
): Session[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...sessions].sort((a, b) => {
    let valA: any;
    let valB: any;
    switch (field) {
      case 'date':
        valA = a.date;
        valB = b.date;
        break;
      case 'startTime':
        valA = a.startTime;
        valB = b.startTime;
        break;
      case 'jpCount':
        valA = a.jpCount;
        valB = b.jpCount;
        break;
      case 'format':
        valA = a.format;
        valB = b.format;
        break;
      default:
        valA = a.date;
        valB = b.date;
    }
    if (valA < valB) return -1 * factor;
    if (valA > valB) return 1 * factor;
    return 0;
  });
}

interface WidyaswaraWorkspaceClientProps {
  targetWiId: string;
}

export function WidyaswaraWorkspaceClient({ targetWiId }: WidyaswaraWorkspaceClientProps) {
  const { sessions, mapelList, widyaswaras, lokasiList, batches } = useWTMS();
  const [viewMode, setViewMode] = useState<'calendar' | 'day' | 'table'>('table');

  // Pagination state for table view
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter sessions to only those where targetWiId is assigned
  const wiSessions = useMemo(() => {
    return sessions.filter(s => (s.wiIds || []).includes(targetWiId));
  }, [sessions, targetWiId]);

  // For calendar navigation, use the earliest session date or today
  const defaultStartDate = useMemo(() => {
    if (wiSessions.length === 0) return new Date();
    const sorted = [...wiSessions].sort((a, b) => a.date.localeCompare(b.date));
    return new Date(sorted[0].date);
  }, [wiSessions]);

  const calendarNav = useCalendarNavigation(defaultStartDate);

  // Day view sessions for selected date
  const daySessions = useMemo(
    () => wiSessions.filter(s => s.date === calendarNav.selectedDayDate),
    [wiSessions, calendarNav.selectedDayDate]
  );

  // Table view: sort and paginate
  const sortedSessions = useMemo(
    () => sortSessions(wiSessions, sortField, sortDirection),
    [wiSessions, sortField, sortDirection]
  );

  const totalCount = sortedSessions.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSessions = sortedSessions.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  }, [sortField]);

  const handleDayClick = useCallback((dateStr: string) => {
    calendarNav.setSelectedDayDate(dateStr);
    setViewMode('day');
  }, [calendarNav]);

  // No edit/delete handlers for WI (read-only view)
  const noopEdit = useCallback(() => {}, []);
  const noopDelete = useCallback(() => {}, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
        <div className="text-xs text-slate-500 font-medium">
          {totalCount} sesi mengajar
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarView
          year={calendarNav.year}
          month={calendarNav.month}
          monthName={calendarNav.monthName}
          calendarDaysList={calendarNav.calendarDaysList}
          batchSessions={wiSessions}
          activeMapels={mapelList}
          onPrevMonth={calendarNav.goToPrevMonth}
          onNextMonth={calendarNav.goToNextMonth}
          onDayClick={handleDayClick}
        />
      )}

      {/* Day View with Timeline */}
      {viewMode === 'day' && (
        <DayView
          selectedDayDate={calendarNav.selectedDayDate}
          setSelectedDayDate={calendarNav.setSelectedDayDate}
          daySessions={daySessions}
          allVisibleSessions={wiSessions}
          activeMapels={mapelList}
          activeWis={widyaswaras}
          activeLokasis={lokasiList}
          onEditSession={noopEdit}
          onDeleteSession={noopDelete}
        />
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <TableView
          filteredSessions={paginatedSessions}
          totalCount={totalCount}
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          activeMapels={mapelList}
          activeWis={widyaswaras}
          activeLokasis={lokasiList}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onEditSession={noopEdit}
          onDeleteSession={noopDelete}
          showFilterBar={false}
          setShowFilterBar={() => {}}
          activeFilterCount={0}
          resetAllFilters={() => {}}
        />
      )}
    </div>
  );
}