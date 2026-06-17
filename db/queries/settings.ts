import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { appSettings } from '@/db/schema';

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const row = await db.query.appSettings.findFirst({
    where: eq(appSettings.key, key),
  });
  return row?.value as T | undefined;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value: value as object })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: value as object },
    });
}
