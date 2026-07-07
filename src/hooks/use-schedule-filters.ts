'use client';

import { useState, useMemo } from 'react';
import type { Session, Mapel } from '@/context/wtms-context';

export type SortField = 'date' | 'startTime' | 'jpCount' | 'mapelName' | 'format';
export type SortDirection = 'asc' | 'desc';

export function useScheduleFilters(
  batchSessions: Session[],
  activeMapels: Mapel[]
) {
  const [filterDateStart, setFilterDateStart] = useState<string>('');
  const [filterDateEnd, setFilterDateEnd] = useState<string>('');
  const [filterFormat, setFilterFormat] = useState<string>('ALL');
  const [filterWIId, setFilterWIId] = useState<string>('ALL');
  const [filterMapelId, setFilterMapelId] = useState<string>('ALL');
  const [filterLokasiId, setFilterLokasiId] = useState<string>('ALL');
  const [filterJpMin, setFilterJpMin] = useState<string>('');
  const [filterJpMax, setFilterJpMax] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilterBar, setShowFilterBar] = useState(false);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filterDateStart) count++;
    if (filterDateEnd) count++;
    if (filterFormat !== 'ALL') count++;
    if (filterWIId !== 'ALL') count++;
    if (filterMapelId !== 'ALL') count++;
    if (filterLokasiId !== 'ALL') count++;
    if (filterJpMin) count++;
    if (filterJpMax) count++;
    return count;
  }, [filterDateStart, filterDateEnd, filterFormat, filterWIId, filterMapelId, filterLokasiId, filterJpMin, filterJpMax]);

  const resetAllFilters = () => {
    setFilterDateStart('');
    setFilterDateEnd('');
    setFilterFormat('ALL');
    setFilterWIId('ALL');
    setFilterMapelId('ALL');
    setFilterLokasiId('ALL');
    setFilterJpMin('');
    setFilterJpMax('');
    setSortField('date');
    setSortDirection('asc');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedSessions = useMemo(() => {
    let result = [...batchSessions];

    if (filterDateStart) {
      result = result.filter(s => s.date >= filterDateStart);
    }
    if (filterDateEnd) {
      result = result.filter(s => s.date <= filterDateEnd);
    }
    if (filterFormat !== 'ALL') {
      result = result.filter(s => s.format === filterFormat);
    }
    if (filterWIId !== 'ALL') {
      result = result.filter(s => (s.wiIds || []).includes(filterWIId));
    }
    if (filterMapelId !== 'ALL') {
      result = result.filter(s => s.mapelId === filterMapelId);
    }
    if (filterLokasiId !== 'ALL') {
      result = result.filter(s => s.lokasiId === filterLokasiId);
    }
    if (filterJpMin) {
      const min = parseInt(filterJpMin);
      if (!isNaN(min)) {
        result = result.filter(s => s.jpCount >= min);
      }
    }
    if (filterJpMax) {
      const max = parseInt(filterJpMax);
      if (!isNaN(max)) {
        result = result.filter(s => s.jpCount <= max);
      }
    }

    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'startTime':
          comparison = a.startTime.localeCompare(b.startTime);
          break;
        case 'jpCount':
          comparison = a.jpCount - b.jpCount;
          break;
        case 'mapelName': {
          const mapelA = activeMapels.find(m => m.id === a.mapelId);
          const mapelB = activeMapels.find(m => m.id === b.mapelId);
          const nameA = mapelA?.name || '';
          const nameB = mapelB?.name || '';
          comparison = nameA.localeCompare(nameB);
          break;
        }
        case 'format':
          comparison = a.format.localeCompare(b.format);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [
    batchSessions,
    filterDateStart, filterDateEnd, filterFormat, filterWIId, filterMapelId,
    filterLokasiId, filterJpMin, filterJpMax,
    sortField, sortDirection,
    activeMapels,
  ]);

  return {
    // Filter state
    filterDateStart, setFilterDateStart,
    filterDateEnd, setFilterDateEnd,
    filterFormat, setFilterFormat,
    filterWIId, setFilterWIId,
    filterMapelId, setFilterMapelId,
    filterLokasiId, setFilterLokasiId,
    filterJpMin, setFilterJpMin,
    filterJpMax, setFilterJpMax,
    // Sort state
    sortField, sortDirection,
    // UI state
    showFilterBar, setShowFilterBar,
    // Computed
    activeFilterCount,
    filteredAndSortedSessions,
    // Handlers
    handleSort,
    resetAllFilters,
  };
}
