// Public (unauthenticated) server functions. These are reachable by anyone,
// so validation is strict and only non-sensitive writes are allowed.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().max(160).optional().default(""),
  service: z.string().trim().max(160).optional().default(""),
  message: z.string().trim().min(5).max(4000),
  source: z.enum(["website", "whatsapp", "referral", "facebook", "instagram", "google"]).default("website"),
});

/** Contact / enquiry capture: stores the enquiry, opens a lead, pings staff. */
export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => enquirySchema.parse(raw))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: lead, error: leadErr } = await supabaseAdmin.from("leads").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service_name: data.service || null,
      message: data.message,
      source: data.source,
      stage: "new_lead",
    }).select("id").single();
    if (leadErr) throw new Error("Could not submit your enquiry. Please try again.");

    await supabaseAdmin.from("enquiries").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      service: data.service || null,
      message: data.message,
      source: data.source,
      lead_id: lead.id,
    });

    await supabaseAdmin.from("notifications").insert({
      audience: "staff",
      type: "lead",
      title: "New website enquiry",
      body: `${data.name}${data.company ? ` (${data.company})` : ""} — ${data.service || "General enquiry"}`,
      link: "/admin/leads",
    });

    await supabaseAdmin.from("activity_logs").insert({
      actor_name: data.name,
      action: "enquiry.created",
      entity_type: "lead",
      entity_id: lead.id,
      meta: { source: data.source, service: data.service },
    });

    return { ok: true as const };
  });
