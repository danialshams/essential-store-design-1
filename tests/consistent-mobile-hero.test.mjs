import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const digest=p=>createHash("sha256").update(readFileSync(p)).digest("hex");
test("blue storefront hero is visually consistent across mobile and desktop",()=>{
 assert.equal(digest("public/images/curated/hero-mobile.webp"),digest("public/images/curated/hero-woman.webp"));
});
