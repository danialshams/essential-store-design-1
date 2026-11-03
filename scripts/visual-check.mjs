import {spawn} from "node:child_process";
import {readFileSync,existsSync,mkdtempSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
const chromeBinary=process.env.CHROME_BIN||"/usr/bin/chromium";
if(!existsSync(chromeBinary)){console.log("Chromium is not installed; skipping optional visual reference check.");process.exit(0)}
const tmp=mkdtempSync(join(tmpdir(),"essential-store-cdp-"));
const chrome=spawn(chromeBinary,["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--disable-background-networking","--no-first-run","--remote-debugging-port=0","--user-data-dir="+tmp,"about:blank"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const root=resolve(".");
const server=createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url||"/","http://localhost").pathname);const filename=resolve(root,"."+pathname);if(!filename.startsWith(root+"/")){res.writeHead(403).end();return}const file=await readFile(filename);const ext=filename.slice(filename.lastIndexOf("."));res.setHeader("Content-Type",ext===".css"?"text/css":ext===".html"?"text/html; charset=utf-8":ext===".webp"?"image/webp":"application/octet-stream");res.end(file)}catch{res.writeHead(404).end("not found")}});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const baseURL=`http://127.0.0.1:${server.address().port}`;
async function waitFor(fn,deadline=20000){const start=Date.now();while(Date.now()-start<deadline){try{const v=await fn();if(v)return v}catch{}await sleep(170)}throw Error("Timeout waiting for Chrome")}
let ws;
try{
 const debugFile=join(tmp,"DevToolsActivePort");await waitFor(()=>existsSync(debugFile));
 const port=readFileSync(debugFile,"utf8").split("\n")[0];
 const target=await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:"PUT"}).then(r=>r.json());
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true})});
 const pending=new Map();let seq=0;
 ws.addEventListener("message",e=>{const message=JSON.parse(String(e.data));if(!message.id||!pending.has(message.id))return;const p=pending.get(message.id);pending.delete(message.id);if(message.error)p.reject(Error(JSON.stringify(message.error)));else p.resolve(message.result||{})});
 function cmd(method,params={}){return new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));setTimeout(()=>{if(pending.has(id)){pending.delete(id);reject(Error("CDP timeout: "+method))}},13000).unref()})}
 await cmd("Page.enable");await cmd("Runtime.enable");
 for(const {name,w,h} of [{name:"desktop",w:1440,h:1030},{name:"tablet",w:820,h:980},{name:"mobile",w:390,h:844},{name:"small-mobile",w:360,h:740}]){
  await cmd("Emulation.setDeviceMetricsOverride",{width:w,height:h,deviceScaleFactor:1,mobile:w<600,screenWidth:w,screenHeight:h});
  await cmd("Page.navigate",{url:baseURL+"/preview/reference-home.html"});
  await sleep(500);
  const response=await cmd("Runtime.evaluate",{expression:`(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,hero:document.querySelector('.hero')?.getBoundingClientRect().toJSON(),products:document.querySelectorAll('.product-card').length,pageUrl:location.href,text:document.body?.textContent?.slice(0,80),visibleCards:[...document.querySelectorAll('.product-card')].filter(e=>e.getBoundingClientRect().width>0).length,bodyReady:document.readyState}))()`,returnByValue:true});
  const state=response.result.value;
  console.log("BROWSER STATE",name,JSON.stringify(state));
  if(state.scrollWidth>w+4)throw Error(`${name}: horizontal overflow ${JSON.stringify(state)}`);
  if(state.products!==4)throw Error(`${name}: missing product cards`);
  const shot=await cmd("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
  writeFileSync(`/mnt/data/essential-store-${name}-review.png`,Buffer.from(shot.data,"base64"));
  console.log(name,JSON.stringify(state));
 }
}catch(e){console.error(e);process.exitCode=1}finally{ws?.close();server.close();chrome.kill("SIGTERM");try{rmSync(tmp,{recursive:true,force:true,maxRetries:3,retryDelay:200})}catch{}}
