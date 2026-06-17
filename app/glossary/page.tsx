import Link from 'next/link';
import { BookA, Pencil, Plus } from 'lucide-react';

import { CategoryBadge } from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { conceptCategoryOptions } from '@/components/forms/options';
import { getAllConcepts, listGlossaryTerms } from '@/db/queries';
import type { ConceptCategory } from '@/types/enums';

import { deleteGlossaryTermAction } from './actions';

export const metadata = { title: 'Glossary' };

export default async function GlossaryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const [terms, concepts] = await Promise.all([
    listGlossaryTerms({
      category: sp.category as ConceptCategory | undefined,
      search: sp.search,
    }),
    getAllConcepts(),
  ]);
  const conceptById = new Map(concepts.map((c) => [c.id, c]));

  return (
    <div>
      <PageHeader
        title="Backend Glossary"
        description="Precise definitions for the terms that get conflated."
        actions={
          <Button render={<Link href="/glossary/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New term
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search terms and definitions…"
        filters={[{ key: 'category', placeholder: 'All categories', options: conceptCategoryOptions }]}
      />

      {terms.length === 0 ? (
        <EmptyState icon={BookA} title="No terms match" description="Adjust filters or add a term." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {terms.map((t) => (
            <div key={t.id} id={t.slug} className="panel scroll-mt-20 space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{t.term}</h3>
                  <div className="mt-1">
                    <CategoryBadge category={t.category} />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" render={<Link href={`/glossary/${t.id}/edit`} />} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton action={deleteGlossaryTermAction.bind(null, t.id)} entity="term" iconOnly />
                </div>
              </div>
              <p className="text-sm text-foreground/90">{t.definition}</p>
              {t.example && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">Example:</span> {t.example}
                </p>
              )}
              {t.commonConfusion && (
                <p className="text-sm text-amber-200/80">
                  <span className="font-medium">Don&apos;t confuse:</span> {t.commonConfusion}
                </p>
              )}
              {t.relatedConceptIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {t.relatedConceptIds.map((id) => {
                    const c = conceptById.get(id);
                    if (!c) return null;
                    return (
                      <Link key={id} href={`/concepts/${c.slug}`} className="text-xs text-primary hover:underline">
                        {c.title}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
