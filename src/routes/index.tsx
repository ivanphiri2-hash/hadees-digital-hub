import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Building2, FileCheck2, Bot, Users, Layers, Cloud, Cpu, GraduationCap, BookOpen, Zap, Award, Star } from "lucide-react";
import { Section, GlassCard, GradientOrbs, Stat, CTAButton, BigCTA } from "@/components/site/ui";
import { WEBSITE_PACKAGES, SERVICES, COMPANY } from "@/lib/company";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Enterprise digital infrastructure for SA business" },
      { name: "description", content: "Websites, business registration, tender assistance, compliance, CRM and enterprise AI — one partner for SA SMEs. Est. 2025, based in Mahikeng." },
      { property: "og:title", content: "Hadees Trading — Enterprise digital infrastructure for SA" },
      { property: "og:description", content: "Websites, CIPC registration, tenders, compliance and enterprise AI, delivered from Mahikeng, South Africa." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
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
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" /> Est. 2025 · Mahikeng, South Africa
            </div>
            <h1 className="mt-6 text-balance font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl animate-rise">
              Enterprise digital infrastructure for{" "}
              <span className="gradient-text">South African business.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg animate-rise">
              Websites, compliance, tenders and AI automation — engineered under one roof. Hadees Trading gives SMEs the operating stack of a Fortune 500.
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

          {/* Product mock */}
          <div className="mx-auto mt-14 max-w-5xl">
            <div className="glass relative overflow-hidden rounded-3xl p-2 shadow-2xl">
              <div className="rounded-2xl bg-gradient-to-br from-[var(--color-navy)] to-[color-mix(in_oklab,var(--color-navy)_50%,var(--color-ink))] p-6">
                <div className="mb-4 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                  <span className="ml-3 text-[10px] uppercase tracking-widest text-white/50">IVAN OS · Command Console</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Pipeline value", value: "R 4.82M", tone: "royal" },
                    { label: "Active tenders", value: "27", tone: "gold" },
                    { label: "Compliance score", value: "98%", tone: "green" },
                  ].map((k) => (
                    <div key={k.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-[10px] uppercase tracking-widest text-white/50">{k.label}</div>
                      <div className={`mt-1 font-display text-2xl font-bold ${k.tone === "gold" ? "text-[var(--color-gold)]" : k.tone === "royal" ? "text-[var(--color-royal-soft)]" : "text-emerald-400"}`}>{k.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-5">
                  <div className="sm:col-span-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/50">Revenue trajectory</div>
                    <svg viewBox="0 0 400 120" className="mt-2 h-24 w-full">
                      <defs>
                        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0" stopColor="#2563EB" stopOpacity="0.5" />
                          <stop offset="1" stopColor="#2563EB" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d="M0 90 L40 70 L80 78 L120 55 L160 62 L200 40 L240 48 L280 30 L320 34 L360 18 L400 22 L400 120 L0 120 Z" fill="url(#g)" />
                      <path d="M0 90 L40 70 L80 78 L120 55 L160 62 L200 40 L240 48 L280 30 L320 34 L360 18 L400 22" fill="none" stroke="#3B82F6" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/50">AI Agents online</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Array.from({ length: 27 }).map((_, i) => (
                        <span key={i} className="h-2.5 w-2.5 rounded-full bg-[var(--color-gold)]/70" />
                      ))}
                    </div>
                    <div className="mt-3 text-2xl font-bold text-white">27 <span className="text-xs font-normal text-white/60">agents deployed</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <Section eyebrow="Company Statistics" title={<>Built to move South African business forward.</>}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={27} label="AI Agents in IVAN OS" />
          <Stat value={14} label="Enterprise Services" />
          <Stat value={98} suffix="%" label="Compliance Success Rate" />
          <Stat value={24} suffix="/7" label="Automation Uptime" />
        </div>
      </Section>

      {/* WHY CHOOSE US */}
      <Section eyebrow="Why Choose Us" title={<>One partner. Every layer of your operation.</>} intro="From your first CIPC certificate to your 27-agent AI operating system, we own the full stack — so you don't have to stitch vendors together.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Compliance-first", body: "CIPC, SARS, COIDA, NHBRC, CIDB, B-BBEE and POPIA baked into every deliverable." },
            { icon: Zap, title: "Speed to launch", body: "Starter websites live in a week. Registrations submitted within 24 hours." },
            { icon: Bot, title: "AI, not gimmick", body: "27 production AI agents handle documents, tenders, invoices and client comms." },
            { icon: Building2, title: "Enterprise-grade", body: "Architecture built to scale from one founder to a national workforce." },
            { icon: Users, title: "Local specialists", body: "Rooted in Mahikeng, serving South Africa & SADC with on-the-ground expertise." },
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
                <span className="h-2 w-2 rounded-full bg-[var(--color-gold)]" />
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

      {/* TESTIMONIALS */}
      <Section eyebrow="Testimonials" title={<>What clients say.</>}>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { quote: "Registration, website and CIPC compliance — all sorted in under a week. This is what SA SMEs have been missing.", name: "Thabo M.", role: "Founder, Construction SME" },
            { quote: "Hadees Trading built us a proper tender-ready operation. We won our first municipal contract 60 days after onboarding.", name: "Refilwe K.", role: "Director, Services (Pty) Ltd" },
            { quote: "The IVAN automations handle our invoices, quotes and follow-ups. It's like hiring three people for the price of one.", name: "Sipho N.", role: "Operations Manager" },
          ].map((t) => (
            <GlassCard key={t.name}>
              <div className="flex gap-0.5 text-[var(--color-gold)]">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-3 text-sm text-foreground/90">"{t.quote}"</p>
              <div className="mt-4 text-xs">
                <div className="font-semibold">{t.name}</div>
                <div className="text-muted-foreground">{t.role}</div>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title={<>Straight answers.</>}>
        <div className="mx-auto max-w-3xl divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
          {[
            { q: "Where is Hadees Trading based?", a: `We're based in ${COMPANY.city}, South Africa, and serve clients nationally as well as across SADC.` },
            { q: "Do I have to pay VAT on your prices?", a: "All published prices are in South African Rand (ZAR). Where VAT applies, it will be shown clearly on your quote." },
            { q: "Can you help if I'm not yet registered as a company?", a: "Yes. Company registration is R950 and takes about 24–72 hours through CIPC." },
            { q: "Do you help with tenders and CIDB / CSD?", a: "Yes — we assist with CSD registration, CIDB, tender documentation, submissions and post-award compliance." },
            { q: "Will my website be SEO-ready?", a: "Every website ships with technical SEO, schema markup, sitemap, robots.txt and mobile-first design." },
            { q: "Is my data safe with you?", a: "We are POPIA-aligned. Your data is treated confidentially and stored on secure infrastructure." },
          ].map((f) => (
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

      <BigCTA
        title="Ready to build your enterprise stack?"
        subtitle="Registration, websites, compliance and AI — all from one South African partner."
        primary={{ label: "Talk to Hadees Trading", to: "/contact" }}
        secondary={{ label: "See Packages", to: "/packages" }}
      />
    </>
  );
}
