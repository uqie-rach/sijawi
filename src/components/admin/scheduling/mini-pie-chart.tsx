'use client';

import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

interface MiniPieChartProps {
  scheduled: number;
  total: number;
  size?: number;
}

const COLOR_SCHEDULED = '#2563EB'; // blue-600
const COLOR_REMAINING = '#E2E8F0'; // slate-200

export function MiniPieChart({ scheduled, total, size = 60 }: MiniPieChartProps) {
  const percentage = total > 0 ? Math.round((scheduled / total) * 100) : 0;
  const remaining = Math.max(0, total - scheduled);

  const data = [
    { name: 'Terjadwal', value: scheduled },
    { name: 'Tersisa', value: remaining },
  ];

  const innerRadius = size * 0.38;
  const outerRadius = size * 0.46;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2}
          cy={size / 2}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
          isAnimationActive={false}
        >
          <Cell fill={COLOR_SCHEDULED} />
          <Cell fill={COLOR_REMAINING} />
        </Pie>
      </PieChart>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-900 pointer-events-none select-none">
        {percentage}%
      </span>
    </div>
  );
}
