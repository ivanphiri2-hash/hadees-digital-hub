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

export const createClientLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ clientId: z.string().uuid() }).parse(raw))
  .handler(async ({ context, data }) => {
    const permission = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (permission.error || permission.data !== true) throw new Error("Only administrators can create client logins.");
    const client = await context.supabase.from("clients").select("id,full_name,email,user_id").eq("id", data.clientId).single();
    if (client.error || !client.data) throw new Error("Unable to load this client.");
    if (client.data.user_id) throw new Error("This client already has a linked login.");
    const email = client.data.email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("This client record has no valid email address to create a login for.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const existing = await supabaseAdmin.from("profiles").select("id,email").ilike("email", email).limit(2);
    if (existing.error) throw new Error("Unable to check for an existing client login.");
    if (existing.data?.length) throw new Error("A login with this email already exists. Use Link client login instead.");
    const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const password = "Ht-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
    const created = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: client.data.full_name ?? "" },
    });
    if (created.error || !created.data.user) throw new Error("Unable to create the client login. No account was created.");
    const profile = await supabaseAdmin.from("profiles").upsert({ id: created.data.user.id, email, full_name: client.data.full_name ?? null }, { onConflict: "id" }).select("id").single();
    if (profile.error) {
      await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
      throw new Error("Unable to save the client login profile. No account was kept.");
    }
    const linked = await context.supabase.from("clients").update({ user_id: created.data.user.id }).eq("id", client.data.id).is("user_id", null).select("id").single();
    if (linked.error) {
      await supabaseAdmin.from("profiles").delete().eq("id", created.data.user.id);
      await supabaseAdmin.auth.admin.deleteUser(created.data.user.id);
      throw new Error("Unable to connect the login to this client. No changes were kept.");
    }
    return { ok: true as const, email, tempPassword: password };
  });