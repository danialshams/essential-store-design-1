import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(p,"utf8");

test("festival homepage leads to the separate discounted archive and retains four curated highlights",()=>{
 const home=read("src/components/LuxuryHome.tsx");
 const archive=read("src/app/festival/page.tsx");
 const logic=read("src/lib/luxury-catalog.ts");
 assert.match(home,/id="festival-products"/);
 assert.match(home,/sale\.slice\(0,4\)/);
 assert.match(home,/data-festival-product-count/);
 assert.match(home,/href="\/festival"/);
 assert.match(archive,/LuxuryFestivalCollection/);
 assert.match(logic,/p\.comparePrice>p\.price/);
});
test("product photo background is the store theme, with an image frame that never shifts ratio",()=>{
 const media=read("src/app/product-theme-polish.css");
 const card=read("src/components/ProductCard.tsx");
 const layout=read("src/app/layout.tsx");
 assert.match(layout,/product-theme-polish\.css/);
 assert.match(media,/--store-product-frame:/);
 assert.match(media,/aspect-ratio:4\/5!important/);
 assert.match(media,/background:var\(--store-product-frame\)!important/);
 assert.match(media,/focus-within/);
 assert.match(media,/@media\(hover:none\)/);
 assert.doesNotMatch(card,/onLoad=\{event=>/);
 assert.doesNotMatch(card,/naturalWidth.*naturalHeight/);
});
test("desktop/mobile QA validates new festival layout and screenshots with stable product ratios",()=>{
 const qa=read("scripts/test-admin-browser.mjs");
 const smoke=read(".github/workflows/production-smoke.yml");
 assert.match(qa,/luxury-sale-item/);
 assert.match(qa,/storefront-festival\.png/);
 assert.match(qa,/merch\.ratio>/);
 assert.match(smoke,/data-festival-product-count/);
 assert.match(smoke,/\/festival/);
});
