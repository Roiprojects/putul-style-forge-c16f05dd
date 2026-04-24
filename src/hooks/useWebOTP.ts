import { useEffect } from "react";

/**
 * WebOTP API hook — auto-reads SMS OTP on Android Chrome.
 * Requires the SMS to end with: "@yourdomain.com #123456"
 * iOS Safari uses native autoComplete="one-time-code" suggestion bar (no JS needed).
 */
export const useWebOTP = (enabled: boolean, onCode: (code: string) => void) => {
  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!("OTPCredential" in window)) return;

    const ac = new AbortController();

    (navigator.credentials as unknown as {
      get: (opts: Record<string, unknown>) => Promise<{ code?: string } | null>;
    })
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((otp) => {
        if (otp?.code) onCode(otp.code);
      })
      .catch(() => {
        // user dismissed or timeout — silent
      });

    return () => ac.abort();
  }, [enabled, onCode]);
};
