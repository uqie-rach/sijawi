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
    { href: '/admin', label: 'Overview Dashboard', icon: LayoutDashboard },
    { href: '/admin/master', label: 'Master Data', icon: Database },
    { href: '/admin/scheduling', label: 'Batch Scheduling', icon: CalendarDays },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const advancedNavItems = [
    { href: '/admin/day-view', label: 'Day View', icon: List },
    { href: '/admin/agenda-view', label: 'Agenda View', icon: CalendarRange },
    { href: '/admin/month-view', label: 'Month View', icon: Grid2x2 },
    { href: '/admin/week-view', label: 'Week View', icon: Columns },
    { href: '/admin/year-view', label: 'Year View', icon: Grid3X3 },
  ];

  const navItems = ENABLE_ADVANCED_CALENDAR
    ? [...baseNavItems, ...advancedNavItems]
    : baseNavItems;

  return (
    <aside className="w-full md:w-64 bg-blue-900 text-white flex flex-col justify-between border-r border-blue-950 shrink-0">
      <div>
        <div className="p-6 border-b border-blue-950 flex items-center gap-3">
          <div className="bg-amber-500 p-1.5 rounded-lg shadow-md shadow-amber-500/20">
            <GraduationCap className="h-5 w-5 text-blue-950" />

          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight text-white">{BRANDING.name}</h2>
            <p className="text-[10px] text-amber-400 font-medium">Super Admin Console</p>
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
                  ? 'bg-amber-500 text-blue-950 shadow-md shadow-amber-500/10'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-blue-950 space-y-4">
        <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/40">
          <p className="text-[10px] text-blue-200">Logged in as</p>
          <p className="text-sm font-bold text-white">Super Admin</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/30"
        >
          <LogOut className="h-4 w-4" />
          Exit Admin Mode
        </Button>
      </div>
    </aside>
  );
}