import { supabase } from "@/integrations/supabase/client";

/**
 * Log an admin action to the admin_activity_log table.
 * Fire-and-forget — never blocks the calling action even on failure.
 */
export const logAdminAction = async (
  action_type: string,
  entity_type: string,
  entity_id?: string | null,
  details: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("admin_activity_log").insert({
      admin_user_id: user.id,
      action_type,
      entity_type,
      entity_id: entity_id ?? null,
      details,
    });
  } catch {
    // Silent — logging must never break admin flows
  }
};
