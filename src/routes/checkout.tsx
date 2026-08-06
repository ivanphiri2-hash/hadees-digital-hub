import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { z } from "zod";
import { ArrowRight, Lock, ShieldCheck, CreditCard, Loader2 } from "lucide-react";

import { GradientOrbs, GlassCard } from "@/components/site/ui";
import { findPricedService, PRICED_SERVICES } from "@/lib/company";
import { paymentService, type CheckoutDetails } from "@/lib/payments/payment-service";


const searchSchema = z.object({ service: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Secure Checkout — Hadees Trading" },
      { name: "description", content: "Complete your order securely with PayFast — instant EFT, Visa, Mastercard, Capitec Pay and more." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { service: initial } = useSearch({ from: "/checkout" });
  const [slug, setSlug] = useState<string>(initial ?? PRICED_SERVICES[0].slug);
  const service = useMemo(() => findPricedService(slug), [slug]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const [pending, setPending] = useState<{ process_url: string; fields: Record<string, string> } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: {
      service_slug: string;
      customer_name: string;
      customer_email: string;
      customer_phone?: string;
      notes?: string;
    }) => createCheckout({ data }),
    onSuccess: (res) => setPending({ process_url: res.process_url, fields: res.fields }),
    onError: (e: Error) => setError(e.message || "Something went wrong."),
  });

  // As soon as we have PayFast fields, auto-submit the hidden form.
  useEffect(() => {
    if (pending && formRef.current) formRef.current.submit();
  }, [pending]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!service) { setError("Pick a service."); return; }
    if (name.trim().length < 2) { setError("Enter your full name."); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setError("Enter a valid email."); return; }
    mutation.mutate({
      service_slug: service.slug,
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <section className="relative overflow-hidden">
      <GradientOrbs />
      <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Lock className="h-3 w-3 text-[var(--color-gold)]" /> Secure Checkout · PayFast
          </div>
          <h1 className="mt-5 font-display text-3xl font-black tracking-tight sm:text-5xl">
            Complete your order.
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Fill in your details below. You'll be redirected to PayFast to finish the payment — Instant EFT, Visa, Mastercard, Capitec Pay, Apple Pay & Google Pay all supported.
          </p>

          <form onSubmit={onSubmit} className="mt-8 grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Service</span>
              <select
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]"
              >
                {PRICED_SERVICES.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name} — {s.price}</option>
                ))}
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
              </label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone / WhatsApp (optional)</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
              </label>
              <label className="grid gap-1.5 text-sm sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notes (optional)</span>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
              </label>
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</div>
            )}

            <button
              type="submit"
              disabled={mutation.isPending || !!pending}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-royal)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-royal)_35%,transparent)] disabled:opacity-70"
            >
              {mutation.isPending || pending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Redirecting to PayFast…</>
              ) : (
                <>Pay {service?.price} securely <ArrowRight className="h-4 w-4" /></>
              )}
            </button>

            <p className="text-[11px] text-muted-foreground">
              By continuing you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/refund" className="underline">Refund Policy</Link>. Payments are processed securely by PayFast — we never see or store your card details.
            </p>
          </form>

          {/* Hidden auto-submitting form → PayFast */}
          {pending && (
            <form ref={formRef} action={pending.process_url} method="POST" className="hidden">
              {Object.entries(pending.fields).map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v} />
              ))}
            </form>
          )}
        </div>

        <aside className="lg:mt-14">
          <GlassCard className="p-7">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order summary</div>
            <div className="mt-2 font-display text-xl font-bold">{service?.name}</div>
            <p className="mt-1 text-sm text-muted-foreground">{service?.desc}</p>
            <div className="my-5 h-px bg-border/60" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{service?.price}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">VAT</span>
              <span className="text-muted-foreground">Included where applicable</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between border-t border-border/60 pt-4">
              <span className="text-sm font-semibold">Total (ZAR)</span>
              <span className="font-display text-3xl font-black gradient-text">{service?.price}</span>
            </div>

            <div className="mt-6 grid gap-2 text-xs text-muted-foreground">
              <div className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Secure Payment by PayFast</div>
              <div className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-[var(--color-gold)]" /> SSL Secured Checkout</div>
              <div className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-[var(--color-gold)]" /> Instant EFT · Visa · Mastercard · Capitec Pay · Apple Pay · Google Pay</div>
            </div>
          </GlassCard>
        </aside>
      </div>
    </section>
  );
}
