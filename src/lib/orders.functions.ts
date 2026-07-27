import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AdminAuth = z.object({ token: z.string().min(8) });

async function verifyAdmin(token: string) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) throw new Error("Admin access not configured.");
  // Constant-time compare
  if (token.length !== expected.length) throw new Error("Invalid admin token.");
  let mismatch = 0;
  for (let i = 0; i < token.length; i++) mismatch |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) throw new Error("Invalid admin token.");
}

export const adminVerifyToken = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => AdminAuth.parse(raw))
  .handler(async ({ data }) => {
    await verifyAdmin(data.token);
    return { ok: true as const };
  });

export const adminListOrders = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => AdminAuth.parse(raw))
  .handler(async ({ data }) => {
    await verifyAdmin(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("orders")
      .select("id, reference, service_slug, service_name, amount_cents, currency, status, customer_name, customer_email, customer_phone, pf_payment_id, created_at, paid_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
