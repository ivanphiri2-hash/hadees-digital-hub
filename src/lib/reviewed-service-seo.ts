import { COMPANY } from "./company";

export const reviewedServiceSeo = {
  "/business-registration": {
    title: "HADEES TRADING (PTY) LTD | CIPC Registration Assistance",
    description: "Get company registration, CIPC annual returns and amendment assistance from HADEES TRADING (PTY) LTD in Mahikeng, serving eligible clients digitally nationwide.",
    faqs: [
      { question: "What business registration services does HADEES TRADING offer?", answer: "HADEES TRADING (PTY) LTD assists with company registration, CIPC annual returns and amendments. Established in 2025, the business serves eligible entrepreneurs, construction companies, startups and SMEs." },
      { question: "Can clients outside Mahikeng access assistance?", answer: "Yes. HADEES TRADING is based in Mahikeng, North West, South Africa, and serves eligible clients nationwide digitally. Contact admin@hadeestrading.co.za or +27837535798 to discuss your requirements." },
      { question: "What documents are needed for company registration?", answer: "Required documents and eligibility are confirmed before submission. Contact HADEES TRADING to confirm the requirements for your application." },
      { question: "Is CIPC approval guaranteed?", answer: "No. CIPC approval is not guaranteed. HADEES TRADING provides assistance and confirms eligibility and required documents before submission." },
    ],
  },
  "/construction-services": {
    title: "Construction Compliance | HADEES TRADING (PTY) LTD",
    description: "Get NHBRC and CIDB registration assistance, contractor compliance and health and safety file preparation from HADEES TRADING (PTY) LTD in Mahikeng.",
    faqs: [
      { question: "What construction services does HADEES TRADING (PTY) LTD offer?", answer: "Services include NHBRC and CIDB registration assistance, contractor compliance support, and health and safety file preparation." },
      { question: "Can clients outside Mahikeng access these services?", answer: "Yes. Based in Mahikeng, North West, HADEES TRADING (PTY) LTD serves eligible clients nationwide digitally. Remote document assistance depends on the scope of the work." },
      { question: "Are site inspections included, and are approvals guaranteed?", answer: "Site assessments and inspections are separately agreed. Registration assistance and compliance support do not guarantee approvals." },
      { question: "How can I enquire about construction compliance assistance?", answer: "Email admin@hadeestrading.co.za or call +27837535798 to enquire about your requirements and whether remote document assistance is suitable for your scope." },
    ],
  },
  "/website-design": {
    title: "Website Design South Africa | HADEES TRADING (PTY) LTD",
    description: "HADEES TRADING (PTY) LTD offers professional website development from Mahikeng, serving eligible clients across South Africa through a digital process.",
    faqs: [
      { question: "Who is this website development service for?", answer: "The service is aimed at entrepreneurs, construction companies, startups and SMEs. HADEES TRADING (PTY) LTD is based in Mahikeng, North West, and serves eligible clients nationwide digitally." },
      { question: "Can the website development process be handled remotely?", answer: "Yes. Briefing, content collection, design reviews and handover can be completed remotely." },
      { question: "What is agreed before website development begins?", answer: "Pages, assets, domain access and package scope are agreed before development begins." },
      { question: "How can I enquire about website development?", answer: "Contact HADEES TRADING (PTY) LTD at admin@hadeestrading.co.za or +27837535798 to discuss your website requirements." },
    ],
  },
  "/compliance": {
    title: "Business Compliance Support | HADEES TRADING (PTY) LTD",
    description: "HADEES TRADING (PTY) LTD offers business compliance assistance from Mahikeng, serving eligible clients digitally across South Africa. Confirm your scope.",
    faqs: [
      { question: "What business compliance assistance does HADEES TRADING offer?", answer: "HADEES TRADING assists with CIPC annual returns and amendments, SARS tax registration and clearance guidance, COIDA registration and renewals, and CIDB, NHBRC, B-BBEE and POPIA documentation guidance." },
      { question: "Can clients outside Mahikeng receive assistance?", answer: "Yes. Based in Mahikeng, North West, HADEES TRADING serves eligible clients nationwide digitally. Requirements and the scope of remote delivery are confirmed for the requested assistance." },
      { question: "Does compliance assistance guarantee regulator approval?", answer: "No. Regulator approvals are not guaranteed. HADEES TRADING provides assistance and guidance within the confirmed service scope." },
      { question: "How can I enquire about compliance assistance?", answer: "Email admin@hadeestrading.co.za or call +27837535798 to discuss your compliance needs and confirm requirements and remote delivery scope." },
    ],
  },
} as const;

export type ReviewedServicePath = keyof typeof reviewedServiceSeo;
export function serviceSearchScripts(path: ReviewedServicePath) {
  const page = reviewedServiceSeo[path];
  return [
    { type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@type": "Service", name: page.title, description: page.description, url: path,
      provider: { "@type": "Organization", "@id": "/#organization", name: COMPANY.legalName, telephone: COMPANY.phoneIntl, email: COMPANY.email, address: { "@type": "PostalAddress", addressLocality: COMPANY.city, addressRegion: "North West", addressCountry: "ZA" } },
      areaServed: { "@type": "Country", name: "South Africa" },
    }) },
    { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) }) },
  ];
}