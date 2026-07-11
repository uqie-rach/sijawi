"use client";

import React, { useCallback } from "react";
import { HelpCircle } from "lucide-react";
import { OnboardingTour } from "@/components/onboarding/onboarding-tour";
import { useOnboarding } from "@/hooks/use-onboarding";
import { adminOnboardingSteps } from "@/lib/onboarding-steps";
import { Button } from "@/components/ui/button";

export function AdminOnboardingWrapper({ children }: { children: React.ReactNode }) {
  const onboarding = useOnboarding();

  const handleResetTutorial = useCallback(() => {
    onboarding.reset();
  }, [onboarding]);

  return (
    <>
      {children}

      {/* Help button - fixed position */}
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
          steps={adminOnboardingSteps}
          currentStep={onboarding.currentStep}
          isActive={onboarding.isActive}
          onNext={onboarding.nextStep}
          onPrev={onboarding.prevStep}
          onSkip={onboarding.skip}
          onComplete={onboarding.complete}
          onStepChange={onboarding.setCurrentStep}
        />
      )}
    </>
  );
}
