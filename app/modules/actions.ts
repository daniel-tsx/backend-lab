'use server';

import { revalidatePath } from 'next/cache';

import {
  createModule,
  deleteModule,
  updateModule,
  updateModuleStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { moduleSchema } from '@/lib/validations';
import type { ModuleStatus } from '@/types/enums';

export async function createModuleAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = moduleSchema.parse(values);
    const row = await createModule(parsed);
    revalidatePath('/modules');
    return { ok: true, redirectTo: `/modules/${row.slug}`, message: 'Path created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateModuleAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = moduleSchema.parse(values);
    const row = await updateModule(id, parsed);
    revalidatePath('/modules');
    revalidatePath(`/modules/${row.slug}`);
    return { ok: true, redirectTo: `/modules/${row.slug}`, message: 'Path updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setModuleStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await updateModuleStatus(id, status as ModuleStatus);
    revalidatePath('/modules');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteModuleAction(id: string): Promise<ActionResult> {
  try {
    await deleteModule(id);
    revalidatePath('/modules');
    return { ok: true, redirectTo: '/modules', message: 'Path deleted' };
  } catch (error) {
    return actionError(error);
  }
}
