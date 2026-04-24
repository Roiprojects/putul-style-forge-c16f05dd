import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  title: string;
  body: string;
  link: string;
  createdAt: string;
}

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orders } = await supabase
        .from("orders")
        .select("id, status, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (!orders) return;

      const items: Notification[] = orders.map((o) => ({
        id: o.id,
        title: `Order ${o.status.toUpperCase()}`,
        body: `Your order #${o.id.slice(0, 8)} is ${o.status}.`,
        link: `/orders/${o.id}`,
        createdAt: o.updated_at,
      }));

      setNotifications(items);
      const seen = JSON.parse(localStorage.getItem("seen-notifs") || "[]");
      setUnread(items.filter((i) => !seen.includes(i.id)).length);
    };

    load();
  }, []);

  const handleOpen = () => {
    const ids = notifications.map((n) => n.id);
    localStorage.setItem("seen-notifs", JSON.stringify(ids));
    setUnread(0);
  };

  return (
    <Popover onOpenChange={(o) => o && handleOpen()}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-muted rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-semibold">
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b border-border">
          <h4 className="font-semibold text-sm">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <Link
                key={n.id}
                to={n.link}
                className="block p-3 border-b border-border hover:bg-muted transition-colors"
              >
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
