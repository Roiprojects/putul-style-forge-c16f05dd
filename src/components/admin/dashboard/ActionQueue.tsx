import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { XCircle, MessageSquare, PackageX, CreditCard, Inbox } from "lucide-react";

interface QueueItem {
  id: string;
  type: "cancellation" | "review" | "low_stock" | "payment_pending" | "cod_pending";
  title: string;
  subtitle: string;
  href: string;
  ts: string;
}

const ICON: Record<QueueItem["type"], any> = {
  cancellation: XCircle,
  review: MessageSquare,
  low_stock: PackageX,
  payment_pending: CreditCard,
  cod_pending: CreditCard,
};

const COLOR: Record<QueueItem["type"], string> = {
  cancellation: "text-red-600 bg-red-50",
  review: "text-amber-600 bg-amber-50",
  low_stock: "text-orange-600 bg-orange-50",
  payment_pending: "text-blue-600 bg-blue-50",
  cod_pending: "text-purple-600 bg-purple-50",
};

const ActionQueue = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const [cancels, reviews, lowStock, paymentsPending, codPending] = await Promise.all([
      supabase.from("cancellation_requests").select("id, reason, request_type, created_at, order_id").eq("status", "pending").neq("request_type", "direct_cancel").order("created_at", { ascending: false }).limit(10),
      supabase.from("reviews").select("id, author_name, rating, comment, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
      supabase.from("admin_products").select("id, name, stock").lt("stock", 5).order("stock", { ascending: true }).limit(10),
      supabase.from("orders").select("id, customer_name, total, created_at").eq("payment_status", "pending").neq("payment_method", "cod").lt("created_at", twoHoursAgo).order("created_at", { ascending: false }).limit(10),
      supabase.from("orders").select("id, customer_name, total, created_at").eq("status", "pending").ilike("payment_method", "%cod%").order("created_at", { ascending: false }).limit(10),
    ]);

    const merged: QueueItem[] = [];
    (cancels.data || []).forEach((r: any) => merged.push({
      id: `c-${r.id}`, type: "cancellation", ts: r.created_at,
      title: `${r.request_type === "refund" ? "Refund" : r.request_type === "replacement" ? "Replacement" : "Cancellation"} request`,
      subtitle: `Order #${r.order_id.slice(0, 8).toUpperCase()} — ${r.reason}`,
      href: "/admin/cancellations",
    }));
    (reviews.data || []).forEach((r: any) => merged.push({
      id: `r-${r.id}`, type: "review", ts: r.created_at,
      title: `New ${r.rating}★ review pending approval`,
      subtitle: `${r.author_name}: ${(r.comment || "").slice(0, 60)}${(r.comment || "").length > 60 ? "…" : ""}`,
      href: "/admin/reviews",
    }));
    (lowStock.data || []).forEach((p: any) => merged.push({
      id: `s-${p.id}`, type: "low_stock", ts: new Date().toISOString(),
      title: p.stock === 0 ? "Out of stock" : `Low stock — ${p.stock} left`,
      subtitle: p.name,
      href: "/admin/inventory",
    }));
    (paymentsPending.data || []).forEach((o: any) => merged.push({
      id: `p-${o.id}`, type: "payment_pending", ts: o.created_at,
      title: `Online payment pending >2h`,
      subtitle: `${o.customer_name} — ₹${Number(o.total).toLocaleString("en-IN")}`,
      href: `/admin/orders`,
    }));
    (codPending.data || []).forEach((o: any) => merged.push({
      id: `cod-${o.id}`, type: "cod_pending", ts: o.created_at,
      title: `COD order awaiting confirmation`,
      subtitle: `${o.customer_name} — ₹${Number(o.total).toLocaleString("en-IN")}`,
      href: `/admin/orders`,
    }));

    merged.sort((a, b) => +new Date(b.ts) - +new Date(a.ts));
    setItems(merged);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("dash-action-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "cancellation_requests" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  return (
    <div className="bg-background rounded-xl border border-border">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2"><Inbox size={14} /> Action queue</h2>
        <span className="text-[11px] text-muted-foreground">{items.length} items need attention</span>
      </div>
      <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
        {loading ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">All clear 🎉 nothing requires action</p>
        ) : items.map((it) => {
          const Icon = ICON[it.type];
          return (
            <Link key={it.id} to={it.href} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className={`p-2 rounded-lg ${COLOR[it.type]}`}><Icon size={14} /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{it.title}</p>
                <p className="text-xs text-muted-foreground truncate">{it.subtitle}</p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(it.ts).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ActionQueue;
