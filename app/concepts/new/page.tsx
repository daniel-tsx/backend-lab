import { PageHeader } from '@/components/common/page-header';
import { ConceptForm } from '@/components/forms/concept-form';
import { getAllConcepts } from '@/db/queries';

import { createConceptAction } from '../actions';

export const metadata = { title: 'New concept' };

export default async function NewConceptPage() {
  const all = await getAllConcepts();
  const conceptOptions = all.map((c) => ({ value: c.id, label: c.title }));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        backHref="/concepts"
        backLabel="Concepts"
        title="New concept"
        description="Capture a backend concept and how it connects to what you already know."
      />
      <ConceptForm
        conceptOptions={conceptOptions}
        action={createConceptAction}
        submitLabel="Create concept"
        cancelHref="/concepts"
      />
    </div>
  );
}
