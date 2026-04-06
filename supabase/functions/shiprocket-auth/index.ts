import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = Date.now();
    // Token valid for 10 days, refresh 1 day before expiry
    if (cachedToken && tokenExpiry > now + 86400000) {
      return new Response(JSON.stringify({ token: cachedToken }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const email = Deno.env.get("SHIPROCKET_EMAIL");
    const password = Deno.env.get("SHIPROCKET_PASSWORD");

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Shiprocket credentials not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.token) {
      return new Response(JSON.stringify({ error: "Shiprocket auth failed", details: data }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    cachedToken = data.token;
    tokenExpiry = now + 10 * 24 * 60 * 60 * 1000; // 10 days

    return new Response(JSON.stringify({ token: data.token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
