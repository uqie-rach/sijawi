import React from 'react';
import { Clock } from 'lucide-react';
import { sql } from '@/db';

interface AdminHeaderProps {
  title: string;
  description: string;
}

export async function AdminHeader({ title, description }: AdminHeaderProps) {
  // SSR JP Calculation for Header
  const jpResult = await sql`SELECT SUM(jp_count)::int as total FROM sessions`;
  const totalJp = jpResult[0]?.total || 0;

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">{description}</p>
      </div>

      <div className="flex items-center gap-4 bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg">
        <div className="bg-blue-500 p-1.5 rounded-md text-white">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs text-blue-600 font-medium">Total Scheduled JP</p>
          <p className="text-lg font-bold text-blue-900">
            {totalJp} JP <span className="text-xs font-normal text-slate-500">({totalJp * 45} Mins)</span>
          </p>
        </div>
      </div>
    </header>
  );
}