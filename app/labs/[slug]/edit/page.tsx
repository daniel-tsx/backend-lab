import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { LabForm } from '@/components/forms/lab-form';
import { getAllConcepts, getLabBySlug, listModules } from '@/db/queries';

import { updateLabAction } from '../../actions';

export const metadata = { title: 'Edit lab' };

export default async function EditLabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();

  const [concepts, modules] = await Promise.all([getAllConcepts(), listModules()]);

  async function action(values: Parameters<typeof updateLabAction>[1]) {
    'use server';
    return updateLabAction(lab!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref={`/labs/${slug}`} backLabel="Back to lab" title={`Edit: ${lab.title}`} />
      <LabForm
        lab={lab}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        moduleOptions={modules.map((m) => ({ value: m.id, label: m.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/labs/${slug}`}
      />
    </div>
  );
}
