'use client';

import { useState } from 'react';

import { Markdown } from '@/components/markdown/markdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write in Markdown…',
  rows = 10,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  const [tab, setTab] = useState('write');

  return (
    <Tabs value={tab} onValueChange={setTab} className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        <TabsList className="h-8">
          <TabsTrigger value="write" className="text-xs">
            Write
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            Preview
          </TabsTrigger>
        </TabsList>
        <span className="text-[11px] text-muted-foreground">
          Markdown · {value.length} chars
        </span>
      </div>
      <TabsContent value="write" className="mt-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="resize-y font-mono text-[13px] leading-relaxed"
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-2">
        <div className="min-h-[8rem] rounded-md border border-border/70 bg-card/50 p-4">
          <Markdown content={value} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
