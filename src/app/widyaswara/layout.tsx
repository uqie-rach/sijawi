"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useWTMS } from "@/context/wtms-context";
import { WidyaswaraSidebar } from "@/components/widyaswara/sidebar";
import { WidyaswaraHeader } from "@/components/widyaswara/header";
import { FloatingWhatsApp } from "@/components/floating-whatsapp";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";
import { wiOnboardingSteps } from "@/lib/onboarding-steps";
import { Button } from "@/components/ui/button";

export default function WidyaswaraLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { userRole, widyaswaras, selectedWiId, isAuthenticated } = useWTMS();

  const onboarding = useOnboarding();

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
        <WidyaswaraSidebar activeWiName={`${activeWi.name}, ${activeWi.gelar}`} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <WidyaswaraHeader />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mx-auto max-w-[1280px]">
            {children}
          </div>
        </main>
      </div>

      {/* Floating WhatsApp */}
      <div data-onboarding="wi-whatsapp">
        <FloatingWhatsApp />
      </div>

      {/* Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetTutorial}
          className="rounded-full h-10 w-10 p-0 bg-white shadow-lg border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all"
          title="Tampilkan Panduan"
        >
          <HelpCircle className="h-5 w-5 text-slate-500" />
        </Button>
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