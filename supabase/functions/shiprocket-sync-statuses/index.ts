import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Map Shiprocket status strings to our internal order statuses
function mapStatus(srStatus: string): string | null {
  const s = (srStatus || "").toLowerCase().trim();
  if (!s) return null;
  if (s.includes("deliver")) return "delivered";
  if (s.includes("rto") || s.includes("return")) return "cancelled";
  if (s.includes("cancel")) return "cancelled";
  if (
    s.includes("out for delivery") ||
    s.includes("in transit") ||
    s.includes("shipped") ||
    s.includes("picked up") ||
    s.includes("pickup")
  ) {
    return "shipped";
  }
  if (s.includes("ready") || s.includes("manifest") || s.includes("awb assigned")) {
    return "confirmed";
  }
  return null;
}

async function getToken(supabaseUrl: string): Promise<string | null> {
  try {
    const res = await fetch(`${supabaseUrl}/functions/v1/shiprocket-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
    });
    const data = await res.json();
    return data?.token ?? null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find orders that have a Shiprocket shipment and are still in flight
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, status, shiprocket_shipment_id, shiprocket_order_id, awb_code, courier_name, tracking_url")
      .not("shiprocket_shipment_id", "is", null)
      .not("status", "in", "(delivered,cancelled)")
      .limit(200);

    if (error) {
      console.error("Fetch orders failed:", error.message);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ success: true, synced: 0, message: "No active shipments" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken(supabaseUrl);
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Shiprocket auth failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updatedCount = 0;
    const results: any[] = [];

    for (const order of orders) {
      try {
        const url = order.awb_code
          ? `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${order.awb_code}`
          : `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${order.shiprocket_shipment_id}`;

        const r = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json().catch(() => ({}));

        // Shiprocket wraps shipment-tracking responses as { "<shipment_id>": { tracking_data: {...} } }
        // AWB-tracking responses come back as { tracking_data: {...} }
        let td: any = data?.tracking_data;
        if (!td && data && typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          if (firstKey && data[firstKey]?.tracking_data) {
            td = data[firstKey].tracking_data;
          }
        }
        td = td || data;
        const srStatus =
          td?.shipment_status_text ||
          td?.shipment_status ||
          td?.current_status ||
          td?.shipment_track?.[0]?.current_status ||
          "";
        const trackUrl = td?.track_url || order.tracking_url;
        const courier = td?.shipment_track?.[0]?.courier_name || order.courier_name;
        const awb = td?.shipment_track?.[0]?.awb_code || td?.awb || order.awb_code;

        const mapped = mapStatus(String(srStatus));
        const update: Record<string, any> = {};
        if (mapped && mapped !== order.status) update.status = mapped;
        if (trackUrl && trackUrl !== order.tracking_url) update.tracking_url = trackUrl;
        if (courier && courier !== order.courier_name) update.courier_name = courier;
        if (awb && awb !== order.awb_code) update.awb_code = awb;

        if (Object.keys(update).length > 0) {
          await supabase.from("orders").update(update).eq("id", order.id);
          updatedCount++;
          results.push({ order_id: order.id, sr_status: srStatus, mapped, update });
          console.log(`Synced order ${order.id}: ${order.status} -> ${mapped} (${srStatus})`);
        }
      } catch (e) {
        console.error(`Sync failed for order ${order.id}:`, e instanceof Error ? e.message : e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, checked: orders.length, synced: updatedCount, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Sync error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
