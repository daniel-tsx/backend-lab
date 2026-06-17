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
  const mod = await getModuleBySlug(slug);
  if (!mod) notFound();

  const all = await getAllConcepts();
  const conceptOptions = all.map((c) => ({ value: c.id, label: c.title }));

  async function action(values: Parameters<typeof updateModuleAction>[1]) {
    'use server';
    return updateModuleAction(mod!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/modules/${slug}`} backLabel="Back to path" title={`Edit: ${mod.title}`} />
      <ModuleForm
        module={mod}
        conceptIds={mod.concepts.map((c) => c.id)}
        conceptOptions={conceptOptions}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/modules/${slug}`}
      />
    </div>
  );
}
