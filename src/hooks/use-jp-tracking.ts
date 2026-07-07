'use client';

import { useMemo } from 'react';
import type { Session, Mapel, Widyaiswara, Lokasi, Batch, KategoriPelatihan } from '@/context/wtms-context';
import { isLocationClashed } from '@/lib/scheduling-utils';

export interface TrackingMapelStatus extends Mapel {
  scheduledJp: number;
  remainingJp: number;
  isFullyScheduled: boolean;
}

export function useJpTracking(
  currentBatchSelectionId: string,
  currentBatchObj: Batch | null | undefined,
  kategoriList: KategoriPelatihan[],
  activeMapels: Mapel[],
  activeWis: Widyaiswara[],
  activeLokasis: Lokasi[],
  activeSessions: Session[],
  sessionForm: { format: string; date: string; startTime: string; endTime: string },
  editingSessionId: string | null
) {
  const currentCategory = currentBatchObj
    ? kategoriList.find(k => k.id === currentBatchObj.kategoriId)
    : null;

  const filteredMapels = currentBatchObj
    ? activeMapels.filter(m => m.kategoriId === currentBatchObj.kategoriId)
    : activeMapels;

  const filteredWisList = currentCategory
    ? activeWis.filter(wi => wi.level >= currentCategory.minWeight)
    : activeWis;

  const trackingMapelStatus: TrackingMapelStatus[] = useMemo(() => {
    return filteredMapels.map(mapel => {
      const scheduledSessions = activeSessions.filter(
        s => s.batchId === currentBatchSelectionId && s.mapelId === mapel.id
      );
      const scheduledJp = scheduledSessions.reduce((sum, s) => sum + Number(s.jpCount), 0);
      const remainingJp = Math.max(0, Number(mapel.jpTotal) - scheduledJp);
      return {
        ...mapel,
        scheduledJp,
        remainingJp,
        isFullyScheduled: remainingJp <= 0,
      };
    });
  }, [filteredMapels, activeSessions, currentBatchSelectionId]);

  const mapelOptions = useMemo(() => {
    return filteredMapels.map(m => {
      const statusObj = trackingMapelStatus.find(s => s.id === m.id);
      const isExceeded = statusObj ? statusObj.isFullyScheduled : false;
      return {
        value: m.id,
        label: `${m.name} (${m.jpTotal} JP)${isExceeded ? ' - [Kapasitas Terpenuhi]' : ''}`,
        disabled: isExceeded,
      };
    });
  }, [filteredMapels, trackingMapelStatus]);

  const lokasiOptions = useMemo(() => {
    return activeLokasis.map(l => {
      const clashed = isLocationClashed(
        l.id,
        sessionForm,
        activeSessions,
        editingSessionId
      );
      return {
        value: l.id,
        label: `${l.name}${clashed ? ' - [Bentrok Terdeteksi]' : ''}`,
        disabled: clashed,
      };
    });
  }, [activeLokasis, sessionForm, activeSessions, editingSessionId]);

  return {
    currentCategory,
    filteredMapels,
    filteredWisList,
    trackingMapelStatus,
    mapelOptions,
    lokasiOptions,
  };
}
