'use server';

import { revalidatePath } from 'next/cache';

import {
  completeLab,
  createLab,
  createReviewCardsFromDrafts,
  deleteLab,
  getLabById,
  updateConceptStatus,
  updateLab,
  updateLabStatus,
} from '@/db/queries';
import { actionError, type ActionResult } from '@/lib/action-result';
import { labCompletionSchema, labSchema } from '@/lib/validations';
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

export async function completeLabAction(
  id: string,
  values: unknown,
): Promise<ActionResult> {
  try {
    const parsed = labCompletionSchema.parse(values);
    const lab = await getLabById(id);
    if (!lab) return { ok: false, error: 'Lab not found' };

    const row = await completeLab(id, {
      timeSpentMinutes: parsed.timeSpentMinutes,
      confidenceBefore: parsed.confidenceBefore ?? lab.confidenceBefore ?? null,
      confidenceAfter: parsed.confidenceAfter ?? null,
      thingsGotWrong: parsed.thingsGotWrong,
      whatLearned: parsed.whatLearned,
    });

    const created = await createReviewCardsFromDrafts(parsed.reviewCards, {
      conceptId: lab.relatedConceptId,
    });

    if (parsed.conceptStatus && lab.relatedConceptId) {
      await updateConceptStatus(lab.relatedConceptId, parsed.conceptStatus);
      revalidatePath('/concepts');
    }

    revalidatePath('/labs');
    revalidatePath(`/labs/${row.slug}`);
    revalidatePath('/reviews');
    revalidatePath('/');
    return {
      ok: true,
      message: created > 0 ? `Lab completed · ${created} cards added` : 'Lab completed',
    };
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
