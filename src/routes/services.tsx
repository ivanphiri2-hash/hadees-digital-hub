import { createFileRoute, Link } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { SERVICES } from "@/lib/company";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Hadees Trading" },
      { name: "description", content: "14 enterprise services: websites, registration, tenders, compliance, CRM, automation, AI, branding, cloud, IT consulting, training and documentation." },
      { property: "og:title", content: "Services — Hadees Trading" },
      { property: "og:description", content: "Every service your SA business needs, from one enterprise partner." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  return (
    <>
      <Section
        eyebrow="Services"
        title={<>Fourteen enterprise services, one team.</>}
        intro="Every service is delivered by senior specialists, priced transparently, and integrated into the same IVAN OS operating system."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <GlassCard key={s.slug}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-bold">{s.name}</h3>
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--color-gold)]" />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-royal-soft)]">
                Enquire <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </GlassCard>
          ))}
        </div>
      </Section>
      <BigCTA
        title="Not sure which service you need?"
        subtitle="Send us your goal — we'll bundle the right services and a fixed price."
        primary={{ label: "Talk to a specialist", to: "/contact" }}
        secondary={{ label: "See Packages", to: "/packages" }}
      />
    </>
  );
}
