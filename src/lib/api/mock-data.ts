import type { AuditEvent, Booking, Client, Invoice, Lead, Quote, UserRoleRow } from "./types";

// Demo data used by the admin preview until Lovable Cloud is wired in.
export const MOCK_LEADS: Lead[] = [
  { id: "L-1042", name: "Thabo Molefe", email: "thabo@molefeco.co.za", phone: "+27 82 555 0142", service: "Business Website", message: "Need a site + WhatsApp form.", status: "new", source: "website", createdAt: "2026-07-24T09:12:00Z", value: 5500 },
  { id: "L-1041", name: "Nomsa Dlamini", email: "nomsa@brightstar.co.za", phone: "+27 71 555 0193", service: "CIPC + Tax", message: "Register new company + tax pin.", status: "contacted", source: "whatsapp", createdAt: "2026-07-23T14:02:00Z", value: 1300 },
  { id: "L-1040", name: "Kagiso Mokoena", email: "k.mokoena@build-it.co.za", phone: "+27 83 555 0119", service: "Tender review", message: "Water infrastructure tender, closes Friday.", status: "qualified", source: "tender", createdAt: "2026-07-22T08:41:00Z", value: 500 },
  { id: "L-1039", name: "Lerato Sithole", email: "lerato@sithole-events.co.za", phone: "+27 74 555 0177", service: "CRM + Portal", message: "Move off spreadsheets.", status: "won", source: "referral", createdAt: "2026-07-20T11:22:00Z", value: 18500 },
  { id: "L-1038", name: "Sipho Ndaba", email: "sipho@ndaba-transport.co.za", phone: "+27 79 555 0164", service: "Website + AI Chat", message: "Add AI chat to existing site.", status: "lost", source: "website", createdAt: "2026-07-18T16:00:00Z", value: 8500 },
];

export const MOCK_BOOKINGS: Booking[] = [
  { id: "B-208", clientName: "Molefe Co.", service: "Kickoff call", when: "2026-07-27T10:00:00Z", status: "confirmed", location: "Google Meet" },
  { id: "B-207", clientName: "Brightstar Trading", service: "CIPC intake", when: "2026-07-27T14:30:00Z", status: "pending", location: "Mahikeng office" },
  { id: "B-206", clientName: "Build-It Civils", service: "Tender strategy", when: "2026-07-28T09:00:00Z", status: "confirmed", location: "Zoom" },
];

export const MOCK_QUOTES: Quote[] = [
  { id: "Q-3011", number: "Q-2026-3011", clientName: "Molefe Co.", total: 5500, status: "sent", createdAt: "2026-07-24T09:20:00Z" },
  { id: "Q-3010", number: "Q-2026-3010", clientName: "Sithole Events", total: 18500, status: "accepted", createdAt: "2026-07-20T11:30:00Z" },
  { id: "Q-3009", number: "Q-2026-3009", clientName: "Ndaba Transport", total: 8500, status: "rejected", createdAt: "2026-07-18T16:10:00Z" },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: "I-9082", number: "INV-2026-9082", clientName: "Sithole Events", total: 18500, status: "paid", dueDate: "2026-07-25" },
  { id: "I-9081", number: "INV-2026-9081", clientName: "Kgomo Holdings", total: 12200, status: "sent", dueDate: "2026-07-30" },
  { id: "I-9080", number: "INV-2026-9080", clientName: "Rakgotso Farms", total: 4400, status: "overdue", dueDate: "2026-07-15" },
];

export const MOCK_CLIENTS: Client[] = [
  { id: "C-042", name: "Sithole Events", email: "lerato@sithole-events.co.za", phone: "+27 74 555 0177", industry: "Events", since: "2025-11-01", lifetimeValue: 44000 },
  { id: "C-041", name: "Kgomo Holdings", email: "ops@kgomoholdings.co.za", phone: "+27 82 555 0210", industry: "Property", since: "2025-08-14", lifetimeValue: 62500 },
  { id: "C-040", name: "Rakgotso Farms", email: "farm@rakgotso.co.za", phone: "+27 71 555 0132", industry: "Agriculture", since: "2025-06-02", lifetimeValue: 12800 },
];

export const MOCK_AUDIT: AuditEvent[] = [
  { id: "A-1", actor: "admin@hadeestrading.co.za", action: "invoice.paid", entity: "INV-2026-9082", at: "2026-07-25T09:04:00Z" },
  { id: "A-2", actor: "admin@hadeestrading.co.za", action: "lead.status.qualified", entity: "L-1040", at: "2026-07-24T16:20:00Z" },
  { id: "A-3", actor: "staff@hadeestrading.co.za", action: "quote.sent", entity: "Q-2026-3011", at: "2026-07-24T09:22:00Z" },
  { id: "A-4", actor: "admin@hadeestrading.co.za", action: "user.role.updated", entity: "staff@hadeestrading.co.za", at: "2026-07-22T08:00:00Z" },
];

export const MOCK_ROLES: UserRoleRow[] = [
  { id: "U-1", email: "admin@hadeestrading.co.za", role: "owner", active: true },
  { id: "U-2", email: "staff@hadeestrading.co.za", role: "staff", active: true },
  { id: "U-3", email: "viewer@hadeestrading.co.za", role: "viewer", active: false },
];
