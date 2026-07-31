import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { SocialLinks } from "@/components/site/SocialLinks";

const cols = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Industries", to: "/industries" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "All Services", to: "/services" },
      { label: "Pricing", to: "/pricing" },
      { label: "Business Registration", to: "/business-registration" },
      { label: "Construction Services", to: "/construction-services" },
      { label: "Tender Support", to: "/tender-support" },
      { label: "Website Design", to: "/website-design" },
      { label: "Compliance", to: "/compliance" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "IVAN OS", to: "/ivan-os" },
      { label: "Enterprise AI", to: "/enterprise-ai" },
      { label: "CRM", to: "/crm" },
      { label: "Client Portal", to: "/client-portal" },
      { label: "Mobile App", to: "/mobile-app" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Refund Policy", to: "/refund" },
      { label: "Shipping & Delivery", to: "/shipping" },
      { label: "Cookie Policy", to: "/cookies" },
      { label: "POPIA Compliance", to: "/popia" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-gradient-to-b from-transparent to-[color-mix(in_oklab,var(--color-navy)_15%,var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-royal)]">
                <span className="font-display text-sm font-black text-white">H</span>
              </div>
              <div className="font-display text-base font-bold">Hadees Trading (Pty) Ltd</div>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Your Complete Business Growth Partner — registration, compliance, tenders, websites and automation for South African business.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {COMPANY.city}, {COMPANY.country}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> <a href={`tel:${COMPANY.phoneIntl}`} className="hover:text-foreground">{COMPANY.phone}</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a href={`mailto:${COMPANY.email}`} className="hover:text-foreground">{COMPANY.email}</a></li>
            </ul>
            <SocialLinks size="sm" className="mt-6" />
          </div>


          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{c.title}</div>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-foreground/80 transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {COMPANY.legalName}. Est. {COMPANY.established}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Proudly built in {COMPANY.city} · Serving South Africa & SADC.
          </p>
        </div>
      </div>
    </footer>
  );
}
