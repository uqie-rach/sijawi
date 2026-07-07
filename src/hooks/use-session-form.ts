'use client';

import { useState, useEffect } from 'react';
import { calculateEndTime } from '@/lib/scheduling-utils';

export interface SessionFormState {
  batchId: string;
  mapelId: string;
  wiIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  format: 'Klasikal' | 'Virtual' | 'Asinkron';
  lokasiId: string;
  jpKe: string;
  jpCount: string;
}

const DEFAULT_FORM: SessionFormState = {
  batchId: '',
  mapelId: '',
  wiIds: [],
  date: '2026-01-31',
  startTime: '08:00',
  endTime: '09:30',
  format: 'Klasikal',
  lokasiId: '',
  jpKe: '1-2',
  jpCount: '2',
};

export function useSessionForm(
  batchId: string | undefined,
  defaultDate: string
) {
  const [sessionForm, setSessionForm] = useState<SessionFormState>({
    ...DEFAULT_FORM,
    batchId: batchId || '',
    date: defaultDate,
  });

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load draft from localStorage on mount (only for new sessions)
  useEffect(() => {
    if (typeof window !== 'undefined' && !editingSessionId) {
      const draft = localStorage.getItem('draft_sessionForm');
      if (draft) {
        try {
          setSessionForm(JSON.parse(draft));
        } catch {
          // ignore corrupt draft
        }
      }
    }
  }, [editingSessionId]);

  // Save draft to localStorage when creating new session
  const updateForm = (fields: Partial<SessionFormState>) => {
    setSessionForm(prev => {
      const next = { ...prev, ...fields };
      if (!editingSessionId) {
        localStorage.setItem('draft_sessionForm', JSON.stringify(next));
      }
      return next;
    });
  };

  // Auto-calculate endTime from startTime + jpCount
  useEffect(() => {
    if (sessionForm.startTime && sessionForm.jpCount) {
      const endStr = calculateEndTime(sessionForm.startTime, parseInt(sessionForm.jpCount));
      if (sessionForm.endTime !== endStr) {
        setSessionForm(prev => ({ ...prev, endTime: endStr }));
      }
    }
  }, [sessionForm.startTime, sessionForm.jpCount]);

  const getDefaultForm = (): SessionFormState => ({
    ...DEFAULT_FORM,
    batchId: batchId || '',
    date: defaultDate,
  });

  const openNewForm = () => {
    setEditingSessionId(null);
    setSessionForm(getDefaultForm());
  };

  const triggerEdit = (session: {
    id: string;
    batchId: string;
    mapelId: string;
    wiIds?: string[];
    wiId?: string;
    date: string;
    startTime: string;
    endTime: string;
    format: 'Klasikal' | 'Virtual' | 'Asinkron';
    lokasiId?: string;
    jpKe: string;
    jpCount: number;
  }) => {
    setEditingSessionId(session.id);
    setSessionForm({
      batchId: session.batchId,
      mapelId: session.mapelId,
      wiIds: session.wiIds || [session.wiId].filter(Boolean) as string[],
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      format: session.format,
      lokasiId: session.lokasiId || '',
      jpKe: session.jpKe,
      jpCount: String(session.jpCount),
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSessionId(null);
    setSessionForm(getDefaultForm());
    setIsDialogOpen(false);
    localStorage.removeItem('draft_sessionForm');
  };

  return {
    sessionForm,
    editingSessionId,
    isDialogOpen,
    setIsDialogOpen,
    updateForm,
    openNewForm,
    triggerEdit,
    resetForm,
  };
}
