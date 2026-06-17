'use server';

import { revalidatePath } from 'next/cache';

import { createDiagram, deleteDiagram, updateDiagram } from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { diagramSchema } from '@/lib/validations';

export async function createDiagramAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = diagramSchema.parse(values);
    const row = await createDiagram(parsed);
    revalidatePath('/diagrams');
    return { ok: true, redirectTo: `/diagrams/${row.id}`, message: 'Diagram created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateDiagramAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = diagramSchema.parse(values);
    await updateDiagram(id, parsed);
    revalidatePath('/diagrams');
    revalidatePath(`/diagrams/${id}`);
    return { ok: true, redirectTo: `/diagrams/${id}`, message: 'Diagram updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteDiagramAction(id: string): Promise<ActionResult> {
  try {
    await deleteDiagram(id);
    revalidatePath('/diagrams');
    return { ok: true, redirectTo: '/diagrams', message: 'Diagram deleted' };
  } catch (error) {
    return actionError(error);
  }
}
