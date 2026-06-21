/**
 * The Backend Lab brand mark — a backend "data stack" with a teal lab spark.
 * Mirrors public/logo-mark.svg and app/icon.svg (the favicon source).
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
      <g fill="#ffffff">
        <ellipse cx="31" cy="22" rx="14" ry="4.8" />
        <path d="M17 22 L17 42 A14 4.8 0 0 0 45 42 L45 22 A14 4.8 0 0 1 17 22 Z" />
      </g>
      <g stroke="#8b5cf6" strokeWidth="2.4" fill="none" strokeLinecap="round">
        <path d="M17 31.5 A14 4.8 0 0 0 45 31.5" />
        <path d="M17 41 A14 4.8 0 0 0 45 41" />
      </g>
      <circle cx="47" cy="16" r="6.5" fill="#2dd4bf" stroke="#8b5cf6" strokeWidth="2.5" />
    </svg>
  );
}
