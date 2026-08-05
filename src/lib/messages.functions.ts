// Client ⇄ staff messaging. RLS on public.messages is the real boundary:
// clients only see their own thread, staff see every thread.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* ------------------------------- CLIENT SIDE ------------------------------ */

export const getMyMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: client } = await supabase
      .from("clients").select("id").eq("user_id", userId).maybeSingle();
    if (!client) return { clientId: null, messages: [] };

    const { data, error } = await supabase
      .from("messages").select("*").eq("client_id", client.id)
      .order("created_at", { ascending: true }).limit(200);
    if (error) throw new Error(error.message);
    return { clientId: client.id, messages: data ?? [] };
  });

export const sendMyMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ body: z.string().trim().min(1).max(4000) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: client } = await supabase
      .from("clients").select("id, full_name").eq("user_id", userId).maybeSingle();
    if (!client) throw new Error("No client profile is linked to this account yet.");

    const { error } = await supabase.from("messages").insert({
      client_id: client.id,
      sender_id: userId,
      sender_name: client.full_name,
      from_staff: false,
      body: data.body,
    });
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("notifications").insert({
      audience: "staff", type: "message",
      title: "New client message", body: `${client.full_name}: ${data.body.slice(0, 120)}`,
      link: "/admin/messages",
    });
    return { ok: true as const };
  });

/* -------------------------------- STAFF SIDE ------------------------------ */

export const listMessageThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [{ data: messages, error }, { data: clients }] = await Promise.all([
      supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(1000),
      supabase.from("clients").select("id, full_name, company_name, email").order("full_name"),
    ]);
    if (error) throw new Error(error.message);
    return { messages: messages ?? [], clients: clients ?? [] };
  });

export const replyToClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    client_id: z.string().uuid(),
    body: z.string().trim().min(1).max(4000),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle();

    const { error } = await supabase.from("messages").insert({
      client_id: data.client_id,
      sender_id: userId,
      sender_name: profile?.full_name ?? "Hadees Trading",
      from_staff: true,
      body: data.body,
    });
    if (error) throw new Error(error.message);

    const { data: client } = await supabase.from("clients").select("user_id").eq("id", data.client_id).maybeSingle();
    if (client?.user_id) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("notifications").insert({
        user_id: client.user_id, audience: "client", type: "message",
        title: "New message from Hadees Trading", body: data.body.slice(0, 160), link: "/portal",
      });
    }
    return { ok: true as const };
  });
