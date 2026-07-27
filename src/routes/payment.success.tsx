import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, MessageCircle, Home, Loader2 } from "lucide-react";
import { z } from "zod";

import { GradientOrbs, GlassCard } from "@/components/site/ui";
import { getOrderStatus } from "@/lib/checkout.functions";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/payment/success")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Successful — Hadees Trading" },
      { name: "description", content: "Your payment has been received successfully. Thank you for choosing Hadees Trading." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Success,
});

function formatZar(cents?: number) {
  if (!cents && cents !== 0) return "—";
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
}

function Success() {
  const { ref } = useSearch({ from: "/payment/success" });
  const q = useQuery({
    queryKey: ["order", ref],
    queryFn: () => getOrderStatus({ data: { reference: ref! } }),
    enabled: !!ref,
    refetchInterval: (query) => (query.state.data?.status === "paid" ? false : 3000),
  });

  return (
    <section className="relative overflow-hidden">
      <GradientOrbs />
      <div className="relative mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
        <GlassCard className="p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-black sm:text-4xl">Payment Successful</h1>
          <p className="mt-3 text-muted-foreground">
            Thank you for choosing HADEES TRADING (PTY) LTD. Your payment has been received successfully.
          </p>

          <div className="mt-8 rounded-2xl border border-border/60 bg-card/40 p-5 text-left">
            <div className="grid gap-2 text-sm">
              <Row label="Reference number" value={ref ?? "—"} mono />
              {q.isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Confirming with PayFast…</div>
              )}
              {q.data && (
                <>
                  <Row label="Service" value={q.data.service_name} />
                  <Row label="Amount" value={formatZar(q.data.amount_cents ?? undefined)} />
                  <Row label="Status" value={q.data.status ?? "pending"} pill />
                </>
              )}
            </div>
            {q.data?.status !== "paid" && (
              <p className="mt-4 text-xs text-muted-foreground">
                PayFast will confirm your payment within a few seconds. You'll receive an email receipt automatically.
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(`Hi, I've just paid — reference ${ref}`)}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-gold)] px-5 py-2.5 text-sm font-semibold text-[var(--color-ink)]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp Support
            </a>
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-5 py-2.5 text-sm font-semibold">
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}

function Row({ label, value, mono, pill }: { label: string; value: string; mono?: boolean; pill?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      {pill ? (
        <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-400">{value}</span>
      ) : (
        <span className={mono ? "font-mono text-sm" : "text-sm font-medium"}>{value}</span>
      )}
    </div>
  );
}
