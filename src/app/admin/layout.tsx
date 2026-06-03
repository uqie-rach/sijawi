import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { sql } from '@/db';

async function checkAdminAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sessionToken')?.value;
  if (token !== 'admin-session-token') {
    redirect('/login');
  }
}

async function getTotalScheduledJp() {
  try {
    const result = await sql`SELECT SUM(jp_count)::int as total FROM sessions`;
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
            <h1 className="text-2xl font-bold text-slate-900">WTMS Administration</h1>
            <p className="text-sm text-slate-500">Monitor and manage Widyaswara training schedules & load balancing.</p>
          </div>

          <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
            <div className="bg-blue-500 p-1.5 rounded-md text-white">
              <span className="text-xs font-bold">JP</span>
            </div>
            <div>
              <p className="text-xs text-blue-600 font-medium">Total Scheduled JP</p>
              <p className="text-lg font-bold text-blue-900">
                {totalJp} JP <span className="text-xs font-normal text-slate-500">({totalJp * 45} Mins)</span>
              </p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}