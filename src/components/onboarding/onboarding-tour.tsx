"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OnboardingStep } from "@/lib/onboarding-steps";

interface OnboardingTourProps {
  steps: OnboardingStep[];
  currentStep: number;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onComplete: () => void;
  onStepChange: (step: number) => void;
}

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TooltipPosition {
  top: number;
  left: number;
}

const SPOTLIGHT_PADDING = 12;
const TOOLTIP_GAP = 16;
const TOOLTIP_WIDTH = 340;

export function OnboardingTour({
  steps,
  currentStep,
  isActive,
  onNext,
  onPrev,
  onSkip,
  onComplete,
  onStepChange,
}: OnboardingTourProps) {
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const recalc = useCallback(() => {
    if (!isActive || currentStep >= steps.length) {
      setSpotlight(null);
      return;
    }

    const step = steps[currentStep];
    const el = document.querySelector(step.targetSelector);
    if (!el) {
      // Target not found, skip to next step automatically
      if (currentStep < steps.length - 1) {
        onStepChange(currentStep + 1);
      } else {
        onComplete();
      }
      return;
    }

    const rect = el.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const sr: SpotlightRect = {
      top: rect.top + scrollTop - SPOTLIGHT_PADDING,
      left: rect.left + scrollLeft - SPOTLIGHT_PADDING,
      width: rect.width + SPOTLIGHT_PADDING * 2,
      height: rect.height + SPOTLIGHT_PADDING * 2,
    };

    setSpotlight(sr);

    // Calculate tooltip position based on placement
    const placement = step.placement || "bottom";
    let tp = { top: 0, left: 0 };

    const targetCenterX = rect.left + rect.width / 2;
    const targetCenterY = rect.top + rect.height / 2;

    switch (placement) {
      case "bottom":
        tp = {
          top: rect.bottom + TOOLTIP_GAP,
          left: targetCenterX - TOOLTIP_WIDTH / 2,
        };
        break;
      case "top":
        tp = {
          top: rect.top - TOOLTIP_GAP - 160,
          left: targetCenterX - TOOLTIP_WIDTH / 2,
        };
        break;
      case "right":
        tp = {
          top: targetCenterY - 80,
          left: rect.right + TOOLTIP_GAP,
        };
        break;
      case "left":
        tp = {
          top: targetCenterY - 80,
          left: rect.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
        };
        break;
    }

    // Clamp tooltip within viewport
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    tp.left = Math.max(16, Math.min(tp.left, viewportW - TOOLTIP_WIDTH - 16));
    tp.top = Math.max(16, Math.min(tp.top, viewportH - 200));

    setTooltipPos(tp);
  }, [isActive, currentStep, steps, onNext, onComplete, onStepChange]);

  useEffect(() => {
    if (!isActive) return;

    recalc();

    const handleScroll = () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(recalc);
    };

    const handleResize = () => recalc();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, recalc]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, onSkip, onNext, onPrev]);

  if (!mounted || !isActive || currentStep >= steps.length) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const tour = (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark backdrop with spotlight cutout */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        onClick={(e) => {
          // Only skip if clicking directly on the backdrop, not within spotlight
          const target = e.target as SVGElement;
          if (target.tagName === "svg") onSkip();
        }}
      >
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.6)"
          mask="url(#spotlight-mask)"
        />
        {/* Spotlight border glow */}
        {spotlight && (
          <rect
            x={spotlight.left}
            y={spotlight.top}
            width={spotlight.width}
            height={spotlight.height}
            rx="12"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="2"
          />
        )}
      </svg>

      {/* Spotlight overlay ring animation */}
      {spotlight && (
        <div
          className="absolute pointer-events-none animate-pulse"
          style={{
            top: spotlight.top - 4,
            left: spotlight.left - 4,
            width: spotlight.width + 8,
            height: spotlight.height + 8,
            borderRadius: 16,
            boxShadow: "0 0 20px 4px rgba(59, 130, 246, 0.4)",
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_WIDTH,
          maxWidth: `calc(100vw - 32px)`,
        }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {currentStep + 1} / {steps.length}
          </span>
          <button
            onClick={onSkip}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
          >
            Lewati
          </button>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrev}
                className="rounded-xl h-8 px-3"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Kembali
              </Button>
            )}
            {isLast ? (
              <Button
                size="sm"
                onClick={onComplete}
                className="rounded-xl h-8 px-4 bg-blue-600 hover:bg-blue-700"
              >
                Selesai
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onNext}
                className="rounded-xl h-8 px-4 bg-blue-600 hover:bg-blue-700"
              >
                Lanjut
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(tour, document.body);
}
