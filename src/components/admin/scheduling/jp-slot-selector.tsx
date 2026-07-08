'use client';

import React, { useState, useMemo, useCallback } from 'react';

interface JpSlotSelectorProps {
  jpTotal: number;
  allocatedRanges: Array<{ start: number; end: number }>;
  value: string;
  onChange: (jpKe: string, jpCount: number) => void;
}

function parseJpRange(jpKe: string): { start: number; end: number } | null {
  if (!jpKe) return null;
  const parts = jpKe.split('-');
  if (parts.length !== 2) return null;
  const start = parseInt(parts[0]);
  const end = parseInt(parts[1]);
  if (isNaN(start) || isNaN(end) || start > end) return null;
  return { start, end };
}

function isNumberAllocated(n: number, ranges: Array<{ start: number; end: number }>): boolean {
  return ranges.some(r => n >= r.start && n <= r.end);
}

function isRangeBlocked(
  from: number,
  to: number,
  ranges: Array<{ start: number; end: number }>,
  editingRange: { start: number; end: number } | null
): boolean {
  for (let i = from; i <= to; i++) {
    // Skip checking against the currently-editing session's own range
    if (editingRange && i >= editingRange.start && i <= editingRange.end) continue;
    if (isNumberAllocated(i, ranges)) return true;
  }
  return false;
}

export function JpSlotSelector({
  jpTotal,
  allocatedRanges,
  value,
  onChange,
}: JpSlotSelectorProps) {
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [hoverEnd, setHoverEnd] = useState<number | null>(null);

  const currentRange = useMemo(() => parseJpRange(value), [value]);

  const handleChipClick = useCallback(
    (num: number) => {
      // Ignore clicks on allocated chips (unless it's the currently editing session's range)
      if (isNumberAllocated(num, allocatedRanges) && !(currentRange && num >= currentRange.start && num <= currentRange.end)) {
        return;
      }

      if (rangeStart === null) {
        // First click: set range start
        setRangeStart(num);
        setHoverEnd(num);
      } else if (num === rangeStart) {
        // Click same chip: reset
        setRangeStart(null);
        setHoverEnd(null);
        onChange('', 0);
      } else {
        // Second click: set range
        const from = Math.min(rangeStart, num);
        const to = Math.max(rangeStart, num);

        // Check if range crosses any allocated chip
        if (isRangeBlocked(from, to, allocatedRanges, currentRange)) {
          // Reset and try again
          setRangeStart(num);
          setHoverEnd(num);
          return;
        }

        const jpCount = to - from + 1;
        onChange(`${from}-${to}`, jpCount);
        setRangeStart(null);
        setHoverEnd(null);
      }
    },
    [rangeStart, allocatedRanges, currentRange, onChange]
  );

  const handleChipEnter = useCallback(
    (num: number) => {
      if (rangeStart !== null) {
        // Check if preview range would cross allocated chips
        const from = Math.min(rangeStart, num);
        const to = Math.max(rangeStart, num);
        if (!isRangeBlocked(from, to, allocatedRanges, currentRange)) {
          setHoverEnd(num);
        }
      }
    },
    [rangeStart, allocatedRanges, currentRange]
  );

  const previewRange = useMemo(() => {
    if (rangeStart === null || hoverEnd === null) return null;
    return {
      start: Math.min(rangeStart, hoverEnd),
      end: Math.max(rangeStart, hoverEnd),
    };
  }, [rangeStart, hoverEnd]);

  const numbers = Array.from({ length: jpTotal }, (_, i) => i + 1);

  if (jpTotal <= 0) {
    return (
      <p className="text-[11px] text-slate-400 italic">Pilih mata pelatihan terlebih dahulu.</p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {numbers.map(num => {
          const isCurrentlyEditing = currentRange && num >= currentRange.start && num <= currentRange.end;
          const isAllocated = !isCurrentlyEditing && isNumberAllocated(num, allocatedRanges);
          const isInPreview = previewRange && num >= previewRange.start && num <= previewRange.end;
          const isRangeStart = rangeStart === num;

          let chipClass = 'border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';

          if (isAllocated) {
            chipClass = 'border border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed';
          } else if (isInPreview || isCurrentlyEditing) {
            chipClass = 'border border-blue-500 bg-blue-600 text-white cursor-pointer';
          } else if (isRangeStart) {
            chipClass = 'border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-pointer';
          }

          return (
            <button
              key={num}
              type="button"
              disabled={isAllocated}
              onClick={() => handleChipClick(num)}
              onMouseEnter={() => handleChipEnter(num)}
              className={`w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold transition-all duration-100 ${chipClass}`}
              title={isAllocated ? `JP ${num} sudah dialokasikan` : `JP ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
          <span className="text-[9px] text-slate-500">Tersedia</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-slate-200 border border-slate-200" />
          <span className="text-[9px] text-slate-500">Terpakai</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-600 border border-blue-500" />
          <span className="text-[9px] text-slate-500">Dipilih</span>
        </div>
      </div>
    </div>
  );
}
