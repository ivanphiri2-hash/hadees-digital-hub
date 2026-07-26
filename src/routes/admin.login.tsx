import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { DEMO_CREDENTIALS, useAdminAuth } from "@/lib/admin-auth";
import { GradientOrbs } from "@/components/site/ui";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Sign-in — Hadees Trading" },
      { name: "description", content: "Sign in to the Hadees Trading admin control centre." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const { signIn, user } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) {
    navigate({ to: "/admin", replace: true });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = signIn(email, password);
    if (!res.ok) { setError(res.error); return; }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-16">
      <GradientOrbs />
      <div className="relative w-full max-w-md">
        <div className="glass rounded-3xl p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[var(--color-navy)] to-[var(--color-royal)]">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Admin Sign-in</div>
              <div className="text-xs text-muted-foreground">Hadees Trading Control Centre</div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required autoComplete="current-password"
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
            </label>
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
            <button type="submit" className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color-mix(in_oklab,var(--color-royal)_35%,transparent)]">
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border/60 bg-card/30 p-3 text-xs text-muted-foreground">
            <div className="font-medium text-foreground">Preview credentials</div>
            <div className="mt-1 font-mono text-[11px]">{DEMO_CREDENTIALS.email}</div>
            <div className="font-mono text-[11px]">{DEMO_CREDENTIALS.password}</div>
            <div className="mt-2">This is a UI-only shell. Enable Lovable Cloud for real auth & data.</div>
          </div>

          <div className="mt-4 text-center text-xs">
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
