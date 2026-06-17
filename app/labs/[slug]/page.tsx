import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Lightbulb, Pencil } from 'lucide-react';

import {
  DifficultyBadge,
  LabStatusBadge,
  LabTypeBadge,
} from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatusMenu } from '@/components/common/status-menu';
import { CompleteLabDialog } from '@/components/labs/complete-lab-dialog';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { labStatusOptions } from '@/components/forms/options';
import { getLabBySlug } from '@/db/queries';
import { formatMinutes } from '@/lib/format';

import { deleteLabAction, setLabStatusAction } from '../actions';

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        backHref="/labs"
        backLabel="Labs"
        title={lab.title}
        description={lab.description}
        actions={
          <>
            <StatusMenu
              trigger={<LabStatusBadge status={lab.status} />}
              options={labStatusOptions}
              onSelect={setLabStatusAction.bind(null, lab.id)}
            />
            {lab.status !== 'completed' && (
              <CompleteLabDialog lab={lab} conceptTitle={lab.concept?.title} />
            )}
            <Button variant="outline" size="sm" render={<Link href={`/labs/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteLabAction.bind(null, lab.id)} entity="lab" />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <LabTypeBadge labType={lab.labType} />
        <DifficultyBadge difficulty={lab.difficulty} />
        {lab.timeSpentMinutes > 0 && (
          <span className="text-xs text-muted-foreground">{formatMinutes(lab.timeSpentMinutes)} spent</span>
        )}
        {lab.concept && (
          <Link href={`/concepts/${lab.concept.slug}`} className="text-xs text-primary hover:underline">
            {lab.concept.title}
          </Link>
        )}
      </div>

      {lab.scenario && (
        <SectionCard title="Scenario">
          <Markdown content={lab.scenario} />
        </SectionCard>
      )}

      <SectionCard title="Requirements">
        <Markdown content={lab.requirements} />
      </SectionCard>

      {lab.successCriteria.length > 0 && (
        <SectionCard title="Success criteria">
          <ul className="space-y-2">
            {lab.successCriteria.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="size-4 shrink-0 rounded border border-border" />
                {c}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {lab.starterCode && (
        <SectionCard title="Starter code">
          <Markdown content={lab.starterCode} />
        </SectionCard>
      )}

      {lab.hints.length > 0 && (
        <SectionCard title="Hints" icon={Lightbulb}>
          <details className="group">
            <summary className="cursor-pointer text-sm text-primary marker:content-none">
              Reveal {lab.hints.length} hint{lab.hints.length > 1 ? 's' : ''}
            </summary>
            <ul className="mt-3 space-y-2">
              {lab.hints.map((h, i) => (
                <li key={i} className="flex gap-2 text-sm text-foreground/90">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {h}
                </li>
              ))}
            </ul>
          </details>
        </SectionCard>
      )}

      {lab.expectedSolution && (
        <SectionCard title="Expected solution">
          <details className="group">
            <summary className="cursor-pointer text-sm text-primary marker:content-none">
              Reveal solution — try it yourself first
            </summary>
            <div className="mt-3">
              <Markdown content={lab.expectedSolution} />
            </div>
          </details>
        </SectionCard>
      )}

      {/* Lab notebook */}
      {(lab.notebook || lab.thingsGotWrong || lab.whatLearned || lab.confidenceAfter != null) && (
        <SectionCard title="My lab notebook">
          <div className="space-y-4">
            {(lab.confidenceBefore != null || lab.confidenceAfter != null) && (
              <p className="text-sm text-muted-foreground">
                Confidence {lab.confidenceBefore ?? '—'} → {lab.confidenceAfter ?? '—'} (of 10)
              </p>
            )}
            {lab.notebook && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">My solution</p>
                <Markdown content={lab.notebook} />
              </div>
            )}
            {lab.thingsGotWrong && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Things I got wrong</p>
                <Markdown content={lab.thingsGotWrong} />
              </div>
            )}
            {lab.whatLearned && (
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-emerald-400" /> What I learned
                </p>
                <Markdown content={lab.whatLearned} />
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
