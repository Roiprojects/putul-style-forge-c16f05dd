import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { shipment_id, type = "label" } = await req.json();

    if (!shipment_id) {
      return new Response(JSON.stringify({ error: "shipment_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();

    let url: string;
    if (type === "invoice") {
      url = `https://apiv2.shiprocket.in/v1/external/orders/print/invoice`;
    } else {
      url = `https://apiv2.shiprocket.in/v1/external/courier/generate/label`;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ shipment_id: [Number(shipment_id)] }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Failed to generate " + type, details: data }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const labelUrl = data.label_url || data.invoice_url || data.label_created || null;

    return new Response(JSON.stringify({ url: labelUrl, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
