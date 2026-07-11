"use client";

import { gooeyToast } from "goey-toast";

// Adapter: wraps goey-toast to match sonner's `toast` API.
// All existing code using `toast.success(...)`, `toast.error(...)`, etc. works unchanged.

function toastFn(title: string, options?: Record<string, unknown>) {
  return gooeyToast(title, options as Parameters<typeof gooeyToast>[1]);
}

export const toast = Object.assign(toastFn, {
  success: (title: string, options?: Record<string, unknown>) =>
    gooeyToast.success(title, options as Parameters<typeof gooeyToast.success>[1]),
  error: (title: string, options?: Record<string, unknown>) =>
    gooeyToast.error(title, options as Parameters<typeof gooeyToast.error>[1]),
  warning: (title: string, options?: Record<string, unknown>) =>
    gooeyToast.warning(title, options as Parameters<typeof gooeyToast.warning>[1]),
  info: (title: string, options?: Record<string, unknown>) =>
    gooeyToast.info(title, options as Parameters<typeof gooeyToast.info>[1]),
  promise: gooeyToast.promise.bind(gooeyToast),
  dismiss: gooeyToast.dismiss.bind(gooeyToast),
  update: gooeyToast.update.bind(gooeyToast),
});
