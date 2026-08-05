import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GradientOrbs } from "@/components/site/ui";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Hadees Trading" },
      { name: "description", content: "Choose a new password for your Hadees Trading account." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Reset password — Hadees Trading" },
      { property: "og:description", content: "Set a new password for your Hadees Trading account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase delivers the recovery session via the URL hash.
    void supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate({ to: "/portal", replace: true }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update your password.");
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
              <KeyRound className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="font-display text-lg font-bold">Set a new password</div>
              <div className="text-xs text-muted-foreground">Hadees Trading Business Platform</div>
            </div>
          </div>

          {!ready && (
            <p className="mt-6 text-sm text-muted-foreground">
              Open this page from the password-reset link in your email to continue.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">New password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={8}
                autoComplete="new-password" disabled={!ready}
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)] disabled:opacity-50" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Confirm password</span>
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" required minLength={8}
                autoComplete="new-password" disabled={!ready}
                className="rounded-xl border border-border/70 bg-card/40 px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-royal)] disabled:opacity-50" />
            </label>
            {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}
            {done && <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300">Password updated — taking you to your portal…</div>}
            <button type="submit" disabled={busy || !ready}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-royal)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Saving…" : "Update password"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 text-center text-xs">
            <Link to="/auth" search={{}} className="text-muted-foreground hover:text-foreground">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
