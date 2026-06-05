"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SandboxHeader() {
  const router = useRouter();

  return (
    <header className="border-b border-slate-800 bg-slate-950 px-8 py-4 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">WTMS Calendar Sandbox</h1>
          <p className="text-xs text-slate-400">Powered by calendarkit-pro Scheduler</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => router.push('/admin')}
        className="border-slate-800 text-slate-300 hover:bg-slate-900"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>
    </header>
  );
}