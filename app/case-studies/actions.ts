'use server';

import { revalidatePath } from 'next/cache';

import {
  createCaseStudy,
  deleteCaseStudy,
  updateCaseStudy,
  updateCaseStudyStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { caseStudySchema } from '@/lib/validations';
import type { CaseStudyStatus } from '@/types/enums';

export async function createCaseStudyAction(values: unknown): Promise<ActionResult> {
  try {
    const parsed = caseStudySchema.parse(values);
    const row = await createCaseStudy(parsed);
    revalidatePath('/case-studies');
    return { ok: true, redirectTo: `/case-studies/${row.slug}`, message: 'Case study created' };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateCaseStudyAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = caseStudySchema.parse(values);
    const row = await updateCaseStudy(id, parsed);
    revalidatePath('/case-studies');
    revalidatePath(`/case-studies/${row.slug}`);
    return { ok: true, redirectTo: `/case-studies/${row.slug}`, message: 'Case study updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function setCaseStudyStatusAction(
  id: string,
  status: string,
): Promise<ActionResult> {
  try {
    await updateCaseStudyStatus(id, status as CaseStudyStatus);
    revalidatePath('/case-studies');
    return { ok: true, message: 'Status updated' };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteCaseStudyAction(id: string): Promise<ActionResult> {
  try {
    await deleteCaseStudy(id);
    revalidatePath('/case-studies');
    return { ok: true, redirectTo: '/case-studies', message: 'Case study deleted' };
  } catch (error) {
    return actionError(error);
  }
}
