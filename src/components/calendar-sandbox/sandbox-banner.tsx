"use client";

import React from 'react';
import { ShieldAlert } from 'lucide-react';

export function SandboxBanner() {
  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 flex gap-4 text-blue-200">
      <ShieldAlert className="h-6 w-6 shrink-0 text-blue-400 mt-1" />
      <div className="space-y-1">
        <h3 className="font-bold text-blue-300 font-semibold text-sm">Interactive Pro Sandbox Scheduler Rules</h3>
        <p className="text-xs text-slate-300">
          Double-click or drag on empty slots in the scheduler below to dynamically test new mock events. All WTMS constraints (08:00 - 17:00 operational hours, collision checks) are validated in real-time.
        </p>
      </div>
    </div>
  );
}