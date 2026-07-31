import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { NAV, COMPANY } from "@/lib/company";
import { SocialLinks } from "@/components/site/SocialLinks";
import { useTheme } from "./theme";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "glass shadow-[0_1px_0_0_color-mix(in_oklab,var(--foreground)_8%,transparent)]" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <LogoMark />
          <div className="leading-tight">
            <div className="font-display text-[15px] font-bold tracking-tight">Hadees Trading</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Est. {COMPANY.established} · SA</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <SocialLinks size="sm" className="hidden xl:flex" only={["whatsapp", "facebook", "instagram", "linkedin"]} />
          <button
            aria-label="Toggle theme"
            onClick={toggle}
            className="hidden h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground hover:text-foreground md:inline-flex"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <Link
            to="/contact"
            className="hidden rounded-full bg-[var(--color-royal)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-royal)_35%,transparent)] transition-transform hover:-translate-y-0.5 md:inline-flex"
          >
            Get Started
          </Link>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="mx-4 mb-3 rounded-2xl glass p-3">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-primary/10"
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/contact"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function LogoMark() {
  return (
    <div className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-royal)] shadow-inner">
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/10" />
      <span className="font-display text-sm font-black text-white">H</span>
      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[var(--color-gold)] shadow-[0_0_10px_var(--color-gold)]" />
    </div>
  );
}
