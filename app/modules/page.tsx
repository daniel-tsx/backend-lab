import Link from 'next/link';
import { Plus, Route } from 'lucide-react';

import { ModuleStatusBadge, ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { StatusMenu } from '@/components/common/status-menu';
import { Button } from '@/components/ui/button';
import { moduleStatusOptions } from '@/components/forms/options';
import { listModulesWithLessons } from '@/db/queries';
import { moduleStatusLabels, moduleTypeLabels } from '@/lib/labels';

import { setModuleStatusAction } from './actions';

export const metadata = { title: 'Learning Paths' };

export default async function ModulesPage() {
  const modules = await listModulesWithLessons();

  return (
    <div>
      <PageHeader
        title="Learning Paths"
        description="Structured modules that group concepts and lessons into a path."
        actions={
          <Button render={<Link href="/modules/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New path
          </Button>
        }
      />

      {modules.length === 0 ? (
        <EmptyState icon={Route} title="No learning paths yet" description="Create your first path." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((m) => {
            const total = m.lessons.length;
            const completed = m.lessons.filter((l) => l.status === 'completed').length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            return (
              <div key={m.id} className="panel flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/modules/${m.slug}`} className="font-semibold leading-tight hover:text-primary">
                    {m.title}
                  </Link>
                  <StatusMenu
                    trigger={<ModuleStatusBadge status={m.status} />}
                    options={moduleStatusOptions}
                    onSelect={setModuleStatusAction.bind(null, m.id)}
                  />
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{m.description}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <ToneBadge tone="violet">{moduleTypeLabels[m.moduleType]}</ToneBadge>
                  <ToneBadge tone="slate">{m.estimatedHours}h</ToneBadge>
                </div>
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {completed}/{total} lessons
                    </span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
