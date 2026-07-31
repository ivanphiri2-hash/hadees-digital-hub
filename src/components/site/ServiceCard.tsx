import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, MessageCircle, FileText } from "lucide-react";

import { COMPANY, type CatalogService } from "@/lib/company";

function whatsappHref(service: CatalogService) {
  const text = `Hi Hadees Trading, I'm interested in the ${service.name} (${service.price}). Please assist.`;
  return `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function ServiceCard({ service }: { service: CatalogService }) {
  return (
    <article className="glass flex h-full flex-col rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold leading-snug">{service.name}</h3>
            {service.badge && (
              <span className="rounded-full bg-[var(--color-gold)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">
                {service.badge}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">
            {service.startingFrom ? "Starting from" : "Fixed price"}
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-[var(--color-gold)]/15 px-3 py-1 text-sm font-bold text-[var(--color-gold)]">
          {service.price}
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">{service.desc}</p>

      {service.benefits && service.benefits.length > 0 && (
        <ul className="mt-4 space-y-1.5">
          {service.benefits.map((b) => (
            <li key={b} className="flex gap-2 text-xs text-foreground/80">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-royal)]" />
              {b}
            </li>
          ))}
        </ul>
      )}

      {service.includes && service.includes.length > 0 && (
        <div className="mt-4 rounded-xl border border-border/60 bg-card/40 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">What's included</div>
          <ul className="mt-2 grid gap-1.5">
            {service.includes.map((i) => (
              <li key={i} className="flex gap-2 text-xs text-foreground/85">
                <Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-gold)]" />
                {i}
              </li>
            ))}
          </ul>
        </div>
      )}

      {service.disclaimer && (
        <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-amber-300/90">
          <span className="font-semibold">Important:</span> {service.disclaimer}
        </p>
      )}

      <div className="mt-5 flex-1" />

      <div className="grid gap-2">
        <Link
          to="/checkout"
          search={{ service: service.slug }}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--color-royal)] px-4 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          {service.cta} <ArrowRight aria-hidden className="ml-1.5 h-4 w-4" />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/contact"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border/70 px-3 text-xs font-semibold text-foreground hover:bg-card"
          >
            <FileText aria-hidden className="h-3.5 w-3.5" /> Request Quote
          </Link>
          <a
            href={whatsappHref(service)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-3 text-xs font-semibold text-[#25D366]"
          >
            <MessageCircle aria-hidden className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
