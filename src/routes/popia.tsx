import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/site/LegalPage";
import { COMPANY } from "@/lib/company";

export const Route = createFileRoute("/popia")({
  head: () => ({
    meta: [
      { title: "POPIA Compliance — Hadees Trading" },
      { name: "description", content: "Hadees Trading (Pty) Ltd's Protection of Personal Information Act (POPIA) compliance statement." },
      { property: "og:title", content: "POPIA Compliance — Hadees Trading" },
      { property: "og:description", content: "Our commitment to POPIA compliance." },
      { property: "og:url", content: "/popia" },
    ],
    links: [{ rel: "canonical", href: "/popia" }],
  }),
  component: () => (
    <LegalPage title="POPIA Compliance" updated="1 January 2025">
      <p>{COMPANY.legalName} is committed to the lawful and responsible processing of personal information in line with the Protection of Personal Information Act, 2013 ("POPIA").</p>
      <h2>1. Lawful processing</h2>
      <p>We process personal information only for defined, lawful purposes and with a valid legal basis (contract performance, legal obligation, legitimate interest or consent).</p>
      <h2>2. Information Officer</h2>
      <p>Our appointed Information Officer can be reached at {COMPANY.email}. All requests, complaints and enquiries relating to personal information should be directed to this address.</p>
      <h2>3. Security safeguards</h2>
      <p>We use appropriate technical and organisational safeguards, including encryption, access controls and regular reviews of our systems and staff practices.</p>
      <h2>4. Data subject rights</h2>
      <ul>
        <li>Access the personal information we hold about you.</li>
        <li>Request correction of inaccurate information.</li>
        <li>Request deletion where permitted by law.</li>
        <li>Object to certain processing activities.</li>
        <li>Lodge a complaint with the Information Regulator.</li>
      </ul>
      <h2>5. Cross-border transfers</h2>
      <p>Where personal information is transferred outside South Africa, we ensure the recipient is subject to laws, binding rules or agreements providing an adequate level of protection.</p>
      <h2>6. Breach response</h2>
      <p>In the event of a security compromise involving personal information, we will notify affected data subjects and the Information Regulator as required by POPIA.</p>
    </LegalPage>
  ),
});
