import Link from 'next/link';
import { Brain, GraduationCap, Pencil, Plus, Target } from 'lucide-react';

import { ReviewConfidenceBadge, ToneBadge } from '@/components/common/badges';
import { DeleteButton } from '@/components/common/delete-button';
import { PageHeader } from '@/components/common/page-header';
import { SectionCard } from '@/components/common/section-card';
import { StatCard } from '@/components/common/stat-card';
import { StatusMenu } from '@/components/common/status-menu';
import { ReviewSession } from '@/components/reviews/review-session';
import { Button } from '@/components/ui/button';
import { reviewStatusOptions } from '@/components/forms/options';
import {
  getScoringData,
  listDueReviewCards,
  listReviewCards,
  recentlyCompletedLessons,
} from '@/db/queries';
import { conceptCategoryLabels } from '@/lib/labels';
import { weaknessByCategory } from '@/lib/scoring';

import { deleteReviewCardAction, setReviewCardStatusAction } from './actions';

export const metadata = { title: 'Review Center' };

export default async function ReviewsPage() {
  const [due, all, scoringData, recentLessons] = await Promise.all([
    listDueReviewCards(),
    listReviewCards(),
    getScoringData(),
    recentlyCompletedLessons(5),
  ]);

  const active = all.filter((c) => c.status === 'active');
  const mastered = all.filter((c) => c.status === 'mastered');
  const weakness = weaknessByCategory(scoringData).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Center"
        description="Spaced repetition to keep backend knowledge from fading."
        actions={
          <Button render={<Link href="/reviews/new" />} className="gap-1.5">
            <Plus className="size-4" />
            New card
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Due today" value={due.length} icon={Target} tone="rose" />
        <StatCard label="Active cards" value={active.length} icon={Brain} tone="violet" />
        <StatCard label="Mastered" value={mastered.length} icon={GraduationCap} tone="emerald" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Today&apos;s review</h2>
          <ReviewSession cards={due} />
        </div>
        <div className="space-y-4">
          <SectionCard title="Weak areas" icon={Target}>
            {weakness.length > 0 ? (
              <ul className="space-y-2">
                {weakness.map((w) => (
                  <li key={w.category}>
                    <Link href={`/concepts?category=${w.category}`} className="group flex items-center justify-between gap-2 text-sm">
                      <span className="group-hover:text-primary">{conceptCategoryLabels[w.category]}</span>
                      <ToneBadge tone={w.weakness > 60 ? 'rose' : w.weakness > 35 ? 'amber' : 'slate'}>
                        {w.weakness}
                      </ToneBadge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </SectionCard>
          <SectionCard title="Recently completed lessons" icon={GraduationCap}>
            {recentLessons.length > 0 ? (
              <ul className="space-y-1.5">
                {recentLessons.map((l) => (
                  <li key={l.id}>
                    <Link href={`/lessons/${l.slug}`} className="text-sm hover:text-primary">
                      {l.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">None yet.</p>
            )}
          </SectionCard>
        </div>
      </div>

      <SectionCard title={`All cards · ${all.length}`}>
        {all.length > 0 ? (
          <ul className="divide-y divide-border/60">
            {all.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm">{c.question}</p>
                  {c.concept && (
                    <Link href={`/concepts/${c.concept.slug}`} className="text-xs text-muted-foreground hover:text-primary">
                      {c.concept.title}
                    </Link>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <ReviewConfidenceBadge confidence={c.confidence} />
                  <StatusMenu
                    trigger={<ToneBadge tone="slate">{c.status}</ToneBadge>}
                    options={reviewStatusOptions}
                    onSelect={setReviewCardStatusAction.bind(null, c.id)}
                  />
                  <Button variant="ghost" size="icon-sm" render={<Link href={`/reviews/${c.id}/edit`} />} aria-label="Edit">
                    <Pencil className="size-4" />
                  </Button>
                  <DeleteButton action={deleteReviewCardAction.bind(null, c.id)} entity="card" iconOnly />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No review cards yet. Create your first.</p>
        )}
      </SectionCard>
    </div>
  );
}
