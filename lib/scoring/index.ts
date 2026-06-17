/**
 * All calculated metrics for the lab live here as pure functions.
 *
 * Each score is reported on a 0–100 scale with an optional breakdown so the
 * dashboard and reports can explain *why* a number is what it is.
 */
import {
  conceptCategories,
  type ConceptCategory,
  type ConceptStatus,
} from '@/types/enums';
import type {
  CaseStudy,
  Concept,
  DecisionGuide,
  Diagram,
  Lab,
  Lesson,
  Project,
  ReviewCard,
} from '@/types';

export interface ScoringData {
  concepts: Concept[];
  lessons: Lesson[];
  labs: Lab[];
  caseStudies: CaseStudy[];
  diagrams: Diagram[];
  decisionGuides: DecisionGuide[];
  reviewCards: ReviewCard[];
  projects: Project[];
}

export interface ScoreBreakdown {
  score: number; // 0-100
  parts: { label: string; value: number; weight: number }[];
}

/** Mastery weight per concept status (0 = untouched, 1 = mastered). */
export const conceptStatusWeight: Record<ConceptStatus, number> = {
  'not-started': 0,
  reading: 0.3,
  practicing: 0.55,
  'needs-review': 0.45,
  understood: 0.8,
  mastered: 1,
};

// --- small math helpers -----------------------------------------------------
const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));
const round = (n: number) => Math.round(n);
const ratio = <T>(items: T[], predicate: (item: T) => boolean): number =>
  items.length === 0 ? 0 : items.filter(predicate).length / items.length;
const average = (values: number[]): number =>
  values.length === 0 ? 0 : values.reduce((a, b) => a + b, 0) / values.length;

function weighted(parts: { value: number; weight: number }[]): number {
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  if (totalWeight === 0) return 0;
  return parts.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
}

// --- 1. Learning Progress Score ---------------------------------------------
export function learningProgressScore(data: ScoringData): ScoreBreakdown {
  const conceptMastery =
    average(data.concepts.map((c) => conceptStatusWeight[c.status])) * 100;
  const lessonCompletion =
    ratio(data.lessons, (l) => l.status === 'completed') * 100;
  const labCompletion =
    ratio(data.labs, (l) => l.status === 'completed') * 100;
  const activeReviews = data.reviewCards.filter((c) => c.status !== 'suspended');
  const reviewMastery =
    ratio(
      activeReviews,
      (c) => c.confidence === 'high' || c.status === 'mastered',
    ) * 100;

  const parts = [
    { label: 'Concept mastery', value: conceptMastery, weight: 0.4 },
    { label: 'Lessons completed', value: lessonCompletion, weight: 0.25 },
    { label: 'Labs completed', value: labCompletion, weight: 0.2 },
    { label: 'Review retention', value: reviewMastery, weight: 0.15 },
  ];
  return { score: round(clamp(weighted(parts))), parts };
}

// --- 2. Backend Confidence Index --------------------------------------------
export function backendConfidenceIndex(data: ScoringData): ScoreBreakdown {
  const conceptConfidence =
    average(data.concepts.map((c) => conceptStatusWeight[c.status])) * 100;

  const labsWithConfidence = data.labs.filter(
    (l) => typeof l.confidenceAfter === 'number',
  );
  const labConfidence =
    average(labsWithConfidence.map((l) => (l.confidenceAfter ?? 0) * 10));

  // Practical applications: concepts referenced by real projects (capped).
  const appliedConceptIds = new Set(
    data.projects.flatMap((p) => [...p.conceptsUsed, ...p.conceptsToLearn]),
  );
  const application = clamp((appliedConceptIds.size / 20) * 100);

  const activeReviews = data.reviewCards.filter((c) => c.status === 'active');
  const reviewPerformance =
    ratio(activeReviews, (c) => c.confidence !== 'low') * 100;

  const parts = [
    { label: 'Concept confidence', value: conceptConfidence, weight: 0.35 },
    { label: 'Lab confidence', value: labConfidence, weight: 0.25 },
    { label: 'Real-project application', value: application, weight: 0.2 },
    { label: 'Review performance', value: reviewPerformance, weight: 0.2 },
  ];
  return { score: round(clamp(weighted(parts))), parts };
}

// --- 3. System Design Readiness Score ---------------------------------------
const CORE_SYSTEM_CATEGORIES: ConceptCategory[] = [
  'api-design',
  'database',
  'caching',
  'queue',
  'scalability',
  'reliability',
  'security',
  'observability',
  'system-design',
];

export function decisionGuideIsComplete(guide: DecisionGuide): boolean {
  return (
    guide.shortAnswer.trim().length > 0 &&
    guide.options.length >= 2 &&
    guide.recommendationRules.trim().length > 0
  );
}

export function systemDesignReadinessScore(data: ScoringData): ScoreBreakdown {
  const casework =
    ratio(
      data.caseStudies,
      (c) => c.status === 'completed' || c.status === 'reviewed',
    ) * 100;
  const diagramPractice = clamp((data.diagrams.length / 10) * 100);
  const decisionCompletion =
    ratio(data.decisionGuides, decisionGuideIsComplete) * 100;

  // Category coverage: core categories that have at least one understood+ concept.
  const coveredCategories = new Set(
    data.concepts
      .filter((c) => conceptStatusWeight[c.status] >= 0.8)
      .map((c) => c.category),
  );
  const coverage =
    (CORE_SYSTEM_CATEGORIES.filter((cat) => coveredCategories.has(cat)).length /
      CORE_SYSTEM_CATEGORIES.length) *
    100;

  const parts = [
    { label: 'Case studies', value: casework, weight: 0.35 },
    { label: 'Diagram practice', value: diagramPractice, weight: 0.2 },
    { label: 'Decision guides', value: decisionCompletion, weight: 0.15 },
    { label: 'Category coverage', value: coverage, weight: 0.3 },
  ];
  return { score: round(clamp(weighted(parts))), parts };
}

// --- 4. Weakness Score (per category) ---------------------------------------
export interface CategoryWeakness {
  category: ConceptCategory;
  weakness: number; // 0-100, higher = weaker
  conceptCount: number;
  notStarted: number;
  lowConfidenceReviews: number;
  labsCompleted: number;
  hasProjectApplication: boolean;
}

export function weaknessByCategory(data: ScoringData): CategoryWeakness[] {
  const appliedConceptIds = new Set(
    data.projects.flatMap((p) => [...p.conceptsUsed, ...p.conceptsToLearn]),
  );

  const results: CategoryWeakness[] = conceptCategories.map((category) => {
    const conceptsInCat = data.concepts.filter((c) => c.category === category);
    const conceptIds = new Set(conceptsInCat.map((c) => c.id));

    const notStarted = conceptsInCat.filter(
      (c) => c.status === 'not-started',
    ).length;
    const masteryGap =
      1 - average(conceptsInCat.map((c) => conceptStatusWeight[c.status]));

    const reviewsInCat = data.reviewCards.filter(
      (r) => r.relatedConceptId && conceptIds.has(r.relatedConceptId),
    );
    const lowConfidenceReviews = reviewsInCat.filter(
      (r) => r.confidence === 'low',
    ).length;
    const lowReviewRatio = ratio(reviewsInCat, (r) => r.confidence === 'low');

    const labsInCat = data.labs.filter(
      (l) => l.relatedConceptId && conceptIds.has(l.relatedConceptId),
    );
    const labGap = labsInCat.length === 0 ? 1 : 1 - ratio(labsInCat, (l) => l.status === 'completed');

    const hasProjectApplication = conceptsInCat.some((c) =>
      appliedConceptIds.has(c.id),
    );

    // Blend factors → 0..1 weakness, then to 0..100.
    const weakness = clamp(
      (masteryGap * 0.45 +
        lowReviewRatio * 0.2 +
        labGap * 0.2 +
        (hasProjectApplication ? 0 : 0.15)) *
        100,
    );

    return {
      category,
      weakness: round(weakness),
      conceptCount: conceptsInCat.length,
      notStarted,
      lowConfidenceReviews,
      labsCompleted: labsInCat.filter((l) => l.status === 'completed').length,
      hasProjectApplication,
    };
  });

  return results
    .filter((r) => r.conceptCount > 0)
    .sort((a, b) => b.weakness - a.weakness);
}

// --- 5. Practicality Score (per concept) ------------------------------------
export interface ConceptPracticalitySignals {
  hasLesson: boolean;
  hasLab: boolean;
  hasSnippet: boolean;
  hasDiagram: boolean;
  hasProjectApplication: boolean;
}

export function conceptPracticality(
  signals: ConceptPracticalitySignals,
): { score: number; satisfied: number; total: number } {
  const flags = Object.values(signals);
  const satisfied = flags.filter(Boolean).length;
  return {
    score: round((satisfied / flags.length) * 100),
    satisfied,
    total: flags.length,
  };
}

// --- 6. Project Backend Readiness -------------------------------------------
export interface ProjectReadinessSignals {
  hasDiagram: boolean;
  hasIdentifiedRisks: boolean;
  hasStudiedConcepts: boolean;
  hasDecisionGuides: boolean;
  hasNextAction: boolean;
}

export function projectBackendReadiness(
  signals: ProjectReadinessSignals,
): { score: number; satisfied: number; total: number } {
  const flags = Object.values(signals);
  const satisfied = flags.filter(Boolean).length;
  return {
    score: round((satisfied / flags.length) * 100),
    satisfied,
    total: flags.length,
  };
}

export function projectReadinessSignals(
  project: Project,
  diagrams: Diagram[],
  studiedConceptIds: Set<string>,
): ProjectReadinessSignals {
  return {
    hasDiagram: diagrams.some((d) => d.relatedProjectId === project.id),
    hasIdentifiedRisks: project.backendRisks.trim().length > 0,
    hasStudiedConcepts: project.conceptsUsed.some((id) =>
      studiedConceptIds.has(id),
    ),
    hasDecisionGuides: project.relatedDecisionGuideIds.length > 0,
    hasNextAction: project.nextBackendAction.trim().length > 0,
  };
}
