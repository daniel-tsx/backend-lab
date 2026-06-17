'use client';

import { Mermaid } from '@/components/diagrams/mermaid';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function MermaidEditor({
  value,
  onChange,
  rows = 16,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 lg:grid-cols-2', className)}>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Mermaid source</p>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          spellCheck={false}
          placeholder={'graph TD\n  A[Client] --> B[API]\n  B --> C[(Database)]'}
          className="resize-y font-mono text-[13px] leading-relaxed"
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Live preview</p>
        <div className="min-h-[12rem] rounded-md border border-border/70 bg-card/50 p-4">
          {value.trim() ? (
            <Mermaid code={value} />
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Diagram preview appears here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
