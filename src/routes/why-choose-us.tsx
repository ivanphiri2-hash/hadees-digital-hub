import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck, Zap, Users, Award, Lock, Cpu, MessageCircle, BadgeDollarSign,
} from "lucide-react";

import { Section, GlassCard, BigCTA } from "@/components/site/ui";

export const Route = createFileRoute("/why-choose-us")({
  head: () => ({
    meta: [
      { title: "Why Choose Hadees Trading — SA business services partner" },
      { name: "description", content: "Professional, affordable, fast South African business services with transparent pricing, WhatsApp support and modern technology." },
      { property: "og:title", content: "Why Choose Hadees Trading" },
      { property: "og:description", content: "Trusted, transparent, fast — SA business services done right." },
      { property: "og:url", content: "/why-choose-us" },
    ],
    links: [{ rel: "canonical", href: "/why-choose-us" }],
  }),
  component: WhyPage,
});

const REASONS = [
  { icon: Users, title: "Professional Team", body: "Registered specialists in CIPC, tax, compliance, tenders and enterprise IT." },
  { icon: BadgeDollarSign, title: "Affordable Pricing", body: "Fair ZAR prices sized for SA SMEs — no consulting-firm inflation." },
  { icon: Zap, title: "Fast Turnaround", body: "Company registration in 24–72 hours. Websites live in a week." },
  { icon: MessageCircle, title: "WhatsApp Support", body: "Real humans on WhatsApp, not a chatbot. Business-hours SLA." },
  { icon: ShieldCheck, title: "Trusted Service", body: "POPIA-compliant, B-BBEE friendly and CIPC-registered as HADEES TRADING (PTY) LTD." },
  { icon: Cpu, title: "Modern Technology", body: "Enterprise-grade stack — React, TanStack, cloud infra, AI-ready." },
  { icon: Award, title: "Transparent Pricing", body: "Every service and its price is published. No hidden fees." },
  { icon: Lock, title: "Secure Process", body: "PayFast payments, SSL everywhere, encrypted document handling." },
];

function WhyPage() {
  return (
    <>
      <Section
        as="h1"
        eyebrow="Why Us"
        title={<>Why South African SMEs choose Hadees Trading.</>}
        intro="One partner. Fair pricing. Fast delivery. Enterprise-grade quality."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <GlassCard key={title}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-royal)]/12 text-[var(--color-royal-soft)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      <BigCTA
        title="Ready when you are."
        subtitle="Register, launch, comply and pay — from one South African partner."
        primary={{ label: "See pricing", to: "/pricing" }}
        secondary={{ label: "Talk to us", to: "/contact" }}
      />
    </>
  );
}
