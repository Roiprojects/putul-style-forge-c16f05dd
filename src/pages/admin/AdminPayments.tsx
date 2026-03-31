import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPayments = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data, error } = await supabase.from("payment_settings").select("*").order("sort_order", { ascending: true });
    if (error) toast.error(error.message);
    else setMethods(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const channel = supabase
      .channel('admin-payments-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetch();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggle = async (m: any) => {
    const { error } = await supabase.from("payment_settings").update({ is_enabled: !m.is_enabled }).eq("id", m.id);
    if (error) toast.error(error.message);
    else fetch();
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Payment Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Enable or disable payment methods</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-3">
          {methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between bg-background border border-border rounded-xl px-5 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{m.display_name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{m.method}</p>
              </div>
              <button
                onClick={() => toggle(m)}
                className={`relative w-11 h-6 rounded-full transition-colors ${m.is_enabled ? "bg-green-500" : "bg-muted"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${m.is_enabled ? "translate-x-5" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
