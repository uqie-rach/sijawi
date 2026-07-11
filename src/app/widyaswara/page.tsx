"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWTMS } from '@/context/wtms-context';

export default function WidyaswaraPage() {
  const router = useRouter();
  const { isAuthenticated, userRole } = useWTMS();

  useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    } else {
      router.replace('/widyaswara/month-view');
    }
  }, [isAuthenticated, userRole, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-500">Mengarahkan ke jadwal...</p>
    </div>
  );
}
