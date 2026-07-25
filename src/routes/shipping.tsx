import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Delivery Policy — Hadees Trading" },
      { name: "description", content: "How Hadees Trading (Pty) Ltd delivers digital services and any physical items." },
      { property: "og:title", content: "Shipping & Delivery Policy — Hadees Trading" },
      { property: "og:description", content: "Delivery of digital and physical items." },
      { property: "og:url", content: "/shipping" },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: () => (
    <LegalPage title="Shipping & Delivery Policy" updated="1 January 2025">
      <p>{COMPANY.legalName} primarily delivers digital services. This policy explains how our services and any physical items are delivered.</p>
      <h2>1. Digital services</h2>
      <p>Websites, registration certificates, compliance documents and other digital deliverables are delivered via email or through your secure client portal within the timelines quoted for each service.</p>
      <h2>2. Physical items</h2>
      <p>Where a physical item is included (for example printed letterheads), delivery is arranged within South Africa via courier or postal service. Estimated delivery times are 2–7 business days depending on your location.</p>
      <h2>3. Delivery timelines</h2>
      <ul>
        <li>Company Registration: 24–72 hours after CIPC processing.</li>
        <li>Starter Website: 5–7 working days.</li>
        <li>Business Website: 7–10 working days.</li>
        <li>Premium Website: 10–20 working days.</li>
      </ul>
      <h2>4. Delivery issues</h2>
      <p>If you do not receive a deliverable within the quoted timeline, contact {COMPANY.email} and we will investigate immediately.</p>
    </LegalPage>
  ),
});
