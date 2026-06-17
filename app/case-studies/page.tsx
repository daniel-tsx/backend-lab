import Link from 'next/link';
import { Layers, Plus } from 'lucide-react';

import { CaseStudyStatusBadge, DifficultyBadge, ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { StatusMenu } from '@/components/common/status-menu';
import { Button } from '@/components/ui/button';
import {
  caseStudyDomainOptions,
  caseStudyStatusOptions,
  difficultyOptions,
} from '@/components/forms/options';
import { listCaseStudies } from '@/db/queries';
import { caseStudyDomainLabels } from '@/lib/labels';
import type { CaseStudyDomain, CaseStudyStatus, Difficulty } from '@/types/enums';

import { setCaseStudyStatusAction } from './actions';

export const metadata = { title: 'System Design' };

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const cases = await listCaseStudies({
    domain: sp.domain as CaseStudyDomain | undefined,
    difficulty: sp.difficulty as Difficulty | undefined,
    status: sp.status as CaseStudyStatus | undefined,
    search: sp.search,
  });

  return (
    <div>
      <PageHeader
        title="System Design Casebook"
        description="Practice full system designs end-to-end, then score and review them."
        actions={
          <Button render={<Link href="/case-studies/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New case
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search case studies…"
        filters={[
          { key: 'domain', placeholder: 'All domains', options: caseStudyDomainOptions },
          { key: 'difficulty', placeholder: 'All difficulties', options: difficultyOptions },
          { key: 'status', placeholder: 'All statuses', options: caseStudyStatusOptions },
        ]}
      />

      {cases.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No case studies match"
          description="Adjust filters or design a new system."
          action={
            <Button render={<Link href="/case-studies/new" />} variant="outline">
              New case
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cases.map((c) => (
            <div key={c.id} className="panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/case-studies/${c.slug}`} className="font-medium leading-tight hover:text-primary">
                  {c.title}
                </Link>
                <StatusMenu
                  trigger={<CaseStudyStatusBadge status={c.status} />}
                  options={caseStudyStatusOptions}
                  onSelect={setCaseStudyStatusAction.bind(null, c.id)}
                />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{c.problemStatement}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5">
                <ToneBadge tone="teal">{caseStudyDomainLabels[c.domain]}</ToneBadge>
                <DifficultyBadge difficulty={c.difficulty} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
