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

    // Retry helper: retries on network errors, 5xx, 408, 429 with exponential backoff
    const MAX_ATTEMPTS = 3;
    const isTransient = (status: number) => status === 0 || status === 408 || status === 429 || (status >= 500 && status < 600);
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const callWithRetry = async (label: string, url: string, body: any) => {
      let lastStatus = 0;
      let lastData: any = null;
      let lastErr: string | null = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          const r = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
          });
          lastStatus = r.status;
          lastData = await r.json().catch(() => ({}));
          console.log(`Shiprocket ${label} attempt ${attempt}:`, lastStatus, JSON.stringify(lastData));
          if (r.ok || !isTransient(r.status)) {
            return { status: lastStatus, data: lastData, attempts: attempt };
          }
        } catch (e) {
          lastErr = e instanceof Error ? e.message : "network error";
          lastStatus = 0;
          console.log(`Shiprocket ${label} attempt ${attempt} threw:`, lastErr);
        }
        if (attempt < MAX_ATTEMPTS) {
          await sleep(500 * Math.pow(2, attempt - 1)); // 500ms, 1000ms
        }
      }
      return { status: lastStatus, data: lastData ?? { error: lastErr }, attempts: MAX_ATTEMPTS };
    };

    // If AWB exists, cancel shipment by AWB
    let srResponse: any = null;
    if (order.awb_code) {
      const res = await callWithRetry(
        "AWB cancel",
        "https://apiv2.shiprocket.in/v1/external/orders/cancel/shipment/awbs",
        { awbs: [order.awb_code] }
      );
      srResponse = { ...res.data, _attempts: res.attempts };
    }

    // Always also cancel the order itself
    const orderCancel = await callWithRetry(
      "order cancel",
      "https://apiv2.shiprocket.in/v1/external/orders/cancel",
      { ids: [Number(order.shiprocket_order_id)] }
    );
    const orderCancelData = { ...orderCancel.data, _attempts: orderCancel.attempts };

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
