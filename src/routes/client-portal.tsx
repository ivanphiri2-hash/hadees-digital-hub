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
      <Section
        eyebrow="Client Portal"
        title={<>Your clients, self-served.</>}
        intro="A secure, branded portal that reduces support load and increases client trust."
      >
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
