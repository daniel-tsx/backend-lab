import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';

import { LessonStatusBadge } from '@/components/common/badges';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { Button } from '@/components/ui/button';
import { listLessons } from '@/db/queries';

export const metadata = { title: 'Lessons' };

export default async function LessonsPage() {
  const lessons = await listLessons();

  const groups = new Map<string, { title: string; items: typeof lessons }>();
  for (const lesson of lessons) {
    const key = lesson.module?.id ?? 'none';
    const title = lesson.module?.title ?? 'Unassigned';
    if (!groups.has(key)) groups.set(key, { title, items: [] });
    groups.get(key)!.items.push(lesson);
  }

  return (
    <div>
      <PageHeader
        title="Lessons"
        description="Focused written lessons with takeaways, questions, and your own notes."
        actions={
          <Button render={<Link href="/lessons/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New lesson
          </Button>
        }
      />

      {lessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lessons yet"
          description="Write your first lesson, or attach one to a learning path."
          action={
            <Button render={<Link href="/lessons/new" />} variant="outline">
              New lesson
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {[...groups.values()].map((group) => (
            <SectionCard key={group.title} title={group.title}>
              <ul className="divide-y divide-border/60">
                {group.items.map((lesson) => (
                  <li key={lesson.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Link href={`/lessons/${lesson.slug}`} className="group min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{lesson.title}</p>
                      {lesson.summary && (
                        <p className="truncate text-xs text-muted-foreground">{lesson.summary}</p>
                      )}
                    </Link>
                    <LessonStatusBadge status={lesson.status} />
                  </li>
                ))}
              </ul>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
