'use client';

import React from 'react';

interface ProgressBarProps {
  scheduled: number;
  total: number;
  width?: number;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({
  scheduled,
  total,
  width = 100,
  height = 8,
  showLabel = true,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((scheduled / total) * 100)) : 0;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="bg-slate-200 rounded-full overflow-hidden shrink-0"
        style={{ width, height }}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percentage >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">
          {percentage}%
        </span>
      )}
    </div>
  );
}
