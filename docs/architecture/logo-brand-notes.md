# Logo & brand notes — "Backbone B"

> Status: **current**. Identity for Backend Architecture Lab. Last redesign replaced
> the generic database-cylinder mark with the engineered **Backbone B** monogram.

## The chosen direction

**Backbone B** — a hand-engineered capital **B** read as a backend system:

- the **spine** is a vertical *service backbone* (a data bus), terminated by two
  white **node points**;
- the two counters are **architecture-node loops** bound to that backbone;
- a single **teal "lab spark"** sits exactly on the **load-bearing junction**
  where the lower loop meets the spine — the one live/active node.

White linework + one teal accent on the owned **violet badge**. The letterform is
deliberately bottom-heavy (the lower loop is wider) so it reads as an *engineered*
B, not a font glyph in a box.

### Why it fits the product

Backend Lab is a **learning cockpit for backend architecture** — its core surfaces
are a node-edge concept map, architecture diagrams, and labs. The mark encodes that
literally: a backbone with nodes and a single *live* junction. It is technical,
precise and calm — the product's voice — and the teal junction ties to the "lab
spark" the rest of the UI already uses for experiment/active state. The metaphor is
"a system with one load-bearing, live node," which is exactly what the product
teaches you to find.

### Alternatives explored (and why they lost)

Five directions were designed and scored by three independent critics (brand,
technical/scalability, motion):

1. **Calibration Aperture** — an instrument gauge ring. Most *distinctive*
   silhouette and best animation, but its thin open ring **collapsed at 16px** to a
   "smile + dot" and misread as a power/standby glyph. Failed the favicon gate.
2. **Keystone** (isometric cube) — premium and confident, but the teal "live tier"
   was the first thing to crush at 16px.
3. **Signal Topology** (connected nodes) — the most domain-honest mark and cleanest
   at ≥32px, but it sits in the over-cloned "network mesh" category and its looping
   animation read as busy.
4. **Keystone Node** (wildcard graph keystone) — richest concept, weakest execution;
   intrinsic "cocktail-glass" misread.
5. **Backbone B** — **winner**: the only direction that cleared *both* hard gates —
   legible at 16px **and** strong as a static mark without any animation — while
   still supporting a calm, meaningful reveal.

Grafts carried into the winner: the teal accent is seated as a **structural junction
node** (from Aperture's "ownable off-axis accent" idea, made load-bearing), and a
named **favicon degradation order** (from Topology's discipline).

## The animation

A one-shot **"boot"** on mount — the system coming online:

1. the **spine plots** (`stroke-dashoffset`, ~0.5s),
2. the two **loops bind** to it (staggered ~0.2s / 0.32s),
3. the **terminal nodes** fade in,
4. the **teal junction goes live** — fades in with a single settle pulse
   (`transform: scale` 1 → 1.12 → 1).

Total ≈ 1.16s, then **fully static forever** (no loop) so it never makes the navbar
feel busy.

### Why it is lightweight & safe

- Only **GPU-compositable** properties animate: `stroke-dashoffset`, `opacity`,
  `transform: scale`. No filters, blur, gradients, JS, Lottie, canvas or GIF.
- **Paths use `pathLength="100"`** so the draw-on needs no measured lengths.
- All motion is gated behind `@media (prefers-reduced-motion: no-preference)`.
- The **base CSS is the final, fully-visible state**, so with reduced motion — or if
  the stylesheet never applies — the complete mark shows immediately. Nothing is
  ever permanently hidden (verified: resvg render with CSS disabled shows the whole
  mark; in-browser the animation provably converges to the full mark).
- No layout shift: the SVG box never changes; the reveal is one-shot per mount, so
  it does not replay on client-side route changes (the sidebar layout stays mounted).

## Files

### React components — `components/brand/`

| File | Export | Use |
| --- | --- | --- |
| `logo-mark.tsx` | `LogoMark` | **static** symbol — favicons-in-UI, dense/repeated contexts |
| `animated-logo-mark.tsx` | `AnimatedLogoMark` | **animated** symbol — header/navbar, hero, welcome |
| `logo.tsx` | `Logo` | full horizontal lockup (`animated?`, `size="md"\|"lg"`) |

### SVG exports — `public/`

| File | What |
| --- | --- |
| `logo-mark.svg` | static symbol (full geometry, with terminal nodes) |
| `logo-mark-animated.svg` | animated symbol (self-contained CSS) |
| `logo.svg` | full lockup, **dark** surface (white "Backend", violet "Lab") |
| `logo-light.svg` | full lockup, **light** surface (violet wordmark) |
| `logo-animated.svg` | animated full lockup (mark boots, wordmark rises) |
| `brand/icon-app.svg` | full-bleed app-icon master (apple-touch / PWA maskable) |

### App icons & metadata — `app/`

| File | What |
| --- | --- |
| `icon.svg` | **favicon master** — simplified B (no terminal dots, stroke 6), static |
| `favicon.ico` | 16/32/48/64 multi-size, generated from `icon.svg` |
| `apple-icon.png` | 180px, from `brand/icon-app.svg` |
| `opengraph-image.png` / `twitter-image.png` | 1200×630 social card (+ `.alt.txt`) |
| `manifest.ts` | PWA manifest (theme `#14161e`, icons 192/512) |
| `../public/icon-192.png`, `icon-512.png` | PWA / maskable icons |

Rasters are generated from the SVG sources by **`pnpm icons`**
(`scripts/generate-favicon.mjs`, via `@resvg/resvg-js` + `png-to-ico`). Edit the
source SVGs, then re-run.

A live preview lives at **`/brand`** (`app/brand/page.tsx`) — mark, lockup, favicon
feel, palette, and a "Replay intro" button. It is unlisted (not in the nav).

## Usage

**Animated** (`AnimatedLogoMark` / `Logo animated`): sidebar/header (wired into
`components/layout/sidebar-nav.tsx`), landing/hero, welcome or first-run screens.

**Static** (`LogoMark` / `Logo`): favicon & browser tab, app/home-screen icons, the
OG image, footers, repeated logo instances, dense dashboard UI, and anywhere
performance or visual calm matters. **Never animate the favicon.**

## Color & background

Exactly three hues, by meaning only:

| Element | Color |
| --- | --- |
| Badge | brand violet `#8b5cf6` (`--primary`) |
| Linework (spine, loops, terminals) | white `#ffffff` |
| Lab spark (junction node) | teal `#2dd4bf` — the single accent; **never** muted or recolored |

Wordmark: "Backend" foreground/white, "Lab" violet (`text-primary` / `#a78bfa`),
eyebrow in the mono face. The teal stays **in the mark only**, so the spark remains
the one ownable accent. On **light** backgrounds keep the violet badge as-is (white
+ teal already have full contrast on it) and set the wordmark in `#8b5cf6`. No
gradients, no glow.

## Performance & reduced motion

- The animation costs three short `stroke-dashoffset` draws, two `opacity` fades and
  one `transform: scale` — no continuous cost after ~1.16s.
- `prefers-reduced-motion: reduce` → final frame instantly, zero motion.
- Favicons/app icons are static frames; no animation bytes shipped there.

## Future ideas

- A subtle, *opt-in* hover spark traveling the spine in marketing/hero contexts only
  (kept out of the app chrome on purpose).
- A light theme for the app: the mark already has a `logo-light.svg`; wire a theme
  toggle and the lockup will follow.
- Animated OG (a short looping `apng`/video) if a public landing page is ever added —
  static PNG remains the default.
