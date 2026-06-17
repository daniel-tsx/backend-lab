import {
  caseStudyDomainLabels,
  conceptCategoryLabels,
  decisionCategoryLabels,
  difficultyLabels,
} from '@/lib/labels';
import type { CaseStudy, Concept, DecisionGuide } from '@/types';

function list(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join('\n') : '_None_';
}

function section(title: string, body: string): string {
  return body.trim() ? `## ${title}\n\n${body.trim()}\n` : '';
}

export function conceptToMarkdown(c: Concept): string {
  return [
    `# ${c.title}`,
    c.summary ? `> ${c.summary}` : '',
    `**Category:** ${conceptCategoryLabels[c.category]} · **Difficulty:** ${difficultyLabels[c.difficulty]} · **Status:** ${c.status}`,
    section('Mental model', c.mentalModel),
    section('How it works', c.howItWorks),
    section('When to use', c.whenToUse),
    section('When not to use', c.whenNotToUse),
    section('Trade-offs', c.tradeoffs),
    section('Common mistakes', c.commonMistakes),
    section('Real-world examples', c.realWorldExamples),
    c.tags.length ? `**Tags:** ${c.tags.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function decisionGuideToMarkdown(g: DecisionGuide): string {
  const options = g.options
    .map(
      (o) =>
        `### ${o.name}\n\n${o.description}\n\n- **Choose when:** ${o.whenToChoose}\n- **Trade-offs:** ${o.tradeoffs}\n- **Failure modes:** ${o.failureModes}`,
    )
    .join('\n\n');
  return [
    `# ${g.title}`,
    `**Category:** ${decisionCategoryLabels[g.category]}`,
    g.question ? `**Question:** ${g.question}` : '',
    g.shortAnswer ? `> ${g.shortAnswer}` : '',
    options ? `## Options\n\n${options}` : '',
    g.comparisonCriteria.length ? `## Compare on\n\n${list(g.comparisonCriteria)}` : '',
    section('How to decide', g.recommendationRules),
    section('Examples', g.examples),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function caseStudyToMarkdown(c: CaseStudy): string {
  return [
    `# ${c.title}`,
    `**Domain:** ${caseStudyDomainLabels[c.domain]} · **Difficulty:** ${difficultyLabels[c.difficulty]} · **Status:** ${c.status}`,
    section('Problem', c.problemStatement),
    `## Requirements\n\n**Functional**\n\n${list(c.functionalRequirements)}\n\n**Non-functional**\n\n${list(c.nonFunctionalRequirements)}\n\n**Constraints**\n\n${list(c.constraints)}`,
    section('Back-of-the-envelope', c.trafficAssumptions),
    section('Data model', c.dataModel),
    section('API design', c.apiDesign),
    section('Architecture', c.architecture),
    section('Scaling', c.scalingStrategy),
    section('Reliability', c.reliabilityStrategy),
    section('Security', c.securityStrategy),
    section('Observability', c.observabilityStrategy),
    section('Cost', c.costConsiderations),
    section('Trade-offs', c.tradeoffs),
    section('Final review', c.finalNotes),
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function joinDocs(docs: string[]): string {
  return docs.join('\n\n---\n\n');
}
