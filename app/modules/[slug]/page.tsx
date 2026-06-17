import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FileText, Pencil } from 'lucide-react';

import {
  ConceptStatusBadge,
  LessonStatusBadge,
  ModuleStatusBadge,
  ToneBadge,
} from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatusMenu } from '@/components/common/status-menu';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { moduleStatusOptions } from '@/components/forms/options';
import { getModuleBySlug } from '@/db/queries';
import { moduleTypeLabels } from '@/lib/labels';

import { deleteModuleAction, setModuleStatusAction } from '../actions';

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = await getModuleBySlug(slug);
  if (!module) notFound();

  const total = module.lessons.length;
  const completed = module.lessons.filter((l) => l.status === 'completed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        backHref="/modules"
        backLabel="Learning Paths"
        eyebrow={moduleTypeLabels[module.moduleType]}
        title={module.title}
        description={module.description}
        actions={
          <>
            <StatusMenu
              trigger={<ModuleStatusBadge status={module.status} />}
              options={moduleStatusOptions}
              onSelect={setModuleStatusAction.bind(null, module.id)}
            />
            <Button variant="outline" size="sm" render={<Link href={`/modules/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteModuleAction.bind(null, module.id)} entity="path" />
          </>
        }
      />

      <div className="panel space-y-2 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completed}/{total} lessons · ~{module.estimatedHours}h
          </span>
          <span className="font-medium">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {module.outcome && (
        <SectionCard title="Outcome">
          <Markdown content={module.outcome} />
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Lessons" icon={FileText}>
          {module.lessons.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {module.lessons.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 py-2 first:pt-0">
                  <Link href={`/lessons/${l.slug}`} className="text-sm hover:text-primary">
                    {l.title}
                  </Link>
                  <LessonStatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No lessons in this path yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Concepts">
          {module.concepts.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {module.concepts.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 py-2 first:pt-0">
                  <Link href={`/concepts/${c.slug}`} className="text-sm hover:text-primary">
                    {c.title}
                  </Link>
                  <ConceptStatusBadge status={c.status} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No concepts linked.</p>
          )}
        </SectionCard>
      </div>

      {module.notes && (
        <SectionCard title="Notes">
          <Markdown content={module.notes} />
        </SectionCard>
      )}
    </div>
  );
}
