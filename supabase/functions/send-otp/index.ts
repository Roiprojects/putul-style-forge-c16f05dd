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
    const { phone, is_admin } = await req.json();

    if (!phone || typeof phone !== "string" || !/^\+91\d{10}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number. Use +91XXXXXXXXXX format." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // If admin login, check whitelist
    if (is_admin) {
      const { data: adminPhone } = await supabase
        .from("admin_phones")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (!adminPhone) {
        return new Response(
          JSON.stringify({ error: "This number is not authorized for admin access." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Rate limit: max 3 OTPs per phone in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentOtps } = await supabase
      .from("otp_requests")
      .select("id")
      .eq("phone", phone)
      .gte("created_at", tenMinutesAgo);

    if (recentOtps && recentOtps.length >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use fixed OTP for admin numbers during development
    const { data: isAdminPhone } = await supabase
      .from("admin_phones")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    const otpCode = isAdminPhone ? "123456" : String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Store OTP
    const { error: insertError } = await supabase.from("otp_requests").insert({
      phone,
      otp_code: otpCode,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Failed to store OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // TODO: Replace with actual SMS API (Twilio gateway) when connected
    console.log(`[OTP] Phone: ${phone}, Code: ${otpCode}`);

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully." }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
