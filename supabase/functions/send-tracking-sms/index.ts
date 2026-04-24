import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, tracking_number, courier_name, tracking_url } = await req.json();

    if (!order_id || !tracking_number) {
      return new Response(
        JSON.stringify({ success: false, error: "order_id and tracking_number are required" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: order } = await supabase
      .from("orders")
      .select("customer_phone, customer_name, id")
      .eq("id", order_id)
      .maybeSingle();

    if (!order?.customer_phone) {
      return new Response(
        JSON.stringify({ success: false, error: "No customer phone on order" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("SMSALERT_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "SMS not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanPhone = String(order.customer_phone).replace(/^\+/, "").replace(/\s|-/g, "");
    const orderShort = order.id.slice(0, 8).toUpperCase();
    const courierBit = courier_name ? ` via ${courier_name}` : "";
    const linkBit = tracking_url ? ` Track: ${tracking_url}` : "";
    const text = `Hi ${order.customer_name || "Customer"}, your PUTUL order #${orderShort} is shipped${courierBit}. Tracking: ${tracking_number}.${linkBit}`;

    const url = new URL("https://www.smsalert.co.in/api/push.json");
    url.searchParams.set("apikey", apiKey);
    url.searchParams.set("sender", "PUTULF");
    url.searchParams.set("mobileno", cleanPhone);
    url.searchParams.set("text", text);

    const r = await fetch(url.toString(), { method: "POST" });
    const result = await r.text();
    console.log(`[tracking-sms] order=${order_id} phone=${cleanPhone} resp=${result}`);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("send-tracking-sms error:", msg);
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
