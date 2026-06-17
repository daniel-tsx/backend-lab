import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Boxes,
  FlaskConical,
  Network,
  Pencil,
  Workflow,
} from 'lucide-react';

import {
  CategoryBadge,
  DifficultyBadge,
  ImportanceBadge,
  LabStatusBadge,
  LessonStatusBadge,
  ToneBadge,
} from '@/components/common/badges';
import { CodeBlock } from '@/components/common/code-block';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { ConceptStatusButton } from '@/components/concepts/concept-status-button';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  diagramsForConcept,
  getConceptBySlug,
  getConceptsByIds,
  labsForConcept,
  lessonsForConcept,
  listProjects,
  reviewCardsForConcept,
  snippetsForConcept,
} from '@/db/queries';
import { conceptCategoryLabels, snippetLanguageLabels } from '@/lib/labels';
import { conceptPracticality } from '@/lib/scoring';
import { cn } from '@/lib/utils';

import { deleteConceptAction } from '../actions';

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) notFound();

  const [related, prerequisites, labs, snippets, diagrams, reviewCards, lessons, allProjects] =
    await Promise.all([
      getConceptsByIds(concept.relatedConceptIds),
      getConceptsByIds(concept.prerequisiteConceptIds),
      labsForConcept(concept.id),
      snippetsForConcept(concept.id),
      diagramsForConcept(concept.id),
      reviewCardsForConcept(concept.id),
      lessonsForConcept(concept.id),
      listProjects(),
    ]);

  const projects = allProjects.filter(
    (p) =>
      p.conceptsUsed.includes(concept.id) ||
      p.conceptsToLearn.includes(concept.id),
  );

  const signals = {
    hasLesson: lessons.length > 0,
    hasLab: labs.length > 0,
    hasSnippet: snippets.length > 0,
    hasDiagram: diagrams.length > 0,
    hasProjectApplication: projects.length > 0,
  };
  const practicality = conceptPracticality(signals);
  const practicalityItems: { label: string; on: boolean }[] = [
    { label: 'Lesson', on: signals.hasLesson },
    { label: 'Lab', on: signals.hasLab },
    { label: 'Snippet', on: signals.hasSnippet },
    { label: 'Diagram', on: signals.hasDiagram },
    { label: 'Project', on: signals.hasProjectApplication },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/concepts"
        backLabel="Concept Library"
        eyebrow={conceptCategoryLabels[concept.category]}
        title={concept.title}
        description={concept.summary}
        actions={
          <>
            <ConceptStatusButton id={concept.id} status={concept.status} />
            <Button variant="outline" size="sm" render={<Link href={`/concepts/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteConceptAction.bind(null, concept.id)} entity="concept" />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge category={concept.category} />
        <DifficultyBadge difficulty={concept.difficulty} />
        <ImportanceBadge importance={concept.importance} />
        {concept.tags.map((t) => (
          <ToneBadge key={t} tone="slate">
            #{t}
          </ToneBadge>
        ))}
      </div>

      {/* Practicality strip */}
      <div className="panel flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
        <div>
          <p className="text-xs text-muted-foreground">Practicality</p>
          <p className="text-lg font-semibold">
            {practicality.satisfied}/{practicality.total}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {practicalityItems.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-sm">
              <span
                className={cn(
                  'size-2.5 rounded-full',
                  item.on ? 'bg-emerald-400' : 'bg-muted-foreground/30',
                )}
              />
              <span className={item.on ? '' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="how">How it works</TabsTrigger>
          <TabsTrigger value="judgment">Judgment</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <SectionCard title="Mental model">
            <Markdown content={concept.mentalModel} />
          </SectionCard>
          <SectionCard title="Real-world examples">
            <Markdown content={concept.realWorldExamples} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="how" className="mt-4">
          <SectionCard title="How it works">
            <Markdown content={concept.howItWorks} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="judgment" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="When to use">
            <Markdown content={concept.whenToUse} />
          </SectionCard>
          <SectionCard title="When NOT to use">
            <Markdown content={concept.whenNotToUse} />
          </SectionCard>
          <SectionCard title="Trade-offs">
            <Markdown content={concept.tradeoffs} />
          </SectionCard>
          <SectionCard title="Common mistakes">
            <Markdown content={concept.commonMistakes} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="connections" className="mt-4 grid gap-4 lg:grid-cols-2">
          <SectionCard title="Prerequisites" icon={Network}>
            <ConceptLinks concepts={prerequisites} empty="No prerequisites listed." />
          </SectionCard>
          <SectionCard title="Related concepts" icon={Boxes}>
            <ConceptLinks concepts={related} empty="No related concepts listed." />
          </SectionCard>
        </TabsContent>

        <TabsContent value="practice" className="mt-4 space-y-4">
          <SectionCard title="Lessons" icon={Network}>
            {lessons.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {lessons.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 py-2 first:pt-0">
                    <Link href={`/lessons/${l.slug}`} className="text-sm hover:text-primary">
                      {l.title}
                    </Link>
                    <LessonStatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No lessons cover this yet.</p>
            )}
          </SectionCard>

          <SectionCard title="Labs" icon={FlaskConical}>
            {labs.length > 0 ? (
              <ul className="divide-y divide-border/60">
                {labs.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 py-2 first:pt-0">
                    <Link href={`/labs/${l.slug}`} className="text-sm hover:text-primary">
                      {l.title}
                    </Link>
                    <LabStatusBadge status={l.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No labs linked.</p>
            )}
          </SectionCard>

          <SectionCard title="Snippets">
            {snippets.length > 0 ? (
              <div className="space-y-4">
                {snippets.map((s) => (
                  <div key={s.id} className="space-y-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    {s.explanation && (
                      <p className="text-sm text-muted-foreground">{s.explanation}</p>
                    )}
                    <CodeBlock code={s.code} language={snippetLanguageLabels[s.language]} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No snippets linked.</p>
            )}
          </SectionCard>

          <SectionCard title="Diagrams" icon={Workflow}>
            {diagrams.length > 0 ? (
              <div className="space-y-4">
                {diagrams.map((d) => (
                  <div key={d.id} className="space-y-2">
                    <p className="text-sm font-medium">{d.title}</p>
                    <Mermaid code={d.mermaidCode} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No diagrams linked.</p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          <SectionCard title="Review cards">
            {reviewCards.length > 0 ? (
              <ul className="space-y-3">
                {reviewCards.map((r) => (
                  <li key={r.id} className="rounded-lg border border-border/60 p-3">
                    <p className="text-sm font-medium">{r.question}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{r.answer}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No review cards yet. Create one from the Review Center.
              </p>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <SectionCard title="Where this applies in my projects">
            {projects.length > 0 ? (
              <ul className="space-y-2">
                {projects.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.id}`} className="group flex items-center justify-between gap-2">
                      <span className="text-sm group-hover:text-primary">{p.projectName}</span>
                      <ToneBadge tone={p.conceptsUsed.includes(concept.id) ? 'emerald' : 'amber'}>
                        {p.conceptsUsed.includes(concept.id) ? 'In use' : 'To learn'}
                      </ToneBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Not linked to any project yet.
              </p>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ConceptLinks({
  concepts,
  empty,
}: {
  concepts: { id: string; slug: string; title: string }[];
  empty: string;
}) {
  if (concepts.length === 0)
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {concepts.map((c) => (
        <Link
          key={c.id}
          href={`/concepts/${c.slug}`}
          className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2.5 py-1 text-sm transition-colors hover:border-primary/50 hover:text-primary"
        >
          {c.title}
          <ArrowRight className="size-3" />
        </Link>
      ))}
    </div>
  );
}
