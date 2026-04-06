import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
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
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch order + items
    const { data: order, error: orderErr } = await supabase.from("orders").select("*").eq("id", order_id).single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order_id);

    // Parse shipping address
    const addressParts = (order.shipping_address || "").split(",").map((s: string) => s.trim());
    const pincode = addressParts.find((p: string) => /^\d{6}$/.test(p)) || "";
    const state = addressParts[addressParts.length - 2] || "";
    const city = addressParts[addressParts.length - 3] || "";

    const token = await getToken();

    const shiprocketOrder = {
      order_id: order.id.slice(0, 20),
      order_date: new Date(order.created_at).toISOString().split("T")[0],
      pickup_location: "Primary",
      billing_customer_name: order.customer_name.split(" ")[0] || order.customer_name,
      billing_last_name: order.customer_name.split(" ").slice(1).join(" ") || "",
      billing_address: addressParts.slice(0, 2).join(", ") || order.shipping_address || "",
      billing_city: city,
      billing_pincode: pincode,
      billing_state: state,
      billing_country: "India",
      billing_email: order.customer_email,
      billing_phone: order.customer_phone || "",
      shipping_is_billing: true,
      order_items: (items || []).map((item: any) => ({
        name: item.product_name,
        sku: item.product_id || `SKU-${item.id.slice(0, 8)}`,
        units: item.quantity,
        selling_price: Number(item.unit_price),
        discount: 0,
        tax: 0,
      })),
      payment_method: order.payment_method?.toLowerCase().includes("cod") ? "COD" : "Prepaid",
      sub_total: Number(order.total),
      length: 25,
      breadth: 20,
      height: 10,
      weight: 0.5,
    };

    // Create order in Shiprocket
    const createRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(shiprocketOrder),
    });

    const createData = await createRes.json();

    if (!createRes.ok || !createData.order_id) {
      return new Response(JSON.stringify({ error: "Failed to create Shiprocket order", details: createData }), {
        status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order with Shiprocket data
    const updateData: any = {
      shiprocket_order_id: String(createData.order_id),
      shiprocket_shipment_id: createData.shipment_id ? String(createData.shipment_id) : null,
    };

    // If AWB is assigned directly
    if (createData.awb_code) {
      updateData.awb_code = createData.awb_code;
      updateData.courier_name = createData.courier_name || null;
    }

    await supabase.from("orders").update(updateData).eq("id", order_id);

    return new Response(JSON.stringify({
      success: true,
      shiprocket_order_id: createData.order_id,
      shipment_id: createData.shipment_id,
      awb_code: createData.awb_code || null,
      courier_name: createData.courier_name || null,
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
