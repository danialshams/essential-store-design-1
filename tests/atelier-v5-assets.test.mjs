import {test} from "node:test";
import assert from "node:assert/strict";
import {existsSync,statSync,readFileSync} from "node:fs";
const txt=(f)=>readFileSync(f,"utf8");
test("v4 original imagery is committed and available before build",()=>{
  for(const name of [
    "atelier-v4-hero-desktop.webp","atelier-v4-hero-mobile.webp",
    "atelier-v4-campaign.webp","atelier-v4-editorial.webp",
    "atelier-v4-sheet-1.webp","atelier-v4-sheet-2.webp","atelier-v4-sheet-3.webp"]){
    const path="public/images/"+name;
    assert.ok(existsSync(path),"Missing committed editorial source "+name);
    assert.ok(statSync(path).size>18000,"Damaged editorial source "+name);
    assert.equal(readFileSync(path).subarray(0,4).toString(),"RIFF","WebP RIFF header "+name);
  }
});
test("production build must generate 24 local portfolio photos without external fetch",()=>{
  const p=JSON.parse(txt("package.json"));
  assert.match(p.scripts.build,/prepare-atelier-v4-media\.mjs/);
  const s=txt("scripts/prepare-atelier-v4-media.mjs");
  assert.match(s,/atelier-v4-sheet-/);
  assert.match(s,/n\+21/);
  assert.doesNotMatch(s,/images\.unsplash\.com/);
  for(let i=21;i<=32;i++){
    const stem="public/images/atelier-v4-item-"+i;
    for(const suffix of [".webp","-wide.webp"]){
      assert.ok(existsSync(stem+suffix),"Missing generated image "+stem+suffix);
      assert.ok(statSync(stem+suffix).size>12000,"Empty generated image "+stem+suffix);
    }
  }
});
test("v5 home has editorial negative space without changing brand hues",()=>{
  const css=txt("src/app/atelier-v5-space.css");
  assert.match(css,/atelier-festival/);
  assert.match(css,/atelier-best/);
  assert.match(css,/atelier-new/);
  assert.match(css,/atelier-section-head/);
  assert.match(css,/#071827/);
  assert.match(css,/max-width:760px/);
});
