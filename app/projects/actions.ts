'use server';

import { revalidatePath } from 'next/cache';

import {
  createProject,
  deleteProject,
  updateProject,
  updateProjectStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { projectSchema } from '@/lib/validations';
import type { ProjectStatus } from '@/types/enums';

export async function createProjectAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = projectSchema.parse(values);
    const row = await createProject(parsed);
    revalidatePath('/projects');
    return { ok: true, redirectTo: `/projects/${row.id}`, message: 'Project created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateProjectAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = projectSchema.parse(values);
    await updateProject(id, parsed);
    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    return { ok: true, redirectTo: `/projects/${id}`, message: 'Project updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setProjectStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await updateProjectStatus(id, status as ProjectStatus);
    revalidatePath('/projects');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteProjectAction(id: string): Promise<ActionResult> {
  try {
    await deleteProject(id);
    revalidatePath('/projects');
    return { ok: true, redirectTo: '/projects', message: 'Project deleted' };
  } catch (error) {
    return actionError(error);
  }
}
