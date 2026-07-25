import type { ReactNode } from "react";
import { Section } from "@/components/site/ui";
import { COMPANY } from "@/lib/company";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <Section
      eyebrow="Legal"
      title={title}
      intro={`Last updated: ${updated}. ${COMPANY.legalName}, ${COMPANY.city}, ${COMPANY.country}.`}
    >
      <div className="prose prose-invert mx-auto max-w-3xl [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-semibold [&_p]:mt-3 [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-muted-foreground [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:text-sm [&_li]:text-muted-foreground [&_a]:text-[var(--color-royal-soft)]">
        {children}
      </div>
    </Section>
  );
}
