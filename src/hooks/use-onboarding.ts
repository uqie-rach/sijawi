"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wtms_onboarding_completed";

export function useOnboarding() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasChecked, setHasChecked] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const completed = localStorage.getItem(STORAGE_KEY);
    if (completed !== "true") {
      setIsActive(true);
    }
    setHasChecked(true);
  }, []);

  const complete = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const skip = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  return {
    isActive,
    currentStep,
    hasChecked,
    complete,
    skip,
    reset,
    nextStep,
    prevStep,
    setCurrentStep,
  };
}
