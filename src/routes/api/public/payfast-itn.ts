import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/payfast-itn")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Read raw body first — signature computation depends on exact form.
        const raw = await request.text();
        const params = new URLSearchParams(raw);
        const posted: Record<string, string> = {};
        for (const [k, v] of params.entries()) posted[k] = v;

        const {
          getPayFastConfig,
          payfastItnSignature,
          validateItnWithPayFast,
        } = await import("@/lib/payfast.server");
        const cfg = getPayFastConfig();

        // 1. Signature must match.
        const expectedSig = payfastItnSignature(posted, cfg.passphrase);
        if (expectedSig !== (posted.signature ?? "")) {
          console.warn("PayFast ITN: signature mismatch", { ref: posted.m_payment_id });
          return new Response("Invalid signature", { status: 400 });
        }

        // 2. Merchant id must match ours.
        if (posted.merchant_id && posted.merchant_id !== cfg.merchantId) {
          console.warn("PayFast ITN: merchant_id mismatch");
          return new Response("Invalid merchant", { status: 400 });
        }

        // 3. Server-to-server validation with PayFast.
        const valid = await validateItnWithPayFast(cfg.mode, raw);
        if (!valid) {
          console.warn("PayFast ITN: server-side validation failed");
          return new Response("Not validated", { status: 400 });
        }

        // 4. Look up order and confirm amount.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const reference = posted.m_payment_id;
        if (!reference) return new Response("Missing reference", { status: 400 });

        const { data: order, error: fetchErr } = await supabaseAdmin
          .from("orders")
          .select("id, amount_cents, status")
          .eq("reference", reference)
          .maybeSingle();
        if (fetchErr || !order) {
          console.warn("PayFast ITN: unknown order", reference);
          return new Response("Unknown order", { status: 404 });
        }

        const grossCents = Math.round(parseFloat(posted.amount_gross ?? "0") * 100);
        if (grossCents !== order.amount_cents) {
          console.warn("PayFast ITN: amount mismatch", {
            reference,
            expected: order.amount_cents,
            got: grossCents,
          });
          return new Response("Amount mismatch", { status: 400 });
        }

        // 5. Map PayFast status → our status.
        const pfStatus = (posted.payment_status ?? "").toUpperCase();
        let status: "paid" | "failed" | "cancelled" | "refunded" | "pending" = "pending";
        if (pfStatus === "COMPLETE") status = "paid";
        else if (pfStatus === "FAILED") status = "failed";
        else if (pfStatus === "CANCELLED") status = "cancelled";
        else if (pfStatus === "REFUNDED") status = "refunded";

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

        // 6. PayFast requires a plain 200 OK response to consider the ITN handled.
        return new Response("OK", { status: 200 });
      },
    },
  },
});
