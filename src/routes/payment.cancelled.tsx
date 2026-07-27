import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { XCircle, Home, RefreshCw } from "lucide-react";
import { z } from "zod";

import { GradientOrbs, GlassCard } from "@/components/site/ui";

export const Route = createFileRoute("/payment/cancelled")({
  validateSearch: z.object({ ref: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Payment Cancelled — Hadees Trading" },
      { name: "description", content: "Your payment was cancelled. You can try again any time." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Cancelled,
});

function Cancelled() {
  const { ref } = useSearch({ from: "/payment/cancelled" });
  return (
    <section className="relative overflow-hidden">
      <GradientOrbs />
      <div className="relative mx-auto max-w-2xl px-4 py-24 sm:px-6 lg:px-8">
        <GlassCard className="p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-500/15 text-amber-400">
            <XCircle className="h-9 w-9" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-black sm:text-4xl">Payment Cancelled</h1>
          <p className="mt-3 text-muted-foreground">
            You cancelled the payment before it was completed. No charges were made to your account.
          </p>
          {ref && (
            <div className="mt-4 text-xs text-muted-foreground">Reference: <span className="font-mono">{ref}</span></div>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/checkout" className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-royal)] px-5 py-2.5 text-sm font-semibold text-white">
              <RefreshCw className="h-4 w-4" /> Try Again
            </Link>
            <Link to="/" className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-5 py-2.5 text-sm font-semibold">
              <Home className="h-4 w-4" /> Return Home
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
