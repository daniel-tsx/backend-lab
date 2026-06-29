'use client';

import { useState } from 'react';
import { RotateCw } from 'lucide-react';

import { AnimatedLogoMark } from '@/components/brand/animated-logo-mark';
import { Logo } from '@/components/brand/logo';
import { LogoMark } from '@/components/brand/logo-mark';
import { cn } from '@/lib/utils';

function Panel({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('panel overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/80">
          {label}
        </span>
        {hint && (
          <span className="text-[11px] text-muted-foreground/70">{hint}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

const swatches = [
  { name: 'Brand violet', token: '--primary', hex: '#8b5cf6', bg: '#8b5cf6', fg: '#ffffff' },
  { name: 'Lab spark teal', token: 'accent', hex: '#2dd4bf', bg: '#2dd4bf', fg: '#0b3b35' },
  { name: 'Cockpit navy', token: '--background', hex: '#14161e', bg: '#14161e', fg: '#c8ccd6' },
  { name: 'Linework white', token: 'foreground', hex: '#ffffff', bg: '#ffffff', fg: '#14161e' },
];

export default function BrandPage() {
  const [replay, setReplay] = useState(0);
  const k = (id: string) => `${id}-${replay}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Brand system
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Backend <span className="text-primary">Lab</span> identity
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            The Backbone B — an engineered monogram read as a backend system: a
            service backbone, two node-loops, and a live teal junction. Static
            everywhere; alive where it counts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReplay((n) => n + 1)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RotateCw className="size-3.5" />
          Replay intro
        </button>
      </div>

      {/* Hero lockup */}
      <Panel label="Primary lockup" hint="animated · one-shot on load">
        <div className="flex min-h-[200px] items-center justify-center">
          <Logo key={k('hero')} animated size="lg" />
        </div>
      </Panel>

      {/* Mark: animated vs static */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="Mark" hint="animated">
          <div className="flex min-h-[160px] items-center justify-center gap-8">
            <AnimatedLogoMark key={k('mark-a')} className="size-24" />
            <AnimatedLogoMark key={k('mark-b')} className="size-12" />
          </div>
        </Panel>
        <Panel label="Mark" hint="static — favicons, dense UI">
          <div className="flex min-h-[160px] items-center justify-center gap-8">
            <LogoMark className="size-24" />
            <LogoMark className="size-12" />
          </div>
        </Panel>
      </div>

      {/* Surfaces + favicon */}
      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="On light surface" hint="badge stays violet">
          <div className="flex min-h-[150px] items-center justify-center rounded-lg bg-white">
            <span className="inline-flex items-center gap-2.5">
              <LogoMark className="size-12" />
              <span className="flex flex-col leading-none">
                <span className="text-[17px] font-bold tracking-tight text-[#8b5cf6]">
                  Backend Lab
                </span>
                <span className="mt-1.5 font-mono text-[9.5px] font-medium uppercase tracking-[0.2em] text-[#6b7280]">
                  Architecture cockpit
                </span>
              </span>
            </span>
          </div>
        </Panel>
        <Panel label="Favicon" hint="static · 16 / 24 / 32 px">
          <div className="flex min-h-[150px] flex-col items-center justify-center gap-5">
            {/* faux browser tab */}
            <div className="flex w-56 items-center gap-2 rounded-t-lg border border-border bg-card px-3 py-2">
              <LogoMark className="size-4 shrink-0" />
              <span className="truncate text-xs text-muted-foreground">
                Backend Architecture Lab
              </span>
              <span className="ml-auto text-muted-foreground/50">×</span>
            </div>
            <div className="flex items-end gap-5">
              <LogoMark className="size-8" />
              <LogoMark className="size-6" />
              <LogoMark className="size-4" />
            </div>
          </div>
        </Panel>
      </div>

      {/* Palette */}
      <Panel label="Palette" hint="one hue + one accent">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {swatches.map((s) => (
            <div
              key={s.name}
              className="flex h-24 flex-col justify-between rounded-lg border border-border/60 p-3"
              style={{ background: s.bg, color: s.fg }}
            >
              <span className="text-xs font-medium">{s.name}</span>
              <span className="font-mono text-[11px] opacity-80">{s.hex}</span>
            </div>
          ))}
        </div>
      </Panel>

      <p className="px-1 text-xs text-muted-foreground/70">
        The reveal plays once per load and then holds. With{' '}
        <span className="font-mono text-muted-foreground">prefers-reduced-motion</span>{' '}
        the mark renders its final frame immediately — no motion, nothing hidden.
        Favicons and app icons are always static.
      </p>
    </div>
  );
}
