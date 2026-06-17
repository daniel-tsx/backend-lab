import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, Pencil, Workflow } from 'lucide-react';

import { CaseStudyStatusBadge, DifficultyBadge, ToneBadge } from '@/components/common/badges';
import { RadarScore } from '@/components/charts/chart-primitives';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatusMenu } from '@/components/common/status-menu';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { caseStudyStatusOptions } from '@/components/forms/options';
import { getCaseStudyBySlug } from '@/db/queries';
import { caseStudyDomainLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';

import { deleteCaseStudyAction, setCaseStudyStatusAction } from '../actions';

const scoreLabels: Record<string, string> = {
  requirementsClarity: 'Requirements',
  dataModelQuality: 'Data model',
  apiQuality: 'API',
  scalability: 'Scalability',
  reliability: 'Reliability',
  security: 'Security',
  simplicity: 'Simplicity',
  costAwareness: 'Cost',
};

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCaseStudyBySlug(slug);
  if (!c) notFound();

  const completeness = [
    { label: 'Problem statement', done: c.problemStatement.trim().length > 0 },
    { label: 'Functional requirements', done: c.functionalRequirements.length > 0 },
    { label: 'Non-functional requirements', done: c.nonFunctionalRequirements.length > 0 },
    { label: 'Traffic assumptions', done: c.trafficAssumptions.trim().length > 0 },
    { label: 'Data model', done: c.dataModel.trim().length > 0 },
    { label: 'API design', done: c.apiDesign.trim().length > 0 },
    { label: 'Architecture', done: c.architecture.trim().length > 0 },
    { label: 'Scaling', done: c.scalingStrategy.trim().length > 0 },
    { label: 'Reliability', done: c.reliabilityStrategy.trim().length > 0 },
    { label: 'Security', done: c.securityStrategy.trim().length > 0 },
    { label: 'Observability', done: c.observabilityStrategy.trim().length > 0 },
    { label: 'Trade-offs', done: c.tradeoffs.trim().length > 0 },
  ];
  const doneCount = completeness.filter((s) => s.done).length;

  const radarData = c.reviewScores
    ? Object.entries(c.reviewScores).map(([k, v]) => ({
        dimension: scoreLabels[k] ?? k,
        value: v,
      }))
    : [];
  const avgScore =
    radarData.length > 0
      ? (radarData.reduce((s, d) => s + d.value, 0) / radarData.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/case-studies"
        backLabel="Casebook"
        eyebrow={caseStudyDomainLabels[c.domain]}
        title={c.title}
        actions={
          <>
            <StatusMenu
              trigger={<CaseStudyStatusBadge status={c.status} />}
              options={caseStudyStatusOptions}
              onSelect={setCaseStudyStatusAction.bind(null, c.id)}
            />
            <Button variant="outline" size="sm" render={<Link href={`/case-studies/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteCaseStudyAction.bind(null, c.id)} entity="case study" />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={c.difficulty} />
        <ToneBadge tone="teal">{caseStudyDomainLabels[c.domain]}</ToneBadge>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Problem" className="lg:col-span-2">
          <Markdown content={c.problemStatement} />
        </SectionCard>
        <SectionCard title={`Completeness · ${doneCount}/${completeness.length}`}>
          <ul className="space-y-1.5">
            {completeness.map((s) => (
              <li key={s.label} className="flex items-center gap-2 text-sm">
                {s.done ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
                <span className={cn(!s.done && 'text-muted-foreground')}>{s.label}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title="Requirements" className="lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <RequirementList title="Functional" items={c.functionalRequirements} />
            <RequirementList title="Non-functional" items={c.nonFunctionalRequirements} />
            <RequirementList title="Constraints" items={c.constraints} />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Back-of-the-envelope
              </p>
              <p className="text-sm text-foreground/90">{c.trafficAssumptions || '—'}</p>
            </div>
          </div>
        </SectionCard>
        {radarData.length > 0 && (
          <SectionCard title={`Review score${avgScore ? ` · ${avgScore}/5` : ''}`}>
            <RadarScore data={radarData} />
          </SectionCard>
        )}
      </div>

      {c.dataModel && (
        <SectionCard title="Data model">
          <Markdown content={c.dataModel} />
        </SectionCard>
      )}
      {c.apiDesign && (
        <SectionCard title="API design">
          <Markdown content={c.apiDesign} />
        </SectionCard>
      )}
      {c.architecture && (
        <SectionCard title="Architecture & core flows">
          <Markdown content={c.architecture} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {c.scalingStrategy && (
          <SectionCard title="Scaling">
            <Markdown content={c.scalingStrategy} />
          </SectionCard>
        )}
        {c.reliabilityStrategy && (
          <SectionCard title="Reliability">
            <Markdown content={c.reliabilityStrategy} />
          </SectionCard>
        )}
        {c.securityStrategy && (
          <SectionCard title="Security">
            <Markdown content={c.securityStrategy} />
          </SectionCard>
        )}
        {c.observabilityStrategy && (
          <SectionCard title="Observability">
            <Markdown content={c.observabilityStrategy} />
          </SectionCard>
        )}
        {c.costConsiderations && (
          <SectionCard title="Cost">
            <Markdown content={c.costConsiderations} />
          </SectionCard>
        )}
        {c.tradeoffs && (
          <SectionCard title="Trade-offs">
            <Markdown content={c.tradeoffs} />
          </SectionCard>
        )}
      </div>

      {c.diagrams.length > 0 && (
        <SectionCard title="Diagrams" icon={Workflow}>
          <div className="space-y-4">
            {c.diagrams.map((d) => (
              <div key={d.id} className="space-y-2">
                <p className="text-sm font-medium">{d.title}</p>
                <Mermaid code={d.mermaidCode} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {c.finalNotes && (
        <SectionCard title="Final review">
          <Markdown content={c.finalNotes} />
        </SectionCard>
      )}
    </div>
  );
}

function RequirementList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {items.length > 0 ? (
        <ul className="ml-4 list-disc space-y-1 text-sm text-foreground/90 marker:text-muted-foreground/50">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">—</p>
      )}
    </div>
  );
}
