// Server-only PayFast ITN processing. Shared by all ITN endpoints.
// A payment is ONLY treated as successful after: signature match, merchant
// match, PayFast server-to-server validation, and amount match.

export async function handlePayFastItn(request: Request): Promise<Response> {
  const raw = await request.text();
  const params = new URLSearchParams(raw);
  const posted: Record<string, string> = {};
  for (const [k, v] of params.entries()) posted[k] = v;

  const { getPayFastConfig, payfastItnSignature, validateItnWithPayFast, itnHostAllowed } =
    await import("@/lib/payfast.server");
  const cfg = getPayFastConfig();

  // 0. Origin sanity check (best-effort; header not always present).
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!(await itnHostAllowed(null)) && !(await itnHostAllowed(host))) {
    return new Response("Bad origin", { status: 403 });
  }

  // 1. Signature.
  if (payfastItnSignature(posted, cfg.passphrase) !== (posted.signature ?? "")) {
    console.warn("PayFast ITN: signature mismatch", { ref: posted.m_payment_id });
    return new Response("Invalid signature", { status: 400 });
  }

  // 2. Merchant.
  if (posted.merchant_id && posted.merchant_id !== cfg.merchantId) {
    return new Response("Invalid merchant", { status: 400 });
  }

  // 3. Official PayFast server-to-server validation.
  if (!(await validateItnWithPayFast(cfg.mode, raw))) {
    console.warn("PayFast ITN: validation failed");
    return new Response("Not validated", { status: 400 });
  }

  // 4. Order lookup + amount confirmation.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const reference = posted.m_payment_id;
  if (!reference) return new Response("Missing reference", { status: 400 });

  const { data: order, error: fetchErr } = await supabaseAdmin
    .from("orders")
    .select(
      "id, amount_cents, status, reference, service_slug, service_name, currency, customer_name, customer_email, customer_phone, notes",
    )
    .eq("reference", reference)
    .maybeSingle();
  if (fetchErr || !order) return new Response("Unknown order", { status: 404 });

  const grossCents = Math.round(parseFloat(posted.amount_gross ?? "0") * 100);
  if (grossCents !== order.amount_cents) {
    console.warn("PayFast ITN: amount mismatch", { reference });
    return new Response("Amount mismatch", { status: 400 });
  }

  // 5. Status mapping.
  const pfStatus = (posted.payment_status ?? "").toUpperCase();
  let status: "paid" | "failed" | "cancelled" | "refunded" | "pending" = "pending";
  if (pfStatus === "COMPLETE") status = "paid";
  else if (pfStatus === "FAILED") status = "failed";
  else if (pfStatus === "CANCELLED") status = "cancelled";
  else if (pfStatus === "REFUNDED") status = "refunded";

  const alreadyPaid = order.status === "paid";

  const { error: updateErr } = await supabaseAdmin
    .from("orders")
    .update({
      status,
      pf_payment_id: posted.pf_payment_id ?? null,
      itn_payload: posted,
      ...(status === "paid" ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq("id", order.id);
  if (updateErr) {
    console.error("PayFast ITN: DB update failed", updateErr);
    return new Response("DB error", { status: 500 });
  }

  // 6. Post-payment automation (idempotent).
  if (status === "paid" && !alreadyPaid) {
    try {
      const { runPaymentAutomation } = await import("@/lib/automation.server");
      await runPaymentAutomation(supabaseAdmin, order);
    } catch (e) {
      console.error("PayFast ITN: automation chain failed", e);
    }
  } else if (status === "failed") {
    await supabaseAdmin.from("notifications").insert({
      audience: "staff",
      type: "payment",
      title: "Failed payment",
      body: `Payment failed for ${order.service_name} (${order.reference}).`,
      link: "/admin/payments",
    });
  }

  // 7. PayFast expects a bare 200.
  return new Response("OK", { status: 200 });
}
