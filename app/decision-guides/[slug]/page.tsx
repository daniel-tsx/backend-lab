import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Lightbulb, Pencil } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import {
  getConceptsByIds,
  getDecisionGuideBySlug,
  listLabs,
} from '@/db/queries';
import { decisionCategoryLabels } from '@/lib/labels';

import { deleteDecisionGuideAction } from '../actions';

export default async function DecisionGuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = await getDecisionGuideBySlug(slug);
  if (!guide) notFound();

  const [concepts, allLabs] = await Promise.all([
    getConceptsByIds(guide.relatedConceptIds),
    listLabs(),
  ]);
  const labs = allLabs.filter((l) => guide.relatedLabIds.includes(l.id));

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/decision-guides"
        backLabel="Decision Guides"
        eyebrow={decisionCategoryLabels[guide.category]}
        title={guide.title}
        description={guide.question}
        actions={
          <>
            <Button variant="outline" size="sm" render={<Link href={`/decision-guides/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteDecisionGuideAction.bind(null, guide.id)} entity="guide" />
          </>
        }
      />

      {guide.shortAnswer && (
        <div className="panel flex gap-3 border-l-2 border-l-primary p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary/80">Short answer</p>
            <p className="mt-1 text-sm text-foreground/90">{guide.shortAnswer}</p>
          </div>
        </div>
      )}

      {guide.comparisonCriteria.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Compare on:</span>
          {guide.comparisonCriteria.map((c) => (
            <ToneBadge key={c} tone="slate">
              {c}
            </ToneBadge>
          ))}
        </div>
      )}

      {guide.options.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guide.options.map((o, i) => (
            <div key={i} className="panel space-y-3 p-4">
              <p className="font-semibold">{o.name}</p>
              {o.description && <p className="text-sm text-muted-foreground">{o.description}</p>}
              {o.whenToChoose && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">Choose when</p>
                  <p className="text-sm text-foreground/90">{o.whenToChoose}</p>
                </div>
              )}
              {o.tradeoffs && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/80">Trade-offs</p>
                  <p className="text-sm text-foreground/90">{o.tradeoffs}</p>
                </div>
              )}
              {o.failureModes && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-rose-400/80">Failure modes</p>
                  <p className="text-sm text-foreground/90">{o.failureModes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {guide.recommendationRules && (
        <SectionCard title="How to decide">
          <Markdown content={guide.recommendationRules} />
        </SectionCard>
      )}
      {guide.examples && (
        <SectionCard title="From my projects">
          <Markdown content={guide.examples} />
        </SectionCard>
      )}

      {(concepts.length > 0 || labs.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {concepts.length > 0 && (
            <SectionCard title="Related concepts">
              <div className="flex flex-wrap gap-2">
                {concepts.map((c) => (
                  <Link key={c.id} href={`/concepts/${c.slug}`} className="rounded-md border border-border/70 px-2.5 py-1 text-sm hover:border-primary/50 hover:text-primary">
                    {c.title}
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}
          {labs.length > 0 && (
            <SectionCard title="Related labs">
              <div className="flex flex-wrap gap-2">
                {labs.map((l) => (
                  <Link key={l.id} href={`/labs/${l.slug}`} className="rounded-md border border-border/70 px-2.5 py-1 text-sm hover:border-primary/50 hover:text-primary">
                    {l.title}
                  </Link>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      )}
    </div>
  );
}
