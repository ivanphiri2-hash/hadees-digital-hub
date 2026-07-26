// Thin async service layer. Today it resolves from mock data; when Lovable
// Cloud is enabled these functions become the single place to swap for real
// Supabase queries. UI code should only import from this module.

import { hasBackend } from "./env";
import {
  MOCK_AUDIT,
  MOCK_BOOKINGS,
  MOCK_CLIENTS,
  MOCK_INVOICES,
  MOCK_LEADS,
  MOCK_QUOTES,
  MOCK_ROLES,
} from "./mock-data";
import type {
  AuditEvent,
  Booking,
  Client,
  Invoice,
  Lead,
  Quote,
  UserRoleRow,
} from "./types";

const wait = <T,>(v: T, ms = 120) => new Promise<T>((r) => setTimeout(() => r(v), ms));

export const api = {
  leads: {
    list: (): Promise<Lead[]> => wait(MOCK_LEADS),
  },
  bookings: {
    list: (): Promise<Booking[]> => wait(MOCK_BOOKINGS),
  },
  quotes: {
    list: (): Promise<Quote[]> => wait(MOCK_QUOTES),
  },
  invoices: {
    list: (): Promise<Invoice[]> => wait(MOCK_INVOICES),
  },
  clients: {
    list: (): Promise<Client[]> => wait(MOCK_CLIENTS),
  },
  audit: {
    list: (): Promise<AuditEvent[]> => wait(MOCK_AUDIT),
  },
  roles: {
    list: (): Promise<UserRoleRow[]> => wait(MOCK_ROLES),
  },
  meta: {
    liveBackend: hasBackend(),
  },
};
