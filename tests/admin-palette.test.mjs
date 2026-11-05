import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const css=readFileSync("src/app/admin/edition-two-admin.css","utf8");
test("Essential 01 admin uses its native white and blue palette rather than Edition 02 sepia",()=>{
 assert.match(css,/\.ed2-admin\{[^}]*--ed2-bg:#f5f8fe/);
 assert.match(css,/\.ed2-admin\{[^}]*--ed2-ink:#173352/);
 assert.match(css,/\.ed2-side-link\.active\{background:#eaf3ff;color:#0b60cc\}/);
 assert.match(css,/\.ed2-admin \.ed2-button-dark[\s\S]*?background:#0c65d9!important/);
 for(const legacy of ["#fffefa","#f7f5f1","#a4825f","#d8c5ad","#3c3630","#eee8df","#e8e3dc"]){
  assert.ok(!css.includes(legacy),"Found unconverted legacy sepia value "+legacy);
 }
});
test("The native Edition 01 mobile and desktop visual-editor layout remains intact",()=>{
 assert.match(css,/\.ed1-mini-hero/);
 assert.match(css,/\.ed1-visual-page\.is-mobile/);
 assert.match(css,/\.ed2-part-selector/);
});
