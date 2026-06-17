import Link from 'next/link';
import { Boxes, Plus } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { ConceptGrid } from '@/components/concepts/concept-grid';
import { Button } from '@/components/ui/button';
import {
  conceptCategoryOptions,
  conceptStatusOptions,
  difficultyOptions,
  importanceOptions,
} from '@/components/forms/options';
import { listConcepts, type ConceptSort } from '@/db/queries';
import type {
  ConceptCategory,
  ConceptStatus,
  Difficulty,
  Importance,
} from '@/types/enums';

const sortOptions = [
  { value: 'importance', label: 'Importance' },
  { value: 'difficulty', label: 'Difficulty' },
  { value: 'review', label: 'Needs review' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'title', label: 'Title (A–Z)' },
];

export default async function ConceptsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const concepts = await listConcepts({
    category: sp.category as ConceptCategory | undefined,
    difficulty: sp.difficulty as Difficulty | undefined,
    status: sp.status as ConceptStatus | undefined,
    importance: sp.importance as Importance | undefined,
    tag: sp.tag,
    search: sp.search,
    sort: sp.sort as ConceptSort | undefined,
  });

  return (
    <div>
      <PageHeader
        title="Concept Library"
        description="Every backend concept — what it is, when to use it, and how it connects."
        actions={
          <Button render={<Link href="/concepts/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New concept
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search concepts, mistakes, examples…"
        filters={[
          { key: 'category', placeholder: 'All categories', options: conceptCategoryOptions },
          { key: 'difficulty', placeholder: 'All difficulties', options: difficultyOptions },
          { key: 'status', placeholder: 'All statuses', options: conceptStatusOptions },
          { key: 'importance', placeholder: 'All importance', options: importanceOptions },
        ]}
        sort={{ options: sortOptions, placeholder: 'Sort by importance' }}
      />

      {concepts.length > 0 ? (
        <ConceptGrid concepts={concepts} />
      ) : (
        <EmptyState
          icon={Boxes}
          title="No concepts match"
          description="Try clearing filters, or add a new concept to your library."
          action={
            <Button render={<Link href="/concepts/new" />} variant="outline">
              New concept
            </Button>
          }
        />
      )}
    </div>
  );
}
