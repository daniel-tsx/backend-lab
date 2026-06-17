/**
 * Zod v4 schemas backing every create/edit form. These describe the *form*
 * shape (arrays already split, slugs optional — derived from title server-side).
 */
import { z } from 'zod';

import {
  caseStudyDomains,
  caseStudyStatuses,
  conceptCategories,
  conceptStatuses,
  decisionCategories,
  diagramTypes,
  difficulties,
  importances,
  labStatuses,
  labTypes,
  lessonStatuses,
  moduleStatuses,
  moduleTypes,
  projectStatuses,
  projectTypes,
  reviewConfidences,
  reviewDifficulties,
  reviewStatuses,
  snippetCategories,
  snippetLanguages,
} from '@/types/enums';

const requiredString = (label: string) =>
  z.string().trim().min(1, `${label} is required`);

const optionalText = z.string().trim().default('');
const stringArray = z.array(z.string().trim().min(1)).default([]);

export const conceptSchema = z.object({
  title: requiredString('Title').max(160),
  summary: optionalText,
  category: z.enum(conceptCategories),
  difficulty: z.enum(difficulties),
  status: z.enum(conceptStatuses).default('not-started'),
  importance: z.enum(importances).default('medium'),
  mentalModel: optionalText,
  howItWorks: optionalText,
  whenToUse: optionalText,
  whenNotToUse: optionalText,
  commonMistakes: optionalText,
  tradeoffs: optionalText,
  realWorldExamples: optionalText,
  relatedConceptIds: stringArray,
  prerequisiteConceptIds: stringArray,
  tags: stringArray,
});
export type ConceptInput = z.infer<typeof conceptSchema>;

export const moduleSchema = z.object({
  title: requiredString('Title').max(160),
  description: optionalText,
  moduleType: z.enum(moduleTypes),
  order: z.coerce.number().int().min(0).default(0),
  estimatedHours: z.coerce.number().int().min(0).default(0),
  status: z.enum(moduleStatuses).default('not-started'),
  outcome: optionalText,
  notes: optionalText,
  conceptIds: stringArray,
});
export type ModuleInput = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  moduleId: requiredString('Module'),
  title: requiredString('Title').max(160),
  order: z.coerce.number().int().min(0).default(0),
  summary: optionalText,
  body: optionalText,
  keyTakeaways: stringArray,
  questionsToAnswer: stringArray,
  commonMisconceptions: stringArray,
  practicalChecklist: stringArray,
  ownWords: optionalText,
  projectApplication: optionalText,
  status: z.enum(lessonStatuses).default('not-started'),
});
export type LessonInput = z.infer<typeof lessonSchema>;

export const labSchema = z.object({
  title: requiredString('Title').max(160),
  relatedConceptId: z.string().nullish(),
  moduleId: z.string().nullish(),
  difficulty: z.enum(difficulties),
  labType: z.enum(labTypes),
  description: optionalText,
  scenario: optionalText,
  requirements: optionalText,
  starterCode: optionalText,
  expectedSolution: optionalText,
  hints: stringArray,
  successCriteria: stringArray,
  status: z.enum(labStatuses).default('not-started'),
  timeSpentMinutes: z.coerce.number().int().min(0).default(0),
  confidenceBefore: z.coerce.number().int().min(1).max(10).nullish(),
  confidenceAfter: z.coerce.number().int().min(1).max(10).nullish(),
  notes: optionalText,
  notebook: optionalText,
  thingsGotWrong: optionalText,
  whatLearned: optionalText,
});
export type LabInput = z.infer<typeof labSchema>;

const reviewScoresSchema = z
  .object({
    requirementsClarity: z.coerce.number().int().min(0).max(5),
    dataModelQuality: z.coerce.number().int().min(0).max(5),
    apiQuality: z.coerce.number().int().min(0).max(5),
    scalability: z.coerce.number().int().min(0).max(5),
    reliability: z.coerce.number().int().min(0).max(5),
    security: z.coerce.number().int().min(0).max(5),
    simplicity: z.coerce.number().int().min(0).max(5),
    costAwareness: z.coerce.number().int().min(0).max(5),
  })
  .nullish();

export const caseStudySchema = z.object({
  title: requiredString('Title').max(160),
  domain: z.enum(caseStudyDomains),
  difficulty: z.enum(difficulties),
  problemStatement: optionalText,
  functionalRequirements: stringArray,
  nonFunctionalRequirements: stringArray,
  constraints: stringArray,
  trafficAssumptions: optionalText,
  dataModel: optionalText,
  apiDesign: optionalText,
  architecture: optionalText,
  scalingStrategy: optionalText,
  reliabilityStrategy: optionalText,
  securityStrategy: optionalText,
  observabilityStrategy: optionalText,
  costConsiderations: optionalText,
  tradeoffs: optionalText,
  finalNotes: optionalText,
  reviewScores: reviewScoresSchema,
  status: z.enum(caseStudyStatuses).default('not-started'),
});
export type CaseStudyInput = z.infer<typeof caseStudySchema>;

export const diagramSchema = z.object({
  title: requiredString('Title').max(160),
  description: optionalText,
  diagramType: z.enum(diagramTypes),
  relatedConceptId: z.string().nullish(),
  relatedCaseStudyId: z.string().nullish(),
  relatedProjectId: z.string().nullish(),
  mermaidCode: requiredString('Mermaid code'),
  notes: optionalText,
});
export type DiagramInput = z.infer<typeof diagramSchema>;

export const snippetSchema = z.object({
  title: requiredString('Title').max(160),
  language: z.enum(snippetLanguages),
  category: z.enum(snippetCategories),
  code: requiredString('Code'),
  explanation: optionalText,
  useCase: optionalText,
  relatedConceptId: z.string().nullish(),
  relatedLabId: z.string().nullish(),
  tags: stringArray,
});
export type SnippetInput = z.infer<typeof snippetSchema>;

export const decisionOptionSchema = z.object({
  name: requiredString('Option name'),
  description: optionalText,
  whenToChoose: optionalText,
  tradeoffs: optionalText,
  failureModes: optionalText,
});

export const decisionGuideSchema = z.object({
  title: requiredString('Title').max(160),
  category: z.enum(decisionCategories),
  question: optionalText,
  shortAnswer: optionalText,
  options: z.array(decisionOptionSchema).default([]),
  comparisonCriteria: stringArray,
  recommendationRules: optionalText,
  examples: optionalText,
  relatedConceptIds: stringArray,
  relatedLabIds: stringArray,
});
export type DecisionGuideInput = z.infer<typeof decisionGuideSchema>;

export const projectSchema = z.object({
  projectName: requiredString('Project name').max(160),
  projectType: z.enum(projectTypes),
  description: optionalText,
  currentArchitecture: optionalText,
  backendRisks: optionalText,
  conceptsUsed: stringArray,
  conceptsToLearn: stringArray,
  architectureNotes: optionalText,
  improvementIdeas: optionalText,
  nextBackendAction: optionalText,
  relatedDecisionGuideIds: stringArray,
  relatedCaseStudyId: z.string().nullish(),
  status: z.enum(projectStatuses).default('active'),
});
export type ProjectInput = z.infer<typeof projectSchema>;

export const reviewCardSchema = z.object({
  relatedConceptId: z.string().nullish(),
  relatedLessonId: z.string().nullish(),
  question: requiredString('Question'),
  answer: optionalText,
  difficulty: z.enum(reviewDifficulties).default('medium'),
  confidence: z.enum(reviewConfidences).default('low'),
  status: z.enum(reviewStatuses).default('active'),
  note: optionalText,
});
export type ReviewCardInput = z.infer<typeof reviewCardSchema>;

export const learningLogSchema = z.object({
  date: z.coerce.date().default(() => new Date()),
  title: requiredString('Title').max(160),
  summary: optionalText,
  conceptIds: stringArray,
  labIds: stringArray,
  timeSpentMinutes: z.coerce.number().int().min(0).default(0),
  confidenceChange: z.coerce.number().int().min(-10).max(10).default(0),
  blockers: optionalText,
  notes: optionalText,
  nextStep: optionalText,
});
export type LearningLogInput = z.infer<typeof learningLogSchema>;

export const glossaryTermSchema = z.object({
  term: requiredString('Term').max(160),
  definition: optionalText,
  category: z.enum(conceptCategories).default('other'),
  example: optionalText,
  relatedConceptIds: stringArray,
  commonConfusion: optionalText,
});
export type GlossaryTermInput = z.infer<typeof glossaryTermSchema>;

/** Grade submitted from the review center. */
export const reviewGradeSchema = z.object({
  id: requiredString('Card id'),
  grade: z.enum(['forgot', 'shaky', 'good', 'easy']),
});
