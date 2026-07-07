import { Toaster } from '@/components/ui/sonner';
import { BRANDING } from '@/lib/config';
import Image from 'next/image';
import Link from 'next/link';

export default function EngineerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="container mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/60">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <div>
            <h1 className="font-black text-xl tracking-tight text-blue-600">{BRANDING.name}</h1>
            <p className="text-xs text-slate-500 font-medium">Engineer Console</p>
          </div>
        </Link>
        <Link
          href="/login"
          className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          ← Kembali ke Login
        </Link>
      </header>
      <main className="container mx-auto px-6 py-8">{children}</main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
