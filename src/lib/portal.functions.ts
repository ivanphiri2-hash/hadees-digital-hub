// Client-portal server functions. RLS restricts every query to rows that
// belong to the signed-in client, so these are safe by construction.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getPortalData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: client } = await supabase
      .from("clients").select("*").eq("user_id", userId).maybeSingle();

    if (!client) {
      return { client: null, projects: [], invoices: [], quotations: [], receipts: [], payments: [], documents: [], tickets: [], notifications: [] };
    }

    const [projects, invoices, quotations, receipts, payments, documents, tickets, notifications] = await Promise.all([
      supabase.from("projects").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("invoices").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("quotations").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("receipts").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("documents").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*").eq("client_id", client.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
    ]);

    return {
      client,
      projects: projects.data ?? [],
      invoices: invoices.data ?? [],
      quotations: quotations.data ?? [],
      receipts: receipts.data ?? [],
      payments: payments.data ?? [],
      documents: documents.data ?? [],
      tickets: tickets.data ?? [],
      notifications: notifications.data ?? [],
    };
  });

export const updateMyCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    full_name: z.string().trim().min(1).max(120),
    phone: z.string().trim().max(40).optional(),
    whatsapp: z.string().trim().max(40).optional(),
    company_name: z.string().trim().max(160).optional(),
    registration_number: z.string().trim().max(60).optional(),
    vat_number: z.string().trim().max(60).optional(),
    address: z.string().trim().max(400).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("clients").update(data).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createMyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    subject: z.string().trim().min(3).max(160),
    body: z.string().trim().min(5).max(4000),
    priority: z.enum(["low", "normal", "high"]).default("normal"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: client } = await context.supabase.from("clients").select("id, full_name").eq("user_id", context.userId).maybeSingle();
    if (!client) throw new Error("No client profile linked to this account yet.");
    const { error } = await context.supabase.from("support_tickets").insert({
      client_id: client.id,
      subject: data.subject,
      body: data.body,
      priority: data.priority,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("notifications").insert({
      audience: "staff", type: "support_ticket",
      title: "New support ticket", body: `${client.full_name}: ${data.subject}`, link: "/admin/support",
    });
    return { ok: true as const };
  });

export const registerMyDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    name: z.string().trim().min(1).max(200),
    storage_path: z.string().trim().min(1).max(400),
    mime_type: z.string().trim().max(120).optional(),
    size_bytes: z.number().int().min(0).max(50 * 1024 * 1024),
    category: z.string().trim().max(60).default("general"),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: client } = await context.supabase.from("clients").select("id").eq("user_id", context.userId).maybeSingle();
    if (!client) throw new Error("No client profile linked to this account yet.");
    if (!data.storage_path.startsWith(`${client.id}/`)) throw new Error("Invalid upload path.");
    const { error } = await context.supabase.from("documents").insert({
      client_id: client.id,
      name: data.name,
      storage_path: data.storage_path,
      mime_type: data.mime_type ?? null,
      size_bytes: data.size_bytes,
      category: data.category,
      uploaded_by: context.userId,
    });
    if (error) throw new Error(error.message);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("notifications").insert({
      audience: "staff", type: "document", title: "New client document", body: data.name, link: "/admin/documents",
    });
    return { ok: true as const };
  });

export const getMyDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ path: z.string().min(1).max(400) }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: signed, error } = await context.supabase.storage.from("documents").createSignedUrl(data.path, 300);
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });
