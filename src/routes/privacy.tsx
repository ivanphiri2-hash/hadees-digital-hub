import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Hadees Trading" },
      { name: "description", content: "How Hadees Trading (Pty) Ltd collects, uses and protects your personal information under POPIA." },
      { property: "og:title", content: "Privacy Policy — Hadees Trading" },
      { property: "og:description", content: "POPIA-aligned privacy policy." },
      { property: "og:url", content: "/privacy" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: () => (
    <LegalPage title="Privacy Policy" updated="1 January 2025">
      <p>This Privacy Policy explains how {COMPANY.legalName} ("we", "us", "our") collects, uses, discloses and safeguards your personal information when you use our website and services. It is drafted in line with the Protection of Personal Information Act, 2013 (POPIA).</p>
      <h2>1. Information we collect</h2>
      <ul>
        <li>Contact information you provide (name, email, phone, company).</li>
        <li>Business information required to deliver our services (ID/registration numbers, tax numbers, addresses).</li>
        <li>Website usage information (pages visited, device/browser, IP address).</li>
        <li>Communications you send us (email, WhatsApp, portal messages).</li>
      </ul>
      <h2>2. How we use your information</h2>
      <ul>
        <li>To deliver the services you request (websites, registrations, compliance, tenders, AI).</li>
        <li>To comply with legal and regulatory obligations (CIPC, SARS, COIDA, CIDB, etc.).</li>
        <li>To communicate with you about your project, invoices and support.</li>
        <li>To improve our services and website experience.</li>
      </ul>
      <h2>3. Sharing</h2>
      <p>We share information only with regulators, payment providers and sub-processors necessary to deliver your services. We do not sell your personal information.</p>
      <h2>4. Security</h2>
      <p>We use appropriate technical and organisational safeguards to protect your data, including encryption in transit, access control and regular reviews.</p>
      <h2>5. Retention</h2>
      <p>We retain personal information only as long as necessary for the purposes for which it was collected or as required by South African law.</p>
      <h2>6. Your rights</h2>
      <p>You may request access to, correction of, or deletion of your personal information at any time by contacting {COMPANY.email}.</p>
      <h2>7. Contact</h2>
      <p>Information Officer · {COMPANY.legalName} · {COMPANY.city}, {COMPANY.country} · {COMPANY.email} · {COMPANY.phone}.</p>
    </LegalPage>
  ),
});
