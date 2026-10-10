import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { caseStudySchema, canPublishCaseStudy } from "./case-study-rules";
import type { Database } from "@/integrations/supabase/types";

export const listCaseStudies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).handler(async ({ context }) => {
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !roles?.some((r) => ["super_admin", "administrator"].includes(r.role))) throw new Error("Administrator access required.");
    const { data, error } = await context.supabase.from("case_studies").select("*").order("updated_at", { ascending: false });
    if (error) throw new Error("Unable to load case studies.");
    return data;
  });

export const saveCaseStudy = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((raw: unknown) => caseStudySchema.parse(raw)).handler(async ({ data, context }) => {
    const { data: roles, error: roleError } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    if (roleError || !roles?.some((r) => ["super_admin", "administrator"].includes(r.role))) throw new Error("Administrator access required.");
    if (data.published && !canPublishCaseStudy(data)) throw new Error("Confirm client permission, completed scope, outcome and privacy review before publishing.");
    const { id, ...fields } = data;
    const result = id ? await context.supabase.from("case_studies").update(fields).eq("id", id).select("id").single()
      : await context.supabase.from("case_studies").insert(fields).select("id").single();
    if (result.error) throw new Error("Unable to save this case study. No changes were saved.");
    return result.data;
  });

export const listPublicCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Portfolio is temporarily unavailable.");
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { data, error } = await client.from("case_studies")
    .select("id,title,client_identity,challenge,work_performed,outcome,completion_date,evidence")
    .eq("published", true).eq("permission_confirmed", true).eq("scope_verified", true).eq("privacy_reviewed", true)
    .order("completion_date", { ascending: false });
  if (error) throw new Error("Portfolio is temporarily unavailable.");
  return data;
});