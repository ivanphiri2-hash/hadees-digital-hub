import { Section } from "./ui";
import { reviewedServiceSeo, type ReviewedServicePath } from "@/lib/reviewed-service-seo";

export function ServiceFaq({ path }: { path: ReviewedServicePath }) {
  return <Section eyebrow="Questions & answers" title="Before we begin">
    <div className="mx-auto max-w-3xl divide-y divide-border">
      {reviewedServiceSeo[path].faqs.map((faq) => <details key={faq.question} className="py-4">
        <summary className="cursor-pointer text-sm font-semibold">{faq.question}</summary>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
      </details>)}
    </div>
  </Section>;
}