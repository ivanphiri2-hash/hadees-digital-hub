// Swappable payment layer. Today: PayFast LIVE hosted links + local storage of
// customer details. Tomorrow: a Supabase-backed implementation can persist the
// lead/order before redirecting — the checkout UI stays untouched.

import { getPaymentLink } from "@/config/payment-links";

export interface CheckoutDetails {
  service_slug: string;
  service_name?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
}

export interface CheckoutStartResult {
  redirect_url: string;
  reference: string;
}

export interface PaymentService {
  /** Persist customer details (where supported) and resolve the redirect URL. */
  startCheckout(details: CheckoutDetails): Promise<CheckoutStartResult>;
}

export const CHECKOUT_STORAGE_KEY = "hadees.checkout.pending";

export function newReference(): string {
  return `HT-${Date.now().toString(36).toUpperCase()}`;
}

/** Local-only implementation: stores details in localStorage, then redirects. */
export class LocalPayFastLinkService implements PaymentService {
  async startCheckout(details: CheckoutDetails): Promise<CheckoutStartResult> {
    const redirect_url = getPaymentLink(details.service_slug);
    if (!redirect_url) {
      throw new Error("This service isn't available for online payment yet. Please contact us.");
    }
    const reference = newReference();
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          CHECKOUT_STORAGE_KEY,
          JSON.stringify({ ...details, reference, created_at: new Date().toISOString() }),
        );
      }
    } catch {
      // Storage blocked — never block the payment.
    }
    return { redirect_url, reference };
  }
}

export const paymentService: PaymentService = new LocalPayFastLinkService();
