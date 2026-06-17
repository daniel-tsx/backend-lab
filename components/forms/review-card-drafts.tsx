'use client';

import { Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface ReviewDraft {
  question: string;
  answer: string;
}

/** Inline editor for drafting review cards inside a completion flow. */
export function ReviewCardDrafts({
  value,
  onChange,
}: {
  value: ReviewDraft[];
  onChange: (drafts: ReviewDraft[]) => void;
}) {
  const update = (i: number, patch: Partial<ReviewDraft>) =>
    onChange(value.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, { question: '', answer: '' }]);

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          None yet. Add a card or two to lock in what you learned.
        </p>
      )}
      {value.map((d, i) => (
        <div key={i} className="space-y-2 rounded-lg border border-border/70 p-3">
          <div className="flex items-center gap-2">
            <Input
              value={d.question}
              placeholder="Question / prompt"
              onChange={(e) => update(i, { question: e.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => remove(i)}
              aria-label="Remove card"
            >
              <X className="size-4" />
            </Button>
          </div>
          <Input
            value={d.answer}
            placeholder="Answer (optional)"
            onChange={(e) => update(i, { answer: e.target.value })}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={add}>
        <Plus className="size-4" />
        Add review card
      </Button>
    </div>
  );
}
