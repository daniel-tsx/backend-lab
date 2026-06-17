/**
 * Backend Architecture Lab — database schema (PostgreSQL / Drizzle ORM).
 *
 * Conventions:
 * - JS property names are camelCase, columns are snake_case.
 * - Enum-like fields are `text` typed with `$type<Union>()` (see types/enums.ts)
 *   so adding a value never needs a migration.
 * - Free arrays (tags, takeaways, related ids) use Postgres `text[]`.
 * - No `userId` yet, but every table is single-purpose so a tenant/owner column
 *   can be added later when BetterAuth is introduced.
 */
import { relations, sql } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import type {
  CaseStudyDomain,
  CaseStudyStatus,
  ConceptCategory,
  ConceptStatus,
  DecisionCategory,
  DiagramType,
  Difficulty,
  Importance,
  LabStatus,
  LabType,
  LessonStatus,
  ModuleStatus,
  ModuleType,
  ProjectStatus,
  ProjectType,
  ReviewConfidence,
  ReviewDifficulty,
  ReviewStatus,
  SnippetCategory,
  SnippetLanguage,
} from '@/types/enums';

/** Columns shared by every table. */
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/** Empty-array default for `text[]` columns. */
const emptyTextArray = sql`'{}'::text[]`;

// ---------------------------------------------------------------------------
// Concepts
// ---------------------------------------------------------------------------
export const concepts = pgTable(
  'concepts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    summary: text('summary').notNull().default(''),
    category: text('category').$type<ConceptCategory>().notNull(),
    difficulty: text('difficulty').$type<Difficulty>().notNull(),
    status: text('status').$type<ConceptStatus>().notNull().default('not-started'),
    importance: text('importance').$type<Importance>().notNull().default('medium'),
    mentalModel: text('mental_model').notNull().default(''),
    howItWorks: text('how_it_works').notNull().default(''),
    whenToUse: text('when_to_use').notNull().default(''),
    whenNotToUse: text('when_not_to_use').notNull().default(''),
    commonMistakes: text('common_mistakes').notNull().default(''),
    tradeoffs: text('tradeoffs').notNull().default(''),
    realWorldExamples: text('real_world_examples').notNull().default(''),
    relatedConceptIds: text('related_concept_ids')
      .array()
      .notNull()
      .default(emptyTextArray),
    prerequisiteConceptIds: text('prerequisite_concept_ids')
      .array()
      .notNull()
      .default(emptyTextArray),
    tags: text('tags').array().notNull().default(emptyTextArray),
    ...timestamps,
  },
  (t) => [uniqueIndex('concepts_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// Learning modules (these double as the app's "learning paths")
// ---------------------------------------------------------------------------
export const modules = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull().default(''),
    moduleType: text('module_type').$type<ModuleType>().notNull(),
    order: integer('order').notNull().default(0),
    estimatedHours: integer('estimated_hours').notNull().default(0),
    status: text('status').$type<ModuleStatus>().notNull().default('not-started'),
    outcome: text('outcome').notNull().default(''),
    notes: text('notes').notNull().default(''),
    ...timestamps,
  },
  (t) => [uniqueIndex('modules_slug_idx').on(t.slug)],
);

/** Many-to-many join: a concept can belong to several modules and vice versa. */
export const moduleConcepts = pgTable('module_concepts', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),
  conceptId: uuid('concept_id')
    .notNull()
    .references(() => concepts.id, { onDelete: 'cascade' }),
  order: integer('order').notNull().default(0),
});

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    order: integer('order').notNull().default(0),
    summary: text('summary').notNull().default(''),
    body: text('body').notNull().default(''),
    keyTakeaways: text('key_takeaways').array().notNull().default(emptyTextArray),
    questionsToAnswer: text('questions_to_answer')
      .array()
      .notNull()
      .default(emptyTextArray),
    commonMisconceptions: text('common_misconceptions')
      .array()
      .notNull()
      .default(emptyTextArray),
    practicalChecklist: text('practical_checklist')
      .array()
      .notNull()
      .default(emptyTextArray),
    // Reflective fields surfaced on the lesson page.
    ownWords: text('own_words').notNull().default(''),
    projectApplication: text('project_application').notNull().default(''),
    status: text('status').$type<LessonStatus>().notNull().default('not-started'),
    ...timestamps,
  },
  (t) => [uniqueIndex('lessons_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// Lab exercises
// ---------------------------------------------------------------------------
export const labs = pgTable(
  'labs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    relatedConceptId: uuid('related_concept_id').references(() => concepts.id, {
      onDelete: 'set null',
    }),
    moduleId: uuid('module_id').references(() => modules.id, {
      onDelete: 'set null',
    }),
    difficulty: text('difficulty').$type<Difficulty>().notNull(),
    labType: text('lab_type').$type<LabType>().notNull(),
    description: text('description').notNull().default(''),
    scenario: text('scenario').notNull().default(''),
    requirements: text('requirements').notNull().default(''),
    starterCode: text('starter_code').notNull().default(''),
    expectedSolution: text('expected_solution').notNull().default(''),
    hints: text('hints').array().notNull().default(emptyTextArray),
    successCriteria: text('success_criteria')
      .array()
      .notNull()
      .default(emptyTextArray),
    // Success-criteria strings the runner has checked off (persisted run state).
    completedCriteria: text('completed_criteria')
      .array()
      .notNull()
      .default(emptyTextArray),
    status: text('status').$type<LabStatus>().notNull().default('not-started'),
    timeSpentMinutes: integer('time_spent_minutes').notNull().default(0),
    confidenceBefore: integer('confidence_before'),
    confidenceAfter: integer('confidence_after'),
    notes: text('notes').notNull().default(''),
    // Lab notebook fields.
    notebook: text('notebook').notNull().default(''),
    thingsGotWrong: text('things_got_wrong').notNull().default(''),
    whatLearned: text('what_learned').notNull().default(''),
    ...timestamps,
  },
  (t) => [uniqueIndex('labs_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// System design case studies
// ---------------------------------------------------------------------------
export type CaseStudyReviewScores = {
  requirementsClarity: number;
  dataModelQuality: number;
  apiQuality: number;
  scalability: number;
  reliability: number;
  security: number;
  simplicity: number;
  costAwareness: number;
};

export const caseStudies = pgTable(
  'case_studies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    domain: text('domain').$type<CaseStudyDomain>().notNull(),
    difficulty: text('difficulty').$type<Difficulty>().notNull(),
    problemStatement: text('problem_statement').notNull().default(''),
    functionalRequirements: text('functional_requirements')
      .array()
      .notNull()
      .default(emptyTextArray),
    nonFunctionalRequirements: text('non_functional_requirements')
      .array()
      .notNull()
      .default(emptyTextArray),
    constraints: text('constraints').array().notNull().default(emptyTextArray),
    trafficAssumptions: text('traffic_assumptions').notNull().default(''),
    dataModel: text('data_model').notNull().default(''),
    apiDesign: text('api_design').notNull().default(''),
    architecture: text('architecture').notNull().default(''),
    scalingStrategy: text('scaling_strategy').notNull().default(''),
    reliabilityStrategy: text('reliability_strategy').notNull().default(''),
    securityStrategy: text('security_strategy').notNull().default(''),
    observabilityStrategy: text('observability_strategy').notNull().default(''),
    costConsiderations: text('cost_considerations').notNull().default(''),
    tradeoffs: text('tradeoffs').notNull().default(''),
    finalNotes: text('final_notes').notNull().default(''),
    reviewScores: jsonb('review_scores').$type<CaseStudyReviewScores | null>(),
    status: text('status')
      .$type<CaseStudyStatus>()
      .notNull()
      .default('not-started'),
    ...timestamps,
  },
  (t) => [uniqueIndex('case_studies_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// Architecture diagrams
// ---------------------------------------------------------------------------
export const diagrams = pgTable('diagrams', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  diagramType: text('diagram_type').$type<DiagramType>().notNull(),
  relatedConceptId: uuid('related_concept_id').references(() => concepts.id, {
    onDelete: 'set null',
  }),
  relatedCaseStudyId: uuid('related_case_study_id').references(
    () => caseStudies.id,
    { onDelete: 'set null' },
  ),
  relatedProjectId: uuid('related_project_id').references(() => projects.id, {
    onDelete: 'set null',
  }),
  mermaidCode: text('mermaid_code').notNull().default(''),
  notes: text('notes').notNull().default(''),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Code snippets
// ---------------------------------------------------------------------------
export const snippets = pgTable('snippets', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  language: text('language').$type<SnippetLanguage>().notNull(),
  category: text('category').$type<SnippetCategory>().notNull(),
  code: text('code').notNull().default(''),
  explanation: text('explanation').notNull().default(''),
  useCase: text('use_case').notNull().default(''),
  relatedConceptId: uuid('related_concept_id').references(() => concepts.id, {
    onDelete: 'set null',
  }),
  relatedLabId: uuid('related_lab_id').references(() => labs.id, {
    onDelete: 'set null',
  }),
  tags: text('tags').array().notNull().default(emptyTextArray),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Decision guides
// ---------------------------------------------------------------------------
export type DecisionOption = {
  name: string;
  description: string;
  whenToChoose: string;
  tradeoffs: string;
  failureModes: string;
};

export const decisionGuides = pgTable(
  'decision_guides',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    category: text('category').$type<DecisionCategory>().notNull(),
    question: text('question').notNull().default(''),
    shortAnswer: text('short_answer').notNull().default(''),
    options: jsonb('options').$type<DecisionOption[]>().notNull().default([]),
    comparisonCriteria: text('comparison_criteria')
      .array()
      .notNull()
      .default(emptyTextArray),
    recommendationRules: text('recommendation_rules').notNull().default(''),
    examples: text('examples').notNull().default(''),
    relatedConceptIds: text('related_concept_ids')
      .array()
      .notNull()
      .default(emptyTextArray),
    relatedLabIds: text('related_lab_ids')
      .array()
      .notNull()
      .default(emptyTextArray),
    ...timestamps,
  },
  (t) => [uniqueIndex('decision_guides_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// Project applications (anchors to the user's real products)
// ---------------------------------------------------------------------------
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectName: text('project_name').notNull(),
  projectType: text('project_type').$type<ProjectType>().notNull(),
  description: text('description').notNull().default(''),
  currentArchitecture: text('current_architecture').notNull().default(''),
  backendRisks: text('backend_risks').notNull().default(''),
  conceptsUsed: text('concepts_used').array().notNull().default(emptyTextArray),
  conceptsToLearn: text('concepts_to_learn')
    .array()
    .notNull()
    .default(emptyTextArray),
  architectureNotes: text('architecture_notes').notNull().default(''),
  improvementIdeas: text('improvement_ideas').notNull().default(''),
  nextBackendAction: text('next_backend_action').notNull().default(''),
  relatedDecisionGuideIds: text('related_decision_guide_ids')
    .array()
    .notNull()
    .default(emptyTextArray),
  relatedCaseStudyId: uuid('related_case_study_id').references(
    () => caseStudies.id,
    { onDelete: 'set null' },
  ),
  status: text('status').$type<ProjectStatus>().notNull().default('active'),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Review cards (spaced repetition — see lib/review-scheduler)
// ---------------------------------------------------------------------------
export const reviewCards = pgTable('review_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  relatedConceptId: uuid('related_concept_id').references(() => concepts.id, {
    onDelete: 'cascade',
  }),
  relatedLessonId: uuid('related_lesson_id').references(() => lessons.id, {
    onDelete: 'cascade',
  }),
  question: text('question').notNull(),
  answer: text('answer').notNull().default(''),
  difficulty: text('difficulty')
    .$type<ReviewDifficulty>()
    .notNull()
    .default('medium'),
  nextReviewAt: timestamp('next_review_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  reviewCount: integer('review_count').notNull().default(0),
  // SM-2-style scheduling state.
  intervalDays: integer('interval_days').notNull().default(0),
  easeFactor: real('ease_factor').notNull().default(2.5),
  confidence: text('confidence')
    .$type<ReviewConfidence>()
    .notNull()
    .default('low'),
  status: text('status').$type<ReviewStatus>().notNull().default('active'),
  note: text('note').notNull().default(''),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Learning log (daily / weekly journal)
// ---------------------------------------------------------------------------
export const learningLogs = pgTable('learning_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date', { withTimezone: true }).defaultNow().notNull(),
  title: text('title').notNull(),
  summary: text('summary').notNull().default(''),
  // UUIDs of the concepts/labs this entry touched (see projects.conceptsUsed
  // for the same pattern). Resolved to titles for display.
  conceptIds: text('concept_ids').array().notNull().default(emptyTextArray),
  labIds: text('lab_ids').array().notNull().default(emptyTextArray),
  timeSpentMinutes: integer('time_spent_minutes').notNull().default(0),
  confidenceChange: integer('confidence_change').notNull().default(0),
  blockers: text('blockers').notNull().default(''),
  notes: text('notes').notNull().default(''),
  nextStep: text('next_step').notNull().default(''),
  ...timestamps,
});

// ---------------------------------------------------------------------------
// Glossary
// ---------------------------------------------------------------------------
export const glossaryTerms = pgTable(
  'glossary_terms',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    term: text('term').notNull(),
    slug: text('slug').notNull(),
    definition: text('definition').notNull().default(''),
    category: text('category').$type<ConceptCategory>().notNull().default('other'),
    example: text('example').notNull().default(''),
    relatedConceptIds: text('related_concept_ids')
      .array()
      .notNull()
      .default(emptyTextArray),
    commonConfusion: text('common_confusion').notNull().default(''),
    ...timestamps,
  },
  (t) => [uniqueIndex('glossary_terms_slug_idx').on(t.slug)],
);

// ---------------------------------------------------------------------------
// App settings (singleton key/value — scoring weights, preferences, etc.)
// ---------------------------------------------------------------------------
export const appSettings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------
export const modulesRelations = relations(modules, ({ many }) => ({
  lessons: many(lessons),
  moduleConcepts: many(moduleConcepts),
  labs: many(labs),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  reviewCards: many(reviewCards),
}));

export const conceptsRelations = relations(concepts, ({ many }) => ({
  moduleConcepts: many(moduleConcepts),
  labs: many(labs),
  snippets: many(snippets),
  diagrams: many(diagrams),
  reviewCards: many(reviewCards),
}));

export const moduleConceptsRelations = relations(moduleConcepts, ({ one }) => ({
  module: one(modules, {
    fields: [moduleConcepts.moduleId],
    references: [modules.id],
  }),
  concept: one(concepts, {
    fields: [moduleConcepts.conceptId],
    references: [concepts.id],
  }),
}));

export const labsRelations = relations(labs, ({ one, many }) => ({
  concept: one(concepts, {
    fields: [labs.relatedConceptId],
    references: [concepts.id],
  }),
  module: one(modules, {
    fields: [labs.moduleId],
    references: [modules.id],
  }),
  snippets: many(snippets),
}));

export const snippetsRelations = relations(snippets, ({ one }) => ({
  concept: one(concepts, {
    fields: [snippets.relatedConceptId],
    references: [concepts.id],
  }),
  lab: one(labs, {
    fields: [snippets.relatedLabId],
    references: [labs.id],
  }),
}));

export const diagramsRelations = relations(diagrams, ({ one }) => ({
  concept: one(concepts, {
    fields: [diagrams.relatedConceptId],
    references: [concepts.id],
  }),
  caseStudy: one(caseStudies, {
    fields: [diagrams.relatedCaseStudyId],
    references: [caseStudies.id],
  }),
  project: one(projects, {
    fields: [diagrams.relatedProjectId],
    references: [projects.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  caseStudy: one(caseStudies, {
    fields: [projects.relatedCaseStudyId],
    references: [caseStudies.id],
  }),
  diagrams: many(diagrams),
}));

export const caseStudiesRelations = relations(caseStudies, ({ many }) => ({
  diagrams: many(diagrams),
  projects: many(projects),
}));

export const reviewCardsRelations = relations(reviewCards, ({ one }) => ({
  concept: one(concepts, {
    fields: [reviewCards.relatedConceptId],
    references: [concepts.id],
  }),
  lesson: one(lessons, {
    fields: [reviewCards.relatedLessonId],
    references: [lessons.id],
  }),
}));
