'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SessionFormPanel } from '@/components/admin/scheduling/session-form-panel';
import type { SessionFormState } from '@/hooks/use-session-form';
import type { Widyaiswara } from '@/context/wtms-context';
import type { TrackingMapelStatus } from '@/hooks/use-jp-tracking';

interface SessionFormDialogProps {
  isOpen: boolean;
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
}

export function SessionFormDialog({
  isOpen, onOpenChange,
  editingSessionId, sessionForm, updateForm, onSubmit, openNewForm,
  batchId, batchOptions, mapelOptions, filteredWisList, lokasiOptions,
  trackingMapelStatus, activeWis, activeBatch,
}: SessionFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          onClick={openNewForm}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs font-semibold py-5 px-4 shadow-md shadow-blue-100 lg:hidden"
        >
          <Plus className="h-4 w-4" /> Alokasikan Sesi Jadwal
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-blue-600">
            {editingSessionId ? 'Edit Alokasi Sesi' : 'Alokasikan Sesi Baru'}
          </DialogTitle>
          <DialogDescription>
            Atur pemetaan instruktur, batasan ketersediaan ruang kelas, dan parameter operasional.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6">
          <SessionFormPanel
            editingSessionId={editingSessionId}
            sessionForm={sessionForm}
            updateForm={updateForm}
            onSubmit={onSubmit}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}