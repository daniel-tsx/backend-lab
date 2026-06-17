'use server';

import { revalidatePath } from 'next/cache';

import { createSnippet, deleteSnippet, updateSnippet } from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { snippetSchema } from '@/lib/validations';

export async function createSnippetAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = snippetSchema.parse(values);
    await createSnippet(parsed);
    revalidatePath('/snippets');
    return { ok: true, redirectTo: '/snippets', message: 'Snippet created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateSnippetAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = snippetSchema.parse(values);
    await updateSnippet(id, parsed);
    revalidatePath('/snippets');
    return { ok: true, redirectTo: '/snippets', message: 'Snippet updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteSnippetAction(id: string): Promise<ActionResult> {
  try {
    await deleteSnippet(id);
    revalidatePath('/snippets');
    return { ok: true, message: 'Snippet deleted' };
  } catch (error) {
    return actionError(error);
  }
}
