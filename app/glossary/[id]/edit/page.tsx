import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { GlossaryForm } from '@/components/forms/glossary-form';
import { getAllConcepts, getGlossaryTermById } from '@/db/queries';

import { updateGlossaryTermAction } from '../../actions';

export const metadata = { title: 'Edit glossary term' };

export default async function EditGlossaryTermPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [term, concepts] = await Promise.all([
    getGlossaryTermById(id),
    getAllConcepts(),
  ]);
  if (!term) notFound();

  async function action(values: Parameters<typeof updateGlossaryTermAction>[1]) {
    'use server';
    return updateGlossaryTermAction(id, values);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/glossary" backLabel="Glossary" title={`Edit: ${term.term}`} />
      <GlossaryForm
        term={term}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref="/glossary"
      />
    </div>
  );
}
