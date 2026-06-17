'use server';

import { revalidatePath } from 'next/cache';

import {
  createLearningLog,
  deleteLearningLog,
  updateLearningLog,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { learningLogSchema } from '@/lib/validations';

export async function createLearningLogAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = learningLogSchema.parse(values);
    await createLearningLog(parsed);
    revalidatePath('/logs');
    revalidatePath('/');
    return { ok: true, redirectTo: '/logs', message: 'Log saved' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateLearningLogAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = learningLogSchema.parse(values);
    await updateLearningLog(id, parsed);
    revalidatePath('/logs');
    return { ok: true, redirectTo: '/logs', message: 'Log updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteLearningLogAction(id: string): Promise<ActionResult> {
  try {
    await deleteLearningLog(id);
    revalidatePath('/logs');
    return { ok: true, message: 'Log deleted' };
  } catch (error) {
    return actionError(error);
  }
}
