"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Database, CalendarDays, BarChart3, LogOut, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWTMS } from '@/context/wtms-context';

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

  const navItems = [
    { href: '/admin', label: 'Overview Dashboard', icon: LayoutDashboard },
    { href: '/admin/master', label: 'Master Data', icon: Database },
    { href: '/admin/scheduling', label: 'Batch Scheduling', icon: CalendarDays },
    { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight">WTMS Admin</h2>
            <p className="text-xs text-slate-400">Super Admin Console</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <p className="text-xs text-slate-400">Logged in as</p>
          <p className="text-sm font-semibold text-slate-200">Super Admin</p>
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