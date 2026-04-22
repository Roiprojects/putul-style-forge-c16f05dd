import { Link } from "react-router-dom";
import { Plus, Tag, Printer, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const exportTodaysOrdersCSV = async () => {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from("orders")
    .select("id, created_at, customer_name, customer_email, customer_phone, status, payment_method, payment_status, subtotal, shipping_cost, discount, total, shipping_address")
    .gte("created_at", today.toISOString())
    .order("created_at", { ascending: false });
  if (error) { toast.error(error.message); return; }
  if (!data || data.length === 0) { toast.info("No orders today to export"); return; }
  const headers = Object.keys(data[0]);
  const rows = [headers.join(",")];
  data.forEach((o: any) => {
    rows.push(headers.map((h) => {
      const v = o[h] == null ? "" : String(o[h]).replace(/"/g, '""');
      return `"${v}"`;
    }).join(","));
  });
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `orders-${today.toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} orders`);
};

const printPendingLabels = async () => {
  const { data } = await supabase.from("orders").select("shipping_label_url").eq("status", "confirmed").not("shipping_label_url", "is", null).limit(50);
  const urls = (data || []).map((o: any) => o.shipping_label_url).filter(Boolean);
  if (urls.length === 0) { toast.info("No pending labels found"); return; }
  urls.forEach((u: string) => window.open(u, "_blank"));
  toast.success(`Opened ${urls.length} labels`);
};

const QuickActionsBar = () => {
  return (
    <div className="flex flex-wrap gap-2">
      <Link to="/admin/products/new" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
        <Plus size={13} /> New product
      </Link>
      <Link to="/admin/coupons" className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">
        <Tag size={13} /> New coupon
      </Link>
      <button onClick={printPendingLabels} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">
        <Printer size={13} /> Print pending labels
      </button>
      <button onClick={exportTodaysOrdersCSV} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors">
        <Download size={13} /> Export today's orders
      </button>
    </div>
  );
};

export default QuickActionsBar;
