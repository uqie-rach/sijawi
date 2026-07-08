'use client';

import { useMemo, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { FilterState } from '@/components/admin/scheduling/filter-bar';

export type SortField = 'date' | 'startTime' | 'jpCount' | 'mapelName' | 'format';
export type SortDirection = 'asc' | 'desc';

export function useScheduleFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read filters from URL
  const filters: FilterState = {
    year: searchParams.get('year') || 'ALL',
    format: searchParams.get('format') || 'ALL',
    wiId: searchParams.get('wiId') || 'ALL',
    mapelId: searchParams.get('mapelId') || 'ALL',
    lokasiId: searchParams.get('lokasiId') || 'ALL',
  };

  const sortField = (searchParams.get('sortField') || 'date') as SortField;
  const sortDirection = (searchParams.get('sortDirection') || 'asc') as SortDirection;
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const showFilterBar = searchParams.get('showFilters') === 'true';

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.year !== 'ALL') count++;
    if (filters.format !== 'ALL') count++;
    if (filters.wiId !== 'ALL') count++;
    if (filters.mapelId !== 'ALL') count++;
    if (filters.lokasiId !== 'ALL') count++;
    return count;
  }, [filters]);

  // Push filter changes to URL
  const pushParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(updates)) {
        if (val && val !== 'ALL') {
          params.set(key, val);
        } else {
          params.delete(key);
        }
      }
      // Reset page when filters change
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const handleFilterChange = useCallback(
    (partial: Partial<FilterState>) => {
      const updates: Record<string, string> = {};
      if (partial.year !== undefined) updates.year = partial.year;
      if (partial.format !== undefined) updates.format = partial.format;
      if (partial.wiId !== undefined) updates.wiId = partial.wiId;
      if (partial.mapelId !== undefined) updates.mapelId = partial.mapelId;
      if (partial.lokasiId !== undefined) updates.lokasiId = partial.lokasiId;
      pushParams(updates);
    },
    [pushParams]
  );

  const setShowFilterBar = useCallback(
    (show: boolean) => {
      pushParams({ showFilters: show ? 'true' : '' });
    },
    [pushParams]
  );

  const handleSort = useCallback(
    (field: SortField) => {
      const updates: Record<string, string> = { sortField: field };
      if (sortField === field) {
        updates.sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        updates.sortDirection = 'asc';
      }
      pushParams(updates);
    },
    [sortField, sortDirection, pushParams]
  );

  const resetAllFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const handlePageChange = useCallback(
    (newPage: number) => {
      pushParams({ page: String(newPage) });
    },
    [pushParams]
  );

  return {
    // Filter state (from URL)
    filters,
    // Sort state (from URL)
    sortField,
    sortDirection,
    // Pagination (from URL)
    page,
    pageSize,
    // UI state
    showFilterBar,
    setShowFilterBar,
    // Computed
    activeFilterCount,
    // Handlers
    handleSort,
    handleFilterChange,
    handlePageChange,
    resetAllFilters,
  };
}
