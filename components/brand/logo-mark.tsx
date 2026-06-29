/**
 * The Backend Lab brand mark — "Backbone B".
 *
 * A hand-engineered capital B read as a backend system: the spine is a vertical
 * service backbone (a data bus) terminated by two white node points, the two
 * counters are architecture-node loops bound to it, and a single teal "lab
 * spark" sits exactly on the load-bearing junction — the one live/active node.
 *
 * Static version. Mirrors public/logo-mark.svg. The favicon (app/icon.svg) uses
 * a simplified variant (no terminal dots, heavier stroke) tuned for 16px.
 * For the header/navbar, prefer <AnimatedLogoMark> for a one-shot reveal.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Backend Lab"
      className={className}
    >
      <rect x="3" y="3" width="58" height="58" rx="16" fill="#8b5cf6" />
      <g
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M19 15 V49" />
        <path d="M19 15 H32 a9.5 8.5 0 0 1 0 17 H19" />
        <path d="M19 32 H35 a9.5 8.5 0 0 1 0 17 H19" />
      </g>
      <g fill="#ffffff">
        <circle cx="19" cy="15" r="3.6" />
        <circle cx="19" cy="49" r="3.6" />
      </g>
      <circle cx="19" cy="32" r="4.6" fill="#2dd4bf" />
    </svg>
  );
}
