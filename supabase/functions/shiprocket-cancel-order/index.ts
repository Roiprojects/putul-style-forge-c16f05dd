import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ success: false, error: "order_id required" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, shiprocket_order_id, awb_code, status")
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ success: false, error: "Order not found" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.shiprocket_order_id) {
      // No shipment created yet - just mark order cancelled locally
      await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);
      return new Response(JSON.stringify({ success: true, message: "No Shiprocket shipment to cancel" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get Shiprocket auth token
    const authRes = await fetch(`${supabaseUrl}/functions/v1/shiprocket-auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
    });
    const { token } = await authRes.json();
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Shiprocket auth failed" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If AWB exists, request a return/cancel shipment; otherwise cancel the order
    let srResponse: any = null;
    let srStatus = 0;

    if (order.awb_code) {
      // Cancel shipment by AWB
      const r = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ awbs: [order.awb_code] }),
      });
      srStatus = r.status;
      srResponse = await r.json().catch(() => ({}));
      console.log("Shiprocket AWB cancel:", srStatus, JSON.stringify(srResponse));
    }

    // Always also cancel the order itself
    const r2 = await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids: [Number(order.shiprocket_order_id)] }),
    });
    const orderCancelStatus = r2.status;
    const orderCancelData = await r2.json().catch(() => ({}));
    console.log("Shiprocket order cancel:", orderCancelStatus, JSON.stringify(orderCancelData));

    // Update local order regardless (Shiprocket sometimes returns 400 if already cancelled)
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);

    return new Response(
      JSON.stringify({
        success: true,
        shiprocket_order_cancel: orderCancelData,
        shiprocket_awb_cancel: srResponse,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Cancel error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
