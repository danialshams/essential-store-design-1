// Production-browser regression for the cinematic homepage.
// Runs against the built local production server, using the Chrome DevTools Protocol.
// Intentionally does not depend on a paid remote browser service.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const port = 39192;
const origin = `http://127.0.0.1:${port}`;
const delay = ms => new Promise(r => setTimeout(r, ms));
const waitFor = async (check, label, timeout=30000) => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await check()) return; } catch {}
    await delay(120);
  }
  throw Error("Timeout: " + label);
};
const profile = mkdtempSync(join(tmpdir(), "atelier-browser-"));
const output = resolve(".artifacts/atelier");
mkdirSync(output, { recursive: true });
let server, chrome, socket;
try {
  server = spawn("npm", ["run", "start", "--", "-p", String(port)], {
    cwd: process.cwd(), stdio: ["ignore", "pipe", "pipe"], detached: true,
    env: { ...process.env, NEXT_PUBLIC_STUDIO_DEMO: "1" }
  });
  await waitFor(async () => {
    const response = await fetch(origin + "/", { signal: AbortSignal.timeout(5000) });
    return response.status === 200;
  }, "production server");

  const candidates = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium"].filter(Boolean);
  const binary = candidates.find(existsSync);
  if (!binary) throw Error("Chrome is missing from the CI runner");
  chrome = spawn(binary, [
    "--headless=new", "--no-sandbox", "--disable-dev-shm-usage",
    "--disable-extensions", "--disable-background-networking",
    "--enable-unsafe-swiftshader", "--use-angle=swiftshader",
    "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"
  ], { stdio: "ignore" });
  const debugFile = join(profile, "DevToolsActivePort");
  await waitFor(() => existsSync(debugFile), "Chrome debug socket");
  const debugPort = Number(readFileSync(debugFile, "utf8").split("\n")[0]);
  const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: "PUT" }).then(r => r.json());
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const pending = new Map();
  let sequence = 0;
  socket.addEventListener("message", e => {
    const msg = JSON.parse(String(e.data));
    if (!msg.id || !pending.has(msg.id)) return;
    const task = pending.get(msg.id); pending.delete(msg.id); clearTimeout(task.timer);
    msg.error ? task.reject(Error(JSON.stringify(msg.error))) : task.resolve(msg.result || {});
  });
  const send = (method, params={}) => new Promise((resolve,reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(Error("CDP timeout "+method)); }, 25000);
    pending.set(id,{resolve,reject,timer});
    socket.send(JSON.stringify({id,method,params}));
  });
  const evaluate = async code => {
    const reply = await send("Runtime.evaluate", { expression:code,returnByValue:true,awaitPromise:true });
    if (reply.exceptionDetails) throw Error("Browser runtime error: " + JSON.stringify(reply.exceptionDetails).slice(0,800));
    return reply.result?.value;
  };
  const capture = async (name, full = false) => {
    const screenshot = await send("Page.captureScreenshot", {
      format: "jpeg", quality: 78, captureBeyondViewport: full, fromSurface: true
    });
    writeFileSync(join(output,name+".jpg"),Buffer.from(screenshot.data,"base64"));
  };
  await send("Page.enable");
  await send("Runtime.enable");
  const report = [];
  for (const {name,width,height} of [
    {name:"desktop",width:1440,height:900},
    {name:"mobile",width:390,height:844},
    {name:"small-mobile",width:320,height:700}
  ]) {
    await send("Emulation.setDeviceMetricsOverride", {width,height,deviceScaleFactor:1,mobile:width<700,screenWidth:width,screenHeight:height});
    await send("Page.navigate",{url:origin+"/"});
    await waitFor(() => evaluate('!!document.querySelector(".atelier-intro")'), name + " intro");
    await waitFor(() => evaluate('Number(getComputedStyle(document.querySelector(".atelier-intro")).zIndex) > Number(getComputedStyle(document.querySelector(".site-header")).zIndex)'), name + " fully styled overlay", 12000);
    const overlay = await evaluate('({z:Number(getComputedStyle(document.querySelector(".atelier-intro")).zIndex), header:Number(getComputedStyle(document.querySelector(".site-header")).zIndex)})');
    assert.ok(overlay.z > overlay.header, name+" loader must cover header");
    await waitFor(() => evaluate('!!document.querySelector(".atelier-intro--turn")'), name+" corner-curl start",14000);
    let dragged = false, canvas = false, turning = false;
    const curlSamples=[];
    for (let i=0;i<9;i++) {
      const state=await evaluate('({drag:document.querySelector(".grabfold")?.dataset.dragging==="true",turning:document.querySelector(".grabfold")?.dataset.turning==="true",canvas:!!document.querySelector(".atelier-intro canvas"),root:document.querySelector(".grabfold")?.getBoundingClientRect().toJSON(),phase:document.querySelector(".atelier-intro")?.className})');
      curlSamples.push(state);
      if(state.drag)dragged=true;
      if(state.turning)turning=true;
      if(state.canvas)canvas=true;
      if((name==="desktop"||name==="mobile") && (i===1||i===4)) {
        await capture("curl-"+name+(i===1?"-early":"-mid"));
      }
      await delay(90);
    }
    assert.ok(canvas,name+" loader must render the WebGL curling paper");
    if(!dragged)console.error("ATELIER_CURL_DIAGNOSTIC "+name+" "+JSON.stringify(curlSamples));
    assert.ok(dragged,name+" WebGL fold must begin as a top-corner drag, not a center-edge fallback: "+JSON.stringify(curlSamples.slice(-2)));
    // During the fold the moving sheet is captured above, not after it disappears.
    await waitFor(() => evaluate('!document.querySelector(".atelier-intro")'), name+" loader completion",9000);
    const data=await evaluate(`(() => {
      const host=document.querySelector(".atelier-home");
      return {
        scroll:document.body.style.overflow,
        overflow:document.documentElement.scrollWidth-window.innerWidth,
        footerGap:Math.round(document.querySelector(".site-footer").getBoundingClientRect().top-host.getBoundingClientRect().bottom),
        heroFit:getComputedStyle(document.querySelector(".atelier-hero-image")).objectFit,
        heroTop:Math.round(document.querySelector(".atelier-hero").getBoundingClientRect().top),
        headerBottom:Math.round(document.querySelector(".site-header").getBoundingClientRect().bottom),
        sales:document.querySelectorAll(".atelier-sale-grid .atelier-tile").length,
        best:document.querySelectorAll(".atelier-best-gallery .atelier-tile").length,
        newest:document.querySelectorAll(".atelier-new-products .atelier-tile").length,
        whiteCards:document.querySelectorAll(".atelier-home .product-card").length
      };
    })()`);
    assert.notEqual(data.scroll,"hidden",name+" scrolling must unlock");
    assert.ok(data.overflow <= 1,name+" must not scroll horizontally: "+data.overflow);
    assert.equal(data.footerGap,0,name+" must not have a gap above the footer");
    assert.equal(data.heroFit,"cover",name+" hero image must fit its exact viewport frame");
    assert.ok(Math.abs(data.heroTop-data.headerBottom) <= 2,name+" hero must start precisely beneath header: "+JSON.stringify(data));
    assert.equal(data.whiteCards,0,name+" must not render legacy cards");
    assert.equal(data.sales,4,name+" must show four featured sale items");
    assert.ok(data.best>0 && data.newest>0,name+" must render two product galleries");
    // Exercise GSAP scroll triggers before photographing the complete editorial gallery.
    const numberOfScreens = await evaluate("Math.ceil(document.documentElement.scrollHeight / innerHeight)");
    for (let screen = 1; screen <= numberOfScreens; screen++) {
      await evaluate("window.scrollTo(0," + screen + "*innerHeight);true");
      await delay(160);
    }
    await delay(600);
    await evaluate("window.scrollTo(0,0);true");
    await delay(180);
    await capture(name, true);
    await waitFor(()=>evaluate('[...document.querySelectorAll(".atelier-home img")].filter(i=>(i.currentSrc||i.src).includes("atelier-v3-")).every(i=>i.complete&&i.naturalWidth>0)'),name+" all locally served WebP photos decoded",18000);
    await send("Page.navigate",{url:origin+"/festival"});
    await waitFor(() => evaluate('!!document.querySelector(".luxury-festival-page")'),name+" festival route");
    assert.ok(await evaluate('document.querySelectorAll(".luxury-festival-filters button").length>1'),name+" festival filters");
    report.push({name,...data,cornerCurl:true});
  }
  console.log("ATELIER_BROWSER_QA="+JSON.stringify(report));
} finally {
  try { socket?.close(); } catch {}
  try { if(chrome && !chrome.killed)chrome.kill("SIGTERM"); } catch {}
  try { if(server && !server.killed)process.kill(-server.pid,"SIGTERM"); } catch {}
  try { rmSync(profile,{recursive:true,force:true,maxRetries:5,retryDelay:250}); } catch { /* Chrome can still be releasing its profile. */ }
}
