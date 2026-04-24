import { useEffect } from "react";

/**
 * WebOTP API hook — auto-reads SMS OTP on Android Chrome.
 * Requires the SMS to end with: "@yourdomain.com #123456"
 * iOS Safari uses native autoComplete="one-time-code" suggestion bar (no JS needed).
 */
export const useWebOTP = (_enabled: boolean, _onCode: (code: string) => void) => {
  // Auto-read OTP via WebOTP API is disabled for now.
  useEffect(() => {
    return;
  }, []);
};
