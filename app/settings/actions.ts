'use server';

import { revalidatePath } from 'next/cache';

import { applyImport, type BackupFile } from '@/lib/export/json';
import { actionError, type ActionResult } from '@/lib/action-result';
import { seed } from '@/seed';

export async function importDataAction(jsonText: string): Promise<ActionResult> {
  try {
    const parsed = JSON.parse(jsonText) as BackupFile;
    await applyImport(parsed);
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Backup imported' };
  } catch (error) {
    return actionError(error);
  }
}

export async function resetSeedAction(): Promise<ActionResult> {
  try {
    await seed();
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Seed data restored' };
  } catch (error) {
    return actionError(error);
  }
}
