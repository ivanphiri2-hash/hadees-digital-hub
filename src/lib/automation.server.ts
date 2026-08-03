// Server-only post-payment automation chain.
// Verified PayFast payment -> client -> invoice -> receipt -> payment record
// -> project -> notifications -> activity log. Idempotent per order.

import type { SupabaseClient } from "@supabase/supabase-js";

interface PaidOrder {
  id: string;
  reference: string;
  service_slug: string;
  service_name: string;
  amount_cents: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  notes: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Admin = SupabaseClient<any, any, any>;

async function nextNumber(admin: Admin, prefix: "INV" | "REC" | "QTN"): Promise<string> {
  const { data, error } = await admin.rpc("next_doc_number", { _prefix: prefix });
  if (error || !data) {
    const y = new Date().getFullYear();
    return `${prefix}-${y}-${Date.now().toString().slice(-6)}`;
  }
  return data as string;
}

/**
 * Runs the full CRM automation for a successfully paid order.
 * Safe to call more than once: each step checks for an existing record first.
 */
export async function runPaymentAutomation(admin: Admin, order: PaidOrder): Promise<void> {
  const paidAt = new Date().toISOString();

  // 1. Client (match on email, otherwise create).
  let clientId: string | null = null;
  const { data: existingClient } = await admin
    .from("clients")
    .select("id, lifetime_value_cents")
    .eq("email", order.customer_email)
    .maybeSingle();

  if (existingClient) {
    clientId = existingClient.id as string;
    await admin
      .from("clients")
      .update({
        lifetime_value_cents: (existingClient.lifetime_value_cents ?? 0) + order.amount_cents,
        status: "active",
      })
      .eq("id", clientId);
  } else {
    const { data: created, error: clientErr } = await admin
      .from("clients")
      .insert({
        full_name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        whatsapp: order.customer_phone,
        status: "active",
        lifetime_value_cents: order.amount_cents,
        notes: order.notes,
      })
      .select("id")
      .single();
    if (clientErr) {
      console.error("automation: client create failed", clientErr);
      return;
    }
    clientId = created.id as string;
  }

  // 2. Invoice (one per order).
  const { data: existingInvoice } = await admin
    .from("invoices")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  let invoiceId = existingInvoice?.id as string | undefined;
  if (!invoiceId) {
    const vatCents = Math.round(order.amount_cents - order.amount_cents / 1.15);
    const invoiceNumber = await nextNumber(admin, "INV");
    const { data: invoice, error: invErr } = await admin
      .from("invoices")
      .insert({
        number: invoiceNumber,
        client_id: clientId,
        order_id: order.id,
        title: order.service_name,
        line_items: [
          {
            description: order.service_name,
            qty: 1,
            unit_cents: order.amount_cents,
            total_cents: order.amount_cents,
          },
        ],
        subtotal_cents: order.amount_cents - vatCents,
        vat_cents: vatCents,
        total_cents: order.amount_cents,
        amount_paid_cents: order.amount_cents,
        currency: order.currency,
        status: "paid",
        paid_at: paidAt,
        notes: `Paid online via PayFast — reference ${order.reference}.`,
      })
      .select("id")
      .single();
    if (invErr) console.error("automation: invoice create failed", invErr);
    invoiceId = invoice?.id as string | undefined;
  }

  // 3. Payment record.
  const { data: existingPayment } = await admin
    .from("payments")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  let paymentId = existingPayment?.id as string | undefined;
  if (!paymentId) {
    const { data: payment, error: payErr } = await admin
      .from("payments")
      .insert({
        invoice_id: invoiceId ?? null,
        client_id: clientId,
        order_id: order.id,
        amount_cents: order.amount_cents,
        currency: order.currency,
        method: "payfast",
        status: "succeeded",
        reference: order.reference,
        paid_at: paidAt,
      })
      .select("id")
      .single();
    if (payErr) console.error("automation: payment create failed", payErr);
    paymentId = payment?.id as string | undefined;
  }

  // 4. Receipt.
  if (paymentId) {
    const { data: existingReceipt } = await admin
      .from("receipts")
      .select("id")
      .eq("payment_id", paymentId)
      .maybeSingle();
    if (!existingReceipt) {
      const receiptNumber = await nextNumber(admin, "REC");
      const { error: recErr } = await admin.from("receipts").insert({
        number: receiptNumber,
        payment_id: paymentId,
        invoice_id: invoiceId ?? null,
        client_id: clientId,
        amount_cents: order.amount_cents,
        currency: order.currency,
        issued_at: paidAt,
      });
      if (recErr) console.error("automation: receipt create failed", recErr);
    }
  }

  // 5. Project.
  const { data: existingProject } = await admin
    .from("projects")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();
  if (!existingProject) {
    const { error: projErr } = await admin.from("projects").insert({
      name: `${order.service_name} — ${order.customer_name}`,
      client_id: clientId,
      order_id: order.id,
      service_slug: order.service_slug,
      status: "pending",
      progress: 0,
      description: order.notes,
      milestones: [
        { title: "Onboarding & information gathering", done: false },
        { title: "Delivery in progress", done: false },
        { title: "Client review", done: false },
        { title: "Handover & completion", done: false },
      ],
    });
    if (projErr) console.error("automation: project create failed", projErr);
  }

  // 6. Notifications (staff + client-facing broadcast).
  await admin.from("notifications").insert([
    {
      audience: "staff",
      type: "payment",
      title: "Payment received",
      body: `${order.customer_name} paid for ${order.service_name} (${order.reference}).`,
      link: "/admin/payments",
    },
    {
      audience: "client",
      type: "welcome",
      title: `Welcome to ${"Hadees Trading"}`,
      body: `Your payment for ${order.service_name} is confirmed. Your invoice, receipt and project are ready in your portal.`,
      link: "/portal",
    },
  ]);

  // 7. Activity log.
  await admin.from("activity_logs").insert({
    actor_name: order.customer_name,
    action: "payment.completed",
    entity_type: "order",
    entity_id: order.id,
    meta: {
      reference: order.reference,
      amount_cents: order.amount_cents,
      service: order.service_name,
      client_id: clientId,
    },
  });
}
