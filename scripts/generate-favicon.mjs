/**
 * Render app/icon.svg into the raster app icons.
 *
 * Outputs:
 *   app/favicon.ico   — multi-size ICO (16/32/48/64) for browsers & OS
 *   app/apple-icon.png — 180px apple-touch icon (served by Next automatically)
 *
 * Run: pnpm icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'app/icon.svg'), 'utf8');

const renderPng = (size) =>
  new Resvg(svg, { fitTo: { mode: 'width', value: size } }).render().asPng();

const ico = await pngToIco([16, 32, 48, 64].map(renderPng));
writeFileSync(join(root, 'app/favicon.ico'), ico);
writeFileSync(join(root, 'app/apple-icon.png'), renderPng(180));

console.log('✓ Wrote app/favicon.ico and app/apple-icon.png');
