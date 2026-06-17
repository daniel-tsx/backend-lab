import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { CodeBlock } from '@/components/common/code-block';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { getDiagramById } from '@/db/queries';
import { diagramTypeLabels } from '@/lib/labels';

import { deleteDiagramAction } from '../actions';

export default async function DiagramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const d = await getDiagramById(id);
  if (!d) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/diagrams"
        backLabel="Diagrams"
        eyebrow={diagramTypeLabels[d.diagramType]}
        title={d.title}
        description={d.description}
        actions={
          <>
            <Button variant="outline" size="sm" render={<Link href={`/diagrams/${id}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteDiagramAction.bind(null, d.id)} entity="diagram" />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <ToneBadge tone="blue">{diagramTypeLabels[d.diagramType]}</ToneBadge>
        {d.concept && (
          <Link href={`/concepts/${d.concept.slug}`} className="text-xs text-primary hover:underline">
            {d.concept.title}
          </Link>
        )}
        {d.caseStudy && (
          <Link href={`/case-studies/${d.caseStudy.slug}`} className="text-xs text-primary hover:underline">
            {d.caseStudy.title}
          </Link>
        )}
        {d.project && (
          <Link href={`/projects/${d.project.id}`} className="text-xs text-primary hover:underline">
            {d.project.projectName}
          </Link>
        )}
      </div>

      <SectionCard title="Diagram">
        <Mermaid code={d.mermaidCode} />
      </SectionCard>

      <SectionCard title="Mermaid source">
        <CodeBlock code={d.mermaidCode} language="mermaid" />
      </SectionCard>

      {d.notes && (
        <SectionCard title="Notes">
          <Markdown content={d.notes} />
        </SectionCard>
      )}
    </div>
  );
}
