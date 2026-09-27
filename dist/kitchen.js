import * as THREE from './vendor/three.module.js';
import { bookData } from './book-data.js';
import { turnLeaf } from './page-turn.js';

const $=s=>document.querySelector(s), W=1672, H=941;
const portraitBook=matchMedia('(max-width: 700px) and (orientation: portrait)');
let pageSide=0;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const words={
 ru:{about:'Обо мне',menu:'Книга рецептов',contact:'Написать Марине ↗',welcome:'ДОБРО ПОЖАЛОВАТЬ',title:'На кухне у Марины',intro:'Здесь всегда что-то вкусное.',loading:'На кухне становится уютно…',instruction:'РИГА · ДОМАШНЯЯ КУХНЯ',pause:'Пауза',resume:'Продолжить',fromMarina:'ИЗ КУХНИ МАРИНЫ',discuss:'Обсудить меню с Мариной ↗',book:'Открыть книгу Марины',next:'Следующая страница',prev:'Предыдущая страница',nextShort:'Далее',prevShort:'Назад',close:'Закрыть книгу',page:'Разворот',footer:'Это лишь несколько любимых блюд. Меню составим по вашим пожеланиям.',error:'Не удалось включить анимацию. Книга рецептов доступна в меню.'},
 lv:{about:'Par mani',menu:'Recepšu grāmata',contact:'Rakstīt Marinai ↗',welcome:'LAIPNI LŪGTI',title:'Marinas virtuvē',intro:'Te vienmēr top kaut kas gards.',loading:'Virtuvē kļūst omulīgi…',instruction:'RĪGA · MĀJAS VIRTUVE',pause:'Pauze',resume:'Turpināt',fromMarina:'NO MARINAS VIRTUVES',discuss:'Pārrunāt ēdienkarti ar Marinu ↗',book:'Atvērt Marinas grāmatu',next:'Nākamā lapa',prev:'Iepriekšējā lapa',nextShort:'Tālāk',prevShort:'Atpakaļ',close:'Aizvērt grāmatu',page:'Atvērums',footer:'Šie ir tikai daži iecienīti ēdieni. Ēdienkarti pielāgosim jūsu vēlmēm.',error:'Neizdevās ieslēgt animāciju. Recepšu grāmata ir pieejama izvēlnē.'}
};
let lang='ru',paused=reduced.matches,bookPage=0,pageBusy=false,activeTurn=null;
let renderer,scene,camera,root,background,steam,portraitBackground,portraitSteam,clock=0,loaded=false,lastTime=performance.now();
let width=innerWidth,height=innerHeight,viewW=W,viewH=H;


const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function t(k){return words[lang][k]||k}
function setLanguage(value){activeTurn?.finish();lang=value;document.documentElement.lang=value;document.title=`Home Bakery — ${t('title')}`;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));$('#scene-book').setAttribute('aria-label',t('book'));$('#close-book').setAttribute('aria-label',t('close'));$('#next-page').setAttribute('aria-label',t('next'));$('#prev-page').setAttribute('aria-label',t('prev'));$('#kitchen').setAttribute('aria-label',t('title'));renderBook();}
const invitations={
 ru:{title:'Давайте придумаем\nваше меню',note:'Расскажите, что вы любите, на сколько человек и к какому дню. Вместе выберем блюда, которые порадуют именно вас.',sign:'С теплом, Марина',action:'Обсудить меню с Мариной',where:'Личное сообщение в Instagram ↗',hint:'Листайте свайпом или стрелками',page:'Страница'},
 lv:{title:'Izplānosim jūsu\nēdienkarti',note:'Pastāstiet, kas jums garšo, cik cilvēkiem un kurai dienai gatavot. Kopā izvēlēsimies ēdienus tieši jums.',sign:'Sirsnībā, Marina',action:'Pārrunāt ēdienkarti ar Marinu',where:'Privāta ziņa Instagram ↗',hint:'Pāršķiriet ar vilcienu vai bultiņām',page:'Lapa'}
};
function renderBook(){
 const [heading,note,title,list]=bookData[lang][bookPage],single=portraitBook.matches,invite=invitations[lang];
 const dialog=$('#book-dialog');dialog.classList.toggle('single-page',single);dialog.classList.toggle('show-right',pageSide===1);dialog.setAttribute('aria-label',t('menu'));
 const left=$('.book-shell > .left-page'),right=$('.book-shell > .right-page');
 left.inert=single&&pageSide===1;right.inert=single&&pageSide===0;
 left.setAttribute('aria-hidden',String(left.inert));right.setAttribute('aria-hidden',String(right.inert));
 $('#book-heading').textContent=heading;$('#book-note').textContent=note;
 const content=$('#recipe-content');content.classList.remove('about-story');content.classList.toggle('invitation',bookPage===bookData[lang].length-1);
 const h=document.createElement('h3');h.className='recipe-label';h.textContent=title;
 if(bookPage===bookData[lang].length-1){
  h.textContent=invite.title;
  const note=document.createElement('p');note.className='invitation-note';note.textContent=invite.note;
  const sign=document.createElement('p');sign.className='signature';sign.textContent=invite.sign;
  const action=document.createElement('a');action.className='invitation-action';action.href='https://www.instagram.com/home.baker_lv/';action.target='_blank';action.rel='noopener noreferrer';
  const seal=document.createElement('span');seal.className='letter-seal';seal.setAttribute('aria-hidden','true');seal.textContent='м';
  const label=document.createElement('span');label.textContent=invite.action;
  const where=document.createElement('small');where.textContent=invite.where;
  action.append(seal,label,where);content.replaceChildren(h,note,sign,action);
 }else if(bookPage===bookData[lang].length-2){
  content.classList.add('about-story');const paragraphs=list.map(text=>{const p=document.createElement('p');p.textContent=text;return p});content.replaceChildren(h,...paragraphs);
 }else{
  const ul=document.createElement('ul');ul.className='recipe-list';list.forEach(name=>{const li=document.createElement('li');li.textContent=name;ul.append(li)});
  const p=document.createElement('p');p.className='recipe-footer';p.textContent=t('footer');content.replaceChildren(h,ul,p);
 }
 $('#page-left').textContent=String(bookPage*2+1).padStart(2,'0');$('#page-right').textContent=String(bookPage*2+2).padStart(2,'0');
 const current=single?bookPage*2+pageSide:bookPage,total=bookData[lang].length*(single?2:1);
 $('#page-status').textContent=`${single?invite.page:t('page')} ${current+1} / ${total}`;
 $('#prev-page').disabled=pageBusy||current===0;$('#next-page').disabled=pageBusy||current===total-1;
 $('#book-hint').textContent=single?invite.hint:'';
}
function turnSingle(direction){
 const current=bookPage*2+pageSide,next=clamp(current+direction,0,bookData[lang].length*2-1);if(next===current)return;
 bookPage=Math.floor(next/2);pageSide=next%2;
 if(reduced.matches){renderBook();return;}
 pageBusy=true;renderBook();const page=$('.book-shell > '+(pageSide?'.right-page':'.left-page'));
 const animation=page.animate([{transform:`translateX(${direction*35}px)`,opacity:0},{transform:'translateX(0)',opacity:1}],{duration:350,easing:'ease-out'});
 let done=false;const finish=()=>{if(done)return;done=true;animation.cancel();pageBusy=false;activeTurn=null;renderBook()};
 activeTurn={finish};animation.finished.then(finish,()=>{});
}
portraitBook.addEventListener('change',()=>{activeTurn?.finish();renderBook()});
function openBook(){if(!$('#book-dialog').open){renderBook();$('#book-dialog').showModal()}}
function turnPage(direction){
 if(pageBusy)return;
 if(portraitBook.matches){turnSingle(direction);return;}
 const next=clamp(bookPage+direction,0,bookData[lang].length-1);if(next===bookPage)return;pageSide=0;
 if(reduced.matches){bookPage=next;renderBook();return;}
 const shell=$('.book-shell'),left=shell.querySelector(':scope > .left-page'),right=shell.querySelector(':scope > .right-page'),sheet=$('#turn-sheet');
 const oldLeft=left.cloneNode(true),oldRight=right.cloneNode(true),oldHeight=shell.clientHeight;
 pageBusy=true;bookPage=next;renderBook();
 const newLeft=left.cloneNode(true),newRight=right.cloneNode(true);
 shell.style.height=Math.max(oldHeight,shell.clientHeight)+'px';
 const forward=direction>0;
 if(forward)left.innerHTML=oldLeft.innerHTML;else right.innerHTML=oldRight.innerHTML;
 shell.classList.add('turning');
 activeTurn=turnLeaf(sheet,forward?oldRight:newRight,forward?newLeft:oldLeft,forward,()=>{
  left.innerHTML=newLeft.innerHTML;right.innerHTML=newRight.innerHTML;
  shell.classList.remove('turning');shell.style.height='';pageBusy=false;activeTurn=null;renderBook();
 });
}
$('#book-dialog').addEventListener('close',()=>activeTurn?.finish());
window.addEventListener('resize',()=>activeTurn?.finish());
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
$('#menu-button').onclick=$('#mobile-book').onclick=$('#scene-book').onclick=openBook;
$('#about-button').onclick=()=>{activeTurn?.finish();bookPage=bookData[lang].length-2;pageSide=1;renderBook();openBook()};
$('#close-book').onclick=()=>$('#book-dialog').close();$('#prev-page').onclick=()=>turnPage(-1);$('#next-page').onclick=()=>turnPage(1);
let touchStart=null;
$('.book-shell').addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
$('.book-shell').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;touchStart=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)turnPage(dx<0?1:-1);},{passive:true});
$('.book-shell').addEventListener('touchcancel',()=>touchStart=null,{passive:true});
$('#book-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turnPage(1)}if(e.key==='ArrowLeft'){e.preventDefault();turnPage(-1)}});
$('#book-dialog').addEventListener('click',e=>{if(e.target!==e.currentTarget)return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()});

reduced.addEventListener('change',e=>{paused=e.matches;setLanguage(lang)});

// The approved photograph is the sole scene asset. Motion is restricted to
// the four kinds of marks in the user's reference; no objects are added.
function plane(w,h,material){const geometry=new THREE.PlaneGeometry(w,h);geometry.scale(1,-1,1);return new THREE.Mesh(geometry,material)}
const vertexShader='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
function createBackground(texture){
 const material=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{map:{value:texture},time:{value:0}},vertexShader,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform float time;
 float maskAt(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.22,1.,length((p-c)/r));}
 vec2 foliage(vec2 p,vec2 c,vec2 r,float phase,float amount){
   float m=maskAt(p,c,r);
   float gust=.85+.3*sin(time*.41+phase);
   float sway=gust*(sin(time*1.24+phase)+.38*sin(time*2.11+phase*2.));
   return m*amount*2.45*vec2(sway*(.67+.33*sin(p.y*.035+phase)),.46*sin(time*1.35+phase+p.x*.026));
 }
 vec2 heart(vec2 p,vec2 pivot,vec2 center,float phase){
   float m=maskAt(p,center,vec2(35.,37.));vec2 q=p-pivot;
   float a=.075*sin(time*1.16+phase)+.012*sin(time*2.32+phase);
   vec2 rotated=vec2(cos(a)*q.x-sin(a)*q.y,sin(a)*q.x+cos(a)*q.y);
   return (rotated-q)*m;
 }
 float flicker(float speed,float phase){return sin(time*speed+phase)*.48+sin(time*speed*2.17+phase)*.24+sin(time*7.7+phase)*.18+sin(time*12.3+phase*2.)*.10;}
 void main(){
   vec2 p=vec2(vUv.x*1672.,(1.-vUv.y)*941.);vec2 d=vec2(0.);
   // Green marks: bouquets, trailing plant, herbs and foreground greenery.
   d+=foliage(p,vec2(151.,141.),vec2(149.,93.),.2,1.8);
   d+=foliage(p,vec2(486.,167.),vec2(77.,108.),1.4,2.1);
   d+=foliage(p,vec2(460.,260.),vec2(44.,63.),1.7,1.7);
   d+=foliage(p,vec2(1381.,59.),vec2(136.,59.),2.7,1.9);
   d+=foliage(p,vec2(469.,499.),vec2(65.,53.),.8,1.7);
   d+=foliage(p,vec2(85.,584.),vec2(144.,132.),3.3,2.2);
   d+=foliage(p,vec2(221.,751.),vec2(90.,31.),2.2,1.0);
   d+=foliage(p,vec2(1304.,550.),vec2(65.,28.),1.9,1.0);
   d+=foliage(p,vec2(1424.,498.),vec2(61.,56.),2.6,1.5);
   d+=foliage(p,vec2(1567.,676.),vec2(39.,77.),.7,1.4);
   // Orange mark: each heart rocks gently about its own string attachment.
   d+=heart(p,vec2(917.,378.),vec2(920.,405.),.0);
   d+=heart(p,vec2(981.,394.),vec2(987.,421.),.35);
   d+=heart(p,vec2(1047.,409.),vec2(1048.,436.),.7);
   d+=heart(p,vec2(1113.,418.),vec2(1117.,448.),1.05);
   d+=heart(p,vec2(1184.,421.),vec2(1185.,451.),1.4);
   d+=heart(p,vec2(1254.,415.),vec2(1255.,443.),1.75);
   d+=heart(p,vec2(1327.,406.),vec2(1329.,432.),2.1);
   d+=heart(p,vec2(1400.,391.),vec2(1401.,417.),2.45);
   // Flame silhouettes breathe within the red candle marks.
   d.x+=maskAt(p,vec2(264.,171.),vec2(8.,19.))*1.5*(sin(time*5.5)+.3*sin(time*11.));
   d.x+=maskAt(p,vec2(1509.,481.),vec2(8.,18.))*1.4*(sin(time*6.1+1.)+.3*sin(time*10.7));
   vec4 c=texture2D(map,vUv+vec2(d.x/1672.,-d.y/941.));
   // Darker room with warm local illumination and independently breathing sources.
   float left=maskAt(p,vec2(264.,183.),vec2(123.,156.));
   float hood=maskAt(p,vec2(216.,320.),vec2(210.,71.));
   float lamp=maskAt(p,vec2(704.,417.),vec2(158.,158.));
   float jars=maskAt(p,vec2(1384.,318.),vec2(170.,135.));
   float right=maskAt(p,vec2(1509.,493.),vec2(129.,151.));
   float oven=maskAt(p,vec2(384.,756.),vec2(127.,89.));
   float leftPulse=1.+.52*flicker(2.12,.1);
   float hoodPulse=1.+.13*flicker(.86,1.2);
   float lampPulse=1.+.23*flicker(1.21,2.1);
   float jarPulse=1.+.36*flicker(1.74,3.2);
   float rightPulse=1.+.55*flicker(2.31,4.5);
   float ovenPulse=1.+.43*flicker(1.48,5.1);
   float pool=left*leftPulse+hood*hoodPulse*.64+lamp*lampPulse*.86+jars*jarPulse*.78+right*rightPulse+oven*ovenPulse*1.35;
   // Low room exposure, preserving texture while the sources carry the light.
   c.rgb=pow(c.rgb,vec3(1.12))*vec3(.245,.255,.27);
   vec3 surface=texture2D(map,vUv+vec2(d.x/1672.,-d.y/941.)).rgb;
   c.rgb+=surface*vec3(.96,.65,.35)*pool;
   // Feathered inner flame radiance, broad falloff and reflected light below.
   float flameL=exp(-dot((p-vec2(264.,172.))/vec2(12.,22.),(p-vec2(264.,172.))/vec2(12.,22.)));
   float flameR=exp(-dot((p-vec2(1509.,481.))/vec2(12.,22.),(p-vec2(1509.,481.))/vec2(12.,22.)));
   float ember=maskAt(p,vec2(382.,750.),vec2(44.,25.));
   float radiance=flameL*leftPulse+flameR*rightPulse+ember*ovenPulse*.55;
   c.rgb+=vec3(.72,.32,.065)*radiance;
   c.rgb+=vec3(.065,.025,.004)*pool*pool;
   float bounce=maskAt(p,vec2(1505.,553.),vec2(155.,48.))*rightPulse
       +maskAt(p,vec2(276.,252.),vec2(104.,32.))*leftPulse
       +maskAt(p,vec2(387.,820.),vec2(140.,50.))*ovenPulse;
   c.rgb+=surface*vec3(.23,.085,.012)*bounce;
   gl_FragColor=c;
   #include <colorspace_fragment>
 }`});
 const mesh=plane(W,H,material);mesh.position.set(W/2,H/2,0);root.add(mesh);return mesh;
}
function createPortraitBackground(texture){
 const material=new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{map:{value:texture},time:{value:0}},vertexShader,fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform float time;
 float maskAt(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.15,1.,length((p-c)/r));}
 float flicker(float phase){return .5*sin(time*2.3+phase)+.3*sin(time*6.7+phase*2.)+.2*sin(time*11.1+phase);}
 vec2 plant(vec2 p,vec2 c,vec2 r,float phase){float m=maskAt(p,c,r);return m*vec2(3.1*sin(time*1.2+phase),1.2*sin(time*1.8+phase+p.x*.01));}
 vec2 heart(vec2 p,vec2 pivot,vec2 center,float phase){float m=maskAt(p,center,vec2(27.,36.));vec2 q=p-pivot;float a=.06*sin(time*1.1+phase);return m*(vec2(cos(a)*q.x-sin(a)*q.y,sin(a)*q.x+cos(a)*q.y)-q);}
 void main(){
 vec2 p=vec2(vUv.x*1024.,(1.-vUv.y)*1536.),d=vec2(0.);
 d+=plant(p,vec2(248.,280.),vec2(105.,156.),.4);
 d+=plant(p,vec2(964.,139.),vec2(117.,102.),1.8);
 d+=plant(p,vec2(91.,807.),vec2(129.,139.),2.4);
 d+=plant(p,vec2(247.,673.),vec2(95.,47.),3.1);
 d+=plant(p,vec2(975.,634.),vec2(75.,57.),1.1);
 d+=heart(p,vec2(590.,517.),vec2(592.,542.),.1);
 d+=heart(p,vec2(638.,532.),vec2(643.,557.),.5);
 d+=heart(p,vec2(698.,550.),vec2(700.,578.),.9);
 d+=heart(p,vec2(758.,557.),vec2(760.,585.),1.3);
 d+=heart(p,vec2(820.,551.),vec2(821.,578.),1.7);
 d+=heart(p,vec2(882.,533.),vec2(884.,563.),2.1);
 d+=heart(p,vec2(940.,509.),vec2(940.,538.),2.5);
 float flame=maskAt(p,vec2(906.,644.),vec2(8.,18.));d.x+=flame*1.2*sin(time*7.);
 vec4 c=texture2D(map,vUv+vec2(d.x/1024.,-d.y/1536.));
 float candle=maskAt(p,vec2(906.,665.),vec2(117.,165.))*(1.+.42*flicker(.2));
 float oven=maskAt(p,vec2(151.,987.),vec2(128.,114.))*(1.+.38*flicker(2.));
 float lamp=maskAt(p,vec2(465.,568.),vec2(156.,161.))*(1.+.15*flicker(4.));
 float jars=maskAt(p,vec2(923.,442.),vec2(135.,94.))*(1.+.3*flicker(5.));
 float pool=candle+oven+lamp+jars;
 c.rgb*=vec3(.73,.70,.67)+vec3(.42,.29,.14)*pool;
 c.rgb+=vec3(.038,.017,.003)*pool*pool+vec3(.19,.09,.012)*flame*(1.+.42*flicker(.2));
 c.a=smoothstep(0.,.025,vUv.y)*smoothstep(0.,.025,1.-vUv.y);
 gl_FragColor=c;
 #include <colorspace_fragment>
 }`});
 const mesh=plane(1024,1536,material);mesh.position.set(512,768,0);root.add(mesh);return mesh;
}
function createPieSteam(portrait=false){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader,fragmentShader:`
 varying vec2 vUv;uniform float time;
 float wisp(float x,float y,float center,float phase){
   float bend=sin(y*9.-time*1.4+phase)*(.022+y*.07)+sin(y*16.-time*.73+phase)*.017;
   float width=.013+y*.032;
   float shape=exp(-pow((x-center-bend)/width,2.));
   float pulse=.65+.35*sin(y*7.-time*1.5+phase);
   float fade=smoothstep(0.,.12,y)*(1.-smoothstep(.64,1.,y));
   return shape*pulse*fade;
 }
 void main(){float x=vUv.x,y=vUv.y;
   float vapor=wisp(x,y,.25,.0)+wisp(x,y,.5,2.1)+wisp(x,y,.74,4.2);
   gl_FragColor=vec4(.91,.87,.80,vapor*.29);
 }`});
 const mesh=plane(portrait?180:198,portrait?260:244,material);mesh.position.set(portrait?286:574,portrait?1035:666,2);root.add(mesh);return mesh;
}
async function init(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor('#291c12',0);renderer.outputColorSpace=THREE.SRGBColorSpace;$('#canvas-host').append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');scene=new THREE.Scene();root=new THREE.Group();scene.add(root);camera=new THREE.OrthographicCamera(0,W,0,H,.1,1000);camera.position.z=500;
 const loader=new THREE.TextureLoader();const [texture,portraitTexture]=await Promise.all([loader.loadAsync('./assets/original.png'),loader.loadAsync('./assets/kitchen-portrait.png')]);texture.colorSpace=portraitTexture.colorSpace=THREE.SRGBColorSpace;background=createBackground(texture);steam=createPieSteam();portraitBackground=createPortraitBackground(portraitTexture);portraitSteam=createPieSteam(true);
 resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>lastTime=performance.now());loaded=true;$('#loading').classList.add('done');$('#fallback').classList.add('ambient-matte');setTimeout(()=>$('#welcome').classList.add('faded'),9000);lastTime=performance.now();requestAnimationFrame(frame);
 window.kitchenDebug={getState:()=>({loaded,paused,lang,bookPage,pageSide,singlePage:portraitBook.matches,time:clock,source:portraitBook.matches?'kitchen-portrait.png':'original.png',effects:['marked-lights','greenery','pie-steam','heart-garland'],interactiveObjects:['book'],camera:{x:camera.position.x,y:camera.position.y,left:camera.left,right:camera.right},sceneObjects:root.children.length}),worldToScreen:toScreen};
}
function resize(){
 width=$('#stage').clientWidth;height=$('#stage').clientHeight;renderer.setSize(width,height);
 const portrait=portraitBook.matches,aspect=width/height,sceneW=portrait?1024:W,sceneH=portrait?1536:H;
 if(portrait){viewW=1024;viewH=Math.max(1536,viewW/aspect)}else if(aspect>W/H){viewW=W;viewH=W/aspect}else{viewH=H;viewW=H*aspect;}
 camera.left=(sceneW-viewW)/2;camera.right=(sceneW+viewW)/2;camera.top=(sceneH-viewH)/2;camera.bottom=(sceneH+viewH)/2;camera.updateProjectionMatrix();
 background.visible=steam.visible=!portrait;portraitBackground.visible=portraitSteam.visible=portrait;
 document.body.classList.toggle('portrait-scene',portrait);const fallback=$('#fallback'),source=portrait?'./assets/kitchen-portrait.png':'./assets/original.png';if(fallback.getAttribute('src')!==source)fallback.src=source;
 positionBookButton();
}
function toScreen(x,y){return{x:(x-camera.left)/viewW*width,y:(y-camera.top)/viewH*height}}
function positionBookButton(){
 const portrait=portraitBook.matches,p=toScreen(portrait?512:846,portrait?1164:788),b=$('#scene-book');
 b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.width=(portrait?475:326)/viewW*width+'px';b.style.height=(portrait?233:143)/viewH*height+'px';
 b.querySelector('svg').setAttribute('viewBox',portrait?'0 0 475 233':'0 0 326 143');
 b.querySelector('path').setAttribute('d',portrait?'M2 43 L265 2 L473 120 L467 181 L144 231 L2 84 Z':'M10 27 L189 2 L322 70 L324 116 L101 141 L2 56 Z');
}
function frame(now){requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!paused)clock+=dt;background.material.uniforms.time.value=clock;steam.material.uniforms.time.value=clock;portraitBackground.material.uniforms.time.value=clock;portraitSteam.material.uniforms.time.value=clock;renderer.render(scene,camera)}
setLanguage('ru');
init().catch(error=>{console.error('Kitchen initialization failed',error);$('#loading').classList.add('done');const p=document.createElement('p');p.className='error-note';p.textContent=t('error');$('#stage').append(p);$('#canvas-host').style.display='none';$('#scene-book').hidden=true});
