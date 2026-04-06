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

    // Send SMS via SMSAlert (skip for admin test numbers)
    if (!isAdminPhone) {
      const smsAlertApiKey = Deno.env.get("SMSALERT_API_KEY");
      if (!smsAlertApiKey) {
        console.error("SMSALERT_API_KEY not configured");
        return new Response(
          JSON.stringify({ error: "SMS service not configured." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Strip the '+' and send full number with country code (e.g. 919876543210)
      const cleanPhone = phone.replace(/^\+/, "");
      const smsMessage = `Your Account verification code is ${otpCode} for PUTUL`;

      const smsAlertUrl = new URL("https://www.smsalert.co.in/api/push.json");
      smsAlertUrl.searchParams.set("apikey", smsAlertApiKey);
      smsAlertUrl.searchParams.set("sender", "PUTULF");
      smsAlertUrl.searchParams.set("mobileno", cleanPhone);
      smsAlertUrl.searchParams.set("text", smsMessage);

      try {
        const smsResponse = await fetch(smsAlertUrl.toString(), { method: "POST" });
        const smsResult = await smsResponse.text();
        console.log(`[SMSAlert] Phone: ${cleanPhone}, Response: ${smsResult}`);

        // Parse response to check status
        try {
          const parsed = JSON.parse(smsResult);
          if (parsed.status !== "success") {
            console.error("SMSAlert failed:", smsResult);
            return new Response(
              JSON.stringify({ error: "Failed to send OTP. Please try again." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        } catch {
          console.error("SMSAlert non-JSON response:", smsResult);
          if (!smsResponse.ok) {
            return new Response(
              JSON.stringify({ error: "Failed to send OTP. Please try again." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (smsError) {
        console.error("SMSAlert error:", smsError);
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
