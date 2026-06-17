import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '@/db';
import { diagrams } from '@/db/schema';
import type { DiagramInput } from '@/lib/validations';
import type { DiagramType } from '@/types/enums';
import type { CaseStudy, Concept, Diagram, Project } from '@/types';

export interface DiagramFilters {
  diagramType?: DiagramType;
  search?: string;
}

export interface DiagramWithRelations extends Diagram {
  concept: Concept | null;
  caseStudy: CaseStudy | null;
  project: Project | null;
}

function normalizeRefs(input: DiagramInput) {
  return {
    relatedConceptId: input.relatedConceptId || null,
    relatedCaseStudyId: input.relatedCaseStudyId || null,
    relatedProjectId: input.relatedProjectId || null,
  };
}

export async function listDiagrams(
  filters: DiagramFilters = {},
): Promise<Diagram[]> {
  const conditions = [];
  if (filters.diagramType)
    conditions.push(eq(diagrams.diagramType, filters.diagramType));
  if (filters.search) {
    const q = `%${filters.search}%`;
    conditions.push(
      or(ilike(diagrams.title, q), ilike(diagrams.description, q)),
    );
  }
  return db
    .select()
    .from(diagrams)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(diagrams.updatedAt));
}

export async function getDiagramById(
  id: string,
): Promise<DiagramWithRelations | undefined> {
  const row = await db.query.diagrams.findFirst({
    where: eq(diagrams.id, id),
    with: { concept: true, caseStudy: true, project: true },
  });
  return row as DiagramWithRelations | undefined;
}

export async function diagramsForConcept(conceptId: string): Promise<Diagram[]> {
  return db
    .select()
    .from(diagrams)
    .where(eq(diagrams.relatedConceptId, conceptId));
}

export async function diagramsForProject(projectId: string): Promise<Diagram[]> {
  return db
    .select()
    .from(diagrams)
    .where(eq(diagrams.relatedProjectId, projectId));
}

export async function createDiagram(input: DiagramInput): Promise<Diagram> {
  const [row] = await db
    .insert(diagrams)
    .values({ ...input, ...normalizeRefs(input) })
    .returning();
  return row;
}

export async function updateDiagram(
  id: string,
  input: DiagramInput,
): Promise<Diagram> {
  const [row] = await db
    .update(diagrams)
    .set({ ...input, ...normalizeRefs(input) })
    .where(eq(diagrams.id, id))
    .returning();
  return row;
}

export async function updateDiagramCode(
  id: string,
  mermaidCode: string,
): Promise<void> {
  await db.update(diagrams).set({ mermaidCode }).where(eq(diagrams.id, id));
}

export async function deleteDiagram(id: string): Promise<void> {
  await db.delete(diagrams).where(eq(diagrams.id, id));
}
