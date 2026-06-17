import Link from 'next/link';
import { FolderGit2, Plus } from 'lucide-react';

import { ProjectStatusBadge, ToneBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { FilterBar } from '@/components/common/filter-bar';
import { PageHeader } from '@/components/common/page-header';
import { StatusMenu } from '@/components/common/status-menu';
import { Button } from '@/components/ui/button';
import { projectStatusOptions } from '@/components/forms/options';
import { listProjects } from '@/db/queries';
import { projectTypeLabels } from '@/lib/labels';
import type { ProjectStatus } from '@/types/enums';

import { setProjectStatusAction } from './actions';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const projects = await listProjects({ status: sp.status as ProjectStatus | undefined });

  return (
    <div>
      <PageHeader
        title="Project Applications"
        description="Anchor backend learning to your real products — risks, concepts, and next actions."
        actions={
          <Button render={<Link href="/projects/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New project
          </Button>
        }
      />

      <FilterBar
        searchPlaceholder="Search is per-name; filter by status"
        filters={[{ key: 'status', placeholder: 'All statuses', options: projectStatusOptions }]}
      />

      {projects.length === 0 ? (
        <EmptyState icon={FolderGit2} title="No projects yet" description="Add a project to connect backend work to it." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="panel flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <Link href={`/projects/${p.id}`} className="font-medium leading-tight hover:text-primary">
                  {p.projectName}
                </Link>
                <StatusMenu
                  trigger={<ProjectStatusBadge status={p.status} />}
                  options={projectStatusOptions}
                  onSelect={setProjectStatusAction.bind(null, p.id)}
                />
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
              {p.nextBackendAction && (
                <p className="line-clamp-1 text-xs text-muted-foreground">Next: {p.nextBackendAction}</p>
              )}
              <div className="mt-auto flex flex-wrap items-center gap-1.5">
                <ToneBadge tone="violet">{projectTypeLabels[p.projectType]}</ToneBadge>
                <span className="text-xs text-muted-foreground">
                  {p.conceptsUsed.length} used · {p.conceptsToLearn.length} to learn
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
