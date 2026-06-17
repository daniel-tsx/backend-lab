import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { LearningLogForm } from '@/components/forms/learning-log-form';
import { getLearningLogById } from '@/db/queries';

import { updateLearningLogAction } from '../../actions';

export const metadata = { title: 'Edit log entry' };

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = await getLearningLogById(id);
  if (!log) notFound();

  async function action(values: Parameters<typeof updateLearningLogAction>[1]) {
    'use server';
    return updateLearningLogAction(id, values);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/logs" backLabel="Learning Log" title={`Edit: ${log.title}`} />
      <LearningLogForm log={log} action={action} submitLabel="Save changes" cancelHref="/logs" />
    </div>
  );
}
