

## Fix OTP SMS: Switch from Authkey to SMSAlert

### Root Cause
The Authkey API returns `"Invalid authkey or insufficient balance"` for every request. The credentials are invalid or the account has no balance.

### Solution
Replace Authkey with SMSAlert API using the credentials and documentation you provided.

---

### Step 1: Store SMSAlert API Key as a secret
- Add `SMSALERT_API_KEY` with value `69cd0164ef347`

### Step 2: Update `supabase/functions/send-otp/index.ts`

Replace the Authkey SMS sending block with SMSAlert's `push.json` API:

```
POST https://www.smsalert.co.in/api/push.json
  ?apikey=SMSALERT_API_KEY
  &sender=PUTULF
  &mobileno=9876543210
  &text=Your Account verification code is 123456 for PUTUL
```

Key changes:
- Read `SMSALERT_API_KEY` instead of `AUTHKEY_API_KEY`
- Use SMSAlert `push.json` endpoint (not their `mverify.json`, since we manage OTP storage ourselves)
- Pass `mobileno` with country code prefix (e.g., `919876543210`)
- Pass `sender=PUTULF`
- Check response for `status: "success"` 
- Log the full response for debugging

### Step 3: No other files change
The verify-otp function, AuthModal, and AdminLogin remain unchanged — they already work correctly with the existing OTP storage in the database.

---

### Files Modified

| File | Change |
|------|--------|
| `supabase/functions/send-otp/index.ts` | Switch from Authkey to SMSAlert push.json API |

