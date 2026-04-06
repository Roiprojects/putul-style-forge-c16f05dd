import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

async function getToken(): Promise<string> {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_ANON_KEY")!;
  const res = await fetch(`${url}/functions/v1/shiprocket-auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
  });
  const data = await res.json();
  if (!data.token) throw new Error("Failed to get Shiprocket token");
  return data.token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { pickup_pincode, delivery_pincode, weight = 0.5, cod = false } = await req.json();

    if (!pickup_pincode || !delivery_pincode) {
      return new Response(JSON.stringify({ error: "pickup_pincode and delivery_pincode required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();

    const params = new URLSearchParams({
      pickup_postcode: pickup_pincode,
      delivery_postcode: delivery_pincode,
      weight: String(weight),
      cod: cod ? "1" : "0",
    });

    const res = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params}`,
      {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Serviceability check failed", details: data }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract and simplify courier options
    const couriers = (data.data?.available_courier_companies || []).map((c: any) => ({
      id: c.courier_company_id,
      name: c.courier_name,
      rate: c.rate,
      etd: c.etd,
      estimated_days: c.estimated_delivery_days,
      cod: c.cod,
      rating: c.rating,
    }));

    // Auto-select best (cheapest with good rating)
    const best = couriers.sort((a: any, b: any) => a.rate - b.rate)[0] || null;

    return new Response(JSON.stringify({ couriers, recommended: best }), {
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
