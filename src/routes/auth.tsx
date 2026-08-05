import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { GradientOrbs } from "@/components/site/ui";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ redirect: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Sign in — Hadees Trading Business Platform" },
      { name: "description", content: "Sign in to the Hadees Trading client portal or staff control centre." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Sign in — Hadees Trading" },
      { property: "og:description", content: "Secure access to your projects, invoices and documents." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const dest = redirect && redirect.startsWith("/") ? redirect : "/portal";

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: dest, replace: true });
    });
  }, [dest, navigate]);

  async function onForgotPassword() {
    setError(null); setNotice(null);
    if (!email) { setError("Enter your email address first, then tap “Forgot password”."); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw err;
      setNotice("Password reset link sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the reset email.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null); setNotice(null); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (err) throw err;
        if (!data.session) { setNotice("Check your inbox to confirm your email, then sign in."); return; }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
      navigate({ to: dest, replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
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
              <div className="font-display text-lg font-bold">{mode === "signin" ? "Sign in" : "Create your account"}</div>
              <div className="text-xs text-muted-foreground">Hadees Trading Business Platform</div>
            </div>
          </div>

          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="h-px flex-1 bg-border/60" /> or email <span className="h-px flex-1 bg-border/60" />
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            {mode === "signup" && (
              <label className="grid gap-1.5 text-sm">
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Full name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={120}
                  className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
              </label>
            )}
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email"
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)]" />
            </label>
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
            {notice && <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">{notice}</div>}
            <button type="submit" disabled={busy}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); }}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "New client? Create an account" : "Already have an account? Sign in"}
          </button>

          <div className="mt-4 text-center text-xs">
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Back to site</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
