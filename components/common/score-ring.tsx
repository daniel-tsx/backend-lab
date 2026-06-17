import { cn } from '@/lib/utils';

function scoreColor(value: number): string {
  if (value >= 75) return 'var(--chart-2)'; // teal
  if (value >= 50) return 'var(--chart-1)'; // violet
  if (value >= 30) return 'var(--chart-4)'; // amber
  return 'var(--destructive)';
}

export function ScoreRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  sublabel,
  className,
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: React.ReactNode;
  sublabel?: React.ReactNode;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color = scoreColor(clamped);

  return (
    <div
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular-nums">{clamped}</span>
        {label && (
          <span className="text-[11px] font-medium text-muted-foreground">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[10px] text-muted-foreground/70">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
