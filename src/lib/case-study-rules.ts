import { z } from "zod";

const copy = z.string().trim().max(8000);
export const caseStudySchema = z.object({
  id: z.string().uuid().optional(),
  title: copy.min(1), client_identity: copy.min(1), challenge: copy,
  work_performed: copy, outcome: copy,
  completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  evidence: z.array(z.object({
    label: z.string().trim().min(1).max(160),
    url: z.string().url().refine((url) => url.startsWith("https://"), "Use an authorized public HTTPS link"),
    kind: z.enum(["image", "document"]),
  })).max(12),
  permission_confirmed: z.boolean(), scope_verified: z.boolean(),
  privacy_reviewed: z.boolean(), published: z.boolean(),
});
export type CaseStudyInput = z.infer<typeof caseStudySchema>;
export function canPublishCaseStudy(data: CaseStudyInput, today = new Date().toISOString().slice(0, 10)) {
  return data.permission_confirmed && data.scope_verified && data.privacy_reviewed &&
    !!data.completion_date && data.completion_date <= today &&
    [data.title, data.client_identity, data.challenge, data.work_performed, data.outcome].every((v) => v.trim().length > 0);
}