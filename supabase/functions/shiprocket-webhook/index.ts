import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STATUS_MAP: Record<string, string> = {
  "6": "shipped",
  "7": "delivered",
  "8": "cancelled",
  "17": "shipped", // out for delivery
  "18": "shipped", // in transit
  "19": "shipped", // out for delivery
  "9": "cancelled", // RTO
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Shiprocket webhook received:", JSON.stringify(payload));

    const {
      order_id,
      current_status_id,
      current_status,
      awb,
      courier_name,
      shipment_id,
    } = payload;

    if (!order_id) {
      return new Response(JSON.stringify({ error: "No order_id in webhook" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Find order by shiprocket_order_id
    const { data: orders } = await supabase
      .from("orders")
      .select("id")
      .eq("shiprocket_order_id", String(order_id));

    if (!orders || orders.length === 0) {
      return new Response(JSON.stringify({ error: "Order not found for shiprocket_order_id: " + order_id }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updateData: any = {};

    // Map Shiprocket status to our status
    const mappedStatus = STATUS_MAP[String(current_status_id)];
    if (mappedStatus) {
      updateData.status = mappedStatus;
    }

    if (awb) updateData.awb_code = awb;
    if (courier_name) updateData.courier_name = courier_name;
    if (shipment_id) updateData.shiprocket_shipment_id = String(shipment_id);

    if (Object.keys(updateData).length > 0) {
      await supabase.from("orders").update(updateData).eq("id", orders[0].id);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
