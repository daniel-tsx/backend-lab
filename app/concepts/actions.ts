'use server';

import { revalidatePath } from 'next/cache';

import {
  bulkUpdateConceptStatus,
  createConcept,
  deleteConcept,
  updateConcept,
  updateConceptStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { conceptSchema } from '@/lib/validations';
import type { ConceptStatus } from '@/types/enums';

export async function createConceptAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = conceptSchema.parse(values);
    const row = await createConcept(parsed);
    revalidatePath('/concepts');
    revalidatePath('/concept-map');
    return { ok: true, redirectTo: `/concepts/${row.slug}`, message: 'Concept created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateConceptAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = conceptSchema.parse(values);
    const row = await updateConcept(id, parsed);
    revalidatePath('/concepts');
    revalidatePath(`/concepts/${row.slug}`);
    revalidatePath('/concept-map');
    return { ok: true, redirectTo: `/concepts/${row.slug}`, message: 'Concept updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setConceptStatusAction(
  id: string,
  status: ConceptStatus,
): Promise<ActionResult> {
  try {
    await updateConceptStatus(id, status);
    revalidatePath('/concepts');
    revalidatePath('/concept-map');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function bulkSetConceptStatusAction(
  ids: string[],
  status: ConceptStatus,
): Promise<ActionResult> {
  try {
    await bulkUpdateConceptStatus(ids, status);
    revalidatePath('/concepts');
    revalidatePath('/concept-map');
    return { ok: true, message: `Updated ${ids.length} concepts` };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteConceptAction(id: string): Promise<ActionResult> {
  try {
    await deleteConcept(id);
    revalidatePath('/concepts');
    revalidatePath('/concept-map');
    return { ok: true, redirectTo: '/concepts', message: 'Concept deleted' };
  } catch (error) {
    return actionError(error);
  }
}
