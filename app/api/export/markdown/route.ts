import { listCaseStudies, listConcepts, listDecisionGuides } from '@/db/queries';
import {
  caseStudyToMarkdown,
  conceptToMarkdown,
  decisionGuideToMarkdown,
  joinDocs,
} from '@/lib/export/markdown';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type') ?? 'concepts';

  let markdown = '';
  let name = type;

  if (type === 'concepts') {
    const rows = await listConcepts({ sort: 'title' });
    markdown = joinDocs(rows.map(conceptToMarkdown));
    name = 'concepts';
  } else if (type === 'decision-guides') {
    const rows = await listDecisionGuides();
    markdown = joinDocs(rows.map(decisionGuideToMarkdown));
    name = 'decision-guides';
  } else if (type === 'case-studies') {
    const rows = await listCaseStudies();
    markdown = joinDocs(rows.map(caseStudyToMarkdown));
    name = 'case-studies';
  } else {
    return new Response('Unknown export type', { status: 400 });
  }

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Content-Disposition': `attachment; filename="backend-lab-${name}.md"`,
    },
  });
}
