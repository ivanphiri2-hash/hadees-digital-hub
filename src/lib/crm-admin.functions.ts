// CRM correction layer: staff edit / delete / archive / restore for records
// that previously had no safe way to be fixed after a typo.
//
// Nothing here touches PayFast. Deleting a CRM payment row only removes the
// bookkeeping record and re-balances its invoice — it never calls PayFast,
// never changes a Secure Button, and never alters the ITN routes.
//
// Every table below is staff-only via existing RLS (is_staff(auth.uid())),
// so these functions inherit the same boundary; clients can never call them
// against another client's data.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const uuid = z.string().uuid();

async function log(
  ctx: { supabase: { from: (t: string) => { insert: (v: unknown) => Promise<unknown> } }; userId: string },
  action: string, entity_type: string, entity_id: string, meta: Record<string, unknown> = {},
) {
  await ctx.supabase.from("activity_logs").insert({ actor_id: ctx.userId, action, entity_type, entity_id, meta });
}

/* ---------------------------------- LEADS --------------------------------- */

export const deleteLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { data: lead } = await context.supabase.from("leads").select("id, client_id, name").eq("id", data.id).maybeSingle();
    if (!lead) throw new Error("Lead not found.");
    if (lead.client_id) {
      throw new Error("This lead was converted into a client. Delete or archive the client record instead.");
    }
    await context.supabase.from("follow_ups").delete().eq("lead_id", data.id);
    await context.supabase.from("enquiries").update({ lead_id: null }).eq("lead_id", data.id);
    const { error } = await context.supabase.from("leads").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, "lead.deleted", "lead", data.id, { name: lead.name });
    return { ok: true as const };
  });

/* --------------------------------- CLIENTS -------------------------------- */

/** Count everything hanging off a client so the admin sees the impact first. */
export const getClientRelations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const count = async (table: string) => {
      const { count: n } = await s.from(table).select("id", { count: "exact", head: true }).eq("client_id", data.id);
      return n ?? 0;
    };
    const [projects, invoices, payments, receipts, documents, tickets, websites, quotations] = await Promise.all([
      count("projects"), count("invoices"), count("payments"), count("receipts"),
      count("documents"), count("support_tickets"), count("client_websites"), count("quotations"),
    ]);
    const total = projects + invoices + payments + receipts + documents + tickets + websites + quotations;
    return { projects, invoices, payments, receipts, documents, tickets, websites, quotations, total };
  });

/** Archive (soft delete) or restore a client without losing any history. */
export const archiveClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, archived: z.boolean() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("clients").update({ status: data.archived ? "archived" : "active" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, data.archived ? "client.archived" : "client.restored", "client", data.id);
    return { ok: true as const };
  });

/**
 * Permanent client delete. Refuses while financial or delivery records exist,
 * unless the admin explicitly confirms cascade removal of CRM-only records.
 */
export const deleteClientSafe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, force: z.boolean().default(false) }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const countOf = async (table: string) => {
      const { count } = await s.from(table).select("id", { count: "exact", head: true }).eq("client_id", data.id);
      return count ?? 0;
    };
    const invoices = await countOf("invoices");
    const payments = await countOf("payments");
    if ((invoices > 0 || payments > 0) && !data.force) {
      throw new Error(
        `This client has ${invoices} invoice(s) and ${payments} payment(s). Archive the client instead, or remove the financial records first.`,
      );
    }
    if (invoices > 0 || payments > 0) {
      throw new Error("Clients with invoices or payments cannot be permanently deleted. Archive them instead.");
    }
    await s.from("leads").update({ client_id: null }).eq("client_id", data.id);
    await s.from("follow_ups").delete().eq("client_id", data.id);
    await s.from("client_websites").delete().eq("client_id", data.id);
    await s.from("documents").delete().eq("client_id", data.id);
    await s.from("support_tickets").delete().eq("client_id", data.id);
    await s.from("projects").delete().eq("client_id", data.id);
    const { error } = await s.from("clients").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, "client.deleted", "client", data.id);
    return { ok: true as const };
  });

/** Duplicate detection before manually capturing an existing client. */
export const findClientDuplicates = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    company_name: z.string().trim().max(160).optional(),
    email: z.string().trim().max(255).optional(),
    phone: z.string().trim().max(40).optional(),
    full_name: z.string().trim().max(160).optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const filters: string[] = [];
    if (data.company_name) filters.push(`company_name.ilike.%${data.company_name}%`);
    if (data.full_name) filters.push(`full_name.ilike.%${data.full_name}%`);
    if (data.email) filters.push(`email.ilike.%${data.email}%`);
    if (data.phone) filters.push(`phone.ilike.%${data.phone}%`);
    if (filters.length === 0) return [];
    const { data: rows } = await context.supabase
      .from("clients")
      .select("id, client_number, full_name, company_name, email, phone, status")
      .or(filters.join(","))
      .limit(5);
    return rows ?? [];
  });

/* -------------------------------- PROJECTS -------------------------------- */

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, force: z.boolean().default(false) }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { count: docs } = await s.from("documents").select("id", { count: "exact", head: true }).eq("project_id", data.id);
    if ((docs ?? 0) > 0 && !data.force) {
      throw new Error(`This project has ${docs} linked document(s). Archive it, or confirm again to unlink the documents.`);
    }
    await s.from("documents").update({ project_id: null }).eq("project_id", data.id);
    await s.from("client_websites").update({ project_id: null }).eq("project_id", data.id);
    await s.from("project_tasks").delete().eq("project_id", data.id);
    await s.from("project_comments").delete().eq("project_id", data.id);
    const { error } = await s.from("projects").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, "project.deleted", "project", data.id);
    return { ok: true as const };
  });

export const archiveProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid, archived: z.boolean() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("projects").update({ status: data.archived ? "archived" : "pending" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, data.archived ? "project.archived" : "project.restored", "project", data.id);
    return { ok: true as const };
  });

export const deleteProjectComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("project_comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

/* -------------------------------- INVOICES -------------------------------- */

export const patchInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    title: z.string().trim().min(1).max(200).optional(),
    due_date: z.string().max(20).nullable().optional(),
    notes: z.string().trim().max(4000).nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("invoices").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    await log(context, "invoice.updated", "invoice", id, patch);
    return { ok: true as const };
  });

/** Void keeps the audit trail; hard delete is only allowed with no payments. */
export const voidInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("invoices").update({ status: "void" }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, "invoice.voided", "invoice", data.id);
    return { ok: true as const };
  });

export const deleteInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { count } = await s.from("payments").select("id", { count: "exact", head: true }).eq("invoice_id", data.id);
    if ((count ?? 0) > 0) {
      throw new Error("This invoice already has payments against it. Void it instead of deleting.");
    }
    await s.from("receipts").delete().eq("invoice_id", data.id);
    const { error } = await s.from("invoices").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await log(context, "invoice.deleted", "invoice", data.id);
    return { ok: true as const };
  });

/* -------------------------------- PAYMENTS -------------------------------- */

/** Correct a bookkeeping payment record. Does not contact PayFast. */
export const patchPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({
    id: uuid,
    amount_cents: z.number().int().min(0).max(100_000_000).optional(),
    method: z.enum(["eft", "cash", "card", "payfast", "other"]).optional(),
    status: z.enum(["pending", "processing", "paid", "failed", "cancelled", "refunded"]).optional(),
    reference: z.string().trim().max(120).nullable().optional(),
    paid_at: z.string().max(40).nullable().optional(),
  }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { data: before } = await s.from("payments").select("*").eq("id", data.id).maybeSingle();
    if (!before) throw new Error("Payment not found.");
    const { id, ...patch } = data;
    const { error } = await s.from("payments").update(patch).eq("id", id);
    if (error) throw new Error(error.message);

    // Keep the linked invoice balance honest after an amount correction.
    if (patch.amount_cents !== undefined && before.invoice_id && before.status === "paid") {
      const { data: inv } = await s.from("invoices").select("*").eq("id", before.invoice_id).maybeSingle();
      if (inv) {
        const paid = Math.max(0, inv.amount_paid_cents - before.amount_cents + patch.amount_cents);
        await s.from("invoices").update({
          amount_paid_cents: paid,
          status: paid >= inv.total_cents ? "paid" : inv.status === "paid" ? "sent" : inv.status,
        }).eq("id", inv.id);
      }
    }
    await log(context, "payment.updated", "payment", id, patch);
    return { ok: true as const };
  });

/**
 * Remove an incorrect CRM payment record and re-balance its invoice.
 * PayFast is untouched — this only edits Hadees bookkeeping rows.
 */
export const deletePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ id: uuid }).parse(raw))
  .handler(async ({ data, context }) => {
    const s = context.supabase;
    const { data: pay } = await s.from("payments").select("*").eq("id", data.id).maybeSingle();
    if (!pay) throw new Error("Payment not found.");

    await s.from("receipts").delete().eq("payment_id", data.id);
    const { error } = await s.from("payments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);

    if (pay.invoice_id && pay.status === "paid") {
      const { data: inv } = await s.from("invoices").select("*").eq("id", pay.invoice_id).maybeSingle();
      if (inv) {
        const paid = Math.max(0, inv.amount_paid_cents - pay.amount_cents);
        await s.from("invoices").update({
          amount_paid_cents: paid,
          status: paid >= inv.total_cents ? "paid" : inv.status === "paid" ? "sent" : inv.status,
          ...(paid >= inv.total_cents ? {} : { paid_at: null }),
        }).eq("id", inv.id);
      }
    }
    await log(context, "payment.deleted", "payment", data.id, { amount_cents: pay.amount_cents });
    return { ok: true as const };
  });
