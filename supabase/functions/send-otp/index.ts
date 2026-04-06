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

    if (!phone || typeof phone !== "string" || !/^\+\d{1,4}\d{4,14}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format." }),
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

    // Check if admin phone (use fixed OTP for testing)
    const { data: isAdminPhone } = await supabase
      .from("admin_phones")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    // Generate random 6-digit OTP (fixed for admin phones in dev)
    const otpCode = isAdminPhone
      ? "123456"
      : String(Math.floor(100000 + Math.random() * 900000));

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

    // Send SMS via Authkey (skip for admin test numbers)
    if (!isAdminPhone) {
      const authkeyApiKey = Deno.env.get("AUTHKEY_API_KEY");
      if (!authkeyApiKey) {
        console.error("AUTHKEY_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "SMS service not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract country code and mobile number from phone string like +919876543210
      const countryCodeMatch = phone.match(/^\+(\d{1,4})(\d{4,14})$/);
      if (!countryCodeMatch) {
        return new Response(
          JSON.stringify({ error: "Invalid phone format." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const countryCode = countryCodeMatch[1];
      const mobileNumber = countryCodeMatch[2];
      const senderId = "PUTULF";
      const dltTemplateId = "100729198774591805604";

      const smsMessage = `Your Account verification code is ${otpCode} for PUTUL`;

      const authkeyUrl = new URL("https://api.authkey.io/request");
      authkeyUrl.searchParams.set("authkey", authkeyApiKey);
      authkeyUrl.searchParams.set("mobile", mobileNumber);
      authkeyUrl.searchParams.set("country_code", countryCode);
      authkeyUrl.searchParams.set("sms", smsMessage);
      authkeyUrl.searchParams.set("sender", senderId);
      authkeyUrl.searchParams.set("pe_id", "");
      authkeyUrl.searchParams.set("template_id", dltTemplateId);

      try {
        const smsResponse = await fetch(authkeyUrl.toString());
        const smsResult = await smsResponse.text();
        console.log(`[Authkey SMS] Phone: ${mobileNumber}, Response: ${smsResult}`);

        if (!smsResponse.ok) {
          console.error("Authkey SMS failed:", smsResult);
          return new Response(
            JSON.stringify({ error: "Failed to send OTP. Please try again." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (smsError) {
        console.error("Authkey SMS error:", smsError);
        return new Response(
          JSON.stringify({ error: "SMS service unavailable. Please try again." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      console.log(`[OTP] Admin test phone: ${phone}, Code: ${otpCode}`);
    }

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
