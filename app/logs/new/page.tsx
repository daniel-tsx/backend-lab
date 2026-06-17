import { PageHeader } from '@/components/common/page-header';
import { LearningLogForm } from '@/components/forms/learning-log-form';
import { getAllConcepts, listLabs } from '@/db/queries';

import { createLearningLogAction } from '../actions';

export const metadata = { title: 'New log entry' };

export default async function NewLogPage() {
  const [concepts, labs] = await Promise.all([getAllConcepts(), listLabs()]);
  const conceptOptions = concepts.map((c) => ({ value: c.id, label: c.title }));
  const labOptions = labs.map((l) => ({ value: l.id, label: l.title }));

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/logs" backLabel="Learning Log" title="New log entry" />
      <LearningLogForm
        conceptOptions={conceptOptions}
        labOptions={labOptions}
        action={createLearningLogAction}
        submitLabel="Save entry"
        cancelHref="/logs"
      />
    </div>
  );
}
