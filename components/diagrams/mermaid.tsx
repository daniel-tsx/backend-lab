'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { cn } from '@/lib/utils';

let initialized = false;

function initMermaid() {
  if (initialized || typeof window === 'undefined') return;
  // Imported lazily so mermaid (a large dep) stays out of the initial bundle.
  void import('mermaid').then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      securityLevel: 'loose',
      fontFamily: 'var(--font-sans), ui-sans-serif',
      themeVariables: {
        background: 'transparent',
        primaryColor: '#241f3d',
        primaryTextColor: '#e7e7f2',
        primaryBorderColor: '#7c6df2',
        lineColor: '#8b8ba7',
        secondaryColor: '#1c2333',
        tertiaryColor: '#15161f',
        mainBkg: '#241f3d',
        clusterBkg: '#16182198',
        clusterBorder: '#3a3a52',
        nodeBorder: '#7c6df2',
        titleColor: '#e7e7f2',
        edgeLabelBackground: '#1c2333',
        fontSize: '14px',
      },
    });
    initialized = true;
  });
}

export function Mermaid({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const reactId = useId().replace(/[:]/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    initMermaid();

    async function render() {
      if (!code.trim()) {
        if (ref.current) ref.current.innerHTML = '';
        setError(null);
        return;
      }
      try {
        const { default: mermaid } = await import('mermaid');
        // Ensure init ran before first render.
        if (!initialized) initMermaid();
        const { svg, bindFunctions } = await mermaid.render(
          `mermaid-${reactId}`,
          code,
        );
        if (!active || !ref.current) return;
        ref.current.innerHTML = svg;
        bindFunctions?.(ref.current);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : 'Could not render diagram');
      }
    }

    void render();
    return () => {
      active = false;
    };
  }, [code, reactId]);

  if (error) {
    return (
      <div className={cn('rounded-lg border border-amber-500/30 bg-amber-500/5 p-4', className)}>
        <div className="flex items-center gap-2 text-sm font-medium text-amber-300">
          <AlertTriangle className="size-4" />
          Diagram error
        </div>
        <p className="mt-1 text-xs text-amber-200/70">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        '[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full flex justify-center overflow-x-auto',
        className,
      )}
    />
  );
}
