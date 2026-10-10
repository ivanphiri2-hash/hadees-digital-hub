import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { listPublicCaseStudies } from "@/lib/content.functions";
import { Section, BigCTA } from "@/components/site/ui";
import { z } from "zod";
const options = { queryKey: ["public", "case-studies"], queryFn: () => listPublicCaseStudies() };
const evidenceSchema = z.array(z.object({ label: z.string(), url: z.string().url().refine((url) => url.startsWith("https://")), kind: z.enum(["image", "document"]) }));
export const Route = createFileRoute("/portfolio")({
  loader: ({ context }) => context.queryClient.ensureQueryData(options),
  head: () => ({ meta: [
    { title: "Verified Portfolio & Case Studies — Hadees Trading" },
    { name: "description", content: "Verified completed business services engagements from Hadees Trading, shared with client permission and confirmed scope and outcomes." },
    { property: "og:title", content: "Verified Portfolio — Hadees Trading" },
    { property: "og:description", content: "Approved delivery evidence from our South African business services engagements." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ], links: [{ rel: "canonical", href: "/portfolio" }] }),
  component: Portfolio,
});
function Portfolio() {
  const { data } = useSuspenseQuery(options);
  return <><Section as="h1" eyebrow="Hadees Trading" title="Verified work & case studies" intro="Completed engagements, with approved public identities, confirmed scope and outcomes. Confidential client documents remain private.">
    {data.length === 0 ? <p className="text-center text-muted-foreground">No case studies have been approved for public sharing yet.</p> : <div className="grid gap-10">{data.map((study) => {
      const evidence = evidenceSchema.safeParse(study.evidence);
      return <article key={study.id} className="border-b border-border pb-10">
        <h2 className="font-display text-2xl font-bold">{study.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{study.client_identity} · Completed {study.completion_date}</p>
        <dl className="mt-6 grid gap-6 md:grid-cols-3">{[["Challenge", study.challenge], ["Work performed", study.work_performed], ["Outcome", study.outcome]].map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{value}</dd></div>)}</dl>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">{(evidence.success ? evidence.data : []).map((item) => <div key={item.url}>{item.kind === "image" && <img src={item.url} alt={item.label} loading="lazy" className="mb-2 max-h-96 w-full rounded-md object-contain" />}<a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">{item.label}</a></div>)}</div>
      </article>;
    })}</div>}
  </Section><BigCTA title="Discuss your next project" subtitle="Confirm your requirements, delivery scope and eligibility with our team." primary={{ label: "Contact Hadees Trading", to: "/contact" }} /></>;
}