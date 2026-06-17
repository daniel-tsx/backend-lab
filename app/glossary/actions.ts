'use server';

import { revalidatePath } from 'next/cache';

import {
  createGlossaryTerm,
  deleteGlossaryTerm,
  updateGlossaryTerm,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { glossaryTermSchema } from '@/lib/validations';

export async function createGlossaryTermAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = glossaryTermSchema.parse(values);
    await createGlossaryTerm(parsed);
    revalidatePath('/glossary');
    return { ok: true, redirectTo: '/glossary', message: 'Term created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateGlossaryTermAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = glossaryTermSchema.parse(values);
    await updateGlossaryTerm(id, parsed);
    revalidatePath('/glossary');
    return { ok: true, redirectTo: '/glossary', message: 'Term updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteGlossaryTermAction(id: string): Promise<ActionResult> {
  try {
    await deleteGlossaryTerm(id);
    revalidatePath('/glossary');
    return { ok: true, message: 'Term deleted' };
  } catch (error) {
    return actionError(error);
  }
}
