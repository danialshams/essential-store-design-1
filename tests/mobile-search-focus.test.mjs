import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("mobile search input font size prevents iOS Safari auto-zoom while retaining user pinch zoom", () => {
  const css=readFileSync(new URL("../src/app/globals.css",import.meta.url),"utf8");
  const layout=readFileSync(new URL("../src/app/layout.tsx",import.meta.url),"utf8");
  assert.match(css, /@media\s*\(max-width:\s*1000px\)[\s\S]*?\.mobile-search-drawer input,[\s\S]*?\.collection-search input,[\s\S]*?\.header-search input\s*\{\s*font-size:\s*16px\s*\}/);
  assert.match(layout, /initialScale:\s*1/);
  assert.doesNotMatch(layout, /userScalable:\s*false|maximumScale:\s*1/);
});
