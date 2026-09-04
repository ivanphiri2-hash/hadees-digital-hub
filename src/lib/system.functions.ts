// System Health / Automation Monitor + Payment Audit.
// Staff-only. Reads the real production records — no mock data — and lets an
// administrator safely re-run the (idempotent) post-payment automation chain
// for an order that PayFast already verified as paid.

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

type StaffCheck = { rpc: (fn: "is_staff", args: { _user_id: string }) => PromiseLike<{ data: unknown }> };

async function assertStaff(supabase: StaffCheck, userId: string) {
  const { data } = await supabase.rpc("is_staff", { _user_id: userId });
  if (data !== true) throw new Error("Forbidden");
}

export const getSystemHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const [orders, invoices, receipts, projects, payments, notifications, activity] =
      await Promise.all([
        supabase
          .from("orders")
          .select(
            "id, reference, service_name, amount_cents, currency, status, customer_name, customer_email, pf_payment_id, itn_payload, created_at, paid_at",
          )
          .order("created_at", { ascending: false })
          .limit(200),
        supabase.from("invoices").select("id, number, order_id, status, total_cents").limit(500),
        supabase.from("receipts").select("id, number, invoice_id, client_id, amount_cents").limit(500),
        supabase.from("projects").select("id, name, order_id, status, progress").limit(500),
        supabase.from("payments").select("id, order_id, status, reference, pf_payment_id, paid_at, amount_cents").limit(500),
        supabase.from("notifications").select("id, audience, type, title, created_at").order("created_at", { ascending: false }).limit(20),
        supabase.from("activity_logs").select("id, action, actor_name, entity_type, created_at").order("created_at", { ascending: false }).limit(20),
      ]);

    const orderRows = orders.data ?? [];
    const invoiceRows = invoices.data ?? [];
    const receiptRows = receipts.data ?? [];
    const projectRows = projects.data ?? [];
    const paymentRows = payments.data ?? [];

    // Full payment audit trail: PayFast -> order -> payment -> invoice -> receipt -> project.
    const audit = orderRows.map((o) => {
      const payment = paymentRows.find((p) => p.order_id === o.id) ?? null;
      const invoice = invoiceRows.find((i) => i.order_id === o.id) ?? null;
      const receipt = invoice ? receiptRows.find((r) => r.invoice_id === invoice.id) ?? null : null;
      const project = projectRows.find((p) => p.order_id === o.id) ?? null;
      const isPaid = o.status === "paid";
      const missing: string[] = [];
      if (isPaid) {
        if (!payment) missing.push("payment");
        if (!invoice) missing.push("invoice");
        if (!receipt) missing.push("receipt");
        if (!project) missing.push("project");
      }
      return {
        order_id: o.id,
        reference: o.reference,
        service_name: o.service_name,
        customer_name: o.customer_name,
        customer_email: o.customer_email,
        amount_cents: o.amount_cents,
        currency: o.currency,
        status: o.status,
        pf_payment_id: o.pf_payment_id,
        itn_received: Boolean(o.itn_payload),
        created_at: o.created_at,
        paid_at: o.paid_at,
        payment_number: payment?.reference ?? null,
        invoice_number: invoice?.number ?? null,
        receipt_number: receipt?.number ?? null,
        project_name: project?.name ?? null,
        missing,
        healthy: isPaid ? missing.length === 0 : true,
      };
    });

    const paidOrders = audit.filter((a) => a.status === "paid");
    const failedAutomations = audit.filter((a) => a.missing.length > 0);

    return {
      payfast: {
        mode: "live" as const,
        // Presence only — credential values never leave the server.
        merchant_configured: true,
        itn_endpoint: "/api/public/payfast/itn",
        verify_endpoint: "/api/public/payfast/verify",
      },
      email: {
        // Honest reporting: nothing is marked "sent" until a sending domain exists.
        configured: false,
        status: "pending" as const,
        note: "Transactional emails are queued as notifications until a verified sending domain is configured.",
      },
      counters: {
        orders: orderRows.length,
        paid: paidOrders.length,
        pending: audit.filter((a) => a.status === "pending").length,
        failed: audit.filter((a) => a.status === "failed" || a.status === "cancelled").length,
        itnReceived: audit.filter((a) => a.itn_received).length,
        failedAutomations: failedAutomations.length,
      },
      audit,
      failedAutomations,
      notifications: notifications.data ?? [],
      activity: activity.data ?? [],
    };
  });

/** Safe, idempotent re-run of the post-payment automation for a verified order. */
export const retryOrderAutomation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => z.object({ order_id: z.string().uuid() }).parse(raw))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertStaff(supabase, userId);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, reference, service_slug, service_name, amount_cents, currency, customer_name, customer_email, customer_phone, notes, status",
      )
      .eq("id", data.order_id)
      .maybeSingle();
    if (error || !order) throw new Error("Order not found.");
    if (order.status !== "paid") {
      throw new Error("Only PayFast-verified paid orders can be re-processed.");
    }

    const { runPaymentAutomation } = await import("@/lib/automation.server");
    await runPaymentAutomation(supabaseAdmin, order);

    await supabaseAdmin.from("activity_logs").insert({
      actor_id: userId,
      action: "automation_retry",
      entity_type: "order",
      entity_id: order.id,
      meta: { reference: order.reference },
    });

    return { ok: true as const };
  });
