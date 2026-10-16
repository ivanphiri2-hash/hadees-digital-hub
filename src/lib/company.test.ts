import { describe, expect, it } from "vitest";
import { COMPANY, SOCIALS } from "./company";

describe("official contact details", () => {
  it("uses the requested business telephone number", () => {
    expect(COMPANY.phone).toBe("0632702826");
    expect(COMPANY.phoneIntl).toBe("+27632702826");
  });
  it("routes WhatsApp enquiries to the same number", () => {
    expect(COMPANY.whatsapp).toBe("27632702826");
    expect(SOCIALS.find((link) => link.key === "whatsapp")?.href).toBe("https://wa.me/27632702826");
  });
});