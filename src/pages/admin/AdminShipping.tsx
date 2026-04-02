import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const emptyZone = {
  name: "", states: "", base_charge: 0,
  free_shipping_threshold: null as number | null,
  estimated_days_min: 3, estimated_days_max: 7, is_active: true,
};

const AdminShipping = () => {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyZone });

  const fetch = async () => {
    const { data, error } = await supabase.from("shipping_zones").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setZones(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...emptyZone }); setShowForm(true); };
  const openEdit = (z: any) => {
    setEditing(z);
    setForm({
      name: z.name, states: (z.states ?? []).join(", "), base_charge: z.base_charge,
      free_shipping_threshold: z.free_shipping_threshold,
      estimated_days_min: z.estimated_days_min, estimated_days_max: z.estimated_days_max, is_active: z.is_active,
    });
    setShowForm(true);
  };

  const save = async () => {
    const payload: any = {
      name: form.name.trim(),
      states: form.states.split(",").map((s: string) => s.trim()).filter(Boolean),
      base_charge: Number(form.base_charge),
      free_shipping_threshold: form.free_shipping_threshold ? Number(form.free_shipping_threshold) : null,
      estimated_days_min: Number(form.estimated_days_min),
      estimated_days_max: Number(form.estimated_days_max),
      is_active: form.is_active,
    };
    if (!payload.name) { toast.error("Name is required"); return; }

    const { error } = editing
      ? await supabase.from("shipping_zones").update(payload).eq("id", editing.id)
      : await supabase.from("shipping_zones").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(editing ? "Zone updated" : "Zone created"); setShowForm(false); fetch(); }
  };

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const remove = (id: string) => {
    setDeleteTarget(id);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("shipping_zones").delete().eq("id", deleteTarget);
    if (error) toast.error(error.message);
    else { toast.success("Deleted"); fetch(); }
    setDeleteTarget(null);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Shipping Zones</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage delivery zones and charges</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
          <Plus size={16} /> Add Zone
        </button>
      </div>

      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-accent/50">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Zone</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">States</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Charge</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Free Above</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Delivery</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">Loading...</td></tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-muted-foreground">No shipping zones</td></tr>
              ) : (
                zones.map((z) => (
                  <tr key={z.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium">{z.name}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{(z.states ?? []).join(", ")}</td>
                    <td className="px-5 py-3 text-sm font-medium">₹{Number(z.base_charge).toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm">{z.free_shipping_threshold ? `₹${Number(z.free_shipping_threshold).toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-3 text-sm">{z.estimated_days_min}–{z.estimated_days_max} days</td>
                    <td className="px-5 py-3">
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${z.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {z.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(z)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => remove(z.id)} className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
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
              className="bg-background w-full max-w-md rounded-xl border border-border p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">{editing ? "Edit Zone" : "New Zone"}</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">Zone Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="South India" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">States (comma separated)</label>
                  <input value={form.states} onChange={(e) => setForm({ ...form, states: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Tamil Nadu, Kerala, Karnataka" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Base Charge (₹)</label>
                    <input type="number" value={form.base_charge} onChange={(e) => setForm({ ...form, base_charge: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Free Above (₹)</label>
                    <input type="number" value={form.free_shipping_threshold ?? ""} onChange={(e) => setForm({ ...form, free_shipping_threshold: e.target.value ? Number(e.target.value) : null })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Optional" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Min Days</label>
                    <input type="number" value={form.estimated_days_min} onChange={(e) => setForm({ ...form, estimated_days_min: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">Max Days</label>
                    <input type="number" value={form.estimated_days_max} onChange={(e) => setForm({ ...form, estimated_days_max: Number(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-ring" />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                  Active
                </label>
                <button onClick={save} className="w-full py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors">
                  {editing ? "Update Zone" : "Create Zone"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminShipping;
