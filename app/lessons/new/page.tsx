import { PageHeader } from '@/components/common/page-header';
import { LessonForm } from '@/components/forms/lesson-form';
import { listModules } from '@/db/queries';

import { createLessonAction } from '../actions';

export const metadata = { title: 'New lesson' };

export default async function NewLessonPage({
  searchParams,
}: {
  searchParams: Promise<{ moduleId?: string }>;
}) {
  const { moduleId } = await searchParams;
  const modules = await listModules();
  const moduleOptions = modules.map((m) => ({ value: m.id, label: m.title }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/lessons" backLabel="Lessons" title="New lesson" />
      <LessonForm
        moduleId={moduleId}
        moduleOptions={moduleOptions}
        action={createLessonAction}
        submitLabel="Create lesson"
        cancelHref="/lessons"
      />
    </div>
  );
}
