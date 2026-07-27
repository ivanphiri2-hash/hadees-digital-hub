// PayFast server-only helpers. Never import from client code.
// Docs: https://developers.payfast.co.za/docs

import { createHash } from "node:crypto";

export interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase: string;
  mode: "sandbox" | "live";
  siteUrl: string;
}

export function getPayFastConfig(): PayFastConfig {
  const mode = (process.env.PAYFAST_MODE ?? "sandbox").toLowerCase() === "live" ? "live" : "sandbox";
  return {
    merchantId: process.env.PAYFAST_MERCHANT_ID ?? "",
    merchantKey: process.env.PAYFAST_MERCHANT_KEY ?? "",
    passphrase: process.env.PAYFAST_PASSPHRASE ?? "",
    mode,
    siteUrl: (process.env.SITE_URL ?? "").replace(/\/+$/, ""),
  };
}

export function payfastProcessUrl(mode: "sandbox" | "live"): string {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process";
}

export function payfastValidateUrl(mode: "sandbox" | "live"): string {
  return mode === "live"
    ? "https://www.payfast.co.za/eng/query/validate"
    : "https://sandbox.payfast.co.za/eng/query/validate";
}

// PayFast requires PHP-style urlencoding: spaces become '+', uppercase hex.
function pfEncode(v: string): string {
  return encodeURIComponent(v.trim()).replace(/%20/g, "+");
}

/**
 * Build the PayFast MD5 signature over an ordered field list, in the exact
 * order the form fields will be posted (excluding "signature"). Empty values
 * are omitted per PayFast convention.
 */
export function payfastSignature(
  fields: Record<string, string | number | undefined>,
  passphrase: string,
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined || v === null) continue;
    const s = String(v);
    if (s.length === 0) continue;
    parts.push(`${k}=${pfEncode(s)}`);
  }
  let str = parts.join("&");
  if (passphrase && passphrase.length > 0) {
    str += `&passphrase=${pfEncode(passphrase)}`;
  }
  return createHash("md5").update(str).digest("hex");
}

/** ITN signature is computed the same way over ALL posted fields except `signature`. */
export function payfastItnSignature(
  posted: Record<string, string>,
  passphrase: string,
): string {
  const ordered: Record<string, string> = {};
  for (const [k, v] of Object.entries(posted)) {
    if (k === "signature") continue;
    ordered[k] = v;
  }
  return payfastSignature(ordered, passphrase);
}

/** Server-to-server ITN validation call back to PayFast. */
export async function validateItnWithPayFast(
  mode: "sandbox" | "live",
  postedRaw: string,
): Promise<boolean> {
  try {
    const res = await fetch(payfastValidateUrl(mode), {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: postedRaw,
    });
    const body = (await res.text()).trim();
    return body.startsWith("VALID");
  } catch (e) {
    console.error("PayFast validate call failed", e);
    return false;
  }
}

// PayFast-published production server IPs (safe to hard-fail against for live only).
const PAYFAST_HOSTS = [
  "www.payfast.co.za",
  "sandbox.payfast.co.za",
  "w1w.payfast.co.za",
  "w2w.payfast.co.za",
];

export async function itnHostAllowed(remoteHost: string | null): Promise<boolean> {
  if (!remoteHost) return true; // header not always present behind edge; skip strict check
  return PAYFAST_HOSTS.some((h) => remoteHost.endsWith(h));
}
