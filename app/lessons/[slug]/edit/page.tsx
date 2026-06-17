import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { LessonForm } from '@/components/forms/lesson-form';
import { getLessonBySlug, listModules } from '@/db/queries';

import { updateLessonAction } from '../../actions';

export const metadata = { title: 'Edit lesson' };

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);
  if (!lesson) notFound();

  const modules = await listModules();
  const moduleOptions = modules.map((m) => ({ value: m.id, label: m.title }));

  async function action(values: Parameters<typeof updateLessonAction>[1]) {
    'use server';
    return updateLessonAction(lesson!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/lessons/${slug}`} backLabel="Back to lesson" title={`Edit: ${lesson.title}`} />
      <LessonForm
        lesson={lesson}
        moduleOptions={moduleOptions}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/lessons/${slug}`}
      />
    </div>
  );
}
