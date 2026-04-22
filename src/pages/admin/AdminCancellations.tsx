import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye } from "lucide-react";

interface Req {
  id: string;
  order_id: string;
  user_id: string;
  reason: string;
  reason_note: string | null;
  request_type: string;
  payment_method: string | null;
  refund_method: string | null;
  bank_name: string | null;
  account_holder: string | null;
  account_number: string | null;
  ifsc: string | null;
  upi_id: string | null;
  replacement_size: string | null;
  replacement_color: string | null;
  replacement_variant: string | null;
  replacement_note: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  orders?: { customer_name: string; customer_email: string; total: number } | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};

const AdminCancellations = () => {
  const [rows, setRows] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Req | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cancellation_requests")
      .select("*, orders(customer_name, customer_email, total)")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("cancellation_requests")
      .update({ status, admin_notes: adminNote || null })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    if (status === "approved") {
      const { data: cancelData, error: cancelErr } = await supabase.functions.invoke(
        "shiprocket-cancel-order",
        { body: { order_id: selected!.order_id } }
      );
      if (cancelErr || cancelData?.success === false) {
        toast.error("Shiprocket cancel failed: " + (cancelErr?.message || cancelData?.error || "Unknown"));
      } else {
        toast.success("Order cancelled & synced to Shiprocket");
      }
    } else {
      toast.success(`Request ${status}`);
    }
    setSelected(null);
    setAdminNote("");
    load();
  };

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Cancellation Requests</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and process customer cancellation, refund, and replacement requests.</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No requests found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">#{r.order_id.slice(0, 8).toUpperCase()}</td>
                <td className="px-4 py-3">{r.orders?.customer_name || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    r.request_type === "refund" ? "bg-blue-50 text-blue-700"
                      : r.request_type === "replacement" ? "bg-purple-50 text-purple-700"
                      : "bg-slate-100 text-slate-700"
                  }`}>
                    {r.request_type === "direct_cancel" ? "direct cancel" : r.request_type}
                  </span>
                </td>
                <td className="px-4 py-3 max-w-[180px] truncate" title={r.reason}>{r.reason}</td>
                <td className="px-4 py-3 text-xs">{r.payment_method || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${STATUS_BADGE[r.status] || ""}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setSelected(r); setAdminNote(r.admin_notes || ""); }}
                    className="inline-flex items-center gap-1 text-xs text-secondary hover:underline"
                  >
                    <Eye size={12} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cancellation Request</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Order ID" value={`#${selected.order_id.slice(0, 8).toUpperCase()}`} />
                <Field label="Customer" value={selected.orders?.customer_name || "—"} />
                <Field label="Type" value={selected.request_type} />
                <Field label="Payment" value={selected.payment_method || "—"} />
                <Field label="Status" value={selected.status} />
                <Field label="Created" value={new Date(selected.created_at).toLocaleString("en-IN")} />
              </div>
              <Field label="Reason" value={selected.reason} />
              {selected.reason_note && <Field label="Note" value={selected.reason_note} />}

              {selected.request_type === "refund" && (
                <div className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Refund Details</p>
                  <Field label="Method" value={selected.refund_method || "—"} />
                  {selected.refund_method === "bank" && (
                    <>
                      <Field label="Account Holder" value={selected.account_holder || "—"} />
                      <Field label="Account Number" value={selected.account_number || "—"} />
                      <Field label="IFSC" value={selected.ifsc || "—"} />
                      <Field label="Bank" value={selected.bank_name || "—"} />
                    </>
                  )}
                  {selected.refund_method === "upi" && <Field label="UPI ID" value={selected.upi_id || "—"} />}
                </div>
              )}

              {selected.request_type === "replacement" && (
                <div className="border border-border rounded-lg p-3 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Replacement Details</p>
                  {selected.replacement_variant && <Field label="Item" value={selected.replacement_variant} />}
                  {selected.replacement_size && <Field label="Size" value={selected.replacement_size} />}
                  {selected.replacement_color && <Field label="Color" value={selected.replacement_color} />}
                  {selected.replacement_note && <Field label="Note" value={selected.replacement_note} />}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">Admin notes</label>
                <Textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} className="mt-1" />
              </div>

              {selected.status === "pending" && (
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => updateStatus(selected.id, "rejected")}>Reject</Button>
                  <Button className="flex-1" onClick={() => updateStatus(selected.id, "approved")}>Approve</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium break-words">{value}</p>
  </div>
);

export default AdminCancellations;
