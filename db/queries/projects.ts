import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { projects } from '@/db/schema';
import type { ProjectInput } from '@/lib/validations';
import type { ProjectStatus } from '@/types/enums';
import type { CaseStudy, Diagram, Project } from '@/types';

export interface ProjectFilters {
  status?: ProjectStatus;
}

export interface ProjectWithRelations extends Project {
  caseStudy: CaseStudy | null;
  diagrams: Diagram[];
}

export async function listProjects(
  filters: ProjectFilters = {},
): Promise<Project[]> {
  return db
    .select()
    .from(projects)
    .where(filters.status ? eq(projects.status, filters.status) : undefined)
    .orderBy(desc(projects.updatedAt));
}

export async function getProjectById(
  id: string,
): Promise<ProjectWithRelations | undefined> {
  const row = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: { caseStudy: true, diagrams: true },
  });
  return row as ProjectWithRelations | undefined;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const [row] = await db
    .insert(projects)
    .values({ ...input, relatedCaseStudyId: input.relatedCaseStudyId || null })
    .returning();
  return row;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<Project> {
  const [row] = await db
    .update(projects)
    .set({ ...input, relatedCaseStudyId: input.relatedCaseStudyId || null })
    .where(eq(projects.id, id))
    .returning();
  return row;
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  await db.update(projects).set({ status }).where(eq(projects.id, id));
}

export async function deleteProject(id: string): Promise<void> {
  await db.delete(projects).where(eq(projects.id, id));
}
