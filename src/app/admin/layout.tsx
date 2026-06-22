import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { connectToDatabase } from '@/lib/mongodb';
import JadwalSesi from '@/models/JadwalSesi';
import { BRANDING } from '@/lib/config';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  if (token !== 'admin-session-token') {
    redirect('/login');
  }
}

async function getTotalScheduledJp() {
  try {
    await connectToDatabase();
    const result = await JadwalSesi.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$jp_count' }
        }
      }
    ]);
    return result[0]?.total || 0;
  } catch (e) {
    return 0;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminAuth();
  const totalJp = await getTotalScheduledJp();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-blue-900">Administrasi {BRANDING.name}</h1>
            <p className="text-sm text-slate-500">{BRANDING.fullName} - {BRANDING.tagline}</p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <div className="bg-amber-500 p-1.5 rounded-md text-blue-950">
              <span className="text-xs font-black">JP</span>
            </div>
            <div>
              <p className="text-xs text-blue-900 font-bold">Total JP Terjadwal</p>
              <p className="text-lg font-black text-blue-900">
                {totalJp} JP <span className="text-xs font-normal text-slate-500">({totalJp * 45} Menit)</span>
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}