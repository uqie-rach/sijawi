import React from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { MadeWithDyad } from '@/components/made-with-dyad';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1">
          {children}
        </div>
        <footer className="border-t border-slate-200 bg-white mt-auto">
          <MadeWithDyad />
        </footer>
      </main>
    </div>
  );
}