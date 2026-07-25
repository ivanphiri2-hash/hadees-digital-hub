import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Hadees Trading" },
      { name: "description", content: "The terms & conditions governing your use of Hadees Trading (Pty) Ltd services and website." },
      { property: "og:title", content: "Terms & Conditions — Hadees Trading" },
      { property: "og:description", content: "Terms & Conditions for services provided by Hadees Trading." },
      { property: "og:url", content: "/terms" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: () => (
    <LegalPage title="Terms & Conditions" updated="1 January 2025">
      <p>These Terms & Conditions govern your use of the {COMPANY.legalName} website and services. By engaging our services you agree to these terms.</p>
      <h2>1. Services</h2>
      <p>We provide web design, business registration, compliance, tender assistance, CRM, automation and AI services. The specific scope of each engagement will be set out in a quotation or statement of work.</p>
      <h2>2. Fees & payment</h2>
      <p>Fees are quoted in South African Rand (ZAR). Unless otherwise agreed, a 50% deposit is payable to commence work, with the balance due on delivery. Late payment may attract interest at the prevailing prescribed rate.</p>
      <h2>3. Client responsibilities</h2>
      <p>You are responsible for providing accurate information and required documents timeously. Delays caused by outstanding information may affect timelines.</p>
      <h2>4. Intellectual property</h2>
      <p>On full payment, ownership of bespoke deliverables produced for you transfers to you, excluding pre-existing tools, frameworks and platforms that remain our property.</p>
      <h2>5. Limitation of liability</h2>
      <p>To the maximum extent permitted by law, our liability for any claim shall not exceed the fees paid by you in the preceding three (3) months for the relevant service.</p>
      <h2>6. Confidentiality</h2>
      <p>Both parties agree to treat non-public information disclosed during the engagement as confidential.</p>
      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of the Republic of South Africa. Disputes shall be subject to the exclusive jurisdiction of South African courts.</p>
      <h2>8. Contact</h2>
      <p>{COMPANY.legalName} · {COMPANY.city}, {COMPANY.country} · {COMPANY.email}.</p>
    </LegalPage>
  ),
});
