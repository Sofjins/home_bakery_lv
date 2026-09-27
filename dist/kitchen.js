import * as THREE from './vendor/three.module.js';
import { bookData } from './book-data.js';

const $=s=>document.querySelector(s), W=1672, H=941;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const words={
 ru:{menu:'Книга рецептов',contact:'Написать Марине ↗',welcome:'ДОБРО ПОЖАЛОВАТЬ',title:'На кухне у Марины',intro:'Здесь всегда что-то вкусное.',loading:'На кухне становится уютно…',instruction:'РИГА · ДОМАШНЯЯ КУХНЯ',pause:'Пауза',resume:'Продолжить',fromMarina:'ИЗ КУХНИ МАРИНЫ',discuss:'Обсудить меню с Мариной ↗',book:'Открыть книгу Марины',next:'Следующая страница',prev:'Предыдущая страница',close:'Закрыть книгу',page:'Разворот',footer:'Это лишь несколько любимых блюд. Меню составим по вашим пожеланиям.',error:'Не удалось включить анимацию. Книга рецептов доступна в меню.'},
 lv:{menu:'Recepšu grāmata',contact:'Rakstīt Marinai ↗',welcome:'LAIPNI LŪGTI',title:'Marinas virtuvē',intro:'Te vienmēr top kaut kas gards.',loading:'Virtuvē kļūst omulīgi…',instruction:'RĪGA · MĀJAS VIRTUVE',pause:'Pauze',resume:'Turpināt',fromMarina:'NO MARINAS VIRTUVES',discuss:'Pārrunāt ēdienkarti ar Marinu ↗',book:'Atvērt Marinas grāmatu',next:'Nākamā lapa',prev:'Iepriekšējā lapa',close:'Aizvērt grāmatu',page:'Atvērums',footer:'Šie ir tikai daži iecienīti ēdieni. Ēdienkarti pielāgosim jūsu vēlmēm.',error:'Neizdevās ieslēgt animāciju. Recepšu grāmata ir pieejama izvēlnē.'}
};
let lang='ru',paused=reduced.matches,bookPage=0,pageBusy=false;
let renderer,scene,camera,root,background,steam,clock=0,loaded=false,lastTime=performance.now();
let width=innerWidth,height=innerHeight,viewW=W,viewH=H;
const book={x:1013,y:852};

const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function t(k){return words[lang][k]||k}
function setLanguage(value){lang=value;document.documentElement.lang=value;document.title=`Home Bakery — ${t('title')}`;document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));document.querySelectorAll('[data-lang]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.lang===lang)));$('#motion').textContent=t(paused?'resume':'pause');$('#motion').setAttribute('aria-pressed',String(paused));$('#scene-book').setAttribute('aria-label',t('book'));$('#close-book').setAttribute('aria-label',t('close'));$('#next-page').setAttribute('aria-label',t('next'));$('#prev-page').setAttribute('aria-label',t('prev'));$('#kitchen').setAttribute('aria-label',t('title'));renderBook();}
function renderBook(){const [heading,note,title,list]=bookData[lang][bookPage];$('#book-heading').textContent=heading;$('#book-heading').style.whiteSpace='pre-line';$('#book-note').textContent=note;const h=document.createElement('h3');h.className='recipe-label';h.textContent=title;const ul=document.createElement('ul');ul.className='recipe-list';list.forEach(name=>{const li=document.createElement('li');li.textContent=name;ul.append(li)});const p=document.createElement('p');p.className='recipe-footer';p.textContent=t('footer');$('#recipe-content').replaceChildren(h,ul,p);$('#page-left').textContent=String(bookPage*2+1).padStart(2,'0');$('#page-right').textContent=String(bookPage*2+2).padStart(2,'0');$('#page-status').textContent=`${t('page')} ${bookPage+1} / ${bookData[lang].length}`;$('#prev-page').disabled=bookPage===0;$('#next-page').disabled=bookPage===bookData[lang].length-1;}
function openBook(){if(!$('#book-dialog').open){renderBook();$('#book-dialog').showModal()}}
function turnPage(direction){if(pageBusy)return;const next=clamp(bookPage+direction,0,bookData[lang].length-1);if(next===bookPage)return;pageBusy=true;$('.book-shell').classList.add('turning');setTimeout(()=>{bookPage=next;renderBook()},reduced.matches?0:300);setTimeout(()=>{$('.book-shell').classList.remove('turning');pageBusy=false},reduced.matches?10:640);}
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>setLanguage(b.dataset.lang));
$('#menu-button').onclick=$('#mobile-book').onclick=$('#scene-book').onclick=openBook;
$('#close-book').onclick=()=>$('#book-dialog').close();$('#prev-page').onclick=()=>turnPage(-1);$('#next-page').onclick=()=>turnPage(1);
$('#book-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();turnPage(1)}if(e.key==='ArrowLeft'){e.preventDefault();turnPage(-1)}});
$('#book-dialog').addEventListener('click',e=>{if(e.target!==e.currentTarget)return;const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()});
$('#motion').onclick=()=>{paused=!paused;setLanguage(lang)};
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
   float sway=sin(time*.67+phase)+.28*sin(time*1.13+phase*2.);
   return m*amount*vec2(sway*(.67+.33*sin(p.y*.035+phase)),.28*sin(time*.81+phase+p.x*.026));
 }
 vec2 heart(vec2 p,vec2 pivot,vec2 center,float phase){
   float m=maskAt(p,center,vec2(35.,37.));vec2 q=p-pivot;
   float a=.024*sin(time*.62+phase);
   vec2 rotated=vec2(cos(a)*q.x-sin(a)*q.y,sin(a)*q.x+cos(a)*q.y);
   return (rotated-q)*m;
 }
 float flicker(float speed,float phase){return sin(time*speed+phase)*.8+sin(time*speed*2.17+phase)*.16+sin(time*3.1+phase)*.04;}
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
   d.x+=maskAt(p,vec2(264.,171.),vec2(8.,19.))*.5*sin(time*2.5);
   d.x+=maskAt(p,vec2(1509.,481.),vec2(8.,18.))*.5*sin(time*2.7+1.);
   vec4 c=texture2D(map,vUv+vec2(d.x/1672.,-d.y/941.));
   // Red marks: independent, gradual brightening AND dimming of the six lights.
   float light=0.;
   light+=maskAt(p,vec2(264.,183.),vec2(60.,80.))*.28*flicker(.83,.1);
   light+=maskAt(p,vec2(216.,307.),vec2(163.,27.))*.21*flicker(.55,1.2);
   light+=maskAt(p,vec2(206.,371.),vec2(189.,73.))*.065*flicker(.55,1.2);
   light+=maskAt(p,vec2(704.,409.),vec2(98.,98.))*.27*flicker(.61,2.1);
   light+=maskAt(p,vec2(1384.,318.),vec2(100.,86.))*.32*flicker(.76,3.2);
   light+=maskAt(p,vec2(1509.,493.),vec2(66.,81.))*.29*flicker(.9,4.5);
   light+=maskAt(p,vec2(384.,756.),vec2(77.,45.))*.36*flicker(.73,5.1);
   c.rgb*=exp2(light);
   gl_FragColor=c;
   #include <colorspace_fragment>
 }`});
 const mesh=plane(W,H,material);mesh.position.set(W/2,H/2,0);root.add(mesh);return mesh;
}
function createPieSteam(){
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader,fragmentShader:`
 varying vec2 vUv;uniform float time;
 float wisp(float x,float y,float center,float phase){
   float bend=sin(y*9.-time*.68+phase)*(.022+y*.07)+sin(y*16.-time*.37+phase)*.017;
   float width=.013+y*.032;
   float shape=exp(-pow((x-center-bend)/width,2.));
   float pulse=.65+.35*sin(y*7.-time*.8+phase);
   float fade=smoothstep(0.,.12,y)*(1.-smoothstep(.64,1.,y));
   return shape*pulse*fade;
 }
 void main(){float x=vUv.x,y=vUv.y;
   float vapor=wisp(x,y,.25,.0)+wisp(x,y,.5,2.1)+wisp(x,y,.74,4.2);
   gl_FragColor=vec4(.91,.87,.80,vapor*.13);
 }`});
 const mesh=plane(198,244,material);mesh.position.set(574,666,2);root.add(mesh);return mesh;
}
async function init(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor('#291c12',0);renderer.outputColorSpace=THREE.SRGBColorSpace;$('#canvas-host').append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');scene=new THREE.Scene();root=new THREE.Group();scene.add(root);camera=new THREE.OrthographicCamera(0,W,0,H,.1,1000);camera.position.z=500;
 const texture=await new THREE.TextureLoader().loadAsync('./assets/original.png');texture.colorSpace=THREE.SRGBColorSpace;background=createBackground(texture);steam=createPieSteam();
 resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>lastTime=performance.now());loaded=true;$('#loading').classList.add('done');$('#fallback').classList.add('ambient-matte');setTimeout(()=>$('#welcome').classList.add('faded'),9000);lastTime=performance.now();requestAnimationFrame(frame);
 window.kitchenDebug={getState:()=>({loaded,paused,lang,bookPage,time:clock,source:'original.png',effects:['marked-lights','greenery','pie-steam','heart-garland'],interactiveObjects:['book'],camera:{x:camera.position.x,y:camera.position.y,left:camera.left,right:camera.right},sceneObjects:root.children.length}),worldToScreen:toScreen};
}
function resize(){width=$('#stage').clientWidth;height=$('#stage').clientHeight;renderer.setSize(width,height);const aspect=width/height;if(width<650){viewW=760;viewH=viewW/aspect;}else if(aspect>W/H){viewW=W;viewH=W/aspect}else{viewH=H;viewW=H*aspect;}camera.left=(W-viewW)/2;camera.right=(W+viewW)/2;camera.top=(H-viewH)/2;camera.bottom=(H+viewH)/2;camera.updateProjectionMatrix();positionBookButton()}
function toScreen(x,y){return{x:(x-camera.left)/viewW*width,y:(y-camera.top)/viewH*height}}
function positionBookButton(){const p=toScreen(book.x,book.y),b=$('#scene-book');b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.width=245/viewW*width+'px';b.style.height=119/viewH*height+'px';}
function frame(now){requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!paused&&!$('#book-dialog').open)clock+=dt;background.material.uniforms.time.value=clock;steam.material.uniforms.time.value=clock;renderer.render(scene,camera)}
setLanguage('ru');
init().catch(error=>{console.error('Kitchen initialization failed',error);$('#loading').classList.add('done');const p=document.createElement('p');p.className='error-note';p.textContent=t('error');$('#stage').append(p);$('#canvas-host').style.display='none';$('#scene-book').hidden=true});
