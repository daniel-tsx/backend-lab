import Link from 'next/link';
import { Plus, Scale } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { decisionCategoryOptions } from '@/components/forms/options';
import { listDecisionGuides } from '@/db/queries';
import { decisionCategoryLabels } from '@/lib/labels';
import type { DecisionCategory } from '@/types/enums';

export const metadata = { title: 'Decision Guides' };

export default async function DecisionGuidesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const guides = await listDecisionGuides({
    category: sp.category as DecisionCategory | undefined,
    search: sp.search,
  });

  return (
    <div>
      <PageHeader
        title="Decision Guides"
        description="Practical answers to the backend choices that keep coming up."
        actions={
          <Button render={<Link href="/decision-guides/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New guide
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search decision guides…"
        filters={[{ key: 'category', placeholder: 'All categories', options: decisionCategoryOptions }]}
      />

      {guides.length === 0 ? (
        <EmptyState icon={Scale} title="No guides match" description="Adjust filters or add a guide." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {guides.map((g) => (
            <Link key={g.id} href={`/decision-guides/${g.slug}`} className="panel group flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium group-hover:text-primary">{g.title}</p>
                <ToneBadge tone="violet">{decisionCategoryLabels[g.category]}</ToneBadge>
              </div>
              <p className="line-clamp-3 text-sm text-muted-foreground">
                {g.shortAnswer || g.question}
              </p>
              <span className="text-xs text-muted-foreground">{g.options.length} options</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
