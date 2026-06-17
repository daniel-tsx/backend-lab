'use server';

import { revalidatePath } from 'next/cache';

import {
  createDecisionGuide,
  deleteDecisionGuide,
  updateDecisionGuide,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { decisionGuideSchema } from '@/lib/validations';

export async function createDecisionGuideAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = decisionGuideSchema.parse(values);
    const row = await createDecisionGuide(parsed);
    revalidatePath('/decision-guides');
    return { ok: true, redirectTo: `/decision-guides/${row.slug}`, message: 'Guide created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateDecisionGuideAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = decisionGuideSchema.parse(values);
    const row = await updateDecisionGuide(id, parsed);
    revalidatePath('/decision-guides');
    revalidatePath(`/decision-guides/${row.slug}`);
    return { ok: true, redirectTo: `/decision-guides/${row.slug}`, message: 'Guide updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteDecisionGuideAction(id: string): Promise<ActionResult> {
  try {
    await deleteDecisionGuide(id);
    revalidatePath('/decision-guides');
    return { ok: true, redirectTo: '/decision-guides', message: 'Guide deleted' };
  } catch (error) {
    return actionError(error);
  }
}
