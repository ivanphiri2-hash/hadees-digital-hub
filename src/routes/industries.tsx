import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries — Hadees Trading" },
      { name: "description", content: "Hadees Trading serves construction, retail, professional services, logistics, mining services, hospitality, agriculture and the public sector across South Africa." },
      { property: "og:title", content: "Industries — Hadees Trading" },
      { property: "og:description", content: "Purpose-built for South African sectors." },
      { property: "og:url", content: "/industries" },
    ],
    links: [{ rel: "canonical", href: "/industries" }],
  }),
  component: Industries,
});

const ind = [
  { t: "Construction", b: "CIDB grading, NHBRC, tender preparation and site management tools." },
  { t: "Retail & Trading", b: "Websites, PayFast payments, inventory and CRM." },
  { t: "Professional Services", b: "Client portal, quotes, invoices and compliance monitoring." },
  { t: "Logistics", b: "Fleet & job tracking, driver mobile app and reporting." },
  { t: "Mining Services", b: "Contractor compliance, SLAs, and safety documentation." },
  { t: "Hospitality", b: "Bookings, PayFast, POPIA-ready guest data management." },
  { t: "Agriculture", b: "Field logs, supplier docs, compliance and export documentation." },
  { t: "Public Sector Suppliers", b: "CSD, CIDB, B-BBEE and full tender lifecycle support." },
];

function Industries() {
  return (
    <>
      <Section as="h1" eyebrow="Industries" title={<>Purpose-built for South African sectors.</>}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {ind.map((i) => (
            <GlassCard key={i.t}>
              <h3 className="font-display text-lg font-bold">{i.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{i.b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
      <BigCTA title="Your industry, understood." subtitle="Book a scoping call and we'll tailor a package to your sector." primary={{ label: "Book scoping call", to: "/contact" }} />
    </>
  );
}
