/**
 * Animated Backend Lab mark — a calm, one-shot "boot" of the Backbone B.
 *
 * On mount: the spine plots first, the two node-loops bind to it (staggered),
 * the terminal nodes appear, then the teal junction node goes live with a single
 * settle pulse — "the system coming online". It plays once and then stays static
 * forever (no loop), so it never makes the navbar feel busy.
 *
 * Motion is gated behind `prefers-reduced-motion: no-preference`. With motion
 * reduced — or if the stylesheet never applies — every element renders at its
 * final, fully-visible state (the base rules below), so the complete mark is
 * always shown; nothing is ever permanently hidden. Only stroke-dashoffset,
 * opacity and transform animate (all GPU-compositable, no filters/blur).
 *
 * Use this in high-visibility brand spots (header/navbar, hero, welcome). For
 * favicons, dense or repeated UI, prefer the static <LogoMark>.
 */

// Scoped to .bl-* classes; safe to include more than once on a page.
const MARK_ANIM_CSS = `
.bl-mark .bl-spine,.bl-mark .bl-bowl-t,.bl-mark .bl-bowl-b{stroke-dashoffset:0}
.bl-mark .bl-term,.bl-mark .bl-spark{opacity:1}
@keyframes bl-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}
@keyframes bl-fade{from{opacity:0}to{opacity:1}}
@keyframes bl-spark-in{0%{opacity:0;transform:scale(.6)}60%{opacity:1;transform:scale(1.12)}100%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion: no-preference){
  .bl-mark .bl-spine,.bl-mark .bl-bowl-t,.bl-mark .bl-bowl-b{
    stroke-dasharray:100;animation:bl-draw .5s cubic-bezier(.22,.61,.36,1) both}
  .bl-mark .bl-bowl-t{animation-delay:.2s;animation-duration:.46s}
  .bl-mark .bl-bowl-b{animation-delay:.32s;animation-duration:.46s}
  .bl-mark .bl-term{opacity:0;animation:bl-fade .18s ease .64s forwards}
  .bl-mark .bl-spark{opacity:0;transform-box:fill-box;transform-origin:center;
    animation:bl-spark-in .42s ease .76s forwards}
}`;

export function AnimatedLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Backend Lab"
      className={`bl-mark ${className ?? ""}`}
    >
      <style>{MARK_ANIM_CSS}</style>
      <rect x="3" y="3" width="58" height="58" rx="16" fill="#8b5cf6" />
      <g
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path className="bl-spine" pathLength="100" d="M19 15 V49" />
        <path className="bl-bowl-t" pathLength="100" d="M19 15 H32 a9.5 8.5 0 0 1 0 17 H19" />
        <path className="bl-bowl-b" pathLength="100" d="M19 32 H35 a9.5 8.5 0 0 1 0 17 H19" />
      </g>
      <g className="bl-term" fill="#ffffff">
        <circle cx="19" cy="15" r="3.6" />
        <circle cx="19" cy="49" r="3.6" />
      </g>
      <circle className="bl-spark" cx="19" cy="32" r="4.6" fill="#2dd4bf" />
    </svg>
  );
}
