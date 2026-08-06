// PayFast LIVE hosted payment links, keyed by catalog slug.
// Centralised so the UI never hardcodes a URL. When the full server-side
// PayFast API integration replaces hosted links, only this map (and the
// resolver below) changes — the UI stays untouched.

export type PaymentLinkSlug = keyof typeof PAYMENT_LINKS;

export const PAYMENT_LINKS = {
  // Business registration & startup
  "company-registration": "https://payf.st/0inbt",
  "name-reservation": "https://payf.st/2ocm9",
  "company-amendment": "https://payf.st/9jmow",
  "share-certificate": "https://payf.st/f19pm",
  "starter-consultation": "https://payf.st/reo21",

  // Tax & compliance
  "tax-clearance": "https://payf.st/0k214",
  "sars-efiling": "https://payf.st/twpqs",
  bbbee: "https://payf.st/ls7hb",
  "csd-registration": "https://payf.st/mpsw8",
  "uif-registration": "https://payf.st/ok1pw",
  coida: "https://payf.st/fget2",
  "letter-good-standing": "https://payf.st/n3tv0",

  // Construction
  nhbrc: "https://payf.st/2xbhi",
  "nhbrc-assistance": "https://payf.st/gbf3o",
  "cidb-registration": "https://payf.st/mz6d9",
  "cidb-upgrade": "https://payf.st/zke7r",
  "construction-compliance": "https://payf.st/z4r5e",
  "health-safety-file": "https://payf.st/4w91c",
  psira: "https://payf.st/9f5b2",

  // Tender services
  "tender-review": "https://payf.st/1248y",
  "tender-application": "https://payf.st/2nsbw",
  "tender-package": "https://payf.st/2nsbw",
  "business-profile": "https://payf.st/vycf0",
  "capability-statement": "https://payf.st/ncj3b",
  "business-plan": "https://payf.st/rda7j",
  "company-portfolio": "https://payf.st/72t8l",

  // Website design
  "website-starter": "https://payf.st/nubcv",
  "website-business": "https://payf.st/vldpj",
  "website-premium": "https://payf.st/fk37t",

  // Branding
  "logo-design": "https://payf.st/nykxq",
  "letterhead-design": "https://payf.st/rheik",
  "invoice-template": "https://payf.st/izw3h",
  "company-profile-design": "https://payf.st/vdfro",
  "branding-package": "https://payf.st/90k6w",

  // AI & automation
  "automation-starter": "https://payf.st/3nvlt",
  "ai-business-os": "https://payf.st/ri39p",

  // Featured packages
  "entrepreneur-starter": "https://payf.st/dtr6o",
  "business-compliance": "https://payf.st/p1sy2",
  "contractor-growth": "https://payf.st/dynea",
  "digital-growth": "https://payf.st/ey82z",
} as const satisfies Record<string, string>;

/** Returns the PayFast LIVE payment URL for a slug, or undefined if unmapped. */
export function getPaymentLink(slug: string): string | undefined {
  return (PAYMENT_LINKS as Record<string, string>)[slug];
}
