import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";

export const Route = createFileRoute("/enterprise-ai")({
  head: () => ({
    meta: [
      { title: "Enterprise AI — Document, Tender, Proposal, Invoice AI — Hadees Trading" },
      { name: "description", content: "Enterprise AI stack: Document AI, Tender AI, Proposal AI, Invoice AI, OCR, Speech, Compliance AI, Predictive AI, Multi-Agent Workflows." },
      { property: "og:title", content: "Enterprise AI — Hadees Trading" },
      { property: "og:description", content: "Production AI for South African business, delivered by Hadees Trading." },
      { property: "og:url", content: "/enterprise-ai" },
    ],
    links: [{ rel: "canonical", href: "/enterprise-ai" }],
  }),
  component: EAI,
});

const groups = [
  {
    title: "Document Intelligence",
    items: ["Document AI", "PDF Intelligence", "OCR", "Speech Recognition", "Knowledge Base", "AI Memory"],
  },
  {
    title: "Revenue & Operations",
    items: ["Tender AI", "Proposal AI", "Invoice AI", "AI Chat", "Prompt Library"],
  },
  {
    title: "Risk & Insight",
    items: ["Compliance AI", "Risk Analysis", "Predictive AI", "Business Intelligence"],
  },
  {
    title: "Autonomous",
    items: ["Agentic AI", "Multi-Agent Workflows"],
  },
];

function EAI() {
  return (
    <>
      <Section
        eyebrow="Enterprise AI"
        title={<>Production-grade AI, built for your operation.</>}
        intro="Not a chatbot demo. A working AI layer that reads your documents, drafts your proposals, watches compliance and predicts risk."
      >
        <div className="grid gap-6 md:grid-cols-2">
          {groups.map((g) => (
            <GlassCard key={g.title}>
              <h3 className="font-display text-lg font-bold">{g.title}</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {g.items.map((i) => (
                  <li key={i} className="rounded-lg border border-border/60 bg-card/40 px-3 py-2">{i}</li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>
      </Section>
      <BigCTA title="Turn AI into revenue." subtitle="We deploy, integrate and operate your enterprise AI stack." primary={{ label: "Start with AI", to: "/contact" }} secondary={{ label: "See IVAN OS", to: "/ivan-os" }} />
    </>
  );
}
