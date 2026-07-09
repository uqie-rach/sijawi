import { Toaster } from "@/components/ui/sonner";
import { WTMSProvider } from "@/context/wtms-context";
import type { Metadata } from "next";
import { Viewport } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";
import { BRANDING } from "@/lib/config";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRANDING.name} - ${BRANDING.fullName}`,
  description: `${BRANDING.fullName} - ${BRANDING.tagline}`,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${monaSans.variable} font-sans antialiased bg-white text-slate-700 min-h-screen`}
      >
        <WTMSProvider>
          {children}
          <Toaster position="top-right" richColors />
        </WTMSProvider>
      </body>
    </html>
  );
}