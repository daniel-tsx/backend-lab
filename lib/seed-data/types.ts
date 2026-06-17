/**
 * Seed shapes use *slugs* for cross-references; the runner (seed/index.ts)
 * resolves them to UUIDs after inserting each entity.
 */
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
  SnippetCategory,
  SnippetLanguage,
} from '@/types/enums';
import type { CaseStudyReviewScores, DecisionOption } from '@/types';

export interface ConceptSeed {
  slug: string;
  title: string;
  category: ConceptCategory;
  difficulty: Difficulty;
  status?: ConceptStatus;
  importance?: Importance;
  summary: string;
  mentalModel?: string;
  howItWorks?: string;
  whenToUse?: string;
  whenNotToUse?: string;
  commonMistakes?: string;
  tradeoffs?: string;
  realWorldExamples?: string;
  related?: string[];
  prerequisites?: string[];
  tags?: string[];
}

export interface ModuleSeed {
  slug: string;
  title: string;
  moduleType: ModuleType;
  order: number;
  estimatedHours: number;
  status?: ModuleStatus;
  description: string;
  outcome?: string;
  notes?: string;
  conceptSlugs?: string[];
}

export interface LessonSeed {
  slug: string;
  moduleSlug: string;
  title: string;
  order: number;
  status?: LessonStatus;
  summary: string;
  body: string;
  keyTakeaways?: string[];
  questionsToAnswer?: string[];
  commonMisconceptions?: string[];
  practicalChecklist?: string[];
  ownWords?: string;
  projectApplication?: string;
}

export interface LabSeed {
  slug: string;
  title: string;
  conceptSlug?: string;
  moduleSlug?: string;
  difficulty: Difficulty;
  labType: LabType;
  status?: LabStatus;
  description: string;
  scenario: string;
  requirements: string;
  starterCode?: string;
  expectedSolution?: string;
  hints?: string[];
  successCriteria?: string[];
  timeSpentMinutes?: number;
  confidenceBefore?: number;
  confidenceAfter?: number;
  notes?: string;
  notebook?: string;
  thingsGotWrong?: string;
  whatLearned?: string;
}

export interface CaseStudySeed {
  slug: string;
  title: string;
  domain: CaseStudyDomain;
  difficulty: Difficulty;
  status?: CaseStudyStatus;
  problemStatement: string;
  functionalRequirements?: string[];
  nonFunctionalRequirements?: string[];
  constraints?: string[];
  trafficAssumptions?: string;
  dataModel?: string;
  apiDesign?: string;
  architecture?: string;
  scalingStrategy?: string;
  reliabilityStrategy?: string;
  securityStrategy?: string;
  observabilityStrategy?: string;
  costConsiderations?: string;
  tradeoffs?: string;
  finalNotes?: string;
  reviewScores?: CaseStudyReviewScores;
}

export interface DiagramSeed {
  title: string;
  description: string;
  diagramType: DiagramType;
  mermaidCode: string;
  notes?: string;
  conceptSlug?: string;
  caseStudySlug?: string;
  projectSlug?: string;
}

export interface SnippetSeed {
  title: string;
  language: SnippetLanguage;
  category: SnippetCategory;
  code: string;
  explanation: string;
  useCase: string;
  conceptSlug?: string;
  labSlug?: string;
  tags?: string[];
}

export interface DecisionGuideSeed {
  slug: string;
  title: string;
  category: DecisionCategory;
  question: string;
  shortAnswer: string;
  options: DecisionOption[];
  comparisonCriteria?: string[];
  recommendationRules?: string;
  examples?: string;
  relatedConceptSlugs?: string[];
  relatedLabSlugs?: string[];
}

export interface ProjectSeed {
  slug: string;
  projectName: string;
  projectType: ProjectType;
  status?: ProjectStatus;
  description: string;
  currentArchitecture?: string;
  backendRisks?: string;
  conceptsUsedSlugs?: string[];
  conceptsToLearnSlugs?: string[];
  architectureNotes?: string;
  improvementIdeas?: string;
  nextBackendAction?: string;
  relatedDecisionGuideSlugs?: string[];
  relatedCaseStudySlug?: string;
}

export interface ReviewCardSeed {
  conceptSlug?: string;
  question: string;
  answer: string;
  difficulty?: ReviewDifficulty;
  confidence?: ReviewConfidence;
  /** Days from "now" the card is next due (negative = overdue). */
  dueInDays?: number;
  reviewCount?: number;
}

export interface LearningLogSeed {
  /** Days ago the entry was written. */
  daysAgo: number;
  title: string;
  summary: string;
  conceptsStudied?: string[];
  labsCompleted?: string[];
  timeSpentMinutes: number;
  confidenceChange?: number;
  blockers?: string;
  notes?: string;
  nextStep?: string;
}

export interface GlossarySeed {
  term: string;
  definition: string;
  category: ConceptCategory;
  example?: string;
  commonConfusion?: string;
  relatedConceptSlugs?: string[];
}
