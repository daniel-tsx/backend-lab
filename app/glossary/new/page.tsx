import { PageHeader } from '@/components/common/page-header';
import { GlossaryForm } from '@/components/forms/glossary-form';
import { getAllConcepts } from '@/db/queries';

import { createGlossaryTermAction } from '../actions';

export const metadata = { title: 'New glossary term' };

export default async function NewGlossaryTermPage() {
  const concepts = await getAllConcepts();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader backHref="/glossary" backLabel="Glossary" title="New glossary term" />
      <GlossaryForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        action={createGlossaryTermAction}
        submitLabel="Create term"
        cancelHref="/glossary"
      />
    </div>
  );
}
