'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OverviewPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function OverviewPagination({ currentPage, totalPages }: OverviewPaginationProps) {
  const searchParams = useSearchParams();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/30">
      <span className="text-xs text-slate-500 font-medium">
        Halaman {currentPage} dari {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(Math.max(1, currentPage - 1))}
          className={currentPage <= 1 ? 'pointer-events-none opacity-40' : ''}
        >
          <Button variant="outline" size="sm" disabled={currentPage <= 1} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link key={p} href={buildHref(p)}>
            <Button
              variant={p === currentPage ? 'default' : 'outline'}
              size="sm"
              className={`h-8 w-8 p-0 text-xs font-semibold ${
                p === currentPage ? 'bg-blue-600 text-white' : 'text-slate-600'
              }`}
            >
              {p}
            </Button>
          </Link>
        ))}
        <Link
          href={buildHref(Math.min(totalPages, currentPage + 1))}
          className={currentPage >= totalPages ? 'pointer-events-none opacity-40' : ''}
        >
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
