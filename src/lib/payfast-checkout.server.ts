// Server-only PayFast payment creation. Secrets never leave the server.
import { findPricedService } from "@/lib/company";
import { getPayFastConfig, payfastProcessUrl, payfastSignature } from "@/lib/payfast.server";

export interface CreatePaymentInput {
  service_slug: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  notes?: string | null;
}

export interface CreatePaymentResult {
  process_url: string;
  fields: Record<string, string>;
  reference: string;
  mode: "sandbox" | "live";
}

export function newReference(): string {
  return `HT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
}

/**
 * Creates a pending order and returns the signed PayFast redirect payload.
 * merchant_key is required by PayFast's redirect form; the passphrase and any
 * other credentials are never returned or exposed.
 */
export async function createPayFastPayment(
  input: CreatePaymentInput,
): Promise<CreatePaymentResult> {
  const service = findPricedService(input.service_slug);
  if (!service) throw new Error("Unknown service.");

  const cfg = getPayFastConfig();
  if (!cfg.merchantId || !cfg.merchantKey) {
    throw new Error("Payment gateway is not configured.");
  }
  if (!cfg.siteUrl) throw new Error("SITE_URL is not configured on the server.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const reference = newReference();
  const [firstName, ...rest] = input.customer_name.trim().split(/\s+/);
  const lastName = rest.join(" ") || firstName;

  const { error: insertError } = await supabaseAdmin.from("orders").insert({
    reference,
    service_slug: service.slug,
    service_name: service.name,
    amount_cents: service.amount * 100,
    currency: "ZAR",
    customer_name: input.customer_name,
    customer_email: input.customer_email,
    customer_phone: input.customer_phone || null,
    notes: input.notes || null,
    status: "pending",
  });
  if (insertError) {
    console.error("payfast: order insert failed", insertError);
    throw new Error("Could not create your order. Please try again.");
  }

  // Field ORDER matters — PayFast signs fields in posted order.
  const fields: Record<string, string> = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: `${cfg.siteUrl}/payment/success?ref=${encodeURIComponent(reference)}`,
    cancel_url: `${cfg.siteUrl}/payment/cancelled?ref=${encodeURIComponent(reference)}`,
    notify_url: `${cfg.siteUrl}/api/public/payfast/itn`,
    name_first: firstName,
    name_last: lastName,
    email_address: input.customer_email,
    ...(input.customer_phone ? { cell_number: input.customer_phone } : {}),
    m_payment_id: reference,
    amount: service.amount.toFixed(2),
    item_name: service.name.slice(0, 100),
    item_description: service.desc.slice(0, 255),
  };
  fields.signature = payfastSignature(fields, cfg.passphrase);

  return { process_url: payfastProcessUrl(cfg.mode), fields, reference, mode: cfg.mode };
}
