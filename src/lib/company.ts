export const COMPANY = {
  legalName: "HADEES TRADING (PTY) LTD",
  shortName: "Hadees Trading",
  tagline: "Professional Business Compliance & Digital Solutions.",
  established: "2025",
  city: "Mahikeng",
  country: "South Africa",
  phone: "0837535798",
  phoneIntl: "+27837535798",
  email: "admin@hadeestrading.co.za",
  whatsapp: "27837535798",
  address: "Mahikeng, North West, South Africa",
} as const;

export const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Pricing", to: "/pricing" },
  { label: "Industries", to: "/industries" },
  { label: "Why Us", to: "/why-choose-us" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
] as const;

export const WEBSITE_PACKAGES = [
  {
    slug: "website-starter",
    name: "Starter Website",
    price: "R1,500",
    amount: 1500,
    tagline: "Launch a credible presence, fast.",
    timeline: "5 – 7 working days",
    features: [
      "Up to 5 responsive pages",
      "Mobile-first design",
      "Contact form + WhatsApp",
      "On-page SEO essentials",
      "SSL & fast hosting setup",
      "1 round of revisions",
    ],
    badge: null,
    cta: "Start Starter",
  },
  {
    slug: "website-business",
    name: "Business Website",
    price: "R2,500",
    amount: 2500,
    tagline: "Convert visitors into qualified leads.",
    timeline: "7 – 10 working days",
    features: [
      "Up to 10 pages, custom layout",
      "Blog / news module",
      "Google Business + Maps",
      "Advanced SEO + schema",
      "Lead capture + email routing",
      "2 rounds of revisions",
    ],
    badge: "Most Popular",
    cta: "Start Business",
  },
  {
    slug: "website-premium",
    name: "Premium Business Website",
    price: "R5,500",
    amount: 5500,
    tagline: "A full digital storefront with automation.",
    timeline: "10 – 20 working days",
    features: [
      "Unlimited core pages",
      "Client portal & bookings",
      "PayFast payments ready",
      "CRM + lead pipeline hooks",
      "AI chat + automation ready",
      "Priority support 90 days",
    ],
    badge: "Enterprise",
    cta: "Start Premium",
  },
] as const;

/**
 * Canonical priced-item registry. Every entry is a checkoutable service —
 * `slug` is the URL id used by `/checkout?service=<slug>`, `amount` is in ZAR.
 */
export const PRICED_SERVICES = [
  {
    slug: "company-registration",
    category: "Company Registration",
    name: "Private Company (Pty) Ltd Registration",
    price: "R1,500",
    amount: 1500,
    desc: "CIPC name reservation, company registration, all statutory company documents, share certificate & digital copies.",
    cta: "Register Now",
  },
  ...WEBSITE_PACKAGES.map((p) => ({
    slug: p.slug,
    category: "Website Design",
    name: p.name,
    price: p.price,
    amount: p.amount,
    desc: p.tagline,
    cta: "View Package",
  })),
  {
    slug: "coida",
    category: "Compliance Registration",
    name: "COIDA Registration",
    price: "R3,500",
    amount: 3500,
    desc: "Workmen's compensation registration with the Compensation Fund.",
    cta: "Register Now",
  },
  {
    slug: "nhbrc",
    category: "Compliance Registration",
    name: "NHBRC Registration",
    price: "R4,500",
    amount: 4500,
    desc: "Home Builders Registration Council enrolment.",
    cta: "Register Now",
  },
  {
    slug: "nhbrc-assistance",
    category: "Compliance Assistance",
    name: "NHBRC Assistance",
    price: "R500",
    amount: 500,
    desc: "Support with NHBRC renewals & documentation.",
    cta: "Get Assistance",
  },
  {
    slug: "tax-clearance",
    category: "Tax",
    name: "Tax Clearance Assistance",
    price: "R350",
    amount: 350,
    desc: "SARS tax compliance status pin.",
    cta: "Order Now",
  },
  {
    slug: "bbbee",
    category: "Compliance Registration",
    name: "B-BBEE Registration",
    price: "R350",
    amount: 350,
    desc: "Affidavit-based BEE certificate assistance.",
    cta: "Order Now",
  },
  {
    slug: "share-certificate",
    category: "Documents",
    name: "Share Certificate",
    price: "R350",
    amount: 350,
    desc: "Legally drafted share certificates for members.",
    cta: "Order Now",
  },
  {
    slug: "letterhead-logo",
    category: "Branding",
    name: "Letterhead & Logo Design",
    price: "R500",
    amount: 500,
    desc: "Professional letterhead + logo package.",
    cta: "Order Now",
  },
  {
    slug: "business-plan",
    category: "Documents",
    name: "Business Plan",
    price: "R500",
    amount: 500,
    desc: "Bank & funder-ready business plan.",
    cta: "Order Now",
  },
  {
    slug: "invoice-template",
    category: "Documents",
    name: "Invoice & Quotation Template",
    price: "R400",
    amount: 400,
    desc: "Branded, tax-ready templates.",
    cta: "Order Now",
  },
  {
    slug: "tender-review",
    category: "Tenders",
    name: "Tender Document Review",
    price: "R500",
    amount: 500,
    desc: "Line-by-line review before submission.",
    cta: "Order Now",
  },
  {
    slug: "psira",
    category: "Registration Assistance",
    name: "PSIRA Registration Assistance",
    price: "R1,500",
    amount: 1500,
    desc: "Document preparation, application guidance, coordination with accredited training providers, and progress tracking.",
    cta: "Apply Now",
    badge: "NEW",
    disclaimer:
      "HADEES TRADING (PTY) LTD is NOT a PSIRA-accredited training provider. We provide consultation and registration assistance only. Training is completed through accredited PSIRA training centres.",
  },
] as const;

export type PricedService = (typeof PRICED_SERVICES)[number];

export function findPricedService(slug: string): PricedService | undefined {
  return PRICED_SERVICES.find((s) => s.slug === slug);
}

// Legacy alias retained for pages that still consume this shape.
export const REGISTRATION_PRICING = PRICED_SERVICES
  .filter((s) => !s.slug.startsWith("website-"))
  .map((s) => ({ name: s.name, price: s.price, desc: s.desc, slug: s.slug }));

export const SERVICES = [
  { slug: "website-design", name: "Website Design", desc: "High-performance, SEO-ready websites built to convert.", icon: "layout" },
  { slug: "business-registration", name: "Business Registration", desc: "CIPC, tax, COIDA, NHBRC, CIDB & CSD from one desk.", icon: "building" },
  { slug: "tender-assistance", name: "Tender Assistance", desc: "Find, prepare & submit government & corporate tenders.", icon: "file" },
  { slug: "compliance", name: "Compliance", desc: "Stay CIPC, SARS, COIDA, B-BBEE & POPIA compliant, all year.", icon: "shield" },
  { slug: "psira", name: "PSIRA Registration Assistance", desc: "Document prep & guidance for PSIRA registration. Assistance only.", icon: "shield" },
  { slug: "crm-systems", name: "CRM Systems", desc: "Own your pipeline with an enterprise-grade CRM.", icon: "users" },
  { slug: "business-automation", name: "Business Automation", desc: "Automate quotes, invoices, reminders & workflows.", icon: "zap" },
  { slug: "ai-automation", name: "AI Automation", desc: "Deploy AI agents that work while you sleep.", icon: "bot" },
  { slug: "enterprise-ai", name: "Enterprise AI", desc: "Document AI, tender AI, proposal AI, predictive analytics.", icon: "brain" },
  { slug: "branding", name: "Branding", desc: "Logos, letterheads & identity systems that command trust.", icon: "sparkles" },
  { slug: "digital-transformation", name: "Digital Transformation", desc: "Move paper processes into secure digital systems.", icon: "refresh" },
  { slug: "cloud-solutions", name: "Cloud Solutions", desc: "Cloud email, storage, backups & security.", icon: "cloud" },
  { slug: "it-consulting", name: "IT Consulting", desc: "Advisory for SMEs modernising their IT stack.", icon: "cpu" },
  { slug: "training", name: "Training", desc: "Team training on tools, compliance & AI adoption.", icon: "graduation" },
  { slug: "business-documentation", name: "Business Documentation", desc: "Policies, procedures, contracts & templates.", icon: "book" },
] as const;
