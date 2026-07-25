import { createFileRoute } from "@tanstack/react-router";
import { Section, GlassCard, BigCTA } from "@/components/site/ui";
import { Smartphone, Fingerprint, Bell, WifiOff, Mic, MapPin, Compass, HardHat } from "lucide-react";

export const Route = createFileRoute("/mobile-app")({
  head: () => ({
    meta: [
      { title: "IVAN Mobile — Android & iPhone App — Hadees Trading" },
      { name: "description", content: "IVAN Mobile for Android and iPhone: offline mode, push notifications, biometric login, voice commands, maps, GPS and field-worker tools." },
      { property: "og:title", content: "IVAN Mobile — Hadees Trading" },
      { property: "og:description", content: "IVAN OS in your pocket — for founders and field workers." },
      { property: "og:url", content: "/mobile-app" },
    ],
    links: [{ rel: "canonical", href: "/mobile-app" }],
  }),
  component: Mobile,
});

const feats = [
  { i: Smartphone, t: "Android & iPhone", b: "One codebase, native performance on both stores." },
  { i: WifiOff, t: "Offline Mode", b: "Work in the field with no signal — sync when you're back." },
  { i: Bell, t: "Push Notifications", b: "Deadlines, tenders and client updates in real time." },
  { i: Fingerprint, t: "Biometric Login", b: "Fingerprint & Face ID for secure fast access." },
  { i: Mic, t: "Voice Commands", b: "Dictate quotes, notes and updates on the go." },
  { i: MapPin, t: "Maps & GPS", b: "Pin sites, log visits and navigate with one tap." },
  { i: HardHat, t: "Field Workers", b: "Clock in, capture photos and complete site checklists." },
  { i: Compass, t: "Route Planning", b: "Plan multi-site days efficiently." },
];

function Mobile() {
  return (
    <>
      <Section
        eyebrow="IVAN Mobile"
        title={<>Your entire operation, in your pocket.</>}
        intro="IVAN Mobile brings IVAN OS to Android and iPhone — built for founders on the move and field teams in the wild."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {feats.map(({ i: Icon, t, b }) => (
            <GlassCard key={t}>
              <Icon className="h-6 w-6 text-[var(--color-royal-soft)]" />
              <h3 className="mt-3 font-display text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
      <BigCTA title="IVAN Mobile is coming to your team." subtitle="Register your interest for early access." primary={{ label: "Register interest", to: "/contact" }} />
    </>
  );
}
