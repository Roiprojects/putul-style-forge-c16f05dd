import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

const FONTS = ["Inter", "Playfair Display", "Poppins", "Montserrat", "Lora", "DM Sans", "Merriweather"];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({
    logo_url: "",
    site_name: "Putul Fashions",
    primary_color: "#1a1a1a",
    accent_color: "#c9a96e",
    heading_font: "Playfair Display",
    body_font: "Inter",
    currency: "INR",
    currency_symbol: "₹",
    region: "India",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const map: Record<string, any> = {};
        data.forEach((row: any) => { map[row.setting_key] = row.setting_value; });
        setSettings(prev => ({ ...prev, ...map }));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(settings)) {
      await supabase.from("site_settings").upsert(
        { setting_key: key, setting_value: value },
        { onConflict: "setting_key" }
      );
    }
    toast.success("Settings saved");
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Website Settings</h1>
        <Button onClick={handleSave} disabled={saving}><Save size={16} className="mr-2" />{saving ? "Saving..." : "Save All"}</Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-sm">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Site Name</label><Input value={settings.site_name} onChange={e => setSettings({ ...settings, site_name: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Logo URL</label><Input value={settings.logo_url} onChange={e => setSettings({ ...settings, logo_url: e.target.value })} placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings.primary_color} onChange={e => setSettings({ ...settings, primary_color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={settings.primary_color} onChange={e => setSettings({ ...settings, primary_color: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings.accent_color} onChange={e => setSettings({ ...settings, accent_color: e.target.value })} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={settings.accent_color} onChange={e => setSettings({ ...settings, accent_color: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Typography</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Heading Font</label>
              <Select value={settings.heading_font} onValueChange={v => setSettings({ ...settings, heading_font: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Body Font</label>
              <Select value={settings.body_font} onValueChange={v => setSettings({ ...settings, body_font: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Region & Currency</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Currency</label><Input value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Symbol</label><Input value={settings.currency_symbol} onChange={e => setSettings({ ...settings, currency_symbol: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Region</label><Input value={settings.region} onChange={e => setSettings({ ...settings, region: e.target.value })} /></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
