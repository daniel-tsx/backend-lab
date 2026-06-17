import 'dotenv/config';

import { addDays, subDays } from 'date-fns';
import { sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  caseStudies,
  concepts,
  decisionGuides,
  diagrams,
  glossaryTerms,
  labs,
  learningLogs,
  lessons,
  moduleConcepts,
  modules,
  projects,
  reviewCards,
  snippets,
} from '@/db/schema';
import { slugify } from '@/lib/slug';
import {
  caseStudySeeds,
  conceptSeeds,
  decisionGuideSeeds,
  diagramSeeds,
  glossarySeeds,
  labSeeds,
  learningLogSeeds,
  lessonSeeds,
  moduleSeeds,
  projectSeeds,
  reviewCardSeeds,
  snippetSeeds,
} from '@/lib/seed-data';

/** Wipe every table so seeding is idempotent / re-runnable. */
export async function clearAllData(): Promise<void> {
  await db.execute(sql`
    TRUNCATE TABLE
      ${moduleConcepts}, ${lessons}, ${labs}, ${diagrams}, ${snippets},
      ${reviewCards}, ${learningLogs}, ${glossaryTerms}, ${decisionGuides},
      ${projects}, ${caseStudies}, ${modules}, ${concepts}
    RESTART IDENTITY CASCADE
  `);
}

function mapBy<T extends { slug: string; id: string }>(rows: T[]) {
  return new Map(rows.map((r) => [r.slug, r.id]));
}

function resolveIds(slugs: string[] | undefined, lookup: Map<string, string>, selfId?: string) {
  return (slugs ?? [])
    .map((s) => lookup.get(s))
    .filter((id): id is string => Boolean(id) && id !== selfId);
}

export async function seed(): Promise<void> {
  const now = new Date();
  console.log('• Clearing existing data…');
  await clearAllData();

  // --- Concepts (insert, then wire relations by slug) ----------------------
  console.log('• Concepts…');
  const conceptRows = await db
    .insert(concepts)
    .values(
      conceptSeeds.map((c) => ({
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        category: c.category,
        difficulty: c.difficulty,
        status: c.status ?? 'not-started',
        importance: c.importance ?? 'medium',
        mentalModel: c.mentalModel ?? '',
        howItWorks: c.howItWorks ?? '',
        whenToUse: c.whenToUse ?? '',
        whenNotToUse: c.whenNotToUse ?? '',
        commonMistakes: c.commonMistakes ?? '',
        tradeoffs: c.tradeoffs ?? '',
        realWorldExamples: c.realWorldExamples ?? '',
        tags: c.tags ?? [],
      })),
    )
    .returning({ id: concepts.id, slug: concepts.slug });
  const conceptId = mapBy(conceptRows);

  for (const c of conceptSeeds) {
    const id = conceptId.get(c.slug)!;
    await db
      .update(concepts)
      .set({
        relatedConceptIds: resolveIds(c.related, conceptId, id),
        prerequisiteConceptIds: resolveIds(c.prerequisites, conceptId, id),
      })
      .where(sql`${concepts.id} = ${id}`);
  }

  // --- Modules + module<->concept join -------------------------------------
  console.log('• Modules…');
  const moduleRows = await db
    .insert(modules)
    .values(
      moduleSeeds.map((m) => ({
        slug: m.slug,
        title: m.title,
        description: m.description,
        moduleType: m.moduleType,
        order: m.order,
        estimatedHours: m.estimatedHours,
        status: m.status ?? 'not-started',
        outcome: m.outcome ?? '',
        notes: m.notes ?? '',
      })),
    )
    .returning({ id: modules.id, slug: modules.slug });
  const moduleId = mapBy(moduleRows);

  for (const m of moduleSeeds) {
    const ids = resolveIds(m.conceptSlugs, conceptId);
    if (ids.length > 0) {
      await db.insert(moduleConcepts).values(
        ids.map((cid, index) => ({
          moduleId: moduleId.get(m.slug)!,
          conceptId: cid,
          order: index,
        })),
      );
    }
  }

  // --- Lessons -------------------------------------------------------------
  console.log('• Lessons…');
  await db.insert(lessons).values(
    lessonSeeds.map((l) => ({
      moduleId: moduleId.get(l.moduleSlug)!,
      slug: l.slug,
      title: l.title,
      order: l.order,
      status: l.status ?? 'not-started',
      summary: l.summary,
      body: l.body,
      keyTakeaways: l.keyTakeaways ?? [],
      questionsToAnswer: l.questionsToAnswer ?? [],
      commonMisconceptions: l.commonMisconceptions ?? [],
      practicalChecklist: l.practicalChecklist ?? [],
      ownWords: l.ownWords ?? '',
      projectApplication: l.projectApplication ?? '',
    })),
  );

  // --- Labs ----------------------------------------------------------------
  console.log('• Labs…');
  const labRows = await db
    .insert(labs)
    .values(
      labSeeds.map((l) => ({
        slug: l.slug,
        title: l.title,
        relatedConceptId: l.conceptSlug ? (conceptId.get(l.conceptSlug) ?? null) : null,
        moduleId: l.moduleSlug ? (moduleId.get(l.moduleSlug) ?? null) : null,
        difficulty: l.difficulty,
        labType: l.labType,
        status: l.status ?? 'not-started',
        description: l.description,
        scenario: l.scenario,
        requirements: l.requirements,
        starterCode: l.starterCode ?? '',
        expectedSolution: l.expectedSolution ?? '',
        hints: l.hints ?? [],
        successCriteria: l.successCriteria ?? [],
        timeSpentMinutes: l.timeSpentMinutes ?? 0,
        confidenceBefore: l.confidenceBefore ?? null,
        confidenceAfter: l.confidenceAfter ?? null,
        notes: l.notes ?? '',
        notebook: l.notebook ?? '',
        thingsGotWrong: l.thingsGotWrong ?? '',
        whatLearned: l.whatLearned ?? '',
      })),
    )
    .returning({ id: labs.id, slug: labs.slug });
  const labId = mapBy(labRows);

  // --- Case studies --------------------------------------------------------
  console.log('• Case studies…');
  const caseRows = await db
    .insert(caseStudies)
    .values(
      caseStudySeeds.map((c) => ({
        slug: c.slug,
        title: c.title,
        domain: c.domain,
        difficulty: c.difficulty,
        status: c.status ?? 'not-started',
        problemStatement: c.problemStatement,
        functionalRequirements: c.functionalRequirements ?? [],
        nonFunctionalRequirements: c.nonFunctionalRequirements ?? [],
        constraints: c.constraints ?? [],
        trafficAssumptions: c.trafficAssumptions ?? '',
        dataModel: c.dataModel ?? '',
        apiDesign: c.apiDesign ?? '',
        architecture: c.architecture ?? '',
        scalingStrategy: c.scalingStrategy ?? '',
        reliabilityStrategy: c.reliabilityStrategy ?? '',
        securityStrategy: c.securityStrategy ?? '',
        observabilityStrategy: c.observabilityStrategy ?? '',
        costConsiderations: c.costConsiderations ?? '',
        tradeoffs: c.tradeoffs ?? '',
        finalNotes: c.finalNotes ?? '',
        reviewScores: c.reviewScores ?? null,
      })),
    )
    .returning({ id: caseStudies.id, slug: caseStudies.slug });
  const caseId = mapBy(caseRows);

  // --- Decision guides -----------------------------------------------------
  console.log('• Decision guides…');
  const guideRows = await db
    .insert(decisionGuides)
    .values(
      decisionGuideSeeds.map((g) => ({
        slug: g.slug,
        title: g.title,
        category: g.category,
        question: g.question,
        shortAnswer: g.shortAnswer,
        options: g.options,
        comparisonCriteria: g.comparisonCriteria ?? [],
        recommendationRules: g.recommendationRules ?? '',
        examples: g.examples ?? '',
        relatedConceptIds: resolveIds(g.relatedConceptSlugs, conceptId),
        relatedLabIds: [], // filled below once labId exists (it already does)
      })),
    )
    .returning({ id: decisionGuides.id, slug: decisionGuides.slug });
  const guideId = mapBy(guideRows);

  for (const g of decisionGuideSeeds) {
    const labIds = resolveIds(g.relatedLabSlugs, labId);
    if (labIds.length > 0) {
      await db
        .update(decisionGuides)
        .set({ relatedLabIds: labIds })
        .where(sql`${decisionGuides.id} = ${guideId.get(g.slug)!}`);
    }
  }

  // --- Projects ------------------------------------------------------------
  console.log('• Projects…');
  await db.insert(projects).values(
    projectSeeds.map((p) => ({
      projectName: p.projectName,
      projectType: p.projectType,
      status: p.status ?? 'active',
      description: p.description,
      currentArchitecture: p.currentArchitecture ?? '',
      backendRisks: p.backendRisks ?? '',
      conceptsUsed: resolveIds(p.conceptsUsedSlugs, conceptId),
      conceptsToLearn: resolveIds(p.conceptsToLearnSlugs, conceptId),
      architectureNotes: p.architectureNotes ?? '',
      improvementIdeas: p.improvementIdeas ?? '',
      nextBackendAction: p.nextBackendAction ?? '',
      relatedDecisionGuideIds: resolveIds(p.relatedDecisionGuideSlugs, guideId),
      relatedCaseStudyId: p.relatedCaseStudySlug
        ? (caseId.get(p.relatedCaseStudySlug) ?? null)
        : null,
    })),
  );
  // Projects map (by name slug) for diagrams referencing projects.
  const projectRows = await db
    .select({ id: projects.id, projectName: projects.projectName })
    .from(projects);
  const projectIdBySlug = new Map(
    projectRows.map((r) => [slugify(r.projectName), r.id]),
  );

  // --- Diagrams ------------------------------------------------------------
  console.log('• Diagrams…');
  await db.insert(diagrams).values(
    diagramSeeds.map((d) => ({
      title: d.title,
      description: d.description,
      diagramType: d.diagramType,
      mermaidCode: d.mermaidCode,
      notes: d.notes ?? '',
      relatedConceptId: d.conceptSlug ? (conceptId.get(d.conceptSlug) ?? null) : null,
      relatedCaseStudyId: d.caseStudySlug ? (caseId.get(d.caseStudySlug) ?? null) : null,
      relatedProjectId: d.projectSlug ? (projectIdBySlug.get(d.projectSlug) ?? null) : null,
    })),
  );

  // --- Snippets ------------------------------------------------------------
  console.log('• Snippets…');
  await db.insert(snippets).values(
    snippetSeeds.map((s) => ({
      title: s.title,
      language: s.language,
      category: s.category,
      code: s.code,
      explanation: s.explanation,
      useCase: s.useCase,
      relatedConceptId: s.conceptSlug ? (conceptId.get(s.conceptSlug) ?? null) : null,
      relatedLabId: s.labSlug ? (labId.get(s.labSlug) ?? null) : null,
      tags: s.tags ?? [],
    })),
  );

  // --- Review cards --------------------------------------------------------
  console.log('• Review cards…');
  await db.insert(reviewCards).values(
    reviewCardSeeds.map((r) => {
      const dueInDays = r.dueInDays ?? 0;
      const reviewCount = r.reviewCount ?? 0;
      return {
        relatedConceptId: r.conceptSlug ? (conceptId.get(r.conceptSlug) ?? null) : null,
        question: r.question,
        answer: r.answer,
        difficulty: r.difficulty ?? 'medium',
        confidence: r.confidence ?? 'low',
        status: 'active' as const,
        reviewCount,
        intervalDays: Math.max(0, dueInDays),
        easeFactor: 2.5,
        nextReviewAt: addDays(now, dueInDays),
        lastReviewedAt: reviewCount > 0 ? subDays(now, Math.max(1, dueInDays === 0 ? 1 : Math.abs(dueInDays))) : null,
      };
    }),
  );

  // --- Learning logs -------------------------------------------------------
  console.log('• Learning logs…');
  await db.insert(learningLogs).values(
    learningLogSeeds.map((l) => ({
      date: subDays(now, l.daysAgo),
      title: l.title,
      summary: l.summary,
      conceptIds: resolveIds(l.conceptsStudied, conceptId),
      labIds: resolveIds(l.labsCompleted, labId),
      timeSpentMinutes: l.timeSpentMinutes,
      confidenceChange: l.confidenceChange ?? 0,
      blockers: l.blockers ?? '',
      notes: l.notes ?? '',
      nextStep: l.nextStep ?? '',
    })),
  );

  // --- Glossary ------------------------------------------------------------
  console.log('• Glossary…');
  await db.insert(glossaryTerms).values(
    glossarySeeds.map((g) => ({
      term: g.term,
      slug: slugify(g.term),
      definition: g.definition,
      category: g.category,
      example: g.example ?? '',
      commonConfusion: g.commonConfusion ?? '',
      relatedConceptIds: resolveIds(g.relatedConceptSlugs, conceptId),
    })),
  );

  console.log('✓ Seed complete.');
}
