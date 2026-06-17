import Link from 'next/link';
import { Database, FileText, Route, ShieldCheck } from 'lucide-react';

import { ToneBadge } from '@/components/common/badges';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { DataManagement } from '@/components/settings/data-management';
import { Button } from '@/components/ui/button';
import { conceptCategoryLabels } from '@/lib/labels';
import { conceptCategories } from '@/types/enums';

export const metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        description="Back up, restore, and export your lab — and see what's wired for the future."
      />

      <SectionCard
        title="Data"
        description="Everything lives in your PostgreSQL database. Back it up as JSON, restore it, or reset to the original seed."
        icon={Database}
      >
        <DataManagement />
      </SectionCard>

      <SectionCard
        title="Export to Markdown"
        description="Export your knowledge as portable Markdown documents."
        icon={FileText}
      >
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" render={<a href="/api/export/markdown?type=concepts" download />}>
            Concepts
          </Button>
          <Button variant="outline" render={<a href="/api/export/markdown?type=decision-guides" download />}>
            Decision guides
          </Button>
          <Button variant="outline" render={<a href="/api/export/markdown?type=case-studies" download />}>
            System design cases
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        title="Taxonomy & paths"
        description="Categories are defined in code (types/enums.ts) so changes never need a migration. Learning paths are editable."
        icon={Route}
      >
        <div className="mb-4 flex flex-wrap gap-1.5">
          {conceptCategories.map((c) => (
            <ToneBadge key={c} tone="slate">
              {conceptCategoryLabels[c]}
            </ToneBadge>
          ))}
        </div>
        <Button variant="outline" size="sm" render={<Link href="/modules" />}>
          Manage learning paths
        </Button>
      </SectionCard>

      <SectionCard
        title="Scoring weights"
        description="How the dashboard scores are computed (lib/scoring)."
      >
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground/90">Learning Progress</span> — concept mastery 40%,
            lessons 25%, labs 20%, review retention 15%.
          </li>
          <li>
            <span className="text-foreground/90">Backend Confidence</span> — concept confidence 35%,
            lab confidence 25%, real-project application 20%, review performance 20%.
          </li>
          <li>
            <span className="text-foreground/90">System Design Readiness</span> — case studies 35%,
            diagram practice 20%, decision guides 15%, category coverage 30%.
          </li>
        </ul>
      </SectionCard>

      <SectionCard title="Built to extend" icon={ShieldCheck}>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>
            <span className="text-foreground/90">BetterAuth</span> — all data access is funneled
            through <code className="rounded bg-muted px-1 py-0.5 text-xs">db/queries</code> and
            server actions, so adding a <code className="rounded bg-muted px-1 py-0.5 text-xs">userId</code>{' '}
            column + session checks is additive.
          </li>
          <li>
            <span className="text-foreground/90">AI explanations</span> — concept fields are
            structured (mental model, how it works, trade-offs…) so a future generator can fill them
            without schema changes.
          </li>
        </ul>
      </SectionCard>
    </div>
  );
}
