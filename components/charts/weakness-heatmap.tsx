import Link from 'next/link';

import { conceptCategoryLabels } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { CategoryWeakness } from '@/lib/scoring';

export function WeaknessHeatmap({ items }: { items: CategoryWeakness[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No weak areas detected yet — add concepts to see your heatmap.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.category}
          href={`/concepts?category=${item.category}`}
          className="group rounded-lg border border-border/70 p-3 transition-colors hover:border-border"
          style={{
            backgroundColor: `color-mix(in oklch, var(--destructive) ${Math.round(
              item.weakness * 0.5,
            )}%, transparent)`,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium">
              {conceptCategoryLabels[item.category]}
            </span>
            <span className="text-xs font-semibold tabular-nums text-foreground/90">
              {item.weakness}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground">
            {item.notStarted} not started · {item.labsCompleted} labs
          </div>
        </Link>
      ))}
    </div>
  );
}

export function ChartLegend({
  items,
  className,
}: {
  items: { label: string; color: string; value?: React.ReactNode }[];
  className?: string;
}) {
  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-xs">
          <span
            className="size-2.5 rounded-[3px]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-muted-foreground">{item.label}</span>
          {item.value !== undefined && (
            <span className="font-medium tabular-nums">{item.value}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
