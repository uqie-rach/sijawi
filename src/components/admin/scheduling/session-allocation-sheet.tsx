'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SessionFormPanel } from '@/components/admin/scheduling/session-form-panel';
import { JpTrackerWidget } from '@/components/admin/scheduling/jp-tracker-widget';
import { WiAvailabilityWidget } from '@/components/admin/scheduling/wi-availability-widget';
import { WiDailyScheduleCard } from '@/components/admin/scheduling/wi-daily-schedule-card';
import type { SessionFormState } from '@/hooks/use-session-form';
import type { Widyaiswara } from '@/context/wtms-context';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';
import type { BusyWiDetail } from '@/hooks/use-wi-availability';

interface SessionAllocationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSessionId: string | null;
  sessionForm: SessionFormState;
  updateForm: (fields: Partial<SessionFormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  openNewForm: () => void;
  batchId?: string;
  batchOptions: { value: string; label: string }[];
  mapelOptions: { value: string; label: string; disabled?: boolean }[];
  filteredWisList: Widyaiswara[];
  lokasiOptions: { value: string; label: string; disabled?: boolean }[];
  trackingMapelStatus: TrackingMapelStatus[];
  activeWis: Widyaiswara[];
  activeBatch?: { startDate?: string; endDate?: string } | null;

  // WI Availability
  date: string;
  availableWis: Widyaiswara[];
  busyWis: BusyWiDetail[];
  onAssignWi: (wiId: string) => void;
  onViewWiDetail: (wiId: string) => void;
  selectedWiId: string | null;

  // WI Daily Schedule
  selectedWiDetail: { wi: Widyaiswara; sessions: any[] } | null;
  onCloseWiDetail: () => void;
  onEditSession: (session: any) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function SessionAllocationSheet({
  open,
  onOpenChange,
  editingSessionId,
  sessionForm,
  updateForm,
  onSubmit,
  openNewForm,
  batchId,
  batchOptions,
  mapelOptions,
  filteredWisList,
  lokasiOptions,
  trackingMapelStatus,
  activeWis,
  activeBatch,
  date,
  availableWis,
  busyWis,
  onAssignWi,
  onViewWiDetail,
  selectedWiId,
  selectedWiDetail,
  onCloseWiDetail,
  onEditSession,
  onDeleteSession,
}: SessionAllocationSheetProps) {
  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e);
    if (!editingSessionId) {
      // Close sheet only for new sessions on success (handled by parent via onOpenChange)
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col bg-white border-l border-slate-200"
      >
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-slate-100 shrink-0">
          <SheetTitle className="text-base font-bold text-blue-600">
            {editingSessionId ? 'Edit Alokasi Sesi' : 'Alokasi Sesi Baru'}
          </SheetTitle>
          <SheetDescription className="text-xs">
            Atur pemetaan instruktur, batasan ketersediaan ruang kelas, dan parameter operasional.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Session Form */}
            <SessionFormPanel
              editingSessionId={editingSessionId}
              sessionForm={sessionForm}
              updateForm={updateForm}
              onSubmit={handleSubmit}
              openNewForm={openNewForm}
              batchId={batchId}
              batchOptions={batchOptions}
              mapelOptions={mapelOptions}
              filteredWisList={filteredWisList}
              lokasiOptions={lokasiOptions}
              trackingMapelStatus={trackingMapelStatus}
              activeWis={activeWis}
              activeBatch={activeBatch}
            />

            {/* JP Tracker */}
            {sessionForm.batchId && (
              <JpTrackerWidget trackingMapelStatus={trackingMapelStatus} />
            )}

            {/* WI Availability */}
            <WiAvailabilityWidget
              date={date}
              availableWis={availableWis}
              busyWis={busyWis}
              onAssignWi={onAssignWi}
              onViewWiDetail={onViewWiDetail}
              selectedWiId={selectedWiId}
            />

            {/* WI Daily Schedule Card */}
            {selectedWiDetail && (
              <WiDailyScheduleCard
                wi={selectedWiDetail.wi}
                sessions={selectedWiDetail.sessions}
                date={date}
                onClose={onCloseWiDetail}
                onEditSession={onEditSession}
                onDeleteSession={onDeleteSession}
              />
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
