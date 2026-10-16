import { expect, it } from "vitest";
import { validateClientLink } from "./client-link-rules";
it("preserves the admin account instead of linking it as a client", () => {
  expect(() => validateClientLink("admin@hadeestrading.co.za", "admin@hadeestrading.co.za", ["super_admin"], true)).toThrow("Staff and administrator");
});
it("requires the client record email to match", () => {
  expect(() => validateClientLink("client@example.com", "other@example.com", ["client"], true)).toThrow("must match");
});
it("requires email confirmation", () => {
  expect(() => validateClientLink("client@example.com", "client@example.com", ["client"], false)).toThrow("confirm");
});