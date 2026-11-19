import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path,"utf8");
test("Festival, popular and new arrivals use interactive local category galleries",()=>{
  const home=read("src/components/AtelierHome.tsx");
  const gallery=read("src/components/AtelierCategoryGallery.tsx");
  for(const kind of ["sale","best","new"]){
    assert.match(home,new RegExp('kind="'+kind+'"'));
    assert.match(gallery,new RegExp('kind==="'+kind+'"'));
  }
  assert.match(home,/data-festival-product-count=\{sale\.length\}/);
  assert.match(home,/atelier-sale-grid/);
  assert.match(home,/atelier-best-gallery/);
  assert.match(home,/atelier-new-gallery/);
  assert.match(home,/atelier-new-products/);
  assert.match(gallery,/useState\("all"\)/);
  assert.match(gallery,/products\.filter\(p=>p\.inventory>0/);
  assert.match(gallery,/p\.category===category/);
  assert.match(gallery,/\.slice\(0,4\)/);
  assert.match(gallery,/aria-pressed=\{category===item\.value\}/);
  assert.match(gallery,/data-atelier-filter=\{kind\}/);
});
test("Category navigation stays visually minimal, readable and responsive",()=>{
  const css=read("src/app/atelier-v6-categories.css");
  assert.match(css,/atelier-category-tabs/);
  assert.match(css,/border-bottom:1px/);
  assert.match(css,/atelier-category-grid--count-1/);
  assert.match(css,/@media\(max-width:760px\)/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(read("src/app/layout.tsx"),/atelier-v6-categories\.css/);
});
