// Optional browser verification: npm install --no-save playwright,
// or supply an absolute module path through PLAYWRIGHT_MODULE.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl']});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>window.kitchenDebug?.getState().loaded,{timeout:30000});
 await page.waitForTimeout(1600);
 await page.screenshot({path:'qa-desktop.png'});
 const initial=await page.evaluate(()=>window.kitchenDebug.getState());
 const point=await page.evaluate(()=>{const s=window.kitchenDebug.getState();const p=s.items.find(i=>i.kind==='mug');return window.kitchenDebug.worldToScreen(p.x,p.y)});
 await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+100,point.y+40,{steps:15});await page.waitForTimeout(300);await page.mouse.up();
 await page.waitForTimeout(300);const after=await page.evaluate(()=>window.kitchenDebug.getState());
 const moved=Math.abs(after.items.find(i=>i.kind==='mug').angle-initial.items.find(i=>i.kind==='mug').angle)>.03;
 await page.locator('#menu-button').click();await page.waitForTimeout(700);await page.locator('#next-page').click();await page.waitForTimeout(700);
 const bookWorks=(await page.locator('#book-heading').innerText()).includes('Чаша');
 await page.screenshot({path:'qa-book.png'});await page.keyboard.press('Escape');
 await page.locator('[data-lang="lv"]').click();const lvWorks=(await page.locator('#menu-button').innerText())==='Recepšu grāmata';
 await page.locator('#motion').click();const paused=await page.evaluate(()=>window.kitchenDebug.getState().paused);
 await page.locator('#reset').click();
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);await page.screenshot({path:'qa-mobile.png'});
 await page.locator('#mobile-book').click();await page.waitForTimeout(650);await page.screenshot({path:'qa-mobile-book.png'});
 const noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
 console.log(JSON.stringify({initialItems:initial.itemCount,dragChangesAngle:moved,bookPageTurns:bookWorks,latvianToggle:lvWorks,pause:paused,mobileNoOverflow:noOverflow,errors},null,2));
 await browser.close();if(errors.length||!moved||!bookWorks||!lvWorks||!paused||!noOverflow)process.exit(1);
})();
