import { PageHeader } from '@/components/common/page-header';
import { SnippetForm } from '@/components/forms/snippet-form';
import { getAllConcepts, listLabs } from '@/db/queries';

import { createSnippetAction } from '../actions';

export const metadata = { title: 'New snippet' };

export default async function NewSnippetPage() {
  const [concepts, labs] = await Promise.all([getAllConcepts(), listLabs()]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/snippets" backLabel="Snippets" title="New snippet" />
      <SnippetForm
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        labOptions={labs.map((l) => ({ value: l.id, label: l.title }))}
        action={createSnippetAction}
        submitLabel="Create snippet"
        cancelHref="/snippets"
      />
    </div>
  );
}
