import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/refund")({
  head: () => ({
    meta: [
      { title: "Refund Policy — Hadees Trading" },
      { name: "description", content: "Refund Policy for services provided by Hadees Trading (Pty) Ltd." },
      { property: "og:title", content: "Refund Policy — Hadees Trading" },
      { property: "og:description", content: "How refunds work at Hadees Trading." },
      { property: "og:url", content: "/refund" },
    ],
    links: [{ rel: "canonical", href: "/refund" }],
  }),
  component: () => (
    <LegalPage title="Refund Policy" updated="1 January 2025">
      <p>{COMPANY.legalName} is committed to fair dealing. This policy sets out when refunds may be issued for our services.</p>
      <h2>1. Deposits</h2>
      <p>Deposits are used to commence work (design, research, drafting, submissions). Once work has begun, deposits are generally non-refundable.</p>
      <h2>2. Government fees</h2>
      <p>Where a service includes government or regulator fees (CIPC, COIDA, CIDB, NHBRC, SARS), those fees are non-refundable once paid to the regulator.</p>
      <h2>3. Service delivery issues</h2>
      <p>If we fail to deliver a service as agreed, we will first attempt to remedy the issue. If we cannot, a pro-rata refund of unused amounts may be issued.</p>
      <h2>4. Cancellations</h2>
      <p>You may cancel a service before work has commenced for a full refund minus any bank/payment fees.</p>
      <h2>5. How to request a refund</h2>
      <p>Email {COMPANY.email} with your invoice number and a description of the issue. We respond within 5 business days.</p>
    </LegalPage>
  ),
});
