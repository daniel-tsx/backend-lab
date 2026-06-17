import { notFound } from 'next/navigation';

import { PageHeader } from '@/components/common/page-header';
import { SnippetForm } from '@/components/forms/snippet-form';
import { getAllConcepts, getSnippetById, listLabs } from '@/db/queries';

import { updateSnippetAction } from '../../actions';

export const metadata = { title: 'Edit snippet' };

export default async function EditSnippetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [snippet, concepts, labs] = await Promise.all([
    getSnippetById(id),
    getAllConcepts(),
    listLabs(),
  ]);
  if (!snippet) notFound();

  async function action(values: Parameters<typeof updateSnippetAction>[1]) {
    'use server';
    return updateSnippetAction(id, values);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader backHref="/snippets" backLabel="Snippets" title={`Edit: ${snippet.title}`} />
      <SnippetForm
        snippet={snippet}
        conceptOptions={concepts.map((c) => ({ value: c.id, label: c.title }))}
        labOptions={labs.map((l) => ({ value: l.id, label: l.title }))}
        action={action}
        submitLabel="Save changes"
        cancelHref="/snippets"
      />
    </div>
  );
}
