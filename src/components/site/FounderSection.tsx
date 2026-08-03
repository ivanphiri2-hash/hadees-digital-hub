// Founder trust section — corporate credibility block used on Home and About.
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Building2, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { COMPANY, FOUNDER } from "@/lib/company";
import founderPhoto from "@/assets/founder-ivan-phiri.jpg";

const trust = [
  { icon: Building2, label: "Registered company", body: `${COMPANY.legalName}, ${COMPANY.city}, South Africa` },
  { icon: ShieldCheck, label: "Secure payments", body: "PayFast-secured checkout with instant invoices & receipts" },
  { icon: BadgeCheck, label: "Published pricing", body: "Fixed ZAR pricing on every service — no hidden fees" },
];

export function FounderSection() {
  return (
    <section className="relative border-y border-border/60 bg-[color-mix(in_oklab,var(--background)_94%,black)] py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
            Leadership
          </div>
          <h2 className="mt-5 font-display text-4xl font-black tracking-tight sm:text-5xl">
            Meet the <span className="gradient-text">Founder</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Real people, a registered company and accountable delivery — here is who stands behind every project.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,380px)_1fr]">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rounded-3xl bg-[var(--color-royal)]/15 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-2xl">
              <img
                src={founderPhoto}
                alt={`${FOUNDER.name}, ${FOUNDER.title} of ${COMPANY.legalName}`}
                width={1024}
                height={1280}
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="border-t border-border/60 bg-card/80 p-5">
                <div className="font-display text-xl font-bold">{FOUNDER.name}</div>
                <div className="text-sm text-[var(--color-gold)]">{FOUNDER.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{COMPANY.legalName}</div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">{FOUNDER.bio}</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
                <h3 className="font-display text-base font-bold">Our mission</h3>
                <p className="mt-2 text-sm text-muted-foreground">{FOUNDER.mission}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-card/50 p-5">
                <h3 className="font-display text-base font-bold">Our vision</h3>
                <p className="mt-2 text-sm text-muted-foreground">{FOUNDER.vision}</p>
              </div>
            </div>

            <ul className="mt-6 grid gap-3">
              {trust.map((t) => (
                <li key={t.label} className="flex items-start gap-3">
                  <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-royal-soft)]" />
                  <span className="text-sm">
                    <span className="font-semibold">{t.label}</span>
                    <span className="text-muted-foreground"> — {t.body}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[var(--color-royal)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <Mail className="h-4 w-4" /> Contact Hadees Trading
              </Link>
              <a
                href={`https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hi Hadees Trading, I'd like a consultation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--color-gold)]"
              >
                <MessageCircle className="h-4 w-4 text-[var(--color-gold)]" /> WhatsApp consultation
              </a>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--color-royal)]"
              >
                Request a quote
              </Link>
              <a
                href={`tel:${COMPANY.phoneIntl}`}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--color-royal)]"
              >
                <Phone className="h-4 w-4" /> {COMPANY.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
