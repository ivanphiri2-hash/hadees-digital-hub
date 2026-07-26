// Typed domain models for the Hadees Trading platform.
// This layer is intentionally decoupled from any specific backend so it can
// be swapped for Lovable Cloud (Supabase) later without touching UI.

export type ID = string;
export type ISODate = string;

export type LeadStatus = "new" | "contacted" | "qualified" | "won" | "lost";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "void";
export type Role = "owner" | "admin" | "staff" | "viewer";

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  status: LeadStatus;
  source: "website" | "whatsapp" | "referral" | "tender";
  createdAt: ISODate;
  value?: number;
}

export interface Booking {
  id: ID;
  clientName: string;
  service: string;
  when: ISODate;
  status: BookingStatus;
  location: string;
}

export interface Quote {
  id: ID;
  number: string;
  clientName: string;
  total: number;
  status: QuoteStatus;
  createdAt: ISODate;
}

export interface Invoice {
  id: ID;
  number: string;
  clientName: string;
  total: number;
  status: InvoiceStatus;
  dueDate: ISODate;
}

export interface Client {
  id: ID;
  name: string;
  email: string;
  phone: string;
  industry: string;
  since: ISODate;
  lifetimeValue: number;
}

export interface AuditEvent {
  id: ID;
  actor: string;
  action: string;
  entity: string;
  at: ISODate;
}

export interface UserRoleRow {
  id: ID;
  email: string;
  role: Role;
  active: boolean;
}
