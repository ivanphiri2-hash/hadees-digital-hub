import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Save, Pencil, X } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { listCaseStudies, saveCaseStudy } from "@/lib/content.functions";
import { caseStudySchema, type CaseStudyInput } from "@/lib/case-study-rules";
export const Route = createFileRoute("/admin/case-studies")({
  head: () => ({ meta: [{ title: "Case Studies — Hadees Trading Admin" }, { name: "description", content: "Manage verified, client-approved public delivery evidence." }, { property: "og:title", content: "Case Studies — Hadees Trading" }, { property: "og:description", content: "Administrator publication workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: CaseStudies,
});
const empty: CaseStudyInput = { title: "", client_identity: "", challenge: "", work_performed: "", outcome: "", completion_date: null, evidence: [], permission_confirmed: false, scope_verified: false, privacy_reviewed: false, published: false };
function CaseStudies() {
  const list = useServerFn(listCaseStudies); const save = useServerFn(saveCaseStudy); const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "case-studies"], queryFn: () => list({}) });
  const [form, setForm] = useState<CaseStudyInput | null>(null); const [pending, setPending] = useState(false); const [error, setError] = useState("");
  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  return <AdminShell title="Case studies">
    <div><Button onClick={() => { setForm({ ...empty }); setError(""); }}><Plus />New case study</Button></div>
    <p className="text-sm text-muted-foreground">Only approved public copy and sanitized evidence. Do not attach safety files, personal information, signatures, site details or confidential compliance records. Tloukgolo Construction requires confirmed permission, scope and outcome before publication.</p>
    {(error || q.error) && <p role="alert" className="text-sm text-destructive">{error || q.error?.message}</p>}
    {q.isPending && <p className="text-sm text-muted-foreground">Loading case studies…</p>}
    {form && <form className="grid max-w-4xl gap-4 border-y border-border py-6" onSubmit={async (event) => { event.preventDefault(); setPending(true); setError(""); try { await save({ data: form }); await qc.invalidateQueries({ queryKey: ["admin", "case-studies"] }); await qc.invalidateQueries({ queryKey: ["public", "case-studies"] }); setForm(null); } catch (problem) { setError(problem instanceof Error ? problem.message : "Unable to save. No changes were saved."); } finally { setPending(false); } }}>
      {(["title", "client_identity", "challenge", "work_performed", "outcome"] as const).map((key) => <label key={key} className="grid gap-2 text-sm">{key.replace(/_/g, " ")}<textarea required={key === "title" || key === "client_identity"} maxLength={8000} rows={key === "title" || key === "client_identity" ? 1 : 3} className={field} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
      <label className="grid gap-2 text-sm">Completion date<input type="date" className={field} value={form.completion_date ?? ""} onChange={(e) => setForm({ ...form, completion_date: e.target.value || null })} /></label>
      <h3 className="font-semibold">Authorized public evidence</h3>
      {form.evidence.map((item, index) => <div key={index} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto_auto]">
        <input aria-label={`Evidence ${index + 1} label`} required className={field} placeholder="Label" value={item.label} onChange={(e) => setForm({ ...form, evidence: form.evidence.map((v, i) => i === index ? { ...v, label: e.target.value } : v) })} />
        <input aria-label={`Evidence ${index + 1} public URL`} required type="url" className={field} placeholder="Authorized public HTTPS URL" value={item.url} onChange={(e) => setForm({ ...form, evidence: form.evidence.map((v, i) => i === index ? { ...v, url: e.target.value } : v) })} />
        <select aria-label={`Evidence ${index + 1} type`} className={field} value={item.kind} onChange={(e) => setForm({ ...form, evidence: form.evidence.map((v, i) => i === index ? { ...v, kind: e.target.value === "image" ? "image" : "document" } : v) })}><option value="image">Image</option><option value="document">Document</option></select>
        <Button type="button" variant="ghost" size="icon" aria-label="Remove evidence" onClick={() => setForm({ ...form, evidence: form.evidence.filter((_, i) => i !== index) })}><X /></Button>
      </div>)}
      <div><Button type="button" variant="outline" disabled={form.evidence.length >= 12} onClick={() => setForm({ ...form, evidence: [...form.evidence, { label: "", url: "", kind: "image" }] })}><Plus />Add evidence link</Button></div>
      {([["permission_confirmed", "Client permission confirmed for this exact public content"], ["scope_verified", "Completed scope and outcome verified"], ["privacy_reviewed", "All copy and linked evidence reviewed for privacy"], ["published", "Publish on the public portfolio"]] as const).map(([key, label]) => <label key={key} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} />{label}</label>)}
      <div className="flex gap-3"><Button disabled={pending}><Save />{pending ? "Saving…" : "Save case study"}</Button><Button type="button" variant="outline" disabled={pending} onClick={() => setForm(null)}>Cancel</Button></div>
    </form>}
    <div className="grid divide-y divide-border">{q.data?.map((study) => <div key={study.id} className="flex items-center justify-between gap-4 py-4"><div><h2 className="font-semibold">{study.title}</h2><p className="text-sm text-muted-foreground">{study.client_identity} · {study.published ? "Published" : "Draft"}</p></div><Button variant="outline" onClick={() => { const parsed = caseStudySchema.safeParse(study); if (parsed.success) { setForm(parsed.data); setError(""); } else setError("This record contains invalid evidence. Please contact support."); }}><Pencil />Edit</Button></div>)}</div>
    {q.data?.length === 0 && <p className="text-sm text-muted-foreground">No case studies yet.</p>}
  </AdminShell>;
}