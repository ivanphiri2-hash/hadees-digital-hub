import { ServiceFaq } from "@/components/site/ServiceFaq";
import { reviewedServiceSeo, serviceSearchScripts } from "@/lib/reviewed-service-seo";
import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { ShieldCheck } from "lucide-react";
import { NationalDelivery } from "@/components/site/NationalDelivery";

export const Route = createFileRoute("/compliance")({
  head: () => ({
    meta: [
      { title: reviewedServiceSeo["/compliance"].title },
      { name: "description", content: reviewedServiceSeo["/compliance"].description },
      { property: "og:title", content: reviewedServiceSeo["/compliance"].title },
      { property: "og:description", content: reviewedServiceSeo["/compliance"].description },
      { property: "og:url", content: "/compliance" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: serviceSearchScripts("/compliance"),
    links: [{ rel: "canonical", href: "/compliance" }],
  }),
  component: Compliance,
});

const areas = [
  { title: "CIPC", desc: "Annual returns, amendments, share and director changes." },
  { title: "SARS", desc: "Tax registration, clearance pins, VAT & PAYE guidance." },
  { title: "COIDA", desc: "Employer registration, letters of good standing, renewals." },
  { title: "CIDB", desc: "Construction grading, upgrades and re-registration." },
  { title: "B-BBEE", desc: "Affidavits, certificates and level guidance for EME/QSE." },
  { title: "NHBRC", desc: "Home builder enrolment and project registration." },
  { title: "POPIA", desc: "Information Officer, PAIA manuals, breach playbook." },
];

function Compliance() {
  return (
    <>
      <Section as="h1"
        eyebrow="Compliance"
        title={<>Company health, monitored all year.</>}
        intro="A single dashboard for every regulator your SA business must answer to."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <GlassCard key={a.title}>
              <ShieldCheck className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{a.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{a.desc}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <Section eyebrow="Company Health Dashboard" title={<>See every deadline before it sees you.</>}>
        <div className="glass rounded-3xl p-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "CIPC Annual Return", status: "Due in 42 days", tone: "amber" },
              { label: "SARS Tax Clearance", status: "Valid · 11 months", tone: "green" },
              { label: "COIDA Good Standing", status: "Valid · 8 months", tone: "green" },
              { label: "B-BBEE Affidavit", status: "Renew in 90 days", tone: "amber" },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl border border-border/60 bg-card/40 p-4">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{k.label}</div>
                <div className={`mt-1 font-display text-lg font-bold ${k.tone === "green" ? "text-emerald-400" : "text-[var(--color-gold)]"}`}>{k.status}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <BigCTA
        title="Never miss a compliance deadline again."
        subtitle="We monitor every renewal and file every return — before penalties hit."
        primary={{ label: "Get compliance managed", to: "/contact" }}
      />
      <ServiceFaq path="/compliance" />
      <NationalDelivery service="compliance" />
    </>
  );
}
