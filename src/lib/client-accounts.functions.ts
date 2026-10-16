import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { validateClientLink } from "./client-link-rules";

export const linkClientAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ clientId: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const permission = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (permission.error || permission.data !== true) throw new Error("Only administrators can link client logins.");
    const client = await context.supabase.from("clients").select("id,email,user_id").eq("id", data.clientId).single();
    if (client.error || !client.data) throw new Error("Unable to load this client.");
    if (client.data.user_id) throw new Error("This client already has a linked login.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profiles = await supabaseAdmin.from("profiles").select("id,email").ilike("email", client.data.email).limit(2);
    if (profiles.error) throw new Error("Unable to look up the client login.");
    if (profiles.data?.length !== 1) throw new Error("The client must create and confirm a separate login using their client record email first.");
    const profile = profiles.data[0];
    if (!profile) throw new Error("Client login not found.");
    const [account, roles, linked] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(profile.id),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", profile.id),
      supabaseAdmin.from("clients").select("id").eq("user_id", profile.id).limit(1),
    ]);
    if (account.error || roles.error || linked.error || !account.data.user) throw new Error("Unable to verify the client login.");
    validateClientLink(client.data.email, account.data.user.email ?? "", (roles.data ?? []).map((r) => r.role), Boolean(account.data.user.email_confirmed_at));
    if (linked.data?.length) throw new Error("This login already belongs to another client record.");
    const result = await context.supabase.from("clients").update({ user_id: profile.id }).eq("id", data.clientId).is("user_id", null).select("id").single();
    if (result.error) throw new Error("Unable to link the login. No client changes were saved.");
    return { ok: true as const };
  });