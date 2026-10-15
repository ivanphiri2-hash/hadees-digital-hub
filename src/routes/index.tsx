import { FounderSection } from "@/components/site/FounderSection";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Building2, FileCheck2, Bot, Users, Layers, Cloud, Cpu, GraduationCap, BookOpen, Zap, Award, Star } from "lucide-react";
import { Section, GlassCard, GradientOrbs, Stat, CTAButton, BigCTA } from "@/components/site/ui";
import { WEBSITE_PACKAGES, SERVICES, COMPANY } from "@/lib/company";

const FAQS = [
  { q: "Where is Hadees Trading based?", a: `Our operating base is ${COMPANY.city}, North West, South Africa. We assist eligible clients across South Africa through digital-first services. Any in-person or regulator-specific requirements are confirmed before work starts.` },
  { q: "Do I have to pay VAT on your prices?", a: "All published prices are in South African Rand (ZAR). Where VAT applies, it will be shown clearly on your quote." },
  { q: "Can you help if I'm not yet registered as a company?", a: "Yes. Company registration is R950 and takes about 24–72 hours through CIPC." },
  { q: "Do you help with tenders and CIDB / CSD?", a: "Yes — we assist with CSD registration, CIDB, tender documentation, submissions and post-award compliance." },
  { q: "Will my website be SEO-ready?", a: "Every website ships with technical SEO, schema markup, sitemap, robots.txt and mobile-first design." },
  { q: "Is my data safe with you?", a: "We are POPIA-aligned. Your data is treated confidentially and stored on secure infrastructure." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hadees Trading | Business Services Across South Africa" },
      { name: "description", content: "Digital-first websites, business registration assistance, construction support and compliance for entrepreneurs and SMEs across South Africa. Based in Mahikeng." },
      { property: "og:title", content: "Hadees Trading — Enterprise digital infrastructure for SA" },
      { property: "og:description", content: "South Africa-wide digital-first business services, with a genuine operating base in Mahikeng, North West." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://hadees-digital-forge.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://hadees-digital-forge.lovable.app/" }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(faqJsonLd) },
      { type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "OfferCatalog", name: "HADEES TRADING business services",
        itemListElement: [
          ["Business registration assistance", "/business-registration"],
          ["Construction business support", "/construction-services"],
          ["Professional website development", "/website-design"],
          ["Business compliance assistance", "/compliance"],
        ].map(([name, path]) => ({ "@type": "Offer", itemOffered: {
          "@type": "Service", name, url: `https://hadees-digital-forge.lovable.app${path}`,
          provider: { "@type": "Organization", name: COMPANY.legalName, telephone: COMPANY.phoneIntl,
            address: { "@type": "PostalAddress", addressLocality: "Mahikeng", addressRegion: "North West", addressCountry: "ZA" } },
          areaServed: { "@type": "Country", name: "South Africa" },
        } })),
      }) },
    ],
  }),
  component: Home,
});

const industries = ["Construction", "Retail & Trading", "Professional Services", "Logistics", "Mining Services", "Hospitality", "Agriculture", "Public Sector"];

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <GradientOrbs />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground animate-rise">
              Est. 2025 · South Africa
            </div>
            <h1 className="mt-6 text-balance font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl animate-rise">
              HADEES TRADING{" "}
              <span className="gradient-text">(PTY) LTD</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg animate-rise">
              Helping South African entrepreneurs, construction companies, startups and SMEs register, build their online presence and manage business requirements. Based in Mahikeng, serving eligible clients nationwide with digital-first delivery and an agreed scope.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-rise">
              <CTAButton to="/packages" variant="primary">See Website Packages <ArrowRight className="ml-1.5 h-4 w-4" /></CTAButton>
              <CTAButton to="/ivan-os" variant="ghost">Explore IVAN OS</CTAButton>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[var(--color-gold)]" /> POPIA compliant</span>
              <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-[var(--color-gold)]" /> B-BBEE friendly</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-[var(--color-gold)]" /> AI-powered</span>
            </div>
          </div>

        </div>
      </section>

      {/* WHY CHOOSE US */}
      <Section eyebrow="Why Choose Us" title={<>Clear scope. Connected support. South African focus.</>} intro="Get registration assistance, professional websites, construction support and compliance guidance from one team, with requirements agreed before work begins.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Requirements before promises", body: "We confirm documents, eligibility and the assistance required. Regulator approvals and inspections are not guaranteed." },
            { icon: Zap, title: "A clear delivery plan", body: "Agree your deliverables, required inputs and timeline before the engagement begins." },
            { icon: Bot, title: "Connected client support", body: "Your linked client account brings projects, invoices, payment records and requests into one place." },
            { icon: Building2, title: "Support for growing businesses", body: "Start with the services your business needs now, from company registration assistance to a professional website." },
            { icon: Users, title: "National service, genuine roots", body: "Based in Mahikeng, North West. Serving eligible clients across South Africa digitally, without claiming offices elsewhere." },
            { icon: Award, title: "Fixed, honest pricing", body: "Published prices in ZAR. No consulting-firm surprises." },
          ].map(({ icon: Icon, title, body }) => (
            <GlassCard key={title}>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-royal)]/12 text-[var(--color-royal-soft)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* WEBSITE PACKAGES SUMMARY */}
      <Section eyebrow="Website Packages" title={<>Websites priced for South African business.</>} intro="Fixed price. Fixed timeline. Enterprise-grade quality.">
        <div className="grid gap-6 lg:grid-cols-3">
          {WEBSITE_PACKAGES.map((p) => (
            <div key={p.name} className={`glass relative rounded-3xl p-7 ${p.badge === "Most Popular" ? "ring-1 ring-[var(--color-gold)]/60" : ""}`}>
              {p.badge && (
                <div className="absolute -top-3 left-6 rounded-full bg-[var(--color-gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-ink)]">
                  {p.badge}
                </div>
              )}
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div className="font-display text-4xl font-black">{p.price}</div>
                <div className="text-xs text-muted-foreground">once-off</div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-royal-soft)]" /> <span>{f}</span></li>
                ))}
              </ul>
              <div className="mt-5 text-xs text-muted-foreground">Timeline · {p.timeline}</div>
              <Link to="/packages" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white">{p.cta}</Link>
            </div>
          ))}
        </div>
      </Section>

      {/* SERVICE GRID */}
      <Section eyebrow="Services" title={<>Fourteen services. One roof.</>} intro="Everything a modern SA business needs to launch, comply, sell and scale.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <GlassCard key={s.slug}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-base font-bold">{s.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        <div className="mt-8 text-center">
          <CTAButton to="/services" variant="ghost">Explore all services <ArrowRight className="ml-1.5 h-4 w-4" /></CTAButton>
        </div>
      </Section>

      {/* PLATFORM SHOWCASE */}
      <Section eyebrow="The Platform" title={<>IVAN OS · Enterprise AI · CRM · Client Portal · Mobile</>} intro="A connected operating system for growing SA businesses.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/ivan-os", title: "IVAN OS", desc: "27 AI agents, decision console, knowledge graph & predictive analytics.", icon: Sparkles },
            { to: "/enterprise-ai", title: "Enterprise AI", desc: "Document AI, tender AI, proposal AI, OCR, compliance AI & more.", icon: Bot },
            { to: "/crm", title: "CRM", desc: "Leads, clients, projects, quotes, invoices, tasks, pipeline & audit.", icon: Users },
            { to: "/client-portal", title: "Client Portal", desc: "Secure invoices, projects, documents, payments & e-signatures.", icon: ShieldCheck },
            { to: "/mobile-app", title: "IVAN Mobile", desc: "Android & iPhone, offline, biometric, voice, GPS & field workers.", icon: Cloud },
            { to: "/compliance", title: "Compliance", desc: "CIPC, SARS, COIDA, CIDB, B-BBEE, NHBRC, POPIA — always green.", icon: ShieldCheck },
          ].map(({ to, title, desc, icon: Icon }) => (
            <Link key={to} to={to} className="glass group rounded-2xl p-6 transition-all hover:-translate-y-0.5 hover:ring-1 hover:ring-[var(--color-royal)]/40">
              <Icon className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-royal-soft)]">
                Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* INDUSTRIES */}
      <Section eyebrow="Industries" title={<>Trusted across the South African economy.</>}>
        <div className="flex flex-wrap justify-center gap-2">
          {industries.map((i) => (
            <span key={i} className="rounded-full border border-border/60 bg-card/50 px-4 py-2 text-sm text-foreground/80">{i}</span>
          ))}
        </div>
      </Section>

      <Section eyebrow="Delivery evidence" title={<>Verified work. Approved for sharing.</>} intro="Completed engagements are shared only with client permission and confirmed scope and outcomes.">
        <div className="text-center"><CTAButton to="/portfolio" variant="ghost">View our portfolio <ArrowRight className="ml-1.5 h-4 w-4" /></CTAButton></div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title={<>Straight answers.</>}>
        <div className="mx-auto max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                {f.q}
                <span className="grid h-6 w-6 place-items-center rounded-full border border-border/60 text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <FounderSection />

      <BigCTA
        title="Ready to build your enterprise stack?"
        subtitle="Registration, websites, compliance and AI — all from one South African partner."
        primary={{ label: "Talk to Hadees Trading", to: "/contact" }}
        secondary={{ label: "See Packages", to: "/packages" }}
      />
    </>
  );
}
