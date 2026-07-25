import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 ${className}`}>
      {(eyebrow || title || intro) && (
        <div className="mx-auto mb-12 max-w-3xl text-center">
          {eyebrow && (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-gold)]" /> {eyebrow}
            </div>
          )}
          {title && <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">{title}</h2>}
          {intro && <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">{intro}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass rounded-2xl p-6 transition-transform hover:-translate-y-0.5 ${className}`}>
      {children}
    </div>
  );
}

export function GradientOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb animate-float" style={{ width: 460, height: 460, background: "var(--color-royal)", top: -120, left: -80 }} />
      <div className="orb animate-float" style={{ width: 380, height: 380, background: "var(--color-gold)", top: 60, right: -100, animationDelay: "-3s" }} />
      <div className="orb animate-float" style={{ width: 320, height: 320, background: "var(--color-navy)", bottom: -120, left: "40%", animationDelay: "-6s" }} />
    </div>
  );
}

export function Stat({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1400;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="glass rounded-2xl p-6 text-center">
      <div className="font-display text-4xl font-black tracking-tight sm:text-5xl">
        <span className="gradient-text">{n.toLocaleString()}{suffix}</span>
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
    </div>
  );
}

export function CTAButton({ to, href, children, variant = "primary" }: { to?: string; href?: string; children: ReactNode; variant?: "primary" | "ghost" | "gold" }) {
  const cls =
    variant === "primary"
      ? "bg-[var(--color-royal)] text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-royal)_35%,transparent)] hover:-translate-y-0.5"
      : variant === "gold"
      ? "bg-[var(--color-gold)] text-[var(--color-ink)] shadow-lg shadow-[color-mix(in_oklab,var(--color-gold)_40%,transparent)] hover:-translate-y-0.5"
      : "border border-border/70 bg-card/40 text-foreground hover:bg-card";
  const base = `inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-transform ${cls}`;
  if (to) return <Link to={to} className={base}>{children}</Link>;
  return <a href={href} className={base}>{children}</a>;
}

export function BigCTA({ title, subtitle, primary, secondary }: { title: string; subtitle: string; primary: { label: string; to: string }; secondary?: { label: string; to: string } }) {
  return (
    <section className="relative mx-auto my-24 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/60 gradient-navy p-10 sm:p-16">
        <div className="orb" style={{ width: 320, height: 320, background: "var(--color-gold)", top: -80, right: -60 }} />
        <div className="orb" style={{ width: 360, height: 360, background: "var(--color-royal)", bottom: -120, left: -80 }} />
        <div className="relative mx-auto max-w-3xl text-center text-white">
          <h3 className="text-balance font-display text-3xl font-bold sm:text-5xl">{title}</h3>
          <p className="mt-4 text-white/70">{subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CTAButton to={primary.to} variant="gold">{primary.label}</CTAButton>
            {secondary && <CTAButton to={secondary.to} variant="ghost">{secondary.label}</CTAButton>}
          </div>
        </div>
      </div>
    </section>
  );
}
