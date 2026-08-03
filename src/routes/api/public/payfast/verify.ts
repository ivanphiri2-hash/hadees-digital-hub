import { createFileRoute } from "@tanstack/react-router";

// Read-only payment status lookup. Returns the server's verified state only —
// a payment is "paid" here only after a validated PayFast ITN.
export const Route = createFileRoute("/api/public/payfast/verify")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const reference = (url.searchParams.get("ref") ?? "").trim();
        if (reference.length < 4 || reference.length > 64) {
          return Response.json({ error: "Invalid reference" }, { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("orders")
          .select("reference, service_name, amount_cents, currency, status, paid_at")
          .eq("reference", reference)
          .maybeSingle();

        if (error) return Response.json({ error: "Lookup failed" }, { status: 500 });
        if (!data) return Response.json({ error: "Not found" }, { status: 404 });

        return Response.json({ ...data, verified: data.status === "paid" });
      },
    },
  },
});
