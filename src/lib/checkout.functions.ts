import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const { createPayFastPayment } = await import("@/lib/payfast-checkout.server");
    return createPayFastPayment({
      service_slug: data.service_slug,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone || null,
      notes: data.notes || null,
    });
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
