import Link from 'next/link';
import { Plus, Workflow } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Button } from '@/components/ui/button';
import { diagramTypeOptions } from '@/components/forms/options';
import { listDiagrams } from '@/db/queries';
import { diagramTemplates } from '@/lib/diagram-templates';
import { diagramTypeLabels } from '@/lib/labels';
import type { DiagramType } from '@/types/enums';

export const metadata = { title: 'Diagrams' };

export default async function DiagramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const diagrams = await listDiagrams({
    diagramType: sp.diagramType as DiagramType | undefined,
    search: sp.search,
  });

  return (
    <div>
      <PageHeader
        title="Architecture Diagrams"
        description="A gallery of editable Mermaid diagrams for concepts, cases, and projects."
        actions={
          <Button render={<Link href="/diagrams/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New diagram
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {diagramTemplates.slice(0, 8).map((t) => (
          <Button
            key={t.key}
            variant="outline"
            size="sm"
            render={<Link href={`/diagrams/new?template=${t.key}`} />}
          >
            {t.label}
          </Button>
        ))}
      </div>

      <FilterBar
        searchPlaceholder="Search diagrams…"
        filters={[{ key: 'diagramType', placeholder: 'All types', options: diagramTypeOptions }]}
      />

      {diagrams.length === 0 ? (
        <EmptyState
          icon={Workflow}
          title="No diagrams yet"
          description="Start from a template above, or create one from scratch."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {diagrams.map((d) => (
            <Link
              key={d.id}
              href={`/diagrams/${d.id}`}
              className="panel group block overflow-hidden p-4 transition-colors hover:border-border"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium group-hover:text-primary">{d.title}</p>
                  {d.description && (
                    <p className="line-clamp-1 text-xs text-muted-foreground">{d.description}</p>
                  )}
                </div>
                <ToneBadge tone="blue">{diagramTypeLabels[d.diagramType]}</ToneBadge>
              </div>
              <div className="max-h-56 overflow-hidden rounded-lg border border-border/60 bg-card/50 p-3">
                <Mermaid code={d.mermaidCode} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
