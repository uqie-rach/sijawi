'use client';

import { useState, useMemo, useCallback } from 'react';
import { useWTMS } from '@/context/wtms-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useSessionForm } from '@/hooks/use-session-form';
import { useScheduleFilters } from '@/hooks/use-schedule-filters';
import { useJpTracking } from '@/hooks/use-jp-tracking';
import { useWiAvailability } from '@/hooks/use-wi-availability';
import { useCalendarNavigation } from '@/hooks/use-calendar-navigation';
import { BatchNavigation } from '@/components/admin/scheduling/batch-navigation';
import { JpTrackerWidget } from '@/components/admin/scheduling/jp-tracker-widget';
import { ViewSwitcher } from '@/components/admin/scheduling/view-switcher';
import { SessionFormPanel } from '@/components/admin/scheduling/session-form-panel';
import { FilterBar } from '@/components/admin/scheduling/filter-bar';
import { CalendarView } from '@/components/admin/scheduling/calendar-view';
import { DayView } from '@/components/admin/scheduling/day-view';
import { TableView } from '@/components/admin/scheduling/table-view';
import { WiAvailabilityWidget } from '@/components/admin/scheduling/wi-availability-widget';
import { WiDailyScheduleCard } from '@/components/admin/scheduling/wi-daily-schedule-card';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Public props
// ---------------------------------------------------------------------------
interface SchedulingWorkspaceClientProps {
  batchId?: string;
  initialBatch?: any;
  initialMapels: any[];
  initialWis: any[];
  initialLokasis: any[];
  initialSessions: any[];
  allBatches: any[];
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------
export function SchedulingWorkspaceClient({
  batchId,
  initialBatch,
  initialMapels,
  initialWis,
  initialLokasis,
  initialSessions,
  allBatches,
}: SchedulingWorkspaceClientProps) {
  const {
    widyaswaras,
    kategoriList,
    mapelList,
    lokasiList,
    batches,
    sessions,
    addSession,
    updateSession,
    deleteSession,
  } = useWTMS();

  // ---- View mode ---------------------------------------------------------
  const [viewMode, setViewMode] = useState<'calendar' | 'day' | 'table'>('table');

  // ---- Derived data ------------------------------------------------------
  const activeBatch = batchId ? (batches.find(b => b.id === batchId) || initialBatch) : null;
  const batchStartDate = activeBatch ? new Date(activeBatch.startDate) : new Date(2026, 0, 31);

  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeSessions = sessions.length ? sessions : initialSessions;

  const batchSessions = batchId
    ? activeSessions.filter((s: any) => s.batchId === batchId)
    : activeSessions;

  // ---- Hooks -------------------------------------------------------------
  const {
    sessionForm, editingSessionId, isDialogOpen, setIsDialogOpen,
    updateForm, openNewForm, triggerEdit,
  } = useSessionForm(batchId, activeBatch?.startDate || '2026-01-31');

  const currentBatchSelectionId = batchId || sessionForm.batchId;
  const currentBatchObj = batches.find(b => b.id === currentBatchSelectionId) ||
    (currentBatchSelectionId === initialBatch?.id ? initialBatch : null);

  const filterHook = useScheduleFilters(batchSessions, activeMapels);

  const jpTracking = useJpTracking(
    currentBatchSelectionId, currentBatchObj, kategoriList,
    activeMapels, activeWis, activeLokasis, activeSessions,
    sessionForm, editingSessionId
  );

  const calendarNav = useCalendarNavigation(batchStartDate, activeBatch?.startDate);

  // ---- WI Availability ---------------------------------------------------
  const wiAvailability = useWiAvailability(
    sessionForm.date,
    activeSessions,
    jpTracking.filteredWisList,
    activeMapels,
    activeWis,
    batches.length ? batches : allBatches,
    activeLokasis,
  );

  const [availabilitySelectedWiId, setAvailabilitySelectedWiId] = useState<string | null>(null);

  // ---- Confirm dialog ----------------------------------------------------
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean; title: string; description: string; onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const triggerConfirmation = (title: string, description: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, description, onConfirm });
  };

  // ---- Batch options -----------------------------------------------------
  const batchOptions = allBatches.map((b: any) => ({ value: b.id, label: b.name }));

  // ---- Day click handler (from calendar) ---------------------------------
  const handleCalendarDayClick = useCallback((dateStr: string) => {
    updateForm({ date: dateStr });
    calendarNav.setSelectedDayDate(dateStr);
    setViewMode('day');
  }, [updateForm, calendarNav]);

  // ---- Submit handler ----------------------------------------------------
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetBatchId = currentBatchSelectionId;
    if (!targetBatchId || !sessionForm.mapelId || sessionForm.wiIds.length === 0) return;

    const performSave = () => {
      const payload = {
        batchId: targetBatchId,
        mapelId: sessionForm.mapelId,
        wiIds: sessionForm.wiIds,
        wiId: sessionForm.wiIds[0],
        date: sessionForm.date,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        format: sessionForm.format,
        lokasiId: sessionForm.format === 'Klasikal' ? sessionForm.lokasiId : undefined,
        jpKe: sessionForm.jpKe,
        jpCount: parseInt(sessionForm.jpCount),
      };

      if (editingSessionId) {
        const res = updateSession(editingSessionId, payload as any);
        if (res.success) setIsDialogOpen(false);
      } else {
        const res = addSession(payload as any);
        if (res.success) {
          localStorage.removeItem('draft_sessionForm');
          setIsDialogOpen(false);
        }
      }
    };

    if (editingSessionId) {
      triggerConfirmation(
        'Konfirmasi Perubahan Jadwal',
        'Apakah Anda yakin ingin memperbarui alokasi sesi ini?',
        performSave
      );
    } else {
      performSave();
    }
  };

  // ---- Delete handler ----------------------------------------------------
  const handleDeleteSession = (sessionId: string) => {
    triggerConfirmation(
      'Hapus Sesi Terjadwal',
      'Apakah Anda yakin ingin menghapus sesi terjadwal ini secara permanen?',
      () => deleteSession(sessionId)
    );
  };

  // ---- Edit handler (from child components) ------------------------------
  const handleEditSession = useCallback((session: Session) => {
    triggerEdit(session);
    setIsDialogOpen(true);
  }, [triggerEdit, setIsDialogOpen]);

  // ---- Day sessions ------------------------------------------------------
  const daySessions = useMemo(
    () => batchSessions.filter((s: any) => s.date === calendarNav.selectedDayDate),
    [batchSessions, calendarNav.selectedDayDate]
  );

  // ---- Assign WI from availability widget --------------------------------
  const handleAssignWi = useCallback((wiId: string) => {
    if (!sessionForm.wiIds.includes(wiId)) {
      updateForm({ wiIds: [...sessionForm.wiIds, wiId] });
      toast.success('Widyaiswara ditambahkan ke form.');
    }
  }, [sessionForm.wiIds, updateForm]);

  // ---- View WI detail from availability ----------------------------------
  const handleViewWiDetail = useCallback((wiId: string) => {
    if (availabilitySelectedWiId === wiId) {
      setAvailabilitySelectedWiId(null);
      wiAvailability.selectWi(null);
    } else {
      setAvailabilitySelectedWiId(wiId);
      wiAvailability.selectWi(wiId);
    }
  }, [availabilitySelectedWiId, wiAvailability]);

  // ---- Render ------------------------------------------------------------
  return (
    <div className="grid lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* ---- LEFT PANEL (4 cols) ---- */}
      <div className="lg:col-span-4 space-y-4">
        <BatchNavigation batches={allBatches} currentBatchId={batchId} />

        {/* Inline Session Form */}
        <SessionFormPanel
          editingSessionId={editingSessionId}
          sessionForm={sessionForm}
          updateForm={updateForm}
          onSubmit={handleSubmit}
          openNewForm={openNewForm}
          batchId={batchId}
          batchOptions={batchOptions}
          mapelOptions={jpTracking.mapelOptions}
          filteredWisList={jpTracking.filteredWisList}
          lokasiOptions={jpTracking.lokasiOptions}
          trackingMapelStatus={jpTracking.trackingMapelStatus}
          activeWis={activeWis}
          activeBatch={activeBatch}
        />

        {currentBatchSelectionId && (
          <JpTrackerWidget trackingMapelStatus={jpTracking.trackingMapelStatus} />
        )}

        {/* WI Availability Widget */}
        <WiAvailabilityWidget
          date={sessionForm.date}
          availableWis={wiAvailability.availableWis}
          busyWis={wiAvailability.busyWis}
          onAssignWi={handleAssignWi}
          onViewWiDetail={handleViewWiDetail}
          selectedWiId={availabilitySelectedWiId}
        />

        {/* WI Daily Schedule Card (conditional) */}
        {wiAvailability.selectedWiDetail && (
          <WiDailyScheduleCard
            wi={wiAvailability.selectedWiDetail.wi}
            sessions={wiAvailability.selectedWiDetail.sessions}
            date={sessionForm.date}
            onClose={() => {
              setAvailabilitySelectedWiId(null);
              wiAvailability.selectWi(null);
            }}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </div>

      {/* ---- RIGHT PANEL (8 cols) ---- */}
      <div className="lg:col-span-8 space-y-6">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <CalendarView
            year={calendarNav.year}
            month={calendarNav.month}
            monthName={calendarNav.monthName}
            calendarDaysList={calendarNav.calendarDaysList}
            batchSessions={batchSessions}
            activeMapels={activeMapels}
            activeBatch={activeBatch}
            batchId={batchId}
            onPrevMonth={calendarNav.goToPrevMonth}
            onNextMonth={calendarNav.goToNextMonth}
            onDayClick={handleCalendarDayClick}
            onEditSession={handleEditSession}
          />
        )}

        {/* Day View with Timeline */}
        {viewMode === 'day' && (
          <DayView
            selectedDayDate={calendarNav.selectedDayDate}
            setSelectedDayDate={calendarNav.setSelectedDayDate}
            daySessions={daySessions}
            activeMapels={activeMapels}
            activeWis={activeWis}
            activeLokasis={activeLokasis}
            activeBatch={activeBatch}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <TableView
            filteredSessions={filterHook.filteredAndSortedSessions}
            batchSessions={batchSessions}
            activeMapels={activeMapels}
            activeWis={activeWis}
            activeLokasis={activeLokasis}
            sortField={filterHook.sortField}
            sortDirection={filterHook.sortDirection}
            onSort={filterHook.handleSort}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
            showFilterBar={filterHook.showFilterBar}
            setShowFilterBar={filterHook.setShowFilterBar}
            activeFilterCount={filterHook.activeFilterCount}
            resetAllFilters={filterHook.resetAllFilters}
          >
            {filterHook.showFilterBar && (
              <FilterBar
                filterDateStart={filterHook.filterDateStart}
                setFilterDateStart={filterHook.setFilterDateStart}
                filterDateEnd={filterHook.filterDateEnd}
                setFilterDateEnd={filterHook.setFilterDateEnd}
                filterFormat={filterHook.filterFormat}
                setFilterFormat={filterHook.setFilterFormat}
                filterWIId={filterHook.filterWIId}
                setFilterWIId={filterHook.setFilterWIId}
                filterMapelId={filterHook.filterMapelId}
                setFilterMapelId={filterHook.setFilterMapelId}
                filterLokasiId={filterHook.filterLokasiId}
                setFilterLokasiId={filterHook.setFilterLokasiId}
                filterJpMin={filterHook.filterJpMin}
                setFilterJpMin={filterHook.setFilterJpMin}
                filterJpMax={filterHook.filterJpMax}
                setFilterJpMax={filterHook.setFilterJpMax}
                activeWis={activeWis}
                activeMapels={activeMapels}
                activeLokasis={activeLokasis}
                batchStartDate={activeBatch?.startDate}
                batchEndDate={activeBatch?.endDate}
                activeFilterCount={filterHook.activeFilterCount}
                totalFiltered={filterHook.filteredAndSortedSessions.length}
                totalSessions={batchSessions.length}
              />
            )}
          </TableView>
        )}
      </div>

      {/* Global Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold text-lg">
              {confirmDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm">
              {confirmDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-200 text-slate-700 hover:bg-slate-50">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDialog.onConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}