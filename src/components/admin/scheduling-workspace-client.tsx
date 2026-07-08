'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useWTMS } from '@/context/wtms-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSessionForm } from '@/hooks/use-session-form';
import { useScheduleFilters } from '@/hooks/use-schedule-filters';
import { useJpTracking } from '@/hooks/use-jp-tracking';
import { useWiAvailability } from '@/hooks/use-wi-availability';
import { useCalendarNavigation } from '@/hooks/use-calendar-navigation';
import { ViewSwitcher } from '@/components/admin/scheduling/view-switcher';
import { FilterBar } from '@/components/admin/scheduling/filter-bar';
import { CalendarView } from '@/components/admin/scheduling/calendar-view';
import { DayView } from '@/components/admin/scheduling/day-view';
import { TableView } from '@/components/admin/scheduling/table-view';
import { SessionAllocationSheet } from '@/components/admin/scheduling/session-allocation-sheet';
import { Plus } from 'lucide-react';
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

  // ---- Sheet open state -------------------------------------------------
  const [sheetOpen, setSheetOpen] = useState(false);

  // ---- Year filter ------------------------------------------------------
  const availableYears = useMemo(() => {
    return Array.from(
      new Set(allBatches.map((b: any) => new Date(b.startDate).getFullYear().toString()))
    ).sort((a, b) => Number(b) - Number(a));
  }, [allBatches]);

  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(availableYears[0] || currentYear);

  const isReadOnlyYear = selectedYear !== currentYear;

  // ---- Derived data ------------------------------------------------------
  const activeBatch = batchId ? (batches.find(b => b.id === batchId) || initialBatch) : null;
  const batchStartDate = activeBatch ? new Date(activeBatch.startDate) : new Date(2026, 0, 31);

  const activeMapels = mapelList.length ? mapelList : initialMapels;
  const activeWis = widyaswaras.length ? widyaswaras : initialWis;
  const activeLokasis = lokasiList.length ? lokasiList : initialLokasis;
  const activeSessions = sessions.length ? sessions : initialSessions;

  // Filter sessions by year
  const yearFilteredSessions = useMemo(() => {
    return activeSessions.filter((s: any) => {
      const sYear = new Date(s.date).getFullYear().toString();
      return sYear === selectedYear;
    });
  }, [activeSessions, selectedYear]);

  // Filter sessions by year AND batch
  const batchSessions = batchId
    ? yearFilteredSessions.filter((s: any) => s.batchId === batchId)
    : yearFilteredSessions;

  // ---- Sidebar collapse on sheet open ----------------------------------
  useEffect(() => {
    if (sheetOpen) {
      localStorage.setItem('sidebar_admin_collapsed', 'true');
      // Dispatch a custom event so the sidebar can listen
      window.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { collapsed: true } }));
    } else {
      localStorage.setItem('sidebar_admin_collapsed', 'false');
      window.dispatchEvent(new CustomEvent('sidebar:toggle', { detail: { collapsed: false } }));
    }
  }, [sheetOpen]);

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
    activeMapels, activeWis, activeLokasis, yearFilteredSessions,
    sessionForm, editingSessionId
  );

  const calendarNav = useCalendarNavigation(batchStartDate, activeBatch?.startDate);

  // ---- WI Availability ---------------------------------------------------
  const wiAvailability = useWiAvailability(
    sessionForm.date,
    yearFilteredSessions,
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

    if (isReadOnlyYear) {
      toast.error('Data tahun sebelumnya tidak dapat diubah.');
      return;
    }

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
        if (res.success) {
          setIsDialogOpen(false);
          setSheetOpen(false);
        }
      } else {
        const res = addSession(payload as any);
        if (res.success) {
          localStorage.removeItem('draft_sessionForm');
          setIsDialogOpen(false);
          setSheetOpen(false);
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
    if (isReadOnlyYear) {
      toast.error('Data tahun sebelumnya tidak dapat diubah.');
      return;
    }
    triggerConfirmation(
      'Hapus Sesi Terjadwal',
      'Apakah Anda yakin ingin menghapus sesi terjadwal ini secara permanen?',
      () => deleteSession(sessionId)
    );
  };

  // ---- Edit handler (from child components) ------------------------------
  const handleEditSession = useCallback((session: any) => {
    if (isReadOnlyYear) {
      toast.error('Data tahun sebelumnya tidak dapat diubah.');
      return;
    }
    triggerEdit(session);
    setIsDialogOpen(true);
    setSheetOpen(true);
  }, [triggerEdit, setIsDialogOpen, isReadOnlyYear]);

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

  // ---- Open new session form ---------------------------------------------
  const handleOpenNewSession = () => {
    if (isReadOnlyYear) {
      toast.error('Data tahun sebelumnya tidak dapat diubah.');
      return;
    }
    openNewForm();
    setIsDialogOpen(false);
    setSheetOpen(true);
  };

  // ---- Render ------------------------------------------------------------
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />

          {/* Year Filter */}
          {availableYears.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500">Tahun:</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-8 w-[100px] text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {availableYears.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isReadOnlyYear && (
            <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Tahun Sebelumnya (Read-Only)
            </span>
          )}
          <Button
            onClick={handleOpenNewSession}
            disabled={isReadOnlyYear}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-semibold py-5 px-4 shadow-md shadow-blue-100"
          >
            <Plus className="h-4 w-4" /> Tambah Sesi
          </Button>
        </div>
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

      {/* Right Sidebar: Session Allocation Sheet */}
      <SessionAllocationSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
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
        date={sessionForm.date}
        availableWis={wiAvailability.availableWis}
        busyWis={wiAvailability.busyWis}
        onAssignWi={handleAssignWi}
        onViewWiDetail={handleViewWiDetail}
        selectedWiId={availabilitySelectedWiId}
        selectedWiDetail={wiAvailability.selectedWiDetail}
        onCloseWiDetail={() => {
          setAvailabilitySelectedWiId(null);
          wiAvailability.selectWi(null);
        }}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
      />

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
