'use server';

import { revalidatePath } from 'next/cache';

import { createLab, deleteLab, updateLab, updateLabStatus } from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { labSchema } from '@/lib/validations';
import type { LabStatus } from '@/types/enums';

export async function createLabAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = labSchema.parse(values);
    const row = await createLab(parsed);
    revalidatePath('/labs');
    return { ok: true, redirectTo: `/labs/${row.slug}`, message: 'Lab created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateLabAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = labSchema.parse(values);
    const row = await updateLab(id, parsed);
    revalidatePath('/labs');
    revalidatePath(`/labs/${row.slug}`);
    return { ok: true, redirectTo: `/labs/${row.slug}`, message: 'Lab updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setLabStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await updateLabStatus(id, status as LabStatus);
    revalidatePath('/labs');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteLabAction(id: string): Promise<ActionResult> {
  try {
    await deleteLab(id);
    revalidatePath('/labs');
    return { ok: true, redirectTo: '/labs', message: 'Lab deleted' };
  } catch (error) {
    return actionError(error);
  }
}
