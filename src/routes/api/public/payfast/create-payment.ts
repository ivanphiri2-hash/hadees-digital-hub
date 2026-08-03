import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Input = z.object({
  service_slug: z.string().min(1).max(64),
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().max(32).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const Route = createFileRoute("/api/public/payfast/create-payment")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body" }, { status: 400 });
        }
        const parsed = Input.safeParse(body);
        if (!parsed.success) {
          return Response.json({ error: "Invalid input" }, { status: 400 });
        }
        try {
          const { createPayFastPayment } = await import("@/lib/payfast-checkout.server");
          const result = await createPayFastPayment(parsed.data);
          return Response.json(result);
        } catch (e) {
          console.error("create-payment failed", e);
          return Response.json(
            { error: e instanceof Error ? e.message : "Payment could not be created" },
            { status: 500 },
          );
        }
      },
    },
  },
});
