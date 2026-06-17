import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, CircleHelp, Pencil, TriangleAlert } from 'lucide-react';

import { LessonStatusBadge } from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatusMenu } from '@/components/common/status-menu';
import { Markdown } from '@/components/markdown/markdown';
import { Button } from '@/components/ui/button';
import { lessonStatusOptions } from '@/components/forms/options';
import { getLessonBySlug } from '@/db/queries';

import { deleteLessonAction, setLessonStatusAction } from '../actions';

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        backHref="/lessons"
        backLabel="Lessons"
        eyebrow={lesson.module?.title}
        title={lesson.title}
        description={lesson.summary}
        actions={
          <>
            <StatusMenu
              trigger={<LessonStatusBadge status={lesson.status} />}
              options={lessonStatusOptions}
              onSelect={setLessonStatusAction.bind(null, lesson.id)}
            />
            <Button variant="outline" size="sm" render={<Link href={`/lessons/${slug}/edit`} />} className="gap-1.5">
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton action={deleteLessonAction.bind(null, lesson.id)} entity="lesson" />
          </>
        }
      />

      <SectionCard title="Lesson">
        <Markdown content={lesson.body} />
      </SectionCard>

      {lesson.keyTakeaways.length > 0 && (
        <SectionCard title="Key takeaways">
          <ul className="space-y-2">
            {lesson.keyTakeaways.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {lesson.questionsToAnswer.length > 0 && (
          <SectionCard title="Questions to answer" icon={CircleHelp}>
            <ul className="space-y-2">
              {lesson.questionsToAnswer.map((q, i) => (
                <li key={i} className="text-sm text-foreground/90">
                  {q}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
        {lesson.commonMisconceptions.length > 0 && (
          <SectionCard title="Common misconceptions" icon={TriangleAlert}>
            <ul className="space-y-2">
              {lesson.commonMisconceptions.map((m, i) => (
                <li key={i} className="text-sm text-foreground/90">
                  {m}
                </li>
              ))}
            </ul>
          </SectionCard>
        )}
      </div>

      {lesson.practicalChecklist.length > 0 && (
        <SectionCard title="Practical checklist">
          <ul className="space-y-2">
            {lesson.practicalChecklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <span className="size-4 shrink-0 rounded border border-border" />
                {c}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {lesson.ownWords && (
        <SectionCard title="In my own words">
          <Markdown content={lesson.ownWords} />
        </SectionCard>
      )}
      {lesson.projectApplication && (
        <SectionCard title="How this applies to my projects">
          <Markdown content={lesson.projectApplication} />
        </SectionCard>
      )}
    </div>
  );
}
