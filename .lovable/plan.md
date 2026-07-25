# Hadees Trading (Pty) Ltd — Build Plan

The brief is very large (25+ pages, admin dashboard, AI showcase, CRM/portal previews, legal pages, SEO, dark/light mode). To keep quality at the "better than Stripe/Linear" bar you asked for, I'll deliver it in phases inside this project. Everything ships production-ready — no placeholders in the visible copy, no broken links, all routes wired in the footer/nav.

## Phase 1 — Foundation & Design System (this turn)
- Brand tokens in `src/styles.css` (Navy `#0A2540`, Royal Blue `#2563EB`, Gold `#F59E0B`, bg `#030712`, gray `#94A3B8`, white). No purple anywhere. Dark + light mode.
- Fonts: Inter + Inter Tight via `<link>` in `__root.tsx`.
- Reusable primitives: `SiteHeader`, `SiteFooter`, `Section`, `GlassCard`, `GradientOrb`, `StatCounter`, `PriceCard`, `FeatureGrid`, `CTA`, `WhatsAppFab`, `ThemeToggle`.
- Framer Motion installed for micro-interactions, floating gradients, counters.
- SEO scaffolding: per-route `head()`, JSON-LD helpers (Organization, Service, FAQ, Breadcrumb), `sitemap.xml` server route, `robots.txt`.
- Root layout with header + footer + WhatsApp FAB, structured-data Organization schema.

## Phase 2 — Marketing pages
Home, About, Services (index + individual service cards), Website Packages (R1,500 / R2,500 / R5,500 comparison), Business Registration + full pricing table (all ZAR items exactly as listed), Compliance, Tenders, Industries, Testimonials, FAQ, Contact (Mahikeng, 0837535798, admin@hadeestrading.co.za, Google Maps embed, WhatsApp, contact form).

## Phase 3 — Product showcase pages
IVAN OS (27 agents, knowledge graph, decision console, roadmap), Enterprise AI, CRM, Client Portal, Mobile App (IVAN Mobile). Rich visuals built from CSS/SVG + Framer Motion — no external screenshot assets required.

## Phase 4 — Legal & PayFast compliance
Privacy Policy, Terms & Conditions, Refund Policy, Shipping & Delivery Policy, Cookie Policy, POPIA Compliance — all linked in footer.

## Phase 5 — Admin shell & API layer
- `/admin/login` + `/admin` dashboard shell (Leads, Bookings, Quotes, Invoices, Clients, Roles, Audit Logs) as a UI-only preview gated by a mock auth context.
- `src/lib/api/` service layer with typed clients + `import.meta.env.VITE_*` placeholders for Supabase, Gemini, OpenAI, Claude, WhatsApp Cloud, PayFast, Resend, Google Maps, FCM. No secrets committed. Ready to swap for Lovable Cloud when you're ready.

## Technical notes
- Stack: existing TanStack Start + React 19 + Tailwind v4 + Framer Motion (added).
- Routing: file-based under `src/routes/` (flat dot-separated). Each shareable route gets unique `head()` metadata.
- Admin is a UI shell only in this phase; wiring real auth/DB = Lovable Cloud in a later turn (recommended when you're ready).
- No backend calls are made yet — the API layer is stubbed and typed so activating Lovable Cloud later is drop-in.

## Confirmations before I start
1. **Scope of this first delivery**: I'll ship Phase 1 + Phase 2 + Phase 4 (foundation, all marketing pages, all legal pages) in this turn. Phases 3 (product showcase pages) and 5 (admin shell + API layer) in a follow-up turn to keep quality high. OK?
2. **Backend**: Enable Lovable Cloud now (for real contact form, admin auth, leads DB), or keep everything static/stubbed for this build and wire later?
3. **Images**: OK to generate hero/illustration imagery with the image tool where useful, or keep pure CSS/SVG visuals only?

Reply with answers (or "go — all yes, generate images, Cloud later") and I'll start building.