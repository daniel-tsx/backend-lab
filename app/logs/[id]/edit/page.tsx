import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { LearningLogForm } from '@/components/forms/learning-log-form';
import { getAllConcepts, getLearningLogById, listLabs } from '@/db/queries';

import { updateLearningLogAction } from '../../actions';

export const metadata = { title: 'Edit log entry' };

export default async function EditLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [log, concepts, labs] = await Promise.all([
    getLearningLogById(id),
    getAllConcepts(),
    listLabs(),
  ]);
  if (!log) notFound();
  const conceptOptions = concepts.map((c) => ({ value: c.id, label: c.title }));
  const labOptions = labs.map((l) => ({ value: l.id, label: l.title }));

  async function action(values: Parameters<typeof updateLearningLogAction>[1]) {
    'use server';
    return updateLearningLogAction(id, values);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/logs" backLabel="Learning Log" title={`Edit: ${log.title}`} />
      <LearningLogForm
        log={log}
        conceptOptions={conceptOptions}
        labOptions={labOptions}
        action={action}
        submitLabel="Save changes"
        cancelHref="/logs"
      />
    </div>
  );
}
