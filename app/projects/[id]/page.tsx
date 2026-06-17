import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Circle, FlaskConical, ListChecks, Pencil, Scale, Workflow } from 'lucide-react';

import {
  ConceptStatusBadge,
  LabStatusBadge,
  ProjectStatusBadge,
  ToneBadge,
} from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatusMenu } from '@/components/common/status-menu';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { projectStatusOptions } from '@/components/forms/options';
import {
  getAllConcepts,
  getConceptsByIds,
  getProjectById,
  labsForConcepts,
  listDecisionGuides,
} from '@/db/queries';
import { projectTypeLabels } from '@/lib/labels';
import {
  conceptStatusWeight,
  projectBackendReadiness,
  projectReadinessSignals,
} from '@/lib/scoring';
import type { LabStatus } from '@/types/enums';
import { cn } from '@/lib/utils';

import { deleteProjectAction, setProjectStatusAction } from '../actions';

const labStatusRank: Record<LabStatus, number> = {
  'in-progress': 0,
  'not-started': 1,
  skipped: 2,
  completed: 3,
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  const projectConceptIds = [
    ...new Set([...project.conceptsUsed, ...project.conceptsToLearn]),
  ];
  const [used, toLearn, allConcepts, allGuides, conceptLabs] =
    await Promise.all([
      getConceptsByIds(project.conceptsUsed),
      getConceptsByIds(project.conceptsToLearn),
      getAllConcepts(),
      listDecisionGuides(),
      labsForConcepts(projectConceptIds),
    ]);
  const studied = new Set(
    allConcepts.filter((c) => conceptStatusWeight[c.status] >= 0.8).map((c) => c.id),
  );
  const guides = allGuides.filter((g) => project.relatedDecisionGuideIds.includes(g.id));
  const signals = projectReadinessSignals(project, project.diagrams, studied);
  const readiness = projectBackendReadiness(signals);
  const readinessItems = [
    { label: 'Architecture diagram', on: signals.hasDiagram },
    { label: 'Identified risks', on: signals.hasIdentifiedRisks },
    { label: 'Studied concepts', on: signals.hasStudiedConcepts },
    { label: 'Decision guides attached', on: signals.hasDecisionGuides },
    { label: 'Next backend action', on: signals.hasNextAction },
  ];

  // --- Learning backlog (computed) -----------------------------------------
  const toLearnSorted = [...toLearn].sort(
    (a, b) => conceptStatusWeight[a.status] - conceptStatusWeight[b.status],
  );
  const suggestedLabs = conceptLabs
    .filter((l) => l.status !== 'completed')
    .sort((a, b) => labStatusRank[a.status] - labStatusRank[b.status])
    .slice(0, 5);
  const attachedGuideIds = new Set(project.relatedDecisionGuideIds);
  const suggestedGuides = allGuides
    .filter(
      (g) =>
        !attachedGuideIds.has(g.id) &&
        g.relatedConceptIds.some((cid) => projectConceptIds.includes(cid)),
    )
    .slice(0, 4);

  const weakestToLearn = toLearnSorted.find(
    (c) => conceptStatusWeight[c.status] < 0.8,
  );
  const nextActions: { label: string; href?: string }[] = [];
  if (project.nextBackendAction)
    nextActions.push({ label: project.nextBackendAction });
  if (!signals.hasIdentifiedRisks)
    nextActions.push({
      label: 'Document this project’s backend risks',
      href: `/projects/${id}/edit`,
    });
  if (weakestToLearn)
    nextActions.push({
      label: `Study “${weakestToLearn.title}”`,
      href: `/concepts/${weakestToLearn.slug}`,
    });
  if (suggestedLabs[0])
    nextActions.push({
      label: `Do the “${suggestedLabs[0].title}” lab`,
      href: `/labs/${suggestedLabs[0].slug}`,
    });
  if (!signals.hasDiagram)
    nextActions.push({
      label: 'Sketch an architecture diagram',
      href: '/diagrams/new',
    });
  if (!signals.hasDecisionGuides && suggestedGuides[0])
    nextActions.push({
      label: `Read “${suggestedGuides[0].title}”`,
      href: `/decision-guides/${suggestedGuides[0].slug}`,
    });
  if (!signals.hasNextAction)
    nextActions.push({
      label: 'Set a next backend action',
      href: `/projects/${id}/edit`,
    });
  const top3Actions = nextActions.slice(0, 3);

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/projects"
        backLabel="Projects"
        eyebrow={projectTypeLabels[project.projectType]}
        title={project.projectName}
        description={project.description}
        actions={
          <>
            <StatusMenu
              trigger={<ProjectStatusBadge status={project.status} />}
              options={projectStatusOptions}
              onSelect={setProjectStatusAction.bind(null, project.id)}
            />
            <Button variant="outline" size="sm" render={<Link href={`/projects/${id}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteProjectAction.bind(null, project.id)} entity="project" />
          </>
        }
      />

      {top3Actions.length > 0 && (
        <SectionCard
          title="Recommended next steps"
          description="The highest-leverage backend work for this project"
          icon={ListChecks}
        >
          <ol className="space-y-2.5">
            {top3Actions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                {a.href ? (
                  <Link href={a.href} className="group inline-flex items-center gap-1 hover:text-primary">
                    {a.label}
                    <ArrowRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ) : (
                  <span>{a.label}</span>
                )}
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard title={`Backend readiness · ${readiness.satisfied}/${readiness.total}`}>
          <ul className="space-y-1.5">
            {readinessItems.map((it) => (
              <li key={it.label} className="flex items-center gap-2 text-sm">
                {it.on ? (
                  <CheckCircle2 className="size-4 text-emerald-400" />
                ) : (
                  <Circle className="size-4 text-muted-foreground/40" />
                )}
                <span className={cn(!it.on && 'text-muted-foreground')}>{it.label}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Next backend action" className="lg:col-span-2">
          <p className="text-sm text-foreground/90">{project.nextBackendAction || 'Not set yet.'}</p>
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Current architecture">
          <Markdown content={project.currentArchitecture} />
        </SectionCard>
        <SectionCard title="Backend risks">
          <Markdown content={project.backendRisks} />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Concepts in use">
          <ConceptChips items={used} empty="None linked." tone="emerald" />
        </SectionCard>
        <SectionCard title="Concepts to learn">
          {toLearnSorted.length > 0 ? (
            <ul className="space-y-2">
              {toLearnSorted.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/concepts/${c.slug}`}
                    className="group flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-sm group-hover:text-primary">{c.title}</span>
                    <ConceptStatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">None linked.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Suggested labs" icon={FlaskConical} description="Practice tied to this project’s concepts">
          {suggestedLabs.length > 0 ? (
            <ul className="space-y-2">
              {suggestedLabs.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/labs/${l.slug}`}
                    className="group flex items-center justify-between gap-2"
                  >
                    <span className="truncate text-sm group-hover:text-primary">{l.title}</span>
                    <LabStatusBadge status={l.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No labs linked to these concepts yet.
            </p>
          )}
        </SectionCard>
        <SectionCard title="Decision guides to consider" icon={Scale} description="Relevant to this project’s concepts">
          {suggestedGuides.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {suggestedGuides.map((g) => (
                <Link
                  key={g.id}
                  href={`/decision-guides/${g.slug}`}
                  className="rounded-md border border-border/70 px-2.5 py-1 text-sm hover:border-primary/50 hover:text-primary"
                >
                  {g.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nothing else to suggest right now.
            </p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {project.architectureNotes && (
          <SectionCard title="Architecture notes">
            <Markdown content={project.architectureNotes} />
          </SectionCard>
        )}
        {project.improvementIdeas && (
          <SectionCard title="Improvement ideas">
            <Markdown content={project.improvementIdeas} />
          </SectionCard>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Related decision guides">
          {guides.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {guides.map((g) => (
                <Link key={g.id} href={`/decision-guides/${g.slug}`} className="rounded-md border border-border/70 px-2.5 py-1 text-sm hover:border-primary/50 hover:text-primary">
                  {g.title}
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">None attached.</p>
          )}
        </SectionCard>
        <SectionCard title="Related case study">
          {project.caseStudy ? (
            <Link href={`/case-studies/${project.caseStudy.slug}`} className="text-sm text-primary hover:underline">
              {project.caseStudy.title}
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">None linked.</p>
          )}
        </SectionCard>
      </div>

      {project.diagrams.length > 0 && (
        <SectionCard title="Diagrams" icon={Workflow}>
          <div className="space-y-4">
            {project.diagrams.map((d) => (
              <div key={d.id} className="space-y-2">
                <p className="text-sm font-medium">{d.title}</p>
                <Mermaid code={d.mermaidCode} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

function ConceptChips({
  items,
  empty,
  tone,
}: {
  items: { id: string; slug: string; title: string }[];
  empty: string;
  tone: 'emerald' | 'amber';
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((c) => (
        <Link key={c.id} href={`/concepts/${c.slug}`}>
          <ToneBadge tone={tone}>{c.title}</ToneBadge>
        </Link>
      ))}
    </div>
  );
}
