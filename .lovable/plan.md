

# Mobile OTP Authentication System

## Overview
Replace email/password login with mobile-number-based OTP for both customers and admins. Since Twilio connector isn't set up yet and the user will provide the OTP API later, we'll build the full system with a placeholder edge function that can be swapped to use Twilio gateway once connected.

## Database Changes

**Migration 1 — OTP requests table + admin phones whitelist:**
```sql
CREATE TABLE public.otp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.otp_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only" ON public.otp_requests FOR ALL TO service_role USING (true);

CREATE TABLE public.admin_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_phones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage" ON public.admin_phones FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role can read" ON public.admin_phones FOR SELECT TO service_role USING (true);
```

## Edge Functions

### `send-otp/index.ts`
- Accepts `{ phone, is_admin? }` 
- Rate-limits: max 3 OTPs per phone per 10 minutes (query otp_requests)
- If `is_admin`: check phone exists in `admin_phones`, reject if not
- Generate 6-digit OTP, store in `otp_requests` with 5-min expiry
- **SMS sending**: placeholder `console.log` for now — will be replaced with Twilio gateway once connected
- Returns success/error

### `verify-otp/index.ts`
- Accepts `{ phone, otp_code }`
- Validates against `otp_requests` (not expired, attempts < 5, not already verified)
- Increments attempts on failure
- On success: marks verified, looks up profile by phone
  - Existing user: generates session via `supabase.auth.admin.signInWithPassword` or custom token
  - New user: creates auth user with phone as identifier + profile, then signs in
- If admin check requested: verify user has admin role
- Returns session data (access_token, refresh_token)

## Frontend Changes

### `AuthModal.tsx` — Complete Rewrite
Two-step flow with Framer Motion transitions:

**Step 1 — Phone Input:**
- +91 prefix (fixed for India)
- 10-digit phone number input
- "Send OTP" button
- Premium minimal design matching existing brand

**Step 2 — OTP Verification:**
- 6 auto-focus OTP input boxes (using existing `input-otp` component)
- Auto-submit on last digit
- 30-second countdown timer for resend
- "Change number" link to go back
- On success: close modal, toast welcome, redirect admin to `/admin`

Remove: email/password fields, Google OAuth, forgot password link, signup form.

### `AdminLogin.tsx` — Rewrite
Same OTP flow but with admin-specific UI:
- "Admin Access" header with shield icon
- Phone input (server validates against whitelist)
- OTP verification
- Redirect to `/admin` on success

### `Navbar.tsx` — Minor Updates
- User menu shows phone number instead of email
- Remove email-related display logic

### `App.tsx` — Add Inactivity Timer
- 30-minute idle timeout using mouse/keyboard event listeners
- Auto sign-out and toast notification on timeout

## File Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/send-otp/index.ts` |
| Create | `supabase/functions/verify-otp/index.ts` |
| Create | 1 database migration (otp_requests + admin_phones) |
| Rewrite | `src/components/AuthModal.tsx` |
| Rewrite | `src/pages/admin/AdminLogin.tsx` |
| Update | `src/components/Navbar.tsx` |
| Update | `src/App.tsx` |

## Note on SMS Integration
The edge functions will log the OTP to console for testing. Once you provide the Twilio API connection, we'll wire up actual SMS delivery through the connector gateway.

