

## Integrate Authkey SMS API for Real OTP Delivery

The project already has a complete OTP auth system (send-otp, verify-otp edge functions, AuthModal, AdminLogin). The only change needed is replacing the hardcoded dev OTPs with real SMS delivery via Authkey API.

---

### Step 1: Store Authkey API Key

Use `add_secret` to store `AUTHKEY_API_KEY` — the API key from your Authkey dashboard.

---

### Step 2: Update `send-otp` Edge Function

Current behavior: generates fixed OTPs (`123456` for admin, `000000` for others) and logs them to console.

New behavior:
- Generate a random 6-digit OTP for all users
- Keep fixed `123456` for admin phones only (dev/testing fallback)
- Call Authkey GET API to send the OTP SMS:

```
https://api.authkey.io/request?authkey=AUTHKEY&mobile=PHONE&country_code=91&sms=Your+OTP+is+CODE&sender=SENDERID
```

- Handle Authkey API response errors gracefully
- Continue storing OTP in `otp_requests` table as before

---

### Step 3: Phone Validation Update

Current `send-otp` only accepts `+91` format. Update to:
- Extract country code and number from the full phone string
- Pass correct `country_code` param to Authkey API
- Support international numbers already handled by the AuthModal country selector

---

### Step 4: No Frontend Changes Needed

The existing AuthModal and AdminLogin already handle:
- Phone input with country code selector
- 6-digit OTP entry with auto-submit
- Resend with 30s cooldown
- Rate limiting (3 OTPs per 10 min)
- Brute-force protection (5 max attempts)
- Error messages for all edge cases

---

### Files to Modify

| File | Change |
|------|--------|
| `supabase/functions/send-otp/index.ts` | Replace dummy OTP with random generation + Authkey SMS API call |

### What I Need From You

- Your **Authkey API Key** (will be stored securely as a secret)
- Your **Sender ID** registered on Authkey (e.g., `PUTUL` or similar)
- Whether you have a **DLT template ID** registered for OTP messages (required for Indian SMS)

