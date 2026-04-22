import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const expectedError = (message: string) => jsonResponse({ success: false, error: message }, 200);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp_code, is_admin } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return expectedError("Invalid phone number.");
    }

    if (!otp_code || !/^\d{6}$/.test(otp_code)) {
      return expectedError("Invalid OTP format.");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const authClient = createClient(supabaseUrl, anonKey);

    const { data: adminPhoneRecord } = is_admin
      ? await serviceClient
          .from("admin_phones")
          .select("phone")
          .eq("phone", phone)
          .maybeSingle()
      : { data: null };

    const isAdminPhoneAuthorized = Boolean(adminPhoneRecord);

    const assignAdminRole = async (userId: string) => {
      const { data: existingRole, error: roleLookupError } = await serviceClient
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (roleLookupError) {
        console.error("Failed to lookup admin role:", roleLookupError);
        throw new Error("Failed to verify admin role.");
      }

      if (!existingRole) {
        const { error: insertError } = await serviceClient
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (insertError) {
          console.error("Failed to assign admin role:", insertError);
          throw new Error("Failed to assign admin role.");
        }
      }
    };

    const signInWithDummyCredentials = async (userId: string, email: string, password: string) => {
      await serviceClient.auth.admin.updateUserById(userId, { password });

      let { data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session) {
        return data.session;
      }

      await serviceClient.auth.admin.updateUserById(userId, { email, password });
      ({ data, error } = await authClient.auth.signInWithPassword({
        email,
        password,
      }));

      if (error || !data.session) {
        console.error("Sign in failed:", error);
        throw new Error("Authentication failed. Please try again.");
      }

      return data.session;
    };

    if (is_admin && !isAdminPhoneAuthorized) {
      return expectedError("Access denied. Admin privileges required.");
    }

    if (!isFixedAdminOtpLogin) {
      const now = new Date().toISOString();
      const { data: otpRecord, error: otpError } = await serviceClient
        .from("otp_requests")
        .select("id, attempts, otp_code")
        .eq("phone", phone)
        .eq("verified", false)
        .gte("expires_at", now)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (otpError || !otpRecord) {
        return expectedError("OTP expired or not found. Please request a new one.");
      }

      const attempts = otpRecord.attempts ?? 0;

      if (attempts >= 5) {
        return expectedError("Too many failed attempts. Please request a new OTP.");
      }

      if (otpRecord.otp_code !== otp_code) {
        await serviceClient
          .from("otp_requests")
          .update({ attempts: attempts + 1 })
          .eq("id", otpRecord.id);

        const remaining = 4 - attempts;
        return expectedError(`Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`);
      }

      await serviceClient
        .from("otp_requests")
        .update({ verified: true })
        .eq("id", otpRecord.id);
    }

    const { data: existingProfile } = await serviceClient
      .from("profiles")
      .select("user_id")
      .eq("phone", phone)
      .maybeSingle();

    const dummyEmail = `${phone.replace("+", "")}@phone.putul.app`;
    const dummyPassword = crypto.randomUUID();

    let userId: string;
    let session;

    if (existingProfile) {
      userId = existingProfile.user_id;
      session = await signInWithDummyCredentials(userId, dummyEmail, dummyPassword);
    } else {
      const { data: newUser, error: createError } = await serviceClient.auth.admin.createUser({
        email: dummyEmail,
        password: dummyPassword,
        email_confirm: true,
        user_metadata: { display_name: phone, phone },
      });

      if (createError || !newUser.user) {
        console.error("Create user failed:", createError);
        return jsonResponse({ error: "Failed to create account. Please try again." }, 500);
      }

      userId = newUser.user.id;

      const { error: profileError } = await serviceClient
        .from("profiles")
        .upsert({ user_id: userId, phone, display_name: phone }, { onConflict: "user_id" });

      if (profileError) {
        console.error("Failed to upsert profile:", profileError);
      }

      session = await signInWithDummyCredentials(userId, dummyEmail, dummyPassword);
    }

    if (is_admin && isAdminPhoneAuthorized) {
      await assignAdminRole(userId);
    }

    return jsonResponse({
      success: true,
      session,
      is_new_user: !existingProfile,
    });
  } catch (error) {
    console.error("verify-otp error:", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});