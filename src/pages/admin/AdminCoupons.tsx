import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const emptyCoupon = {
  code: "", discount_type: "percentage", discount_value: 0,
  min_order: 0, max_discount: null as number | null, usage_limit: null as number | null,
  expiry_date: "", is_active: true,
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyCoupon });

  const fetch = async () => {
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setCoupons(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...emptyCoupon }); setShowForm(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: c.discount_value,
      min_order: c.min_order ?? 0, max_discount: c.max_discount, usage_limit: c.usage_limit,
      expiry_date: c.expiry_date ? new Date(c.expiry_date).toISOString().slice(0, 10) : "",
      is_active: c.is_active,
    });
    setShowForm(true);
  };

  const save = async () => {
    const payload: any = {
      code: form.code.toUpperCase().trim(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order: Number(form.min_order) || 0,
      max_discount: form.max_discount ? Number(form.max_discount) : null,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expiry_date: form.expiry_date ? new Date(form.expiry_date).toISOString() : null,
      is_active: form.is_active,
    };
    if (!payload.code) { toast.error("Code is required"); return; }

    const { error } = editing
      ? await supabase.from("coupons").update(payload).eq("id", editing.id)
      : await supabase.from("coupons").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Coupon updated" : "Coupon created"); setShowForm(false); fetch(); }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetch(); }
  };

  const toggleActive = async (c: any) => {
    const { error } = await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    if (error) toast.error(error.message);
    else fetch();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Coupons & Offers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage discount codes</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Discount</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Min Order</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Usage</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Expiry</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : coupons.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No coupons yet</td></tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-mono font-medium">{c.code}</td>
                    <td className="px-5 py-3 text-sm">
                      {c.discount_type === "percentage" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                      {c.max_discount && <span className="text-muted-foreground text-[11px]"> (max ₹{c.max_discount})</span>}
                    </td>
                    <td className="px-5 py-3 text-sm">₹{Number(c.min_order).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">{c.used_count}{c.usage_limit ? `/${c.usage_limit}` : ""}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">
                      {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "No expiry"}
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => toggleActive(c)} className={`text-[11px] font-medium px-2 py-1 rounded-full ${c.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {c.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => remove(c.id)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-background w-full max-w-md rounded-xl border border-border p-6 max-h-[85vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">{editing ? "Edit Coupon" : "New Coupon"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Code</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring font-mono uppercase" placeholder="SUMMER20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Type</label>
                    <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="percentage">Percentage</option>
                      <option value="flat">Flat Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Value</label>
                    <input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Min Order (₹)</label>
                    <input type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Max Discount (₹)</label>
                    <input type="number" value={form.max_discount ?? ""} onChange={(e) => setForm({ ...form, max_discount: e.target.value ? Number(e.target.value) : null })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Usage Limit</label>
                    <input type="number" value={form.usage_limit ?? ""} onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Expiry Date</label>
                    <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
                <button onClick={save} className="w-full py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
                  {editing ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCoupons;
