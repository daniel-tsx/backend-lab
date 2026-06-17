import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { ModuleForm } from '@/components/forms/module-form';
import { getAllConcepts, getModuleBySlug } from '@/db/queries';

import { updateModuleAction } from '../../actions';

export const metadata = { title: 'Edit learning path' };

export default async function EditModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const module = await getModuleBySlug(slug);
  if (!module) notFound();

  const all = await getAllConcepts();
  const conceptOptions = all.map((c) => ({ value: c.id, label: c.title }));

  async function action(values: Parameters<typeof updateModuleAction>[1]) {
    'use server';
    return updateModuleAction(module!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/modules/${slug}`} backLabel="Back to path" title={`Edit: ${module.title}`} />
      <ModuleForm
        module={module}
        conceptIds={module.concepts.map((c) => c.id)}
        conceptOptions={conceptOptions}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/modules/${slug}`}
      />
    </div>
  );
}
