// Env accessors for third-party integrations. All values are optional so the
// site works without them; when Lovable Cloud is enabled these get real values.
// Never put secret keys here — only public/publishable identifiers.

type Env = Record<string, string | undefined>;
const env = (import.meta as unknown as { env: Env }).env ?? {};

export const INTEGRATIONS = {
  supabaseUrl: env.VITE_SUPABASE_URL ?? "",
  supabasePublishableKey: env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
  googleMapsKey: env.VITE_GOOGLE_MAPS_KEY ?? "",
  payfastMerchantId: env.VITE_PAYFAST_MERCHANT_ID ?? "",
  whatsappNumber: env.VITE_WHATSAPP_NUMBER ?? "27837535798",
} as const;

export const hasBackend = () => Boolean(INTEGRATIONS.supabaseUrl && INTEGRATIONS.supabasePublishableKey);
