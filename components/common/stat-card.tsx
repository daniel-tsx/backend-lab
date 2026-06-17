import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Tone } from '@/lib/labels';
import { toneBadgeClasses } from '@/lib/labels';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'violet',
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'panel flex flex-col gap-3 p-4 transition-colors hover:border-border',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {Icon && (
          <span
            className={cn(
              'grid size-7 place-items-center rounded-lg border',
              toneBadgeClasses[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
