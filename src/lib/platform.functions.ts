// Staff-facing server functions for the Hadees Trading Business Operating
// Platform. Every function runs as the signed-in user, so Postgres RLS is the
// real security boundary — staff policies gate all of these tables.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

const STAGES = [
  "new_lead", "contacted", "consultation_scheduled", "proposal_sent",
  "waiting_deposit", "deposit_received", "waiting_client_info", "project_started",
  "design", "development", "client_review", "completed", "support",
] as const;

const SOURCES = ["website", "whatsapp", "referral", "facebook", "instagram", "google", "manual"] as const;
const PROJECT_STATUS = ["pending", "in_progress", "waiting_client", "review", "completed", "archived"] as const;
const DOC_STATUS = ["draft", "sent", "accepted", "rejected", "paid", "overdue", "void", "cancelled"] as const;

export type LeadStage = (typeof STAGES)[number];
export const LEAD_STAGES = STAGES;
export const LEAD_SOURCES = SOURCES;
export const PROJECT_STATUSES = PROJECT_STATUS;

/** Who am I + what can I do. */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: roles }, { data: profile }, { data: client }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("clients").select("id, full_name, company_name").eq("user_id", userId).maybeSingle(),
    ]);
    const list = (roles ?? []).map((r) => r.role);
    const staffRoles = ["super_admin", "administrator", "sales", "project_manager", "finance", "support"];
    return {
      userId,
      roles: list,
      isStaff: list.some((r) => staffRoles.includes(r)),
      isAdmin: list.some((r) => r === "super_admin" || r === "administrator"),
      profile: profile ?? null,
      clientId: client?.id ?? null,
    };
  });

/* ------------------------------- DASHBOARD ------------------------------- */

export const getAdminOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [orders, invoices, clients, leads, projects, tickets, payments] = await Promise.all([
      supabase.from("orders").select("amount_cents, status, service_name, created_at, paid_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("invoices").select("total_cents, amount_paid_cents, status, created_at").limit(1000),
      supabase.from("clients").select("id, created_at, status").limit(2000),
      supabase.from("leads").select("id, stage, source, created_at, value_cents").limit(2000),
      supabase.from("projects").select("id, status, created_at").limit(2000),
      supabase.from("support_tickets").select("id, status").limit(1000),
      supabase.from("payments").select("amount_cents, status, paid_at, created_at").limit(2000),
    ]);

    const paidOrders = (orders.data ?? []).filter((o) => o.status === "paid");
    const now = new Date();
    const monthKey = (d: string) => d.slice(0, 7);
    const thisMonth = now.toISOString().slice(0, 7);

    const revenueCents = paidOrders.reduce((s, o) => s + o.amount_cents, 0)
      + (payments.data ?? []).filter((p) => p.status === "paid").reduce((s, p) => s + p.amount_cents, 0);
    const revenueThisMonthCents = paidOrders
      .filter((o) => monthKey(o.paid_at ?? o.created_at) === thisMonth)
      .reduce((s, o) => s + o.amount_cents, 0);

    // 6-month revenue trend
    const trend: { month: string; cents: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      trend.push({
        month: key,
        cents: paidOrders.filter((o) => monthKey(o.paid_at ?? o.created_at) === key).reduce((s, o) => s + o.amount_cents, 0),
      });
    }

    const byService = new Map<string, { count: number; cents: number }>();
    for (const o of paidOrders) {
      const cur = byService.get(o.service_name) ?? { count: 0, cents: 0 };
      byService.set(o.service_name, { count: cur.count + 1, cents: cur.cents + o.amount_cents });
    }

    const bySource = new Map<string, number>();
    for (const l of leads.data ?? []) bySource.set(l.source, (bySource.get(l.source) ?? 0) + 1);

    const leadCount = (leads.data ?? []).length;
    const wonLeads = (leads.data ?? []).filter((l) => ["deposit_received", "project_started", "design", "development", "client_review", "completed", "support"].includes(l.stage)).length;

    return {
      kpi: {
        revenueCents,
        revenueThisMonthCents,
        activeClients: (clients.data ?? []).filter((c) => c.status === "active").length,
        newLeads: (leads.data ?? []).filter((l) => l.stage === "new_lead").length,
        activeProjects: (projects.data ?? []).filter((p) => ["pending", "in_progress", "waiting_client", "review"].includes(p.status)).length,
        completedProjects: (projects.data ?? []).filter((p) => p.status === "completed").length,
        outstandingInvoiceCents: (invoices.data ?? []).filter((i) => i.status !== "paid" && i.status !== "void")
          .reduce((s, i) => s + (i.total_cents - i.amount_paid_cents), 0),
        pendingPayments: (orders.data ?? []).filter((o) => o.status === "pending").length,
        openTickets: (tickets.data ?? []).filter((t) => t.status === "open" || t.status === "in_progress").length,
        websiteOrders: (orders.data ?? []).length,
        conversionRate: leadCount ? Math.round((wonLeads / leadCount) * 100) : 0,
      },
      charts: {
        revenueTrend: trend,
        servicesSold: [...byService.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.cents - a.cents).slice(0, 8),
        leadSources: [...bySource.entries()].map(([source, count]) => ({ source, count })),
      },
      recentOrders: (orders.data ?? []).slice(0, 8),
    };
  });

/* --------------------------------- LEADS --------------------------------- */

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("leads")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    name: z.string().trim().min(1).max(120),
    company: z.string().trim().max(160).optional(),
    email: z.string().trim().email().max(255).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional(),
    service_name: z.string().trim().max(160).optional(),
    source: z.enum(SOURCES).default("manual"),
    value_cents: z.number().int().min(0).max(100_000_000).default(0),
    notes: z.string().trim().max(4000).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("leads").insert({
      ...data,
      email: data.email || null,
    }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    stage: z.enum(STAGES).optional(),
    notes: z.string().max(4000).optional(),
    next_follow_up: z.string().max(20).nullable().optional(),
    value_cents: z.number().int().min(0).optional(),
    assigned_to: uuid.nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: `lead.update${patch.stage ? `:${patch.stage}` : ""}`,
      entity_type: "lead", entity_id: id, meta: patch,
    });
    return { ok: true as const };
  });

/* -------------------------------- CLIENTS -------------------------------- */

export const listClients = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("clients").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getClientDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [client, projects, invoices, quotations, payments, documents, tickets, activity] = await Promise.all([
      supabase.from("clients").select("*").eq("id", data.id).maybeSingle(),
      supabase.from("projects").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("quotations").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("documents").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").eq("client_id", data.id).order("created_at", { ascending: false }),
      supabase.from("activity_logs").select("*").eq("entity_id", data.id).order("created_at", { ascending: false }).limit(50),
    ]);
    if (!client.data) throw new Error("Client not found");
    return {
      client: client.data,
      projects: projects.data ?? [],
      invoices: invoices.data ?? [],
      quotations: quotations.data ?? [],
      payments: payments.data ?? [],
      documents: documents.data ?? [],
      tickets: tickets.data ?? [],
      activity: activity.data ?? [],
    };
  });

export const upsertClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid.optional(),
    full_name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().max(40).optional(),
    whatsapp: z.string().trim().max(40).optional(),
    company_name: z.string().trim().max(160).optional(),
    registration_number: z.string().trim().max(60).optional(),
    vat_number: z.string().trim().max(60).optional(),
    address: z.string().trim().max(400).optional(),
    industry: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(4000).optional(),
    status: z.enum(["active", "prospect", "dormant"]).default("active"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    if (id) {
      const { error } = await context.supabase.from("clients").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase.from("clients").insert(patch).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* -------------------------------- PROJECTS -------------------------------- */

export const listProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("projects")
      .select("*, clients(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid.optional(),
    name: z.string().trim().min(1).max(160),
    client_id: uuid.nullable().optional(),
    status: z.enum(PROJECT_STATUS).default("pending"),
    progress: z.number().int().min(0).max(100).default(0),
    due_date: z.string().max(20).nullable().optional(),
    description: z.string().max(4000).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const body = { ...patch, ...(patch.status === "completed" ? { completed_at: new Date().toISOString() } : {}) };
    if (id) {
      const { error } = await context.supabase.from("projects").update(body).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase.from("projects").insert(body).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* --------------------------- BILLING / DOCUMENTS --------------------------- */

export const listBilling = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [invoices, quotations, payments, receipts, orders] = await Promise.all([
      supabase.from("invoices").select("*, clients(full_name, company_name)").order("created_at", { ascending: false }).limit(300),
      supabase.from("quotations").select("*, clients(full_name, company_name)").order("created_at", { ascending: false }).limit(300),
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("receipts").select("*").order("created_at", { ascending: false }).limit(300),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(300),
    ]);
    return {
      invoices: invoices.data ?? [],
      quotations: quotations.data ?? [],
      payments: payments.data ?? [],
      receipts: receipts.data ?? [],
      orders: orders.data ?? [],
    };
  });

export const createQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    client_id: uuid.nullable().optional(),
    title: z.string().trim().min(1).max(160),
    line_items: z.array(z.object({
      description: z.string().trim().min(1).max(200),
      qty: z.number().int().min(1).max(999),
      unit_cents: z.number().int().min(0).max(100_000_000),
    })).min(1).max(50),
    vat: z.boolean().default(false),
    valid_until: z.string().max(20).nullable().optional(),
    notes: z.string().max(2000).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const subtotal = data.line_items.reduce((s, l) => s + l.qty * l.unit_cents, 0);
    const vat = data.vat ? Math.round(subtotal * 0.15) : 0;
    const { data: row, error } = await context.supabase.from("quotations").insert({
      client_id: data.client_id ?? null,
      title: data.title,
      line_items: data.line_items,
      subtotal_cents: subtotal,
      vat_cents: vat,
      total_cents: subtotal + vat,
      valid_until: data.valid_until ?? null,
      notes: data.notes ?? null,
      status: "sent",
      created_by: context.userId,
    }).select().single();
    if (error) throw new Error(error.message);
    return row;
  });

export const setQuotationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, status: z.enum(DOC_STATUS) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("quotations").update({
      status: data.status,
      ...(data.status === "accepted" ? { accepted_at: new Date().toISOString() } : {}),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Convert an accepted quotation into an invoice. */
export const convertQuotationToInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: q, error } = await context.supabase.from("quotations").select("*").eq("id", data.id).maybeSingle();
    if (error || !q) throw new Error("Quotation not found");
    const due = new Date(); due.setDate(due.getDate() + 14);
    const { data: inv, error: insErr } = await context.supabase.from("invoices").insert({
      client_id: q.client_id,
      quotation_id: q.id,
      title: q.title,
      line_items: q.line_items,
      subtotal_cents: q.subtotal_cents,
      vat_cents: q.vat_cents,
      total_cents: q.total_cents,
      status: "sent",
      due_date: due.toISOString().slice(0, 10),
    }).select().single();
    if (insErr) throw new Error(insErr.message);
    await context.supabase.from("quotations").update({ status: "accepted", accepted_at: new Date().toISOString() }).eq("id", q.id);
    return inv;
  });

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("documents")
      .select("*, clients(full_name, company_name)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Short-lived signed URL for a stored document. RLS on storage.objects applies. */
export const getDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ path: z.string().min(1).max(400) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage.from("documents").createSignedUrl(data.path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

/* ------------------------- NOTIFICATIONS / ACTIVITY ------------------------ */

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    await context.supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", data.id);
    return { ok: true as const };
  });

export const listActivity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const listEnquiries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const listTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("support_tickets").select("*, clients(full_name, company_name)").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const setTicketStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    status: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("support_tickets").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* -------------------------------- SETTINGS -------------------------------- */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [settings, socials, staff] = await Promise.all([
      context.supabase.from("settings").select("*"),
      context.supabase.from("social_links").select("*").order("position"),
      context.supabase.from("profiles").select("id, full_name, email, is_staff").limit(200),
    ]);
    const roles = await context.supabase.from("user_roles").select("user_id, role");
    return {
      settings: settings.data ?? [],
      socials: socials.data ?? [],
      users: (staff.data ?? []).map((u) => ({
        ...u,
        roles: (roles.data ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
      })),
    };
  });

export const updateSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    key: z.string().trim().min(1).max(60),
    value: z.record(z.string(), z.unknown()),
    is_public: z.boolean().default(true),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("settings")
      .upsert({ key: data.key, value: data.value as never, is_public: data.is_public }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const updateSocialLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    platform: z.string().trim().min(1).max(40),
    url: z.string().trim().url().max(400),
    enabled: z.boolean().default(true),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("social_links")
      .upsert({ platform: data.platform, url: data.url, enabled: data.enabled }, { onConflict: "platform" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------- v4.1 CRM EXTENSIONS --------------------------- */

/** Rich lead editing (contact details, budget, follow-up, notes, assignment). */
export const patchLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    name: z.string().trim().min(1).max(120).optional(),
    company: z.string().trim().max(160).nullable().optional(),
    email: z.string().trim().max(255).nullable().optional(),
    phone: z.string().trim().max(40).nullable().optional(),
    service_name: z.string().trim().max(160).nullable().optional(),
    value_cents: z.number().int().min(0).max(100_000_000).optional(),
    stage: z.enum(STAGES).optional(),
    source: z.enum(SOURCES).optional(),
    next_follow_up: z.string().max(20).nullable().optional(),
    notes: z.string().max(8000).nullable().optional(),
    assigned_to: uuid.nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("leads").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "lead.updated", entity_type: "lead", entity_id: id, meta: patch,
    });
    return { ok: true as const };
  });

/** Promote a lead into a full client record and link them. */
export const convertLeadToClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: lead, error } = await supabase.from("leads").select("*").eq("id", data.id).maybeSingle();
    if (error || !lead) throw new Error("Lead not found");
    if (lead.client_id) return { clientId: lead.client_id };

    const { data: client, error: insErr } = await supabase.from("clients").insert({
      full_name: lead.name,
      email: lead.email ?? `${lead.id}@no-email.local`,
      phone: lead.phone,
      company_name: lead.company,
      notes: lead.notes,
      assigned_to: lead.assigned_to,
      status: "active",
    }).select("id").single();
    if (insErr) throw new Error(insErr.message);

    await supabase.from("leads").update({ client_id: client.id, stage: "deposit_received" }).eq("id", lead.id);
    await supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "lead.converted", entity_type: "client", entity_id: client.id,
      meta: { lead_id: lead.id },
    });
    return { clientId: client.id };
  });

export const setClientStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    status: z.enum(["active", "prospect", "dormant", "suspended", "archived"]),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("clients").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: `client.${data.status}`, entity_type: "client", entity_id: data.id, meta: {},
    });
    return { ok: true as const };
  });

/** Admin-only hard delete (RLS enforces the admin policy on clients). */
export const deleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "client.deleted", entity_type: "client", entity_id: data.id, meta: {},
    });
    return { ok: true as const };
  });

/* ------------------------------- PROJECTS -------------------------------- */

export const getProjectDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [project, tasks, comments, documents] = await Promise.all([
      supabase.from("projects").select("*, clients(full_name, company_name, email)").eq("id", data.id).maybeSingle(),
      supabase.from("project_tasks").select("*").eq("project_id", data.id).order("position"),
      supabase.from("project_comments").select("*").eq("project_id", data.id).order("created_at", { ascending: false }),
      supabase.from("documents").select("*").eq("project_id", data.id).order("created_at", { ascending: false }),
    ]);
    if (!project.data) throw new Error("Project not found");
    return {
      project: project.data,
      tasks: tasks.data ?? [],
      comments: comments.data ?? [],
      documents: documents.data ?? [],
    };
  });

export const upsertProjectTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid.optional(),
    project_id: uuid,
    title: z.string().trim().min(1).max(200),
    status: z.enum(["todo", "in_progress", "done"]).default("todo"),
    due_date: z.string().max(20).nullable().optional(),
    position: z.number().int().min(0).max(999).default(0),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    if (id) {
      const { error } = await context.supabase.from("project_tasks").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase.from("project_tasks").insert(patch).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteProjectTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_tasks").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const addProjectComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    project_id: uuid,
    body: z.string().trim().min(1).max(4000),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_comments").insert({
      project_id: data.project_id, body: data.body, author_id: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* -------------------------------- BILLING -------------------------------- */

export const createInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    client_id: uuid.nullable().optional(),
    title: z.string().trim().min(1).max(160),
    line_items: z.array(z.object({
      description: z.string().trim().min(1).max(200),
      qty: z.number().int().min(1).max(999),
      unit_cents: z.number().int().min(0).max(100_000_000),
    })).min(1).max(50),
    vat: z.boolean().default(false),
    due_date: z.string().max(20).nullable().optional(),
    notes: z.string().max(2000).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const subtotal = data.line_items.reduce((s, l) => s + l.qty * l.unit_cents, 0);
    const vat = data.vat ? Math.round(subtotal * 0.15) : 0;
    const { data: number } = await context.supabase.rpc("next_doc_number", { _prefix: "INV" });
    const { data: row, error } = await context.supabase.from("invoices").insert({
      number: number ?? `INV-${Date.now()}`,
      client_id: data.client_id ?? null,
      title: data.title,
      line_items: data.line_items,
      subtotal_cents: subtotal,
      vat_cents: vat,
      total_cents: subtotal + vat,
      due_date: data.due_date ?? null,
      notes: data.notes ?? null,
      status: "sent",
    }).select().single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "invoice.created", entity_type: "invoice", entity_id: row.id,
      meta: { number: row.number, total_cents: row.total_cents },
    });
    return row;
  });

export const setInvoiceStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, status: z.enum(DOC_STATUS) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("invoices").update({
      status: data.status,
      ...(data.status === "paid" ? { paid_at: new Date().toISOString() } : {}),
    }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/** Manual payment capture (EFT, cash, card machine) + auto receipt. */
export const recordPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    invoice_id: uuid,
    amount_cents: z.number().int().min(1).max(100_000_000),
    method: z.enum(["eft", "cash", "card", "payfast", "other"]).default("eft"),
    reference: z.string().trim().max(120).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: inv, error } = await supabase.from("invoices").select("*").eq("id", data.invoice_id).maybeSingle();
    if (error || !inv) throw new Error("Invoice not found");

    const now = new Date().toISOString();
    const { data: payment, error: payErr } = await supabase.from("payments").insert({
      invoice_id: inv.id,
      client_id: inv.client_id,
      amount_cents: data.amount_cents,
      method: data.method,
      status: "paid",
      reference: data.reference ?? null,
      paid_at: now,
    }).select("id").single();
    if (payErr) throw new Error(payErr.message);

    const paid = inv.amount_paid_cents + data.amount_cents;
    await supabase.from("invoices").update({
      amount_paid_cents: paid,
      status: paid >= inv.total_cents ? "paid" : inv.status,
      ...(paid >= inv.total_cents ? { paid_at: now } : {}),
    }).eq("id", inv.id);

    const { data: receiptNo } = await supabase.rpc("next_doc_number", { _prefix: "REC" });
    await supabase.from("receipts").insert({
      number: receiptNo ?? `REC-${Date.now()}`,
      payment_id: payment.id,
      invoice_id: inv.id,
      client_id: inv.client_id,
      amount_cents: data.amount_cents,
      issued_at: now,
    });

    await supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "payment.recorded", entity_type: "invoice", entity_id: inv.id,
      meta: { amount_cents: data.amount_cents, method: data.method },
    });
    return { ok: true as const };
  });

/* ------------------------------- DOCUMENTS -------------------------------- */

/** Register a file already uploaded to the private `documents` bucket. */
export const registerDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    name: z.string().trim().min(1).max(200),
    category: z.string().trim().min(1).max(60),
    storage_path: z.string().trim().min(1).max(400),
    mime_type: z.string().trim().max(120).optional(),
    size_bytes: z.number().int().min(0).max(200_000_000).optional(),
    client_id: uuid.nullable().optional(),
    project_id: uuid.nullable().optional(),
    parent_id: uuid.nullable().optional(),
    version: z.number().int().min(1).max(999).default(1),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("documents").insert({
      ...data,
      uploaded_by: context.userId,
    }).select("id").single();
    if (error) throw new Error(error.message);
    await context.supabase.from("activity_logs").insert({
      actor_id: context.userId, action: "document.uploaded", entity_type: "document", entity_id: row.id,
      meta: { name: data.name, category: data.category },
    });
    return { id: row.id };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, path: z.string().min(1).max(400) }).parse(raw))
  .handler(async ({ data, context }) => {
    await context.supabase.storage.from("documents").remove([data.path]);
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* --------------------------------- SUPPORT -------------------------------- */

export const upsertTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid.optional(),
    client_id: uuid.nullable().optional(),
    subject: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(6000),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    status: z.enum(["open", "in_progress", "waiting_client", "resolved", "closed"]).default("open"),
    assigned_to: uuid.nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    if (id) {
      const { error } = await context.supabase.from("support_tickets").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase.from("support_tickets")
      .insert({ ...patch, created_by: context.userId }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

/* ----------------------------- GLOBAL SEARCH ------------------------------ */

export const globalSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ q: z.string().trim().min(2).max(120) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const like = `%${data.q.replace(/[%_]/g, "")}%`;
    const [clients, leads, invoices, projects, orders] = await Promise.all([
      supabase.from("clients").select("id, full_name, company_name, email, phone")
        .or(`full_name.ilike.${like},company_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`).limit(8),
      supabase.from("leads").select("id, name, company, email, phone, stage")
        .or(`name.ilike.${like},company.ilike.${like},email.ilike.${like},phone.ilike.${like}`).limit(8),
      supabase.from("invoices").select("id, number, title, total_cents, status")
        .or(`number.ilike.${like},title.ilike.${like}`).limit(8),
      supabase.from("projects").select("id, name, status")
        .ilike("name", like).limit(8),
      supabase.from("orders").select("id, reference, service_name, customer_email, status")
        .or(`reference.ilike.${like},service_name.ilike.${like},customer_email.ilike.${like}`).limit(8),
    ]);
    return {
      clients: clients.data ?? [],
      leads: leads.data ?? [],
      invoices: invoices.data ?? [],
      projects: projects.data ?? [],
      orders: orders.data ?? [],
    };
  });

/* --------------------------- v4.2 OPS EXTENSIONS --------------------------- */

/** Website orders (PayFast checkout) with their linked invoice/project state. */
export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [orders, invoices, projects] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("invoices").select("id, number, order_id, status, total_cents").limit(500),
      supabase.from("projects").select("id, name, order_id, status, progress").limit(500),
    ]);
    return {
      orders: orders.data ?? [],
      invoices: invoices.data ?? [],
      projects: projects.data ?? [],
    };
  });

/** Unified business calendar feed: follow-ups, due dates, deliveries. */
export const getCalendar = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [leads, invoices, projects, tasks] = await Promise.all([
      supabase.from("leads").select("id, name, company, next_follow_up, stage").not("next_follow_up", "is", null).limit(300),
      supabase.from("invoices").select("id, number, title, due_date, status, total_cents").not("due_date", "is", null).limit(300),
      supabase.from("projects").select("id, name, due_date, status").not("due_date", "is", null).limit(300),
      supabase.from("project_tasks").select("id, title, due_date, status, project_id").not("due_date", "is", null).limit(300),
    ]);
    type Ev = { id: string; date: string; kind: "follow_up" | "invoice_due" | "project_due" | "task_due"; title: string; meta: string };
    const events: Ev[] = [
      ...(leads.data ?? []).map((l) => ({ id: `l-${l.id}`, date: l.next_follow_up as string, kind: "follow_up" as const, title: `Follow up: ${l.name}`, meta: l.company ?? String(l.stage) })),
      ...(invoices.data ?? []).map((i) => ({ id: `i-${i.id}`, date: i.due_date as string, kind: "invoice_due" as const, title: `${i.number} due`, meta: i.title })),
      ...(projects.data ?? []).map((p) => ({ id: `p-${p.id}`, date: p.due_date as string, kind: "project_due" as const, title: `Delivery: ${p.name}`, meta: String(p.status) })),
      ...(tasks.data ?? []).map((t) => ({ id: `t-${t.id}`, date: t.due_date as string, kind: "task_due" as const, title: `Task: ${t.title}`, meta: String(t.status) })),
    ];
    events.sort((a, b) => a.date.localeCompare(b.date));
    return events;
  });

/** Staff directory with role assignments. */
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profiles, roles] = await Promise.all([
      context.supabase.from("profiles").select("id, full_name, email, phone, is_staff, created_at").limit(500),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);
    return (profiles.data ?? []).map((p) => ({
      ...p,
      roles: (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as string),
    }));
  });

const APP_ROLES = ["super_admin", "administrator", "sales", "project_manager", "finance", "support", "client"] as const;
export const ROLE_OPTIONS = APP_ROLES;

/** Grant or revoke a role. Admin-only; writes bypass RLS after the role check. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    user_id: uuid,
    role: z.enum(APP_ROLES),
    grant: z.boolean(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("is_admin", { _user_id: context.userId });
    if (!isAdmin) throw new Error("Only administrators can change roles.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.user_id, role: data.role });
      if (error && !error.message.includes("duplicate")) throw new Error(error.message);
      await supabaseAdmin.from("profiles").update({ is_staff: data.role !== "client" }).eq("id", data.user_id);
    } else {
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    await supabaseAdmin.from("activity_logs").insert({
      actor_id: context.userId,
      action: data.grant ? "user.role_granted" : "user.role_revoked",
      entity_type: "user",
      entity_id: data.user_id,
      meta: { role: data.role },
    });
    return { ok: true as const };
  });
