import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const input = z.object({
  content: z.string().trim().min(30).max(20000),
  audience: z.string().trim().min(3).max(1000),
  pagePath: z.string().trim().max(200).regex(/^\/(?!admin|portal|api|account)[a-z0-9/-]*$/, "Provide a public page path"),
});
export const generateSeoDraft = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => input.parse(raw)).handler(async ({ data, context }) => {
    const { data: roles, error } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (error || !roles?.some((r) => ["super_admin", "administrator"].includes(r.role))) throw new Error("Administrator access required.");
    const state = await context.supabase.from("settings").select("value").eq("key", "seo_ai_access").maybeSingle();
    if (state.error) throw new Error("Unable to check AI access. No request was sent.");
    const value = state.data?.value as { blocked?: boolean; message?: string } | undefined;
    if (value?.blocked) throw new Error(value.message ?? "AI access is paused until access is restored.");
    const { generateSeoCopy } = await import("./ai/seo.server");
    try { return await generateSeoCopy(data); }
    catch (problem) {
      if (problem && typeof problem === "object" && "status" in problem && Number(problem.status) === 403) {
        const type = "type" in problem ? String(problem.type) : "";
        const eligibility = ["provider_not_available_in_region", "model_vendor_not_enabled", "model_requires_retention_consent", "credit_limit_reached"].includes(type);
        if (!eligibility) {
          await context.supabase.from("settings").upsert({ key: "seo_ai_access", value: { blocked: true, message: problem instanceof Error ? problem.message : "Provider access denied.", type }, is_public: false });
        }
      }
      throw problem;
    }
  });