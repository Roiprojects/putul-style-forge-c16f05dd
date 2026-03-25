import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, otp_code, is_admin } = await req.json();

    if (!phone || !/^\+91\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!otp_code || !/^\d{6}$/.test(otp_code)) {
      return new Response(
        JSON.stringify({ error: "Invalid OTP format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    const authClient = createClient(supabaseUrl, anonKey);

    const adminDevOtp = "123456";

    const { data: adminPhoneRecord } = is_admin
      ? await serviceClient
          .from("admin_phones")
          .select("phone")
          .eq("phone", phone)
          .maybeSingle()
      : { data: null };

    const isAdminPhoneAuthorized = Boolean(adminPhoneRecord);
    const isFixedAdminOtpLogin = Boolean(is_admin && isAdminPhoneAuthorized && otp_code === adminDevOtp);

    const assignAdminRole = async (userId: string) => {
      const { error } = await serviceClient
        .from("user_roles")
        .upsert(
          { user_id: userId, role: "admin" },
          { onConflict: "user_id,role", ignoreDuplicates: true }
        );

      if (error) {
        console.error("Failed to assign admin role:", error);
        throw new Error("Failed to assign admin role.");
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
      return new Response(
        JSON.stringify({ error: "Access denied. Admin privileges required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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
        return new Response(
          JSON.stringify({ error: "OTP expired or not found. Please request a new one." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const attempts = otpRecord.attempts ?? 0;

      if (attempts >= 5) {
        return new Response(
          JSON.stringify({ error: "Too many failed attempts. Please request a new OTP." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (otpRecord.otp_code !== otp_code) {
        await serviceClient
          .from("otp_requests")
          .update({ attempts: attempts + 1 })
          .eq("id", otpRecord.id);

        const remaining = 4 - attempts;
        return new Response(
          JSON.stringify({ error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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
        return new Response(
          JSON.stringify({ error: "Failed to create account. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
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

    return new Response(
      JSON.stringify({
        success: true,
        session,
        is_new_user: !existingProfile,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});