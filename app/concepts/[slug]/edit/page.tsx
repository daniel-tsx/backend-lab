import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { ConceptForm } from '@/components/forms/concept-form';
import { getAllConcepts, getConceptBySlug } from '@/db/queries';

import { updateConceptAction } from '../../actions';

export const metadata = { title: 'Edit concept' };

export default async function EditConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const concept = await getConceptBySlug(slug);
  if (!concept) notFound();

  const all = await getAllConcepts();
  const conceptOptions = all
    .filter((c) => c.id !== concept.id)
    .map((c) => ({ value: c.id, label: c.title }));

  async function action(values: Parameters<typeof updateConceptAction>[1]) {
    'use server';
    return updateConceptAction(concept!.id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        backHref={`/concepts/${slug}`}
        backLabel="Back to concept"
        title={`Edit: ${concept.title}`}
      />
      <ConceptForm
        concept={concept}
        conceptOptions={conceptOptions}
        action={action}
        submitLabel="Save changes"
        cancelHref={`/concepts/${slug}`}
      />
    </div>
  );
}
