import { AnimatedLogoMark } from "@/components/brand/animated-logo-mark";
import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/utils";

/**
 * The full Backend Lab horizontal lockup: the Backbone B mark + the wordmark
 * ("Backend" in the foreground, "Lab" in the brand violet) over the
 * "Architecture cockpit" eyebrow set in the mono/data face.
 *
 * Pass `animated` to use the one-shot <AnimatedLogoMark> (header/hero); omit it
 * for a static mark (footers, dense or repeated contexts). Uses the app's Geist
 * fonts and design-system tokens, so it tracks the active theme.
 */
const SIZES = {
  md: { mark: "size-9", gap: "gap-2.5", word: "text-[17px]", eyebrow: "mt-1.5 text-[9.5px] tracking-[0.2em]" },
  lg: { mark: "size-14", gap: "gap-4", word: "text-[28px]", eyebrow: "mt-2 text-[11px] tracking-[0.22em]" },
} as const;

export function Logo({
  animated = false,
  size = "md",
  className,
  markClassName,
}: {
  animated?: boolean;
  size?: keyof typeof SIZES;
  className?: string;
  markClassName?: string;
}) {
  const Mark = animated ? AnimatedLogoMark : LogoMark;
  const s = SIZES[size];
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <Mark className={cn(s.mark, "shrink-0", markClassName)} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight", s.word)}>
          Backend <span className="text-primary">Lab</span>
        </span>
        <span
          className={cn(
            "font-mono font-medium uppercase text-muted-foreground",
            s.eyebrow,
          )}
        >
          Architecture cockpit
        </span>
      </span>
    </span>
  );
}
