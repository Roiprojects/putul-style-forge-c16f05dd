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

    // @ts-expect-error - OTPCredential is not in TS lib yet
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: ac.signal })
      .then((otp: any) => {
        if (otp?.code) onCode(otp.code);
      })
      .catch(() => {
        // user dismissed or timeout — silent
      });

    return () => ac.abort();
  }, [enabled, onCode]);
};
