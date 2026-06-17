import type { ConceptStatus } from '@/types/enums';
import type { Concept } from '@/types';

const statusClass: Record<ConceptStatus, string> = {
  'not-started': 'notStarted',
  reading: 'reading',
  practicing: 'practicing',
  understood: 'understood',
  'needs-review': 'needsReview',
  mastered: 'mastered',
};

const classDefs = [
  'classDef notStarted fill:#64748b22,stroke:#64748b,color:#e7e7f2;',
  'classDef reading fill:#38bdf822,stroke:#38bdf8,color:#e7e7f2;',
  'classDef practicing fill:#60a5fa22,stroke:#60a5fa,color:#e7e7f2;',
  'classDef understood fill:#2dd4bf22,stroke:#2dd4bf,color:#e7e7f2;',
  'classDef needsReview fill:#fbbf2422,stroke:#fbbf24,color:#e7e7f2;',
  'classDef mastered fill:#34d39922,stroke:#34d399,color:#e7e7f2;',
];

/**
 * Build a Mermaid `graph LR` of prerequisite relationships among the given
 * concepts. Nodes are colored by learning status and link to their detail page.
 */
export function buildConceptGraph(
  concepts: Concept[],
  { includeRelated = false }: { includeRelated?: boolean } = {},
): string {
  if (concepts.length === 0) return '';
  const idOf = new Map(concepts.map((c, i) => [c.id, `n${i}`]));
  const clean = (s: string) => s.replace(/["\n]/g, ' ').trim();
  const lines: string[] = ['graph LR'];

  concepts.forEach((c, i) => lines.push(`  n${i}["${clean(c.title)}"]`));

  for (const c of concepts) {
    for (const pid of c.prerequisiteConceptIds) {
      if (idOf.has(pid)) lines.push(`  ${idOf.get(pid)} --> ${idOf.get(c.id)}`);
    }
  }

  if (includeRelated) {
    const seen = new Set<string>();
    for (const c of concepts) {
      for (const rid of c.relatedConceptIds) {
        if (!idOf.has(rid)) continue;
        const a = idOf.get(c.id)!;
        const b = idOf.get(rid)!;
        const key = [a, b].sort().join('-');
        if (!seen.has(key)) {
          seen.add(key);
          lines.push(`  ${a} -.- ${b}`);
        }
      }
    }
  }

  concepts.forEach((c, i) => lines.push(`  class n${i} ${statusClass[c.status]}`));
  classDefs.forEach((d) => lines.push(`  ${d}`));
  concepts.forEach((c, i) => lines.push(`  click n${i} "/concepts/${c.slug}"`));

  return lines.join('\n');
}

export const conceptStatusLegend: { status: ConceptStatus; color: string }[] = [
  { status: 'not-started', color: '#64748b' },
  { status: 'reading', color: '#38bdf8' },
  { status: 'practicing', color: '#60a5fa' },
  { status: 'understood', color: '#2dd4bf' },
  { status: 'needs-review', color: '#fbbf24' },
  { status: 'mastered', color: '#34d399' },
];
