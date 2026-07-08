'use client';

import React from 'react';
import { Clock, CalendarDays, TableProperties } from 'lucide-react';

type ViewMode = 'calendar' | 'day' | 'table';

interface ViewSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewSwitcher({ viewMode, onViewModeChange }: ViewSwitcherProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => onViewModeChange('table')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          viewMode === 'table'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <TableProperties className="h-3.5 w-3.5" />
        Matriks Tabel
      </button>
      <button
        onClick={() => onViewModeChange('calendar')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          viewMode === 'calendar'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        Tampilan Kalender
      </button>
      <button
        onClick={() => onViewModeChange('day')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
          viewMode === 'day'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        Lini Masa Hari
      </button>
    </div>
  );
}