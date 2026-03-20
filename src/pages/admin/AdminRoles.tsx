import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Plus, Trash2, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type RoleEntry = { id: string; user_id: string; role: "admin" | "moderator" | "user" };
type Profile = { user_id: string; display_name: string | null };

const ROLES: ("admin" | "moderator" | "user")[] = ["admin", "moderator", "user"];

const AdminRoles = () => {
  const [roles, setRoles] = useState<RoleEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "moderator" | "user">("user");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("user_roles").select("*"),
      supabase.from("profiles").select("user_id, display_name"),
    ]);
    if (r) setRoles(r as RoleEntry[]);
    if (p) setProfiles(p as Profile[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const getName = (userId: string) => profiles.find(p => p.user_id === userId)?.display_name || userId.slice(0, 8);

  const addRole = async () => {
    if (!newUserId.trim()) return toast.error("Enter a user ID");
    const { error } = await supabase.from("user_roles").insert({ user_id: newUserId.trim(), role: newRole });
    if (error) return toast.error(error.message);
    toast.success("Role assigned");
    setDialogOpen(false);
    setNewUserId("");
    fetchData();
  };

  const removeRole = async (id: string) => {
    await supabase.from("user_roles").delete().eq("id", id);
    toast.success("Role removed");
    fetchData();
  };

  const filtered = roles.filter(r => {
    const name = getName(r.user_id).toLowerCase();
    return name.includes(search.toLowerCase()) || r.role.includes(search.toLowerCase());
  });

  const roleColor = (r: string) => {
    if (r === "admin") return "destructive";
    if (r === "moderator") return "default";
    return "secondary";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">{roles.length} role assignments</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}><Plus size={16} className="mr-2" />Assign Role</Button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search users or roles..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {loading ? <p className="text-muted-foreground">Loading...</p> : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <Shield size={18} className="text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{getName(r.user_id)}</p>
                  <p className="text-xs text-muted-foreground font-mono">{r.user_id}</p>
                </div>
                <Badge variant={roleColor(r.role) as any}>{r.role}</Badge>
                <Button variant="ghost" size="icon" onClick={() => removeRole(r.id)}><Trash2 size={14} className="text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">No roles found.</p>}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Role</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium">User ID</label><Input value={newUserId} onChange={e => setNewUserId(e.target.value)} placeholder="Paste user UUID" /></div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={newRole} onValueChange={v => setNewRole(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={addRole}>Assign</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRoles;
