import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL(path,import.meta.url),"utf8");
test("storefront fetches public catalog server-side and preserves demo fallback",()=>{
 const src=read("../src/lib/live-store.ts");
 assert.match(src,/STOREFRONT_ADMIN_ORIGIN/);
 assert.match(src,/return demo/);
 assert.match(src,/mode!=="live"/);
});
test("browser never receives the server-to-server secret",()=>{
 const route=read("../src/app/api/store/order/route.ts");
 assert.match(route,/STOREFRONT_API_SECRET/);
 assert.match(route,/x-storefront-key/);
 const client=read("../src/components/ShopProvider.tsx");
 assert.doesNotMatch(client,/STOREFRONT_API_SECRET/);
});
test("mobile header has one visible search form, not redundant header icon",()=>{
 const header=read("../src/components/Header.tsx");
 assert.match(header,/mobile-search-drawer/);
 assert.doesNotMatch(header,/className="icon-action compact-search"/);
});

test("components calling useShop are client boundaries (prevent production SSR crash)",()=>{
 const footer=read("../src/components/Footer.tsx");
 assert.match(footer, /^["']use client["'];/);
 const chrome=read("../src/components/StoreChrome.tsx");
 assert.match(chrome, /<ShopProvider store=\{store\}>/);
 const root=read("../src/app/layout.tsx");
 assert.match(root, /<StoreChrome store=\{store\}>/);
});
