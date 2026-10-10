import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sparkles, Copy, Download } from "lucide-react";
import { AdminShell } from "@/components/admin/shell";
import { Button } from "@/components/ui/button";
import { generateSeoDraft } from "@/lib/seo.functions";
export const Route = createFileRoute("/admin/seo")({
  head: () => ({ meta: [{ title: "SEO Writer — Hadees Trading Admin" }, { name: "description", content: "Prepare reviewable SEO titles, descriptions and FAQ drafts." }, { property: "og:title", content: "SEO Writer — Hadees Trading" }, { property: "og:description", content: "Administrator SEO draft workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SeoWriter,
});
function SeoWriter() {
  const generate = useServerFn(generateSeoDraft);
  const [pagePath, setPath] = useState("/");
  const [audience, setAudience] = useState("");
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [output, setOutput] = useState<Awaited<ReturnType<typeof generateSeoDraft>> | null>(null);
  const field = "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";
  const text = output ? JSON.stringify(output, null, 2) : "";
  return <AdminShell title="SEO Writer">
    <form className="grid max-w-4xl gap-5" onSubmit={async (event) => {
      event.preventDefault(); setPending(true); setError(""); setNotice(""); setOutput(null);
      try { setOutput(await generate({ data: { pagePath, audience, content } })); }
      catch (problem) { setError(problem instanceof Error ? problem.message : "Unable to generate copy. No page content was changed."); }
      finally { setPending(false); }
    }}>
      <label className="grid gap-2 text-sm">Public page path<input required maxLength={200} className={field} value={pagePath} onChange={(e) => setPath(e.target.value)} /></label>
      <label className="grid gap-2 text-sm">Target audience<textarea required minLength={3} maxLength={1000} rows={2} className={field} value={audience} onChange={(e) => setAudience(e.target.value)} /></label>
      <label className="grid gap-2 text-sm">Approved public page content<textarea required minLength={30} maxLength={20000} rows={9} className={field} value={content} onChange={(e) => setContent(e.target.value)} /></label>
      <p className="text-xs text-muted-foreground">Public, non-confidential content only. Drafts require review and do not change live pages. Lovable AI usage may incur charges.</p>
      <div><Button disabled={pending}><Sparkles />{pending ? "Generating…" : "Generate SEO draft"}</Button></div>
    </form>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {output && <section className="grid max-w-4xl gap-5 border-t border-border pt-6">
      <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-xl font-bold">Draft · Review before publishing</h2><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(text); setNotice("Draft copied."); } catch { setError("Unable to copy. Download the draft instead."); } }}><Copy />Copy</Button><Button variant="outline" onClick={() => { const url = URL.createObjectURL(new Blob([text], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "hadees-seo-draft.json"; link.click(); URL.revokeObjectURL(url); }}><Download />Download</Button></div>
      {notice && <p role="status" className="text-sm text-muted-foreground">{notice}</p>}
      <label className="grid gap-2 text-sm">SEO title · {output.title.length} characters<input className={field} value={output.title} onChange={(e) => setOutput({ ...output, title: e.target.value })} /></label>
      <label className="grid gap-2 text-sm">Meta description · {output.description.length} characters<textarea className={field} value={output.description} onChange={(e) => setOutput({ ...output, description: e.target.value })} /></label>
      {output.faqs.map((faq, index) => <div key={index} className="grid gap-2"><label className="grid gap-2 text-sm">FAQ {index + 1} question<input className={field} value={faq.question} onChange={(e) => setOutput({ ...output, faqs: output.faqs.map((item, i) => i === index ? { ...item, question: e.target.value } : item) })} /></label><label className="grid gap-2 text-sm">Answer<textarea rows={3} className={field} value={faq.answer} onChange={(e) => setOutput({ ...output, faqs: output.faqs.map((item, i) => i === index ? { ...item, answer: e.target.value } : item) })} /></label></div>)}
      <p className="text-sm text-muted-foreground">{output.reviewNotes}</p>
    </section>}
  </AdminShell>;
}