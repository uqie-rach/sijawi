"use client";

import React, { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';
import { WidyaswaraWorkspaceClient } from '@/components/widyaswara/workspace-client';
import { BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function WidyaswaraPage() {
  const router = useRouter();
  const { isAuthenticated, userRole, selectedWiId, widyaswaras } = useWTMS();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  // Resolve target WI id: use selectedWiId from context, fallback to first
  const targetWiId = useMemo(() => {
    if (selectedWiId) return selectedWiId;
    if (widyaswaras.length > 0) return widyaswaras[0].id;
    return null;
  }, [selectedWiId, widyaswaras]);

  const targetWi = widyaswaras.find(w => w.id === targetWiId);

  if (!isAuthenticated || userRole !== 'wi' || !targetWiId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Memuat jadwal...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Jadwal Mengajar Anda
          </CardTitle>
          <CardDescription>
            {targetWi ? `${targetWi.name}, ${targetWi.gelar}` : ''} • Tinjau jadwal mengajar Anda dalam berbagai tampilan.
          </CardDescription>
        </CardHeader>
      </Card>

      <WidyaswaraWorkspaceClient targetWiId={targetWiId} />
    </div>
  );
}