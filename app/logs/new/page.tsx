import { PageHeader } from '@/components/common/page-header';
import { LearningLogForm } from '@/components/forms/learning-log-form';

import { createLearningLogAction } from '../actions';

export const metadata = { title: 'New log entry' };

export default function NewLogPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/logs" backLabel="Learning Log" title="New log entry" />
      <LearningLogForm
        action={createLearningLogAction}
        submitLabel="Save entry"
        cancelHref="/logs"
      />
    </div>
  );
}
