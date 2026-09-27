const path=require('node:path');
const assert=require('node:assert/strict');
const modulePath=process.env.PLAYWRIGHT_MODULE||'playwright';
const {chromium}=require(modulePath);
const {PNG}=require(path.join(path.dirname(require.resolve(modulePath)),'../playwright-core/lib/utilsBundle.js'));
function difference(a,b,rect){let sum=0;const [x,y,w,h]=rect;for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const p=(j*a.width+i)*4;for(let c=0;c<3;c++)sum+=Math.abs(a.data[p+c]-b.data[p+c]);}return sum/(w*h*3)}
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto(process.env.PREVIEW_URL||'http://127.0.0.1:4173',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.kitchenDebug?.getState().loaded);
 const state=()=>page.evaluate(()=>window.kitchenDebug.getState());const before=await state();assert.equal(before.source,'original.png');assert.deepEqual(before.effects,['marked-lights','greenery','pie-steam','heart-garland']);assert.equal(before.sceneObjects,2);
 const a=PNG.sync.read(await page.locator('canvas').screenshot());await page.waitForTimeout(4200);const b=PNG.sync.read(await page.locator('canvas').screenshot({path:'qa-marked-canvas.png'}));
 const regions={candleLeft:[242,148,45,65],hood:[120,299,220,20],lamp:[660,375,95,66],jarLight:[1335,281,104,58],candleRight:[1485,454,45,65],oven:[348,733,67,48],flowersLeft:[55,99,132,90],trailingPlant:[430,105,89,98],flowersRight:[1295,28,145,63],herbs:[441,477,49,44],foregroundGreen:[30,520,126,133],steam:[510,575,133,175],garland:[920,393,485,58]};
 const changes=Object.fromEntries(Object.entries(regions).map(([name,r])=>[name,+difference(a,b,r).toFixed(3)]));for(const [name,d] of Object.entries(changes))assert.ok(d>.015,`${name} must animate without pointer input: ${d}`);assert.equal(difference(a,b,[798,655,77,65]),0,'Unmarked cabinet must remain unchanged');
 await page.mouse.move(400,550);await page.mouse.down();await page.mouse.move(720,600,{steps:8});await page.mouse.up();assert.deepEqual(before.camera,(await state()).camera);assert.equal(await page.locator('.hotspot').count(),0);
 await page.locator('#scene-book').click();assert.equal(await page.locator('#book-dialog').evaluate(e=>e.open),true);await page.keyboard.press('Escape');await page.locator('#motion').click();const p1=await state();await page.waitForTimeout(300);assert.equal(p1.time,(await state()).time);await page.locator('#motion').click();await page.screenshot({path:'qa-marked-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(400);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'qa-marked-mobile.png'});await page.emulateMedia({reducedMotion:'reduce'});await page.waitForFunction(()=>window.kitchenDebug.getState().paused);assert.deepEqual(errors,[]);console.log(JSON.stringify({originalRestored:true,regionPixelChanges:changes,unmarkedCabinetUnchanged:true,cameraFixed:true,book:true,pauseAndReducedMotion:true,mobile:true,errors},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
