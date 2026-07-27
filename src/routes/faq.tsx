import { createFileRoute } from "@tanstack/react-router";
import { Section, BigCTA } from "@/components/site/ui";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Business registration, websites, COIDA, NHBRC, PSIRA" },
      { name: "description", content: "Answers on company registration, website design, COIDA, NHBRC, PSIRA assistance, B-BBEE, tax clearance, payments and turnaround times." },
      { property: "og:title", content: "FAQ — Hadees Trading" },
      { property: "og:description", content: "Straight answers on registrations, websites, compliance and payments." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_GROUPS.flatMap((g) => g.items).map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }),
    }],
  }),
  component: FAQPage,
});

const FAQ_GROUPS = [
  {
    heading: "Company Registration",
    items: [
      { q: "How long does company registration take?", a: "Typically 24–72 working hours through CIPC once we have your ID, address and preferred name." },
      { q: "What documents do I need?", a: "A certified copy of your South African ID, a proposed company name, your address, and your contact details." },
      { q: "What's included in the R1,500 fee?", a: "CIPC name reservation, full registration, statutory company documents, a share certificate, and digital copies delivered to you." },
    ],
  },
  {
    heading: "Website Design",
    items: [
      { q: "How long does a website take?", a: "Starter 5–7 working days, Business 7–10, Premium 10–20 working days from content receipt." },
      { q: "Do you build mobile-friendly, SEO-ready sites?", a: "Every site ships mobile-first, SEO-optimised, and with structured data, sitemap and robots.txt." },
      { q: "Can you integrate PayFast?", a: "Yes — the Premium package includes PayFast checkout integration. Add-on available for Business." },
    ],
  },
  {
    heading: "COIDA",
    items: [
      { q: "Who needs COIDA registration?", a: "Any employer with one or more employees must register with the Compensation Fund (COIDA) by law." },
      { q: "How long does it take?", a: "5–15 working days depending on Compensation Fund turnaround." },
    ],
  },
  {
    heading: "NHBRC",
    items: [
      { q: "Do I need NHBRC to build houses?", a: "Yes — home builders in South Africa must be registered with the NHBRC." },
      { q: "What's the difference between registration and assistance?", a: "Registration (R4,500) is the full enrolment. Assistance (R500) supports renewals and documentation only." },
    ],
  },
  {
    heading: "PSIRA Registration Assistance",
    items: [
      { q: "Are you a PSIRA-accredited training provider?", a: "No. HADEES TRADING (PTY) LTD is NOT a PSIRA-accredited training provider. We only offer consultation, document preparation, application guidance, and coordination with accredited training providers." },
      { q: "What does the R1,500 include?", a: "Document preparation, application guidance, coordination with accredited PSIRA training centres, and tracking of your registration progress." },
      { q: "Where is the actual training done?", a: "Training is completed through accredited PSIRA training centres — not with us." },
    ],
  },
  {
    heading: "B-BBEE",
    items: [
      { q: "What is B-BBEE?", a: "Broad-Based Black Economic Empowerment — most SMEs qualify for an affidavit-based BEE certificate which we prepare from R350." },
    ],
  },
  {
    heading: "Tax Clearance",
    items: [
      { q: "How do I get a tax clearance pin?", a: "We assist with SARS tax compliance status pins from R350, subject to your SARS profile being up to date." },
    ],
  },
  {
    heading: "Payments",
    items: [
      { q: "How can I pay?", a: "Securely via PayFast — Instant EFT, Visa, Mastercard, Capitec Pay, Apple Pay and Google Pay." },
      { q: "Is my payment secure?", a: "Yes. Payments are processed by PayFast, a trusted South African gateway. We never see or store your card details." },
      { q: "Do you issue invoices?", a: "Yes — a branded invoice is generated and emailed automatically after successful payment." },
    ],
  },
  {
    heading: "Turnaround & Documents",
    items: [
      { q: "What's the typical turnaround?", a: "Registrations submitted within 24 hours; final delivery depends on the government body involved." },
      { q: "What do you need from me to start?", a: "For most services: ID, contact details, and the specifics of the service (e.g. company name, address, employees)." },
    ],
  },
];

function FAQPage() {
  return (
    <>
      <Section
        as="h1"
        eyebrow="FAQ"
        title={<>Straight answers.</>}
        intro="Everything you need to know before you buy — from turnaround times to payments."
      >
        <div className="mx-auto grid max-w-4xl gap-6">
          {FAQ_GROUPS.map((group) => (
            <div key={group.heading} className="rounded-2xl border border-border/60 bg-card/40">
              <div className="border-b border-border/60 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{group.heading}</div>
              <div className="divide-y divide-border/60">
                {group.items.map((f) => (
                  <details key={f.q} className="group px-6 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                      {f.q}
                      <span className="grid h-6 w-6 place-items-center rounded-full border border-border/60 text-muted-foreground transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <BigCTA
        title="Still have a question?"
        subtitle="Talk to us on WhatsApp or send an enquiry — we usually reply within an hour."
        primary={{ label: "Contact us", to: "/contact" }}
        secondary={{ label: "See pricing", to: "/pricing" }}
      />
    </>
  );
}
