import { PageHeader } from '@/components/common/page-header';
import { LabForm } from '@/components/forms/lab-form';
import { getAllConcepts, listModules } from '@/db/queries';

import { createLabAction } from '../actions';

export const metadata = { title: 'New lab' };

export default async function NewLabPage() {
  const [concepts, modules] = await Promise.all([getAllConcepts(), listModules()]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/labs" backLabel="Labs" title="New lab" />
      <LabForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        moduleOptions={modules.map((m) => ({ value: m.id, label: m.title }))}
        action={createLabAction}
        submitLabel="Create lab"
        cancelHref="/labs"
      />
    </div>
  );
}
