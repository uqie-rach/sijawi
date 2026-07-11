"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, GraduationCap, HelpCircle } from "lucide-react";
import { useWTMS } from "@/context/wtms-context";
import { WidyaswaraSidebar } from "@/components/widyaswara/sidebar";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";
import { wiOnboardingSteps } from "@/lib/onboarding-steps";
import { BRANDING } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";

export default function WidyaswaraLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const {
    userRole,
    widyaswaras,
    selectedWiId,
    setSelectedWiId,
    isAuthenticated,
  } = useWTMS();

  const onboarding = useOnboarding();

  // Route guard
  useEffect(() => {
    if (!isAuthenticated || userRole !== 'wi') {
      router.push('/login');
    }
  }, [isAuthenticated, userRole, router]);

  const activeWi = widyaswaras.find(w => w.id === selectedWiId) || widyaswaras[0];

  const handleResetTutorial = useCallback(() => {
    onboarding.reset();
  }, [onboarding]);

  if (!isAuthenticated || userRole !== 'wi') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Redirecting to login...</p>
      </div>
    );
  }

  if (!activeWi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500">Memuat profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F5F5F5]">
      {/* Sidebar */}
      <div data-onboarding="wi-sidebar">
        <WidyaswaraSidebar activeWiName={activeWi.name} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="relative bg-white border-b border-slate-200 text-slate-800 px-4 sm:px-8 py-4 shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-2 w-fit border border-blue-200 text-blue-600">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                {BRANDING.fullName}
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Portal {BRANDING.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">{BRANDING.tagline}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Help button to re-trigger tutorial */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetTutorial}
                className="rounded-xl text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                title="Tampilkan Panduan"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Panduan
              </Button>

              {/* WI Profile Selector */}
              <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-xs text-slate-500 font-semibold whitespace-nowrap">Profil Aktif:</span>
                <Select value={activeWi.id} onValueChange={setSelectedWiId}>
                  <SelectTrigger className="h-8 bg-white border border-slate-200 text-slate-800 font-bold focus:ring-0 px-2.5 py-1 gap-1 text-xs rounded-lg">
                    <SelectValue placeholder="Pilih profil" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    {widyaswaras.map(w => (
                      <SelectItem key={w.id} value={w.id} className="hover:bg-slate-100 focus:bg-slate-100 text-xs font-semibold">
                        {w.name}, {w.gelar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating WhatsApp */}
      <div data-onboarding="wi-whatsapp">
        <FloatingWhatsApp />
      </div>

      {/* Onboarding Tour */}
      {onboarding.hasChecked && (
        <OnboardingTour
          steps={wiOnboardingSteps}
          currentStep={onboarding.currentStep}
          isActive={onboarding.isActive}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skip}
          onComplete={onboarding.complete}
          onStepChange={onboarding.setCurrentStep}
        />
      )}
    </div>
  );
}
