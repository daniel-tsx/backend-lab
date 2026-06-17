import Link from 'next/link';
import { Braces, Pencil, Plus } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { CodeBlock } from '@/components/common/code-block';
import { DeleteButton } from '@/components/common/delete-button';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import {
  snippetCategoryOptions,
  snippetLanguageOptions,
} from '@/components/forms/options';
import { listSnippets } from '@/db/queries';
import { snippetCategoryLabels, snippetLanguageLabels } from '@/lib/labels';
import type { SnippetCategory, SnippetLanguage } from '@/types/enums';

import { deleteSnippetAction } from './actions';

export const metadata = { title: 'Snippets' };

export default async function SnippetsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const snippets = await listSnippets({
    language: sp.language as SnippetLanguage | undefined,
    category: sp.category as SnippetCategory | undefined,
    search: sp.search,
  });

  return (
    <div>
      <PageHeader
        title="Snippets"
        description="Reusable backend code and pseudo-code, ready to copy."
        actions={
          <Button render={<Link href="/snippets/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New snippet
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search snippets…"
        filters={[
          { key: 'language', placeholder: 'All languages', options: snippetLanguageOptions },
          { key: 'category', placeholder: 'All categories', options: snippetCategoryOptions },
        ]}
      />

      {snippets.length === 0 ? (
        <EmptyState icon={Braces} title="No snippets match" description="Adjust filters or add a snippet." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {snippets.map((s) => (
            <div key={s.id} className="panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{s.title}</p>
                  {s.useCase && <p className="text-xs text-muted-foreground">{s.useCase}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-sm" render={<Link href={`/snippets/${s.id}/edit`} />} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton action={deleteSnippetAction.bind(null, s.id)} entity="snippet" iconOnly />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <ToneBadge tone="violet">{snippetLanguageLabels[s.language]}</ToneBadge>
                <ToneBadge tone="slate">{snippetCategoryLabels[s.category]}</ToneBadge>
              </div>
              <CodeBlock code={s.code} language={snippetLanguageLabels[s.language]} />
              {s.explanation && <p className="text-sm text-muted-foreground">{s.explanation}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
