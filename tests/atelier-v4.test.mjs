import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");
test("the header is revealed during the corner curl, not delayed until intro DOM removal",()=>{
 const css=read("src/app/atelier-v4.css");
 assert.match(css,/body:has\(\.atelier-intro--turn\) \.site-header/);
 assert.match(css,/visibility:visible!important/);
 assert.match(css,/transition:none!important/);
});
test("mobile drawer follows the midnight palette, includes responsive motion and keeps accessible navigation",()=>{
 const css=read("src/app/atelier-v4.css");
 const header=read("src/components/Header.tsx");
 assert.match(css,/\.mobile-drawer \{/);
 assert.match(css,/#071827/);
 assert.match(css,/atelierDrawerEnter/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(header,/aria-label="بستن فهرست"/);
});
test("full model image sources are framed independently for mobile and desktop",()=>{
 const home=read("src/components/AtelierHome.tsx");
 const css=read("src/app/atelier-v4.css");
 assert.match(home,/atelier-v4-hero-desktop\.webp/);
 assert.match(home,/atelier-v4-hero-mobile\.webp/);
 assert.match(css,/object-position:center top!important/);
 assert.match(read("scripts/prepare-atelier-v4-media.mjs"),/fit:"contain"/);
});
test("new editorial gallery sources expand to 32 distinct slots, keeping merchant uploads",()=>{
 const media=read("src/lib/atelier-v3-media.ts");
 const prep=read("scripts/prepare-atelier-v4-media.mjs");
 assert.match(media,/length:32/);
 assert.match(media,/new Set<number>/);
 assert.match(media,/if\(!bundled&&p\)return p/);
 assert.match(prep,/atelier-v4-item-/);
 assert.equal((prep.match(/photo-\d{13}-[a-z0-9]+/g)||[]).length,14);
});
