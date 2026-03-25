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
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find the latest non-verified, non-expired OTP for this phone
    const now = new Date().toISOString();
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_requests")
      .select("*")
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

    // Check max attempts
    if (otpRecord.attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Too many failed attempts. Please request a new OTP." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Wrong OTP — increment attempts
    if (otpRecord.otp_code !== otp_code) {
      await supabase
        .from("otp_requests")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      const remaining = 4 - otpRecord.attempts;
      return new Response(
        JSON.stringify({ error: `Invalid OTP. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // OTP is correct — mark as verified
    await supabase
      .from("otp_requests")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Check if user exists by phone in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("phone", phone)
      .maybeSingle();

    let userId: string;
    const dummyEmail = `${phone.replace("+", "")}@phone.putul.app`;
    const dummyPassword = crypto.randomUUID();

    if (existingProfile) {
      // Existing user — sign in
      userId = existingProfile.user_id;

      // Update password to a known value, then sign in
      await supabase.auth.admin.updateUserById(userId, { password: dummyPassword });

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (signInError) {
        // Try updating email too in case it doesn't match
        await supabase.auth.admin.updateUserById(userId, { email: dummyEmail, password: dummyPassword });
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password: dummyPassword,
        });

        if (retryError) {
          console.error("Sign in failed:", retryError);
          return new Response(
            JSON.stringify({ error: "Authentication failed. Please try again." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            session: retryData.session,
            is_new_user: false,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check/assign admin role if needed
      if (is_admin) {
        const { data: adminPhone } = await supabase
          .from("admin_phones")
          .select("phone")
          .eq("phone", phone)
          .maybeSingle();

        if (!adminPhone) {
          await supabase.auth.admin.signOut(signInData.session!.access_token);
          return new Response(
            JSON.stringify({ error: "Access denied. Admin privileges required." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Auto-assign admin role if not already present
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();

        if (!existingRole) {
          await supabase
            .from("user_roles")
            .insert({ user_id: userId, role: "admin" });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          session: signInData.session,
          is_new_user: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // New user — create account
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: dummyEmail,
        password: dummyPassword,
        email_confirm: true,
        user_metadata: { display_name: phone, phone },
      });

      if (createError) {
        console.error("Create user failed:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create account. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = newUser.user.id;

      // Update profile with phone
      await supabase
        .from("profiles")
        .update({ phone, display_name: phone })
        .eq("user_id", userId);

      // Sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: dummyPassword,
      });

      if (signInError) {
        console.error("New user sign in failed:", signInError);
        return new Response(
          JSON.stringify({ error: "Account created but sign-in failed. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (is_admin) {
        const { data: adminPhone } = await supabase
          .from("admin_phones")
          .select("phone")
          .eq("phone", phone)
          .maybeSingle();

        if (!adminPhone) {
          await supabase.auth.admin.signOut(signInData.session!.access_token);
          return new Response(
            JSON.stringify({ error: "Access denied. Admin privileges required." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Auto-assign admin role to new user
        await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });
      }

      return new Response(
        JSON.stringify({
          success: true,
          session: signInData.session,
          is_new_user: true,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("verify-otp error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
