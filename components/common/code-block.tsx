import { CopyButton } from '@/components/common/copy-button';
import { cn } from '@/lib/utils';

/**
 * A snippet's `code` field may include Markdown fences; strip a single
 * surrounding ```lang ... ``` block so we render raw code cleanly.
 */
function stripFence(code: string): string {
  const match = code.match(/^```[\w-]*\n([\s\S]*?)\n```\s*$/);
  return match ? match[1] : code;
}

export function CodeBlock({
  code,
  language,
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const clean = stripFence(code);
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border/70', className)}>
      <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          {language ?? 'code'}
        </span>
        <CopyButton value={clean} />
      </div>
      <pre className="no-scrollbar overflow-x-auto bg-[oklch(0.13_0.012_264)] p-4">
        <code className="font-mono text-[13px] leading-relaxed text-foreground/90">
          {clean}
        </code>
      </pre>
    </div>
  );
}
