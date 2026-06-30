"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Database, CalendarDays, BarChart3, LogOut, GraduationCap, List, CalendarRange, Grid2x2, Columns, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWTMS } from '@/context/wtms-context';
import { BRANDING, ENABLE_ADVANCED_CALENDAR } from '@/lib/config';

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsAuthenticated, setUserRole, setSelectedWiId } = useWTMS();

  const handleLogout = () => {
    document.cookie = "sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    setIsAuthenticated(false);
    setUserRole(null);
    setSelectedWiId(null);
    router.push('/login');
  };

  const baseNavItems = [
    { href: '/admin', label: 'Dasbor Ringkasan', icon: LayoutDashboard },
    { href: '/admin/master', label: 'Data Master', icon: Database },
    { href: '/admin/scheduling', label: 'Penjadwalan Pelatihan', icon: CalendarDays },
    { href: '/admin/reports', label: 'Laporan & Analisis', icon: BarChart3 },
  ];

  const advancedNavItems = [
    { href: '/admin/day-view', label: 'Tampilan Hari', icon: List },
    { href: '/admin/agenda-view', label: 'Tampilan Agenda', icon: CalendarRange },
    { href: '/admin/month-view', label: 'Tampilan Bulan', icon: Grid2x2 },
    { href: '/admin/week-view', label: 'Tampilan Minggu', icon: Columns },
    { href: '/admin/year-view', label: 'Tampilan Tahun', icon: Grid3X3 },
  ];

  const navItems = ENABLE_ADVANCED_CALENDAR 
    ? [...baseNavItems, ...advancedNavItems]
    : baseNavItems;

  return (
    <aside className="w-full md:w-64 bg-white text-slate-800 flex flex-col justify-between border-r border-slate-200 shrink-0">
      <div>
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-500/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight text-blue-900">{BRANDING.name}</h2>
            <p className="text-[10px] text-blue-600 font-semibold">Konsol Super Admin</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-100 space-y-4">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <p className="text-[10px] text-slate-500">Masuk sebagai</p>
          <p className="text-sm font-bold text-slate-800">Super Admin</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Keluar Mode Admin
        </Button>
      </div>
    </aside>
  );
}