'use client';

import { useMemo, useState } from 'react';
import type { Session, Widyaiswara, Mapel, Batch, Lokasi } from '@/context/wtms-context';

export interface BusyWiDetail {
  wi: Widyaiswara;
  sessions: Array<{
    id: string;
    mapelName: string;
    batchName: string;
    startTime: string;
    endTime: string;
    format: string;
    lokasiName: string;
    jpKe: string;
    jpCount: number;
  }>;
}

export interface WiAvailabilityResult {
  availableWis: Widyaiswara[];
  busyWis: BusyWiDetail[];
  selectedWiDetail: { wi: Widyaiswara; sessions: BusyWiDetail['sessions'] } | null;
  selectWi: (wiId: string | null) => void;
}

export function useWiAvailability(
  date: string,
  allSessions: Session[],
  filteredWisList: Widyaiswara[],
  activeMapels: Mapel[],
  activeWis: Widyaiswara[],
  allBatches: Batch[],
  allLokasis: Lokasi[],
): WiAvailabilityResult {
  const [selectedWiId, setSelectedWiId] = useState<string | null>(null);

  const { availableWis, busyWis } = useMemo(() => {
    if (!date) {
      return { availableWis: filteredWisList, busyWis: [] as BusyWiDetail[] };
    }

    const available: Widyaiswara[] = [];
    const busy: BusyWiDetail[] = [];

    for (const wi of filteredWisList) {
      const wiSessions = allSessions.filter(
        s => s.date === date && (s.wiIds || []).includes(wi.id)
      );

      if (wiSessions.length === 0) {
        available.push(wi);
      } else {
        const sessionDetails = wiSessions.map(s => {
          const mapel = activeMapels.find(m => m.id === s.mapelId);
          const batch = allBatches.find(b => b.id === s.batchId);
          const lok = allLokasis.find(l => l.id === s.lokasiId);

          return {
            id: s.id,
            mapelName: mapel?.name || 'Unknown',
            batchName: batch?.name || 'Unknown',
            startTime: s.startTime,
            endTime: s.endTime,
            format: s.format,
            lokasiName: s.format === 'Klasikal' ? lok?.name || 'Unknown' : s.format,
            jpKe: s.jpKe,
            jpCount: s.jpCount,
          };
        });

        sessionDetails.sort((a, b) => a.startTime.localeCompare(b.startTime));

        busy.push({
          wi,
          sessions: sessionDetails,
        });
      }
    }

    // Sort available by level desc, then name asc
    available.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return a.name.localeCompare(b.name);
    });

    // Sort busy by first session start time
    busy.sort((a, b) => {
      const aFirst = a.sessions[0]?.startTime || '99:99';
      const bFirst = b.sessions[0]?.startTime || '99:99';
      return aFirst.localeCompare(bFirst);
    });

    return { availableWis: available, busyWis: busy };
  }, [date, allSessions, filteredWisList, activeMapels, allBatches, allLokasis]);

  const selectedWiDetail = useMemo(() => {
    if (!selectedWiId) return null;
    const busy = busyWis.find(b => b.wi.id === selectedWiId);
    if (busy) {
      return { wi: busy.wi, sessions: busy.sessions };
    }
    // If the selected WI is available (no sessions), return empty sessions
    const wi = availableWis.find(w => w.id === selectedWiId);
    if (wi) {
      return { wi, sessions: [] };
    }
    return null;
  }, [selectedWiId, busyWis, availableWis]);

  const selectWi = (wiId: string | null) => {
    setSelectedWiId(wiId);
  };

  return { availableWis, busyWis, selectedWiDetail, selectWi };
}