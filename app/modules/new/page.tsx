import { PageHeader } from '@/components/common/page-header';
import { ModuleForm } from '@/components/forms/module-form';
import { getAllConcepts } from '@/db/queries';

import { createModuleAction } from '../actions';

export const metadata = { title: 'New learning path' };

export default async function NewModulePage() {
  const all = await getAllConcepts();
  const conceptOptions = all.map((c) => ({ value: c.id, label: c.title }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/modules" backLabel="Learning Paths" title="New learning path" />
      <ModuleForm
        conceptOptions={conceptOptions}
        action={createModuleAction}
        submitLabel="Create path"
        cancelHref="/modules"
      />
    </div>
  );
}
