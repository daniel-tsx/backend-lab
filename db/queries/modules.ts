import { asc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { lessons, moduleConcepts, modules } from '@/db/schema';
import { slugify } from '@/lib/slug';
import type { ModuleInput } from '@/lib/validations';
import type { Concept, Lesson, Module } from '@/types';

import { uniqueSlug } from './utils';

export interface ModuleWithRelations extends Module {
  lessons: Lesson[];
  concepts: Concept[];
}

export async function listModules(): Promise<Module[]> {
  return db.select().from(modules).orderBy(asc(modules.order));
}

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export async function listModulesWithLessons(): Promise<ModuleWithLessons[]> {
  const rows = await db.query.modules.findMany({
    orderBy: asc(modules.order),
    with: { lessons: { orderBy: asc(lessons.order) } },
  });
  return rows as ModuleWithLessons[];
}

export async function getModuleBySlug(
  slug: string,
): Promise<ModuleWithRelations | undefined> {
  const row = await db.query.modules.findFirst({
    where: eq(modules.slug, slug),
    with: {
      lessons: { orderBy: asc(lessons.order) },
      moduleConcepts: {
        orderBy: asc(moduleConcepts.order),
        with: { concept: true },
      },
    },
  });
  if (!row) return undefined;
  const { moduleConcepts: links, ...rest } = row;
  return {
    ...rest,
    concepts: links.map((l) => l.concept),
  } as ModuleWithRelations;
}

export async function getModuleById(id: string): Promise<Module | undefined> {
  return db.query.modules.findFirst({ where: eq(modules.id, id) });
}

async function setModuleConcepts(moduleId: string, conceptIds: string[]) {
  await db.delete(moduleConcepts).where(eq(moduleConcepts.moduleId, moduleId));
  if (conceptIds.length > 0) {
    await db.insert(moduleConcepts).values(
      conceptIds.map((conceptId, index) => ({
        moduleId,
        conceptId,
        order: index,
      })),
    );
  }
}

export async function createModule(input: ModuleInput): Promise<Module> {
  const { conceptIds, ...fields } = input;
  const slug = await uniqueSlug(slugify(input.title), async (s) =>
    Boolean(
      await db.query.modules.findFirst({ where: eq(modules.slug, s) }),
    ),
  );
  const [row] = await db
    .insert(modules)
    .values({ ...fields, slug })
    .returning();
  await setModuleConcepts(row.id, conceptIds);
  return row;
}

export async function updateModule(
  id: string,
  input: ModuleInput,
): Promise<Module> {
  const { conceptIds, ...fields } = input;
  const [row] = await db
    .update(modules)
    .set(fields)
    .where(eq(modules.id, id))
    .returning();
  await setModuleConcepts(id, conceptIds);
  return row;
}

export async function updateModuleStatus(
  id: string,
  status: Module['status'],
): Promise<void> {
  await db.update(modules).set({ status }).where(eq(modules.id, id));
}

export async function deleteModule(id: string): Promise<void> {
  await db.delete(modules).where(eq(modules.id, id));
}
