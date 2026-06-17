import Link from 'next/link';
import { FlaskConical, Plus } from 'lucide-react';

import { DifficultyBadge, LabStatusBadge, LabTypeBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { StatusMenu } from '@/components/common/status-menu';
import { Button } from '@/components/ui/button';
import {
  difficultyOptions,
  labStatusOptions,
  labTypeOptions,
} from '@/components/forms/options';
import { listLabs } from '@/db/queries';
import type { Difficulty, LabStatus, LabType } from '@/types/enums';

import { setLabStatusAction } from './actions';

export const metadata = { title: 'Labs' };

export default async function LabsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const labs = await listLabs({
    difficulty: sp.difficulty as Difficulty | undefined,
    labType: sp.labType as LabType | undefined,
    status: sp.status as LabStatus | undefined,
    search: sp.search,
  });

  return (
    <div>
      <PageHeader
        title="Labs"
        description="Hands-on backend exercises — implement, debug, design, compare."
        actions={
          <Button render={<Link href="/labs/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New lab
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search labs…"
        filters={[
          { key: 'labType', placeholder: 'All types', options: labTypeOptions },
          { key: 'difficulty', placeholder: 'All difficulties', options: difficultyOptions },
          { key: 'status', placeholder: 'All statuses', options: labStatusOptions },
        ]}
      />

      {labs.length === 0 ? (
        <EmptyState
          icon={FlaskConical}
          title="No labs match"
          description="Adjust filters or create a new lab."
          action={
            <Button render={<Link href="/labs/new" />} variant="outline">
              New lab
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {labs.map((lab) => (
            <div key={lab.id} className="panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/labs/${lab.slug}`} className="font-medium leading-tight hover:text-primary">
                  {lab.title}
                </Link>
                <StatusMenu
                  trigger={<LabStatusBadge status={lab.status} />}
                  options={labStatusOptions}
                  onSelect={setLabStatusAction.bind(null, lab.id)}
                />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{lab.description}</p>
              <div className="mt-auto flex flex-wrap items-center gap-1.5">
                <LabTypeBadge labType={lab.labType} />
                <DifficultyBadge difficulty={lab.difficulty} />
                {lab.confidenceBefore != null && lab.confidenceAfter != null && (
                  <span className="text-xs text-muted-foreground">
                    confidence {lab.confidenceBefore}→{lab.confidenceAfter}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
