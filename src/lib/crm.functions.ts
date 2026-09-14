// CRM extension: website/technical tracker + follow-up scheduling.
// Staff access is enforced by RLS on client_websites and follow_ups.
// Clients never read those tables directly — getMyWebsites returns a
// deliberately narrow, client-safe projection.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();
const opt = (max: number) => z.string().trim().max(max).nullable().optional();

export const WEBSITE_STATUSES = [
  "not_started", "awaiting_information", "in_progress", "demo_ready", "client_review",
  "revisions", "awaiting_payment", "ready_to_launch", "live", "completed", "on_hold",
] as const;

export const FOLLOW_UP_STATUSES = ["open", "done", "cancelled"] as const;

/* --------------------------- WEBSITE TRACKER ---------------------------- */

export const listWebsites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [sites, clients] = await Promise.all([
      context.supabase.from("client_websites").select("*").order("updated_at", { ascending: false }).limit(500),
      context.supabase.from("clients").select("id, full_name, company_name").limit(1000),
    ]);
    if (sites.error) throw new Error(sites.error.message);
    return {
      websites: sites.data ?? [],
      clients: clients.data ?? [],
    };
  });

const websiteInput = z.object({
  id: uuid.optional(),
  client_id: uuid.nullable().optional(),
  project_id: uuid.nullable().optional(),
  name: z.string().trim().min(1).max(160),
  status: z.enum(WEBSITE_STATUSES).default("not_started"),
  live_url: opt(300),
  demo_url: opt(300),
  domain: opt(200),
  domain_registrar: opt(160),
  hosting_provider: opt(160),
  deployment_provider: opt(160),
  lovable_project_name: opt(200),
  lovable_project_url: opt(300),
  lovable_account_email: opt(200),
  github_repo: opt(300),
  github_account: opt(160),
  vercel_project: opt(200),
  netlify_project: opt(200),
  supabase_ref: opt(120),
  database_notes: opt(4000),
  dns_notes: opt(4000),
  deployment_notes: opt(4000),
  technical_notes: opt(4000),
  responsible_id: uuid.nullable().optional(),
});

export const upsertWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => websiteInput.parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const res = id
      ? await context.supabase.from("client_websites").update(patch).eq("id", id).select("id").single()
      : await context.supabase.from("client_websites").insert(patch).select("id").single();
    if (res.error) throw new Error(res.error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId,
      action: id ? "website.updated" : "website.created",
      entity_type: "website",
      entity_id: res.data.id,
      meta: { name: data.name, status: data.status },
    });
    return { id: res.data.id };
  });

export const deleteWebsite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("client_websites").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "website.deleted", entity_type: "website", entity_id: data.id,
    });
    return { ok: true as const };
  });

/** Client-safe view of their own websites — no Lovable/GitHub/infra details. */
export const getMyWebsites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: client } = await context.supabase
      .from("clients").select("id").eq("user_id", context.userId).maybeSingle();
    if (!client) return [];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("client_websites")
      .select("id, name, status, live_url, demo_url, domain, updated_at")
      .eq("client_id", client.id)
      .order("updated_at", { ascending: false });
    return data ?? [];
  });

/* ------------------------------ FOLLOW-UPS ------------------------------ */

export const listFollowUps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [rows, leads, clients] = await Promise.all([
      context.supabase.from("follow_ups").select("*").order("due_date", { ascending: true }).limit(500),
      context.supabase.from("leads").select("id, name, company").limit(1000),
      context.supabase.from("clients").select("id, full_name, company_name").limit(1000),
    ]);
    if (rows.error) throw new Error(rows.error.message);
    return { followUps: rows.data ?? [], leads: leads.data ?? [], clients: clients.data ?? [] };
  });

export const upsertFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid.optional(),
    lead_id: uuid.nullable().optional(),
    client_id: uuid.nullable().optional(),
    due_date: z.string().min(4).max(20),
    due_time: z.string().max(10).nullable().optional(),
    reason: z.string().trim().min(1).max(200),
    notes: opt(4000),
    status: z.enum(FOLLOW_UP_STATUSES).default("open"),
    assigned_to: uuid.nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const res = id
      ? await context.supabase.from("follow_ups").update(patch).eq("id", id).select("id").single()
      : await context.supabase.from("follow_ups").insert({ ...patch, created_by: context.userId }).select("id").single();
    if (res.error) throw new Error(res.error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId,
      action: id ? "follow_up.updated" : "follow_up.created",
      entity_type: "follow_up",
      entity_id: res.data.id,
      meta: { reason: data.reason, due_date: data.due_date, status: data.status },
    });
    return { id: res.data.id };
  });

export const deleteFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("follow_ups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
