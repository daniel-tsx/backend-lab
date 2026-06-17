'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-6 mb-3 text-xl font-semibold tracking-tight first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-6 mb-2.5 text-lg font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-5 mb-2 text-base font-semibold first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-3 leading-relaxed text-foreground/90 first:mt-0 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-3 ml-5 list-disc space-y-1.5 marker:text-muted-foreground/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-5 list-decimal space-y-1.5 marker:text-muted-foreground/60">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-relaxed text-foreground/90">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="font-medium text-primary underline-offset-4 hover:underline"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel="noreferrer"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-primary/50 pl-4 text-foreground/80 italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border/70" />,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    if (isBlock) {
      return (
        <code className="font-mono text-[13px] leading-relaxed">{children}</code>
      );
    }
    return (
      <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-lg border border-border/70 bg-[oklch(0.13_0.012_264)] p-4 text-[13px]">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border/70">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border/70 px-3 py-2 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border/40 px-3 py-2 align-top text-foreground/90">
      {children}
    </td>
  ),
};

export function Markdown({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  if (!content?.trim()) {
    return (
      <p className={cn('text-sm text-muted-foreground italic', className)}>
        Nothing written yet.
      </p>
    );
  }
  return (
    <div className={cn('text-sm', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
