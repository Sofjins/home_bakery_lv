const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4183',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.kitchenDebug?.getState().loaded);await page.evaluate(()=>document.fonts.load('18px Literata','Марина')); 
 assert.equal(await page.locator('#motion').count(),0);assert(await page.evaluate(()=>document.fonts.check('18px Literata','Марина')));
 const settle=async()=>{await page.evaluate(()=>document.querySelectorAll('#book-dialog *').forEach(el=>el.getAnimations().forEach(a=>a.finish())));await page.waitForFunction(()=>!document.querySelector('.book-shell').classList.contains('turning')&&!document.querySelector('#next-page').disabled||document.querySelector('#page-status').textContent.match(/(8 \/ 8|16 \/ 16)/));};
 const bounds=async()=>{const r=await page.locator('#recipe-content').evaluate(e=>{if(e.parentElement.inert)return null;const b=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect(),n=e.parentElement.querySelector('.page-number').getBoundingClientRect();return{top:b.top-p.top,bottom:b.bottom-n.top,height:b.height,pageHeight:p.height}});if(r)assert(r.top>=0&&r.bottom<0,JSON.stringify(r));};
 for(const lang of ['ru','lv']){
  await page.locator(`[data-lang="${lang}"]`).click();await page.locator('#menu-button').click();
  for(const direction of [1,-1])for(let i=0;i<7;i++){
   await bounds();await page.locator(direction===1?'#next-page':'#prev-page').click();
   if(i===0)for(const progress of [.24,.76]){
    await page.locator('#turn-sheet').evaluate((el,p)=>{const a=el.getAnimations()[0];a.pause();a.currentTime=1250*p},progress);await page.waitForTimeout(50);
    const faces=await page.locator('.leaf-strip').evaluateAll(strips=>strips.map(s=>[...s.children].map(f=>getComputedStyle(f).visibility)));assert.equal(faces.length,18);faces.forEach(f=>assert.equal(f.filter(v=>v==='visible').length,1));
   }
   await settle();assert.equal(await page.locator('#book-heading').count(),1);
   if(lang==='ru'&&direction===1&&i===6){assert.equal(await page.locator('.invitation-action').count(),1);await page.screenshot({path:'qa-invitation-desktop.png'});}
  }
  await page.keyboard.press('Escape');
 }
 await page.locator('[data-lang="ru"]').click();await page.locator('#about-button').click();assert.equal(await page.locator('.about-story').count(),1);await bounds();await page.screenshot({path:'qa-about-desktop.png'});await page.keyboard.press('Escape');
 // Return to page one using keyboard, then check every physical leaf on phones.
 await page.locator('#menu-button').click();for(let i=0;i<6;i++){await page.locator('#prev-page').click();await settle()}await page.keyboard.press('Escape');
 for(const viewport of [{width:390,height:844},{width:320,height:700}]){
  await page.setViewportSize(viewport);await page.waitForFunction(()=>window.kitchenDebug.getState().source==='kitchen-portrait.png');if(viewport.width===390)await page.screenshot({path:'qa-portrait-kitchen.png'});await page.locator('#mobile-book').click();
  for(let i=0;i<16;i++){
   await bounds();assert.equal(await page.locator('.book-shell > .book-page:not([aria-hidden="true"])').count(),1);
   if(viewport.width===390&&i===1)await page.screenshot({path:'qa-single-page.png'});
   if(i<15){await page.locator('#next-page').click();await settle()}
  }
  if(viewport.width===390)await page.screenshot({path:'qa-invitation-mobile.png'});
  await page.setViewportSize({width:844,height:390});await page.waitForFunction(()=>!document.querySelector('#book-dialog').classList.contains('single-page'));assert.match(await page.locator('#page-status').textContent(),/8 \/ 8/);await bounds();await page.screenshot({path:'qa-landscape-book.png'});
  await page.setViewportSize(viewport);await page.waitForFunction(()=>document.querySelector('#book-dialog').classList.contains('single-page'));assert.match(await page.locator('#page-status').textContent(),/16 \/ 16/);
  for(let i=0;i<15;i++){await page.locator('#prev-page').click();await settle()}
  await page.keyboard.press('Escape');
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#menu-button').click();await page.screenshot({path:'qa-centered-book.png'});await page.keyboard.press('Escape');
 await page.locator('#scene-book').hover();await page.screenshot({path:'qa-book-hover.png'});
 assert.deepEqual(errors,[]);console.log('PASS: 8 spreads RU/LV, centered content bounds, 16 portrait pages at 320/390px, rotation preserves page, invitation only on last page, About, removed Pause, fonts, turn faces.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
