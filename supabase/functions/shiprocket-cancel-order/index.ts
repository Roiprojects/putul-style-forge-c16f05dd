import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-flight lock: prevents duplicate concurrent cancel calls for the same order
const inFlight = new Map<string, Promise<Response>>();

// Detects "already cancelled" responses from Shiprocket so we can treat them as success
const isAlreadyCancelled = (status: number, data: any): boolean => {
  if (!data) return false;
  const msg = JSON.stringify(data).toLowerCase();
  return (
    msg.includes("already cancel") ||
    msg.includes("already canceled") ||
    msg.includes("already in cancelled") ||
    msg.includes("cannot be cancelled") ||
    msg.includes("order is cancel") ||
    msg.includes("shipment is cancel") ||
    msg.includes("returned") && msg.includes("cancel")
  );
};

async function handleCancel(order_id: string): Promise<Response> {
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

  // Idempotency: already cancelled locally — short-circuit
  if (order.status === "cancelled") {
    return new Response(
      JSON.stringify({ success: true, idempotent: true, message: "Order already cancelled" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!order.shiprocket_order_id) {
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

  // Pre-check: ask Shiprocket for current status; skip API calls if already cancelled/returned remotely
  let remoteAlreadyCancelled = false;
  try {
    const statusRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/orders/show/${order.shiprocket_order_id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (statusRes.ok) {
      const sd = await statusRes.json().catch(() => ({}));
      const remoteStatus = String(sd?.data?.status || sd?.status || "").toLowerCase();
      console.log(`Shiprocket remote status for order ${order.shiprocket_order_id}:`, remoteStatus);
      if (remoteStatus.includes("cancel") || remoteStatus.includes("rto") || remoteStatus === "returned") {
        remoteAlreadyCancelled = true;
      }
    }
  } catch (e) {
    console.log("Status pre-check failed (continuing):", e instanceof Error ? e.message : e);
  }

  if (remoteAlreadyCancelled) {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);
    return new Response(
      JSON.stringify({ success: true, idempotent: true, message: "Already cancelled in Shiprocket; local status synced" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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
        // Treat "already cancelled" as a successful idempotent outcome
        if (isAlreadyCancelled(lastStatus, lastData)) {
          return { status: lastStatus, data: { ...lastData, _already_cancelled: true }, attempts: attempt };
        }
        if (r.ok || !isTransient(r.status)) {
          return { status: lastStatus, data: lastData, attempts: attempt };
        }
      } catch (e) {
        lastErr = e instanceof Error ? e.message : "network error";
        lastStatus = 0;
        console.log(`Shiprocket ${label} attempt ${attempt} threw:`, lastErr);
      }
      if (attempt < MAX_ATTEMPTS) {
        await sleep(500 * Math.pow(2, attempt - 1));
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

  // Update local order (covers both fresh cancel and "already cancelled" cases)
  await supabase.from("orders").update({ status: "cancelled" }).eq("id", order_id);

  return new Response(
    JSON.stringify({
      success: true,
      shiprocket_order_cancel: orderCancelData,
      shiprocket_awb_cancel: srResponse,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

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

    // Idempotency lock: coalesce concurrent requests for the same order
    const existing = inFlight.get(order_id);
    if (existing) {
      console.log(`Coalescing in-flight cancel for order ${order_id}`);
      const res = await existing;
      // Clone so the body can be read again
      return new Response(res.clone().body, { status: res.status, headers: res.headers });
    }

    const promise = handleCancel(order_id).finally(() => {
      // Release lock after a short delay to absorb immediate retries
      setTimeout(() => inFlight.delete(order_id), 2000);
    });
    inFlight.set(order_id, promise);
    return await promise;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("Cancel error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
