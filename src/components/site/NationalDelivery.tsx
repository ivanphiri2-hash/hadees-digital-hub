import { Section } from "./ui";
export function NationalDelivery({ service }: { service: "registration" | "construction" | "websites" | "compliance" | "digital" }) {
  const guidance = {
    registration: "Provide your proposed company names, director details and required identity documents securely. We confirm CIPC requirements and assist with preparation and submission; registration remains subject to CIPC approval.",
    construction: "Share your contractor registration status and the work you intend to undertake. We confirm the applicable CIDB, NHBRC and safety-file scope. Document preparation may be handled remotely; site-specific assessments and in-person requirements are agreed separately, not assumed to be covered nationwide.",
    websites: "Briefing, content collection, design reviews and handover can take place online across South Africa. Agree your pages, assets, domain access and package scope before development. No local office visit is needed for remote website delivery.",
    compliance: "We review the registrations and renewal documents relevant to your business and confirm the assistance we can provide remotely. Regulator decisions, inspections and any in-person requirements remain separate from document assistance; approvals are not guaranteed.",
    digital: "Start with your business workflow, existing tools and the outcome you need. We confirm integration access, data permissions, remote delivery scope and ongoing support before agreeing a digital solution. Availability depends on the systems and services involved.",
  };
  return <Section eyebrow="Across South Africa" title="Digital-first delivery, with scope agreed." intro="Our operating base is Mahikeng, North West. Eligible clients nationwide can work with us remotely; we do not claim additional physical offices."><p className="mx-auto max-w-3xl text-sm leading-relaxed text-muted-foreground">{guidance[service]}</p></Section>;
}