import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — Hadees Trading" },
      { name: "description", content: "How Hadees Trading uses cookies and similar technologies on this website." },
      { property: "og:title", content: "Cookie Policy — Hadees Trading" },
      { property: "og:description", content: "Cookies and similar technologies used on this website." },
      { property: "og:url", content: "/cookies" },
    ],
    links: [{ rel: "canonical", href: "/cookies" }],
  }),
  component: () => (
    <LegalPage title="Cookie Policy" updated="1 January 2025">
      <p>This website uses a minimal set of cookies and similar technologies to operate correctly and to help us improve your experience.</p>
      <h2>1. Types of cookies</h2>
      <ul>
        <li><strong>Essential:</strong> required for the site to work (e.g. security, session).</li>
        <li><strong>Preferences:</strong> remember your theme and settings.</li>
        <li><strong>Analytics:</strong> aggregate, anonymised usage statistics.</li>
      </ul>
      <h2>2. Managing cookies</h2>
      <p>You can control cookies through your browser settings. Disabling essential cookies may affect site functionality.</p>
      <h2>3. Third-party services</h2>
      <p>Some pages embed third-party services (for example Google Maps) that may set their own cookies subject to their own policies.</p>
    </LegalPage>
  ),
});
