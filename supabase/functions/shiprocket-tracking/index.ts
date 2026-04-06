import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "@supabase/supabase-js/cors";

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
    const { shipment_id, awb_code } = await req.json();

    if (!shipment_id && !awb_code) {
      return new Response(JSON.stringify({ error: "shipment_id or awb_code required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();

    let url: string;
    if (awb_code) {
      url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb_code}`;
    } else {
      url = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipment_id}`;
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "Tracking failed", details: data }), {
        status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normalize tracking data
    const trackingData = data.tracking_data || data;
    const activities = trackingData?.shipment_track_activities || trackingData?.track_activities || [];
    const currentStatus = trackingData?.shipment_status || trackingData?.current_status || "";
    const trackUrl = trackingData?.track_url || "";

    return new Response(JSON.stringify({
      status: currentStatus,
      track_url: trackUrl,
      activities: activities.map((a: any) => ({
        date: a.date,
        activity: a.activity || a["sr-status-label"] || "",
        location: a.location || "",
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
