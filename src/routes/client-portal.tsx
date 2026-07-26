import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { Lock, FileText, CreditCard, PenLine, Bell, LifeBuoy, Calendar, FolderOpen, ShieldCheck, Receipt } from "lucide-react";

export const Route = createFileRoute("/client-portal")({
  head: () => ({
    meta: [
      { title: "Client Portal — Secure Access for Your Clients — Hadees Trading" },
      { name: "description", content: "Give your clients a secure portal for invoices, projects, compliance, bookings, support, notifications, payments, documents and e-signatures." },
      { property: "og:title", content: "Client Portal — Hadees Trading" },
      { property: "og:description", content: "A secure, branded portal for every client relationship." },
      { property: "og:url", content: "/client-portal" },
    ],
    links: [{ rel: "canonical", href: "/client-portal" }],
  }),
  component: Portal,
});

const items = [
  { i: Lock, t: "Secure Login", b: "Passwordless, MFA and biometric options." },
  { i: Receipt, t: "Invoices", b: "View, download and pay invoices online." },
  { i: FolderOpen, t: "Projects", b: "Track project status, milestones and deliverables." },
  { i: ShieldCheck, t: "Compliance", b: "See CIPC, SARS, COIDA and B-BBEE status." },
  { i: Calendar, t: "Bookings", b: "Book consults & site visits with your account manager." },
  { i: LifeBuoy, t: "Support", b: "Open tickets and track resolution times." },
  { i: Bell, t: "Notifications", b: "Deadline, invoice and compliance alerts." },
  { i: CreditCard, t: "Payments", b: "PayFast-ready secure payments." },
  { i: FileText, t: "Documents", b: "Every certificate, letter and contract in one vault." },
  { i: PenLine, t: "Electronic Signatures", b: "Legally-binding e-signatures for SA contracts." },
];

function Portal() {
  return (
    <>
      <Section as="h1"
        eyebrow="Client Portal"
        title={<>Your clients, self-served.</>}
        intro="A secure, branded portal that reduces support load and increases client trust."
      >
        <PortalPreview />
      </Section>

      <Section eyebrow="Features" title={<>Everything a modern SA client expects.</>}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ i: Icon, t, b }) => (
            <GlassCard key={t}>
              <Icon className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
      <BigCTA title="Launch your branded client portal." subtitle="Included with the Premium website package." primary={{ label: "See Packages", to: "/packages" }} secondary={{ label: "Talk to us", to: "/contact" }} />
    </>
  );
}

function PortalPreview() {
  return (
    <div className="glass overflow-hidden rounded-3xl border border-border/60 p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5" /> portal.hadeestrading.co.za</div>
        <div className="font-mono text-muted-foreground">Signed in · Sithole Events</div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="grid gap-3">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Compliance status</div>
            <div className="mt-3 grid gap-2 text-sm">
              {[
                { l: "CIPC Annual Return", s: "Compliant", tone: "green" },
                { l: "Tax Clearance", s: "Compliant", tone: "green" },
                { l: "B-BBEE Affidavit", s: "Renew in 12d", tone: "gold" },
                { l: "COIDA Letter of Good Standing", s: "Overdue", tone: "red" },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2">
                  <span>{r.l}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${r.tone === "green" ? "bg-emerald-500/15 text-emerald-300" : r.tone === "gold" ? "bg-amber-500/15 text-amber-300" : "bg-red-500/15 text-red-300"}`}>{r.s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Next booking</div>
            <div className="mt-2 text-sm font-semibold">Kickoff · Mon 27 Jul · 10:00</div>
            <div className="text-xs text-muted-foreground">With Hadees Trading · Google Meet</div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-4">
          <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>Invoices</span><span>Amount due · R 18,500</span>
          </div>
          <div className="grid gap-2 text-sm">
            {[
              { n: "INV-2026-9082", t: "Premium Website", v: "R 18,500", s: "Due 30 Jul", tone: "gold" },
              { n: "INV-2026-9070", t: "Branding kit", v: "R 4,400", s: "Paid", tone: "green" },
              { n: "INV-2026-9061", t: "CIPC Registration", v: "R 950", s: "Paid", tone: "green" },
            ].map((i) => (
              <div key={i.n} className="flex items-center justify-between rounded-xl border border-border/60 bg-black/20 px-3 py-2.5">
                <div>
                  <div className="font-mono text-[11px] text-muted-foreground">{i.n}</div>
                  <div className="text-sm font-semibold">{i.t}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-display text-sm font-bold">{i.v}</div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${i.tone === "green" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{i.s}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
