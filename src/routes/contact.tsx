import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Section, GlassCard } from "@/components/site/ui";
import { COMPANY } from "@/lib/company";
import { Mail, Phone, MapPin, MessageCircle, Navigation } from "lucide-react";
import { SocialLinks } from "@/components/site/SocialLinks";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Hadees Trading (Pty) Ltd" },
      { name: "description", content: `Contact Hadees Trading in ${COMPANY.city}, South Africa. Phone ${COMPANY.phone} · Email ${COMPANY.email}.` },
      { property: "og:title", content: "Contact — Hadees Trading" },
      { property: "og:description", content: "Speak to our team about websites, registration, compliance, tenders and AI." },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: COMPANY.legalName,
        address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressCountry: "ZA" },
        telephone: COMPANY.phoneIntl,
        email: COMPANY.email,
      }),
    }],
  }),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Website enquiry — ${form.name || "New lead"}`);
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:${COMPANY.email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const mapsQ = encodeURIComponent(`${COMPANY.city}, ${COMPANY.country}`);

  return (
    <>
      <Section as="h1"
        eyebrow="Contact"
        title={<>Talk to Hadees Trading.</>}
        intro="Send a message, WhatsApp us, or drop by our Mahikeng office."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <GlassCard>
              <form onSubmit={onSubmit} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Name</span>
                    <input required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-royal)]/40" />
                  </label>
                  <label className="grid gap-1.5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
                    <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-royal)]/40" />
                  </label>
                </div>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Phone</span>
                  <input maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-royal)]/40" />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Message</span>
                  <textarea required maxLength={2000} rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--color-royal)]/40" />
                </label>
                <button type="submit" className="inline-flex items-center justify-center rounded-full bg-[var(--color-royal)] px-5 py-2.5 text-sm font-semibold text-white">
                  Send message
                </button>
                {sent && <div className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">Thanks — your email client should now open. We reply within one business day.</div>}
              </form>
            </GlassCard>
          </div>

          <div className="grid gap-4 content-start">
            <GlassCard>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 text-[var(--color-royal-soft)]" /><div><div className="font-semibold">Office</div><div className="text-muted-foreground">{COMPANY.city}, {COMPANY.country}</div></div></div>
                <div className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 text-[var(--color-royal-soft)]" /><div><div className="font-semibold">Phone</div><a href={`tel:${COMPANY.phoneIntl}`} className="text-muted-foreground hover:text-foreground">{COMPANY.phone}</a></div></div>
                <div className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 text-[var(--color-royal-soft)]" /><div><div className="font-semibold">Email</div><a href={`mailto:${COMPANY.email}`} className="text-muted-foreground hover:text-foreground">{COMPANY.email}</a></div></div>
              </div>
              <div className="mt-4 grid gap-2">
                <a href={`https://wa.me/${COMPANY.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
                  <MessageCircle className="h-4 w-4" /> WhatsApp us
                </a>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${mapsQ}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 px-4 py-2 text-sm font-semibold">
                  <Navigation className="h-4 w-4" /> Get directions
                </a>
              </div>
            </GlassCard>
            <GlassCard>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Follow Hadees Trading</div>
              <SocialLinks size="sm" className="mt-4" />
            </GlassCard>
          </div>

        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-border/60">
          <iframe
            title={`Map of ${COMPANY.city}`}
            src={`https://www.google.com/maps?q=${mapsQ}&t=k&output=embed`}
            className="h-[420px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>
    </>
  );
}
