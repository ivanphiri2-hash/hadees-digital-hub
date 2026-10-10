import { describe, it, expect } from "vitest";
import { canPublishCaseStudy, type CaseStudyInput } from "./case-study-rules";
const approved: CaseStudyInput = { title: "Approved work", client_identity: "Approved anonymous client", challenge: "Challenge", work_performed: "Confirmed scope", outcome: "Confirmed result", completion_date: "2026-10-01", evidence: [], permission_confirmed: true, scope_verified: true, privacy_reviewed: true, published: true };
describe("Public delivery evidence", () => {
  it("requires client permission, including Tloukgolo", () => expect(canPublishCaseStudy({ ...approved, client_identity: "Tloukgolo Construction", permission_confirmed: false }, "2026-10-09")).toBe(false));
  it("requires verified scope and outcome", () => expect(canPublishCaseStudy({ ...approved, scope_verified: false }, "2026-10-09")).toBe(false));
  it("requires privacy review", () => expect(canPublishCaseStudy({ ...approved, privacy_reviewed: false }, "2026-10-09")).toBe(false));
  it("only publishes completed work", () => expect(canPublishCaseStudy({ ...approved, completion_date: "2026-10-10" }, "2026-10-09")).toBe(false));
  it("requires a disclosed outcome", () => expect(canPublishCaseStudy({ ...approved, outcome: "" }, "2026-10-09")).toBe(false));
  it("allows approved completed work", () => expect(canPublishCaseStudy(approved, "2026-10-09")).toBe(true));
});