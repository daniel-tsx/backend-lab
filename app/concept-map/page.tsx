import Link from 'next/link';
import { Network } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { Mermaid } from '@/components/diagrams/mermaid';
import { Button } from '@/components/ui/button';
import {
  conceptCategoryOptions,
  conceptStatusOptions,
  difficultyOptions,
  importanceOptions,
} from '@/components/forms/options';
import { listConcepts } from '@/db/queries';
import { buildConceptGraph, conceptStatusLegend } from '@/lib/concept-map';
import {
  conceptCategoryLabels,
  conceptStatusLabels,
  conceptStatusTones,
  toneDotClasses,
} from '@/lib/labels';
import { cn } from '@/lib/utils';
import { conceptCategories } from '@/types/enums';
import type {
  ConceptCategory,
  ConceptStatus,
  Difficulty,
  Importance,
} from '@/types/enums';

export const metadata = { title: 'Concept Map' };

export default async function ConceptMapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const includeRelated = sp.related === '1';
  const concepts = await listConcepts({
    category: sp.category as ConceptCategory | undefined,
    difficulty: sp.difficulty as Difficulty | undefined,
    status: sp.status as ConceptStatus | undefined,
    importance: sp.importance as Importance | undefined,
    sort: 'title',
  });
  const graph = buildConceptGraph(concepts, { includeRelated });

  const toggleParams = new URLSearchParams(
    Object.entries(sp).filter(([, v]) => v) as [string, string][],
  );
  if (includeRelated) toggleParams.delete('related');
  else toggleParams.set('related', '1');

  const byCategory = conceptCategories
    .map((category) => ({
      category,
      items: concepts.filter((c) => c.category === category),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <PageHeader
        title="Concept Map"
        description="How backend concepts connect — solid arrows are prerequisites. Click a node to open it."
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/concept-map?${toggleParams.toString()}`} />}
          >
            {includeRelated ? 'Hide related links' : 'Show related links'}
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search is on the library — filter the map here"
        filters={[
          { key: 'category', placeholder: 'All categories', options: conceptCategoryOptions },
          { key: 'difficulty', placeholder: 'All difficulties', options: difficultyOptions },
          { key: 'status', placeholder: 'All statuses', options: conceptStatusOptions },
          { key: 'importance', placeholder: 'All importance', options: importanceOptions },
        ]}
      />

      {concepts.length === 0 ? (
        <EmptyState
          icon={Network}
          title="Nothing to map"
          description="No concepts match these filters."
        />
      ) : (
        <div className="space-y-6">
          <SectionCard
            title="Relationship graph"
            actions={
              <ul className="flex flex-wrap gap-x-3 gap-y-1">
                {conceptStatusLegend.map((l) => (
                  <li key={l.status} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                    {conceptStatusLabels[l.status]}
                  </li>
                ))}
              </ul>
            }
          >
            <div className="overflow-x-auto">
              <Mermaid code={graph} />
            </div>
          </SectionCard>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {byCategory.map((group) => (
              <SectionCard key={group.category} title={conceptCategoryLabels[group.category]}>
                <ul className="space-y-1.5">
                  {group.items.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/concepts/${c.slug}`}
                        className="group flex items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent/50"
                      >
                        <span
                          className={cn(
                            'size-2 shrink-0 rounded-full',
                            toneDotClasses[conceptStatusTones[c.status]],
                          )}
                          title={conceptStatusLabels[c.status]}
                        />
                        <span className="truncate group-hover:text-primary">{c.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
