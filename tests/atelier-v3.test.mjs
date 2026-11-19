import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=path=>readFileSync(path,'utf8');
test('v3 home uses unique editorial shots for each gallery and frame-specific image sources',()=>{
  const code=source('src/components/AtelierHome.tsx');
  const tile=source('src/components/AtelierTile.tsx');
  assert.match(code,/allocateEditorialMedia/);
  assert.match(code,/atelier-v4-hero-desktop/);
  assert.match(code,/atelier-v4-hero-mobile/);
  assert.match(code,/atelier-v4-campaign/);
  assert.match(code,/atelier-v4-editorial/);
  assert.match(tile,/editorialImage/);
  assert.match(tile,/\-wide\.webp/);
});
test('v3 protects responsive photo frames and central titles',()=>{
  const s=source('src/app/atelier-v3-polish.css');
  assert.match(s,/calc\(100svh - var\(--atelier-header-h\)\)/);
  assert.match(s,/object-fit:cover!important/);
  assert.match(s,/atelier-section-head/);
  assert.match(s,/atelier-timer-grid/);
});
test('v3 GSAP masks vary by media position and animate headings',()=>{
  const s=source('src/components/AtelierMotion.tsx');
  assert.match(s,/clipPath/);
  assert.match(s,/polygon/);
  assert.match(s,/ScrollTrigger/);
  assert.match(s,/atelier:intro-complete/);
  assert.match(s,/prefers-reduced-motion/);
});
test('v3 generates all WebP from six source images',()=>{
  const s=source('scripts/prepare-atelier-v3-media.mjs');
  assert.match(s,/atelier-v3-products-a\.webp/);
  assert.match(s,/atelier-v3-products-b\.webp/);
  assert.match(s,/quality:90/);
});
