'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { gradeReviewCardAction } from '@/app/reviews/actions';
import { Button } from '@/components/ui/button';
import { reviewGradeLabels } from '@/lib/review-scheduler';
import { cn } from '@/lib/utils';
import { reviewGrades, type ReviewGrade } from '@/types/enums';
import type { ReviewCardWithRelations } from '@/db/queries';

const gradeTone: Record<ReviewGrade, string> = {
  forgot: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border-rose-500/30',
  shaky: 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border-amber-500/30',
  good: 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 border-blue-500/30',
  easy: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border-emerald-500/30',
};

export function ReviewSession({ cards }: { cards: ReviewCardWithRelations[] }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [pending, startTransition] = useTransition();

  if (cards.length === 0) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-base font-semibold">All caught up</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          No cards are due right now. Come back later, or create a new review card.
        </p>
      </div>
    );
  }

  if (index >= cards.length) {
    return (
      <div className="panel flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="text-base font-semibold">Session complete</p>
        <p className="text-sm text-muted-foreground">You reviewed {cards.length} cards. Nice work.</p>
        <Button variant="outline" onClick={() => router.refresh()}>
          Check for more
        </Button>
      </div>
    );
  }

  const card = cards[index];

  function grade(g: ReviewGrade) {
    startTransition(async () => {
      const res = await gradeReviewCardAction(card.id, g);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setRevealed(false);
      setIndex((i) => i + 1);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        {card.concept && (
          <Link href={`/concepts/${card.concept.slug}`} className="text-primary hover:underline">
            {card.concept.title}
          </Link>
        )}
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70 transition-all"
          style={{ width: `${(index / cards.length) * 100}%` }}
        />
      </div>

      <div className="panel min-h-[16rem] p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Question</p>
        <p className="mt-2 text-lg font-medium">{card.question}</p>

        {revealed ? (
          <div className="mt-6 border-t border-border/70 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Answer</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{card.answer}</p>
            {card.note && <p className="mt-3 text-xs text-muted-foreground">Note: {card.note}</p>}
          </div>
        ) : (
          <Button variant="outline" className="mt-6 gap-1.5" onClick={() => setRevealed(true)}>
            <Eye className="size-4" />
            Show answer
          </Button>
        )}
      </div>

      {revealed && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {reviewGrades.map((g) => (
            <button
              key={g}
              type="button"
              disabled={pending}
              onClick={() => grade(g)}
              className={cn(
                'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50',
                gradeTone[g],
              )}
            >
              {reviewGradeLabels[g]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
