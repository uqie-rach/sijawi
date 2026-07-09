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
  if (parts.length === 2) {
    const start = parseInt(parts[0]);
    const end = parseInt(parts[1]);
    if (isNaN(start) || isNaN(end) || start > end) return null;
    return { start, end };
  }
  const single = parseInt(jpKe);
  if (!isNaN(single)) return { start: single, end: single };
  return null;
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
  const [selectionStart, setSelectionStart] = useState<number | null>(null);
  const [hoverEnd, setHoverEnd] = useState<number | null>(null);

  const currentRange = useMemo(() => parseJpRange(value), [value]);

  const commitSelection = useCallback(
    (from: number, to: number) => {
      if (isRangeBlocked(from, to, allocatedRanges, currentRange)) return;
      const jpCount = to - from + 1;
      if (jpCount === 1) {
        onChange(`${from}`, 1);
      } else {
        onChange(`${from}-${to}`, jpCount);
      }
    },
    [allocatedRanges, currentRange, onChange]
  );

  const handleChipMouseDown = useCallback(
    (num: number) => {
      // Ignore clicks on allocated chips (unless editing that chip's range)
      const isPartOfCurrent = currentRange && num >= currentRange.start && num <= currentRange.end;
      if (!isPartOfCurrent && isNumberAllocated(num, allocatedRanges)) return;

      // Start a new selection
      setSelectionStart(num);
      setHoverEnd(num);
    },
    [allocatedRanges, currentRange]
  );

  const handleChipMouseUp = useCallback(
    (num: number) => {
      if (selectionStart === null) return;

      const from = Math.min(selectionStart, num);
      const to = Math.max(selectionStart, num);

      // If the range is blocked, reset and treat as new start
      if (isRangeBlocked(from, to, allocatedRanges, currentRange)) {
        setSelectionStart(num);
        setHoverEnd(num);
        return;
      }

      // Commit the selection
      commitSelection(from, to);
      setSelectionStart(null);
      setHoverEnd(null);
    },
    [selectionStart, allocatedRanges, currentRange, commitSelection]
  );

  const handleChipEnter = useCallback(
    (num: number) => {
      if (selectionStart !== null) {
        const from = Math.min(selectionStart, num);
        const to = Math.max(selectionStart, num);
        if (!isRangeBlocked(from, to, allocatedRanges, currentRange)) {
          setHoverEnd(num);
        }
      }
    },
    [selectionStart, allocatedRanges, currentRange]
  );

  const previewRange = useMemo(() => {
    if (selectionStart === null || hoverEnd === null) return null;
    return {
      start: Math.min(selectionStart, hoverEnd),
      end: Math.max(selectionStart, hoverEnd),
    };
  }, [selectionStart, hoverEnd]);

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
          const isSelectionStart = selectionStart === num;

          let chipClass = 'border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 cursor-pointer';

          if (isAllocated) {
            chipClass = 'border border-slate-200 bg-slate-200 text-slate-400 cursor-not-allowed';
          } else if (isInPreview || isCurrentlyEditing) {
            chipClass = 'border border-blue-500 bg-blue-600 text-white cursor-pointer';
          } else if (isSelectionStart && previewRange === null) {
            // Single click (not dragging) — show as selected
            chipClass = 'border-2 border-blue-500 bg-blue-100 text-blue-700 cursor-pointer';
          }

          return (
            <button
              key={num}
              type="button"
              disabled={isAllocated}
              onMouseDown={() => handleChipMouseDown(num)}
              onMouseUp={() => handleChipMouseUp(num)}
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
      <div className="flex items-center gap-3 mt-2 flex-wrap">
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

      {/* Helper text */}
      <p className="text-[9px] text-slate-400 italic mt-1.5">
        Klik dan tahan pada JP awal, lalu lepaskan di JP akhir untuk memilih rentang. Klik + lepas di JP yang sama untuk memilih 1 JP.
      </p>
    </div>
  );
}