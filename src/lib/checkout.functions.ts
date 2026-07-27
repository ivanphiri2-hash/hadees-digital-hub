import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { findPricedService } from "@/lib/company";

const CheckoutInput = z.object({
  service_slug: z.string().min(1).max(64),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(32).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CheckoutInput = z.infer<typeof CheckoutInput>;

export interface CheckoutResponse {
  process_url: string;
  fields: Record<string, string>;
  reference: string;
  mode: "sandbox" | "live";
}

export const createCheckout = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => CheckoutInput.parse(raw))
  .handler(async ({ data }): Promise<CheckoutResponse> => {
    const service = findPricedService(data.service_slug);
    if (!service) throw new Error("Unknown service.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { getPayFastConfig, payfastProcessUrl, payfastSignature } = await import(
      "@/lib/payfast.server"
    );

    const cfg = getPayFastConfig();
    if (!cfg.merchantId || !cfg.merchantKey) {
      throw new Error("Payment gateway is not configured. Please contact support.");
    }
    if (!cfg.siteUrl) {
      throw new Error("SITE_URL is not configured on the server.");
    }

    const reference = `HT-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 7)
      .toUpperCase()}`;

    const [firstName, ...rest] = data.customer_name.trim().split(/\s+/);
    const lastName = rest.join(" ") || firstName;

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      reference,
      service_slug: service.slug,
      service_name: service.name,
      amount_cents: service.amount * 100,
      currency: "ZAR",
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      notes: data.notes || null,
      status: "pending",
    });
    if (insertError) {
      console.error("Failed to insert order", insertError);
      throw new Error("Could not create your order. Please try again.");
    }

    // Field ORDER matters: PayFast signs fields in the same order they're
    // posted. Keep the same order in both this map and the checkout form.
    const fields: Record<string, string> = {
      merchant_id: cfg.merchantId,
      merchant_key: cfg.merchantKey,
      return_url: `${cfg.siteUrl}/payment/success?ref=${encodeURIComponent(reference)}`,
      cancel_url: `${cfg.siteUrl}/payment/cancelled?ref=${encodeURIComponent(reference)}`,
      notify_url: `${cfg.siteUrl}/api/public/payfast-itn`,
      name_first: firstName,
      name_last: lastName,
      email_address: data.customer_email,
      ...(data.customer_phone ? { cell_number: data.customer_phone } : {}),
      m_payment_id: reference,
      amount: service.amount.toFixed(2),
      item_name: service.name.slice(0, 100),
      item_description: service.desc.slice(0, 255),
    };

    const signature = payfastSignature(fields, cfg.passphrase);
    fields.signature = signature;

    return {
      process_url: payfastProcessUrl(cfg.mode),
      fields,
      reference,
      mode: cfg.mode,
    };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) =>
    z.object({ reference: z.string().min(4).max(64) }).parse(raw),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .select("reference, service_name, amount_cents, currency, status, paid_at, customer_email")
      .eq("reference", data.reference)
      .maybeSingle();
    if (error) throw new Error("Could not look up your order.");
    return row;
  });
