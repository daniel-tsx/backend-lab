/**
 * Render the Backend Lab brand SVGs into the raster assets the app ships.
 *
 * Sources (edit these, then re-run):
 *   app/icon.svg              — favicon master (rounded badge, simplified B)
 *   public/brand/icon-app.svg — full-bleed app-icon master (apple + PWA maskable)
 *   public/logo.svg           — horizontal lockup (used for the OG composition)
 *
 * Outputs:
 *   app/favicon.ico        — multi-size ICO (16/32/48/64) for browser tabs & OS
 *   app/apple-icon.png     — 180px apple-touch icon
 *   public/icon-192.png    — PWA / manifest icon
 *   public/icon-512.png    — PWA / manifest icon (maskable-safe)
 *   app/opengraph-image.png — 1200x630 social card
 *   app/twitter-image.png   — 1200x630 social card (same art)
 *
 * Run: pnpm icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const png = (svg, size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

// --- Favicon (rounded badge, simplified for tiny sizes) -----------------------
const faviconSvg = read('app/icon.svg');
const ico = await pngToIco([16, 32, 48, 64].map((s) => png(faviconSvg, s)));
writeFileSync(join(root, 'app/favicon.ico'), ico);

// --- App icons (full-bleed so iOS/Android corner masking looks intentional) ---
const appSvg = read('public/brand/icon-app.svg');
writeFileSync(join(root, 'app/apple-icon.png'), png(appSvg, 180));
writeFileSync(join(root, 'public/icon-192.png'), png(appSvg, 192));
writeFileSync(join(root, 'public/icon-512.png'), png(appSvg, 512));

// --- Open Graph / Twitter card (1200x630) -------------------------------------
// Dark cockpit field + hairline blueprint grid (atmosphere, not gradient),
// the mark, the wordmark, and a one-line descriptor.
const grid = () => {
  let lines = '';
  for (let x = 0; x <= 1200; x += 60) lines += `<line x1="${x}" y1="0" x2="${x}" y2="630"/>`;
  for (let y = 0; y <= 630; y += 60) lines += `<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`;
  return `<g stroke="#ffffff" stroke-opacity="0.035" stroke-width="1">${lines}</g>`;
};

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#14161e"/>
  ${grid()}
  <g transform="translate(110,232) scale(2.6)">
    <rect x="3" y="3" width="58" height="58" rx="16" fill="#8b5cf6"/>
    <g stroke="#ffffff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M19 15 V49"/>
      <path d="M19 15 H32 a9.5 8.5 0 0 1 0 17 H19"/>
      <path d="M19 32 H35 a9.5 8.5 0 0 1 0 17 H19"/>
    </g>
    <g fill="#ffffff"><circle cx="19" cy="15" r="3.6"/><circle cx="19" cy="49" r="3.6"/></g>
    <circle cx="19" cy="32" r="4.6" fill="#2dd4bf"/>
  </g>
  <text x="338" y="332" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="84" font-weight="800" letter-spacing="-2">
    <tspan fill="#ffffff">Backend </tspan><tspan fill="#a78bfa">Lab</tspan>
  </text>
  <text x="341" y="378" font-family="ui-monospace, 'Geist Mono', SFMono-Regular, Menlo, monospace" font-size="22" font-weight="600" letter-spacing="6" fill="#8b8f9e">ARCHITECTURE COCKPIT</text>
  <line x1="110" y1="446" x2="158" y2="446" stroke="#2dd4bf" stroke-width="4" stroke-linecap="round"/>
  <text x="110" y="494" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="30" font-weight="500" fill="#c8ccd6">Understand backend concepts deeply — how they work,</text>
  <text x="110" y="494" dy="42" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="30" font-weight="500" fill="#c8ccd6">when to use them, and how they map to real systems.</text>
</svg>`;
const ogPng = png(ogSvg, 1200);
writeFileSync(join(root, 'app/opengraph-image.png'), ogPng);
writeFileSync(join(root, 'app/twitter-image.png'), ogPng);

console.log('✓ favicon.ico, apple-icon.png, icon-192/512.png, opengraph-image.png, twitter-image.png');
