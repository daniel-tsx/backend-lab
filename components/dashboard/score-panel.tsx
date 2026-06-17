import type { LucideIcon } from 'lucide-react';

import { ScoreRing } from '@/components/common/score-ring';
import { cn } from '@/lib/utils';
import type { ScoreBreakdown } from '@/lib/scoring';

export function ScorePanel({
  title,
  subtitle,
  breakdown,
  icon: Icon,
  className,
}: {
  title: string;
  subtitle?: string;
  breakdown: ScoreBreakdown;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn('panel flex flex-col gap-4 p-5', className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            {Icon && <Icon className="size-4 text-primary" />}
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-5">
        <ScoreRing value={breakdown.score} size={104} label="/ 100" />
        <ul className="flex-1 space-y-2">
          {breakdown.parts.map((part) => (
            <li key={part.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{part.label}</span>
                <span className="tabular-nums">{Math.round(part.value)}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70"
                  style={{ width: `${Math.max(2, Math.min(100, part.value))}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
