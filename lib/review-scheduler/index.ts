/**
 * Spaced-repetition scheduling — an SM-2 variant tuned for self-review.
 *
 * The user grades a card with one of four buttons; the grade maps to an SM-2
 * "quality" score that drives the next interval and ease factor.
 */
import { addDays, addMinutes, isAfter } from 'date-fns';

import type { ReviewCard, ReviewConfidence, ReviewGrade } from '@/types';

const GRADE_QUALITY: Record<ReviewGrade, number> = {
  forgot: 0,
  shaky: 3,
  good: 4,
  easy: 5,
};

export const reviewGradeLabels: Record<ReviewGrade, string> = {
  forgot: 'Forgot',
  shaky: 'Shaky',
  good: 'Good',
  easy: 'Easy',
};

export interface SchedulingUpdate {
  intervalDays: number;
  easeFactor: number;
  reviewCount: number;
  nextReviewAt: Date;
  lastReviewedAt: Date;
  confidence: ReviewConfidence;
}

type SchedulingState = Pick<
  ReviewCard,
  'intervalDays' | 'easeFactor' | 'reviewCount'
>;

/** Compute the next scheduling state for a card after a grade. */
export function scheduleNext(
  card: SchedulingState,
  grade: ReviewGrade,
  now: Date = new Date(),
): SchedulingUpdate {
  const quality = GRADE_QUALITY[grade];
  let ease = card.easeFactor ?? 2.5;
  let interval = card.intervalDays ?? 0;
  let reviewCount = card.reviewCount ?? 0;

  if (quality < 3) {
    // Lapse: relearn from the start, but ding the ease factor.
    reviewCount = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else {
    reviewCount += 1;
    if (reviewCount === 1) {
      interval = 1;
    } else if (reviewCount === 2) {
      interval = quality === 5 ? 6 : 3;
    } else {
      interval = Math.max(1, Math.round(interval * ease));
    }
    // SM-2 ease adjustment.
    ease = Math.max(
      1.3,
      ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
  }

  const nextReviewAt =
    interval <= 0 ? addMinutes(now, 10) : addDays(now, interval);

  const confidence: ReviewConfidence =
    quality >= 4 ? 'high' : quality === 3 ? 'medium' : 'low';

  return {
    intervalDays: interval,
    easeFactor: Number(ease.toFixed(2)),
    reviewCount,
    nextReviewAt,
    lastReviewedAt: now,
    confidence,
  };
}

export function isDue(
  card: Pick<ReviewCard, 'status' | 'nextReviewAt'>,
  now: Date = new Date(),
): boolean {
  if (card.status !== 'active') return false;
  return !isAfter(new Date(card.nextReviewAt), now);
}

export function dueCards<T extends Pick<ReviewCard, 'status' | 'nextReviewAt'>>(
  cards: T[],
  now: Date = new Date(),
): T[] {
  return cards.filter((card) => isDue(card, now));
}

/** Defaults for a freshly created card — due immediately. */
export function initialSchedule(now: Date = new Date()) {
  return {
    intervalDays: 0,
    easeFactor: 2.5,
    reviewCount: 0,
    nextReviewAt: now,
  };
}
