import { Toaster } from "@/components/ui/sonner";
import { WTMSProvider } from "@/context/wtms-context";
import type { Metadata } from "next";
import { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BRANDING } from "@/lib/config";
import { generatePrimaryColorCSS } from "@/lib/color-presets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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

async function getDynamicPrimaryCSS(): Promise<string> {
  try {
    const { connectToDatabase } = await import("@/lib/mongodb");
    await connectToDatabase();
    const AdminConfig = (await import("@/models/AdminConfig")).default;
    const config = await AdminConfig.findById("admin-config");
    if (config?.primaryColor) {
      return generatePrimaryColorCSS(config.primaryColor);
    }
  } catch {
    // Fallback to default CSS if MongoDB is not available
  }
  return "";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dynamicCSS = await getDynamicPrimaryCSS();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-700 min-h-screen`}
      >
        {dynamicCSS && (
          <style id="dynamic-primary-color" dangerouslySetInnerHTML={{ __html: dynamicCSS }} />
        )}
        <WTMSProvider>
          {children}
          <Toaster position="top-right" richColors />
        </WTMSProvider>
      </body>
    </html>
  );
}