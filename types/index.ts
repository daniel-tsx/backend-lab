import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

import type * as schema from '@/db/schema';

export * from './enums';
export type { CaseStudyReviewScores, DecisionOption } from '@/db/schema';

export type Concept = InferSelectModel<typeof schema.concepts>;
export type NewConcept = InferInsertModel<typeof schema.concepts>;

export type Module = InferSelectModel<typeof schema.modules>;
export type NewModule = InferInsertModel<typeof schema.modules>;

export type ModuleConcept = InferSelectModel<typeof schema.moduleConcepts>;
export type NewModuleConcept = InferInsertModel<typeof schema.moduleConcepts>;

export type Lesson = InferSelectModel<typeof schema.lessons>;
export type NewLesson = InferInsertModel<typeof schema.lessons>;

export type Lab = InferSelectModel<typeof schema.labs>;
export type NewLab = InferInsertModel<typeof schema.labs>;

export type CaseStudy = InferSelectModel<typeof schema.caseStudies>;
export type NewCaseStudy = InferInsertModel<typeof schema.caseStudies>;

export type Diagram = InferSelectModel<typeof schema.diagrams>;
export type NewDiagram = InferInsertModel<typeof schema.diagrams>;

export type Snippet = InferSelectModel<typeof schema.snippets>;
export type NewSnippet = InferInsertModel<typeof schema.snippets>;

export type DecisionGuide = InferSelectModel<typeof schema.decisionGuides>;
export type NewDecisionGuide = InferInsertModel<typeof schema.decisionGuides>;

export type Project = InferSelectModel<typeof schema.projects>;
export type NewProject = InferInsertModel<typeof schema.projects>;

export type ReviewCard = InferSelectModel<typeof schema.reviewCards>;
export type NewReviewCard = InferInsertModel<typeof schema.reviewCards>;

export type LearningLog = InferSelectModel<typeof schema.learningLogs>;
export type NewLearningLog = InferInsertModel<typeof schema.learningLogs>;

export type GlossaryTerm = InferSelectModel<typeof schema.glossaryTerms>;
export type NewGlossaryTerm = InferInsertModel<typeof schema.glossaryTerms>;

export type AppSetting = InferSelectModel<typeof schema.appSettings>;
export type NewAppSetting = InferInsertModel<typeof schema.appSettings>;
