import * as THREE from './vendor/three.module.js';
import { bookData } from './book-data.js';

const $=s=>document.querySelector(s), W=1672, H=941;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const words={
 ru:{menu:'Книга рецептов',contact:'Написать Марине ↗',welcome:'ДОБРО ПОЖАЛОВАТЬ',title:'На кухне у Марины',intro:'Здесь всегда что-то вкусное.',loading:'На кухне становится уютно…',instruction:'РИГА · ДОМАШНЯЯ КУХНЯ',pause:'Пауза',resume:'Продолжить',fromMarina:'ИЗ КУХНИ МАРИНЫ',discuss:'Обсудить меню с Мариной ↗',book:'Открыть книгу Марины',next:'Следующая страница',prev:'Предыдущая страница',close:'Закрыть книгу',page:'Разворот',footer:'Это лишь несколько любимых блюд. Меню составим по вашим пожеланиям.',error:'Не удалось включить анимацию. Книга рецептов доступна в меню.'},
 lv:{menu:'Recepšu grāmata',contact:'Rakstīt Marinai ↗',welcome:'LAIPNI LŪGTI',title:'Marinas virtuvē',intro:'Te vienmēr top kaut kas gards.',loading:'Virtuvē kļūst omulīgi…',instruction:'RĪGA · MĀJAS VIRTUVE',pause:'Pauze',resume:'Turpināt',fromMarina:'NO MARINAS VIRTUVES',discuss:'Pārrunāt ēdienkarti ar Marinu ↗',book:'Atvērt Marinas grāmatu',next:'Nākamā lapa',prev:'Iepriekšējā lapa',close:'Aizvērt grāmatu',page:'Atvērums',footer:'Šie ir tikai daži iecienīti ēdieni. Ēdienkarti pielāgosim jūsu vēlmēm.',error:'Neizdevās ieslēgt animāciju. Recepšu grāmata ir pieejama izvēlnē.'}
};
let lang='ru',paused=reduced.matches,bookPage=0,pageBusy=false;
let renderer,scene,camera,root,atlas,cooking,background,clock=0,loaded=false,lastTime=performance.now();
let width=innerWidth,height=innerHeight,viewW=W,viewH=H,book,spoon,whisk,pot,bowl,dust;
const lights=[],flames=[],steam=[],flour=[],bubbles=[],props=[];
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

const crops={pan:[116,24,300,490],mug:[602,183,364,310],heart:[1116,153,300,307],book:[20,620,519,334],lamp:[582,530,375,430],quiche:[1001,620,529,309],pot:[35,32,724,430],bowl:[841,35,636,421],spoon:[318,490,152,511],whisk:[1067,500,169,497]};
function textureFor(kind){const [x,y,w,h]=crops[kind],a=['pot','bowl','spoon','whisk'].includes(kind)?cooking:atlas;const tx=a.clone();tx.repeat.set(w/1536,h/1024);tx.offset.set(x/1536,1-(y+h)/1024);tx.colorSpace=THREE.SRGBColorSpace;tx.needsUpdate=true;return tx}
function plane(w,h,material){const geometry=new THREE.PlaneGeometry(w,h);geometry.scale(1,-1,1);return new THREE.Mesh(geometry,material)}
function softMaterial(color,opacity=1){return new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{color:{value:new THREE.Color(color)},opacity:{value:opacity}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform vec3 color;uniform float opacity;void main(){vec2 p=(vUv-.5)*2.;float a=exp(-dot(p,p)*4.)*(1.-smoothstep(.7,1.,length(p)));gl_FragColor=vec4(color,a*opacity);}'})}
function glow(x,y,w,h,color,opacity,z=8){const p=plane(w,h,softMaterial(color,opacity));p.material.blending=THREE.AdditiveBlending;p.position.set(x,y,z);root.add(p);return p}
function sprite(kind,x,y,w,h,z=5){const mesh=plane(w,h,new THREE.MeshBasicMaterial({map:textureFor(kind),transparent:true,alphaTest:.025,depthWrite:false,side:THREE.DoubleSide,color:0xeee2cc}));mesh.position.set(x,y,z);root.add(mesh);props.push({kind,mesh,x,y});return mesh}
function shadow(x,y,w,h,z){const p=plane(w,h,softMaterial('#160c04',.38));p.position.set(x,y,z);root.add(p)}
function line(points){const g=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(p[0],p[1],3)));root.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:'#49301a',transparent:true,opacity:.8})))}
function createBackground(texture){
 const m=new THREE.ShaderMaterial({side:THREE.DoubleSide,uniforms:{map:{value:texture},time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`
 varying vec2 vUv;uniform sampler2D map;uniform float time;
 float region(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.35,1.,length((p-c)/r));}
 void main(){vec2 p=vec2(vUv.x*1672.,(1.-vUv.y)*941.);vec2 d=vec2(0.);
 // Local leaf and stem movement. Furniture and camera are never displaced.
 float leaves=region(p,vec2(428.,168.),vec2(150.,125.))+region(p,vec2(469.,516.),vec2(80.,75.))+region(p,vec2(1167.,534.),vec2(100.,58.))+region(p,vec2(1425.,505.),vec2(110.,96.))+region(p,vec2(130.,599.),vec2(165.,140.))+region(p,vec2(1577.,710.),vec2(85.,112.))+region(p,vec2(165.,748.),vec2(80.,45.));
 float dried=region(p,vec2(130.,148.),vec2(158.,128.))+region(p,vec2(1436.,72.),vec2(133.,100.));
 d.x+=(leaves*1.5+dried*.8)*sin(time*.59+p.y*.028)*sin(time*.23+1.2);d.y+=leaves*.6*sin(time*.81+p.x*.035);
 float cloth=region(p,vec2(343.,878.),vec2(160.,75.))+region(p,vec2(453.,675.),vec2(39.,80.));d+=vec2(.7,.35)*cloth*sin(time*.52+p.y*.07);
 float heat=region(p,vec2(903.,439.),vec2(95.,133.));d.x+=heat*.45*sin(p.y*.11-time*1.1);
 vec2 uv=vUv+vec2(d.x/1672.,-d.y/941.);vec4 c=texture2D(map,uv);
 float oven=region(p,vec2(384.,735.),vec2(92.,85.));float jars=region(p,vec2(1340.,300.),vec2(240.,75.));
 float breath=.5+.5*sin(time*.65)+.13*sin(time*1.73);c.rgb*=1.+oven*(breath*.065)+jars*(sin(time*.42)*.012);
 gl_FragColor=c;
 #include <colorspace_fragment>
 }`});const mesh=plane(W,H,m);mesh.position.set(W/2,H/2,0);root.add(mesh);return mesh;
}
function flame(x,y){const halo=glow(x,y,115,142,'#ff9d24',.11,9),outer=glow(x,y-5,12,29,'#ffcb59',.66,10),core=glow(x,y-2,5,17,'#fff5cf',.82,11);flames.push({x,y,halo,outer,core})}
function makeSteam(x,y,count,spread,rise,opacity){for(let i=0;i<count;i++){const mesh=plane(49,87,softMaterial('#f2e9db',0));mesh.position.z=22;root.add(mesh);steam.push({mesh,x,y,spread,rise,opacity,phase:i/count,seed:i*2.399});}}
function surfaceRipple(x,y,w,h){const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:{time:{value:0}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec2 vUv;uniform float time;void main(){vec2 p=(vUv-.5)*2.;float r=length(p);float wave=pow(.5+.5*sin(r*27.-time*2.7+sin(atan(p.y,p.x)*3.+time)*.3),10.);float a=wave*(1.-smoothstep(.4,1.,r))*.13;gl_FragColor=vec4(.9,.67,.32,a);}'});const p=plane(w,h,mat);p.position.set(x,y,13);root.add(p);return p}
let soupRipple,batterRipple;
function makeCooking(){
 // Pot sits on the black hob on the back counter; the bowl rests on the table.
 pot=sprite('pot',895,544,191,113,12);shadow(895,594,202,26,11);
 bowl=sprite('bowl',796,851,164,107,16);shadow(796,897,174,27,15);
 soupRipple=surfaceRipple(895,516,134,28);batterRipple=surfaceRipple(797,823,105,24);batterRipple.position.z=17;
 spoon=sprite('spoon',895,473,28,113,14);whisk=sprite('whisk',797,783,32,108,18);
 // Occlude the utensil tips behind the front wall of each vessel.
 const potFront=plane(191,113,new THREE.MeshBasicMaterial({map:textureFor('pot'),transparent:true,alphaTest:.025,depthWrite:false,side:THREE.DoubleSide,color:0xeee2cc}));potFront.geometry.setDrawRange(0,6);potFront.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.y > '+String(1-(32+430*.47)/1024)+') discard;');};potFront.position.set(895,544,15);root.add(potFront);
 const bowlFront=plane(164,107,new THREE.MeshBasicMaterial({map:textureFor('bowl'),transparent:true,alphaTest:.025,depthWrite:false,side:THREE.DoubleSide,color:0xeee2cc}));bowlFront.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nif(vMapUv.y > '+String(1-(35+421*.58)/1024)+') discard;');};bowlFront.position.set(796,851,19);root.add(bowlFront);
 makeSteam(895,510,19,40,118,.062);makeSteam(568,785,10,54,104,.035);
 for(let i=0;i<11;i++){const m=glow(895,516,4,2,'#f4c974',.15,14);bubbles.push({mesh:m,phase:i/11,x:Math.sin(i*4.71)*48,y:Math.cos(i*2.1)*7});}
 for(let i=0;i<18;i++){const p=plane(1.7+(i%3)*.4,1.7,new THREE.MeshBasicMaterial({color:'#ffeed3',transparent:true,opacity:0,depthWrite:false}));p.position.z=21;root.add(p);flour.push({mesh:p,phase:i/18,seed:i*2.39});}
}
function makeDust(){const pos=new Float32Array(48*3),seeds=[];for(let i=0;i<48;i++){seeds.push({x:Math.abs(Math.sin(i*127.1)*43758.5453%1)*W,y:(i*137.23)%H,s:.6+(i%4)*.18});pos[i*3]=seeds[i].x;pos[i*3+1]=seeds[i].y;pos[i*3+2]=23;}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));dust={mesh:new THREE.Points(geometry,new THREE.PointsMaterial({color:'#ffdb9e',size:1.15,transparent:true,opacity:.18,depthWrite:false})),seeds};root.add(dust.mesh)}
async function init(){
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor('#291c12',0);renderer.outputColorSpace=THREE.SRGBColorSpace;$('#canvas-host').append(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');scene=new THREE.Scene();root=new THREE.Group();scene.add(root);camera=new THREE.OrthographicCamera(0,W,0,H,.1,1000);camera.position.z=500;
 const loader=new THREE.TextureLoader();const [tex,a,c]=await Promise.all([loader.loadAsync('./assets/kitchen.png'),loader.loadAsync('./assets/objects.png'),loader.loadAsync('./assets/cooking.png')]);[tex,a,c].forEach(tx=>tx.colorSpace=THREE.SRGBColorSpace);atlas=a;cooking=c;background=createBackground(tex);
 [[59,382,73,158],[144,391,91,174],[236,395,80,162]].forEach(p=>sprite('pan',...p,4));
 [482,552,622,692].forEach((x,i)=>{sprite('mug',x,395+(i%2)*3,52,47,5);line([[x,365],[x,375]])});
 sprite('lamp',772,404,56,65,6);line([[772,348],[772,376]]);
 const points=[];for(let i=0;i<=16;i++){const x=900+i*28,y=384+Math.sin(i/16*Math.PI)*35;points.push([x,y]);if(i%2===1)sprite('heart',x,y+19,44,45,5)}line(points);
 book=sprite('book',1041,853,278,179,17);shadow(1041,909,291,42,16);sprite('quiche',565,837,341,174,16);shadow(565,888,359,49,15);
 flame(264,176);flame(1509,482);flame(1428,310);lights.push({mesh:glow(772,457,233,175,'#ffcb81',.1),base:.1,speed:.39});lights.push({mesh:glow(384,734,128,114,'#ff8d28',.15),base:.15,speed:.77});
 makeCooking();makeDust();resize();window.addEventListener('resize',resize);document.addEventListener('visibilitychange',()=>lastTime=performance.now());loaded=true;$('#loading').classList.add('done');$('#fallback').classList.add('ambient-matte');setTimeout(()=>$('#welcome').classList.add('faded'),9000);lastTime=performance.now();requestAnimationFrame(frame);
 window.kitchenDebug={getState:()=>({loaded,paused,lang,bookPage,time:clock,interactiveObjects:['book'],camera:{x:camera.position.x,y:camera.position.y,left:camera.left,right:camera.right},spoon:{x:spoon.position.x,y:spoon.position.y,angle:spoon.rotation.z},whisk:{x:whisk.position.x,y:whisk.position.y,angle:whisk.rotation.z},props:props.filter(p=>!['spoon','whisk'].includes(p.kind)).map(p=>({kind:p.kind,x:p.mesh.position.x,y:p.mesh.position.y,angle:p.mesh.rotation.z}))}),worldToScreen:toScreen};
}
function resize(){width=$('#stage').clientWidth;height=$('#stage').clientHeight;renderer.setSize(width,height);const aspect=width/height;if(width<650){viewW=760;viewH=viewW/aspect;}else if(aspect>W/H){viewW=W;viewH=W/aspect}else{viewH=H;viewW=H*aspect;}camera.left=(W-viewW)/2;camera.right=(W+viewW)/2;camera.top=(H-viewH)/2;camera.bottom=(H+viewH)/2;camera.updateProjectionMatrix();positionBookButton()}
function toScreen(x,y){return{x:(x-camera.left)/viewW*width,y:(y-camera.top)/viewH*height}}
function positionBookButton(){if(!book)return;const p=toScreen(book.position.x,book.position.y),b=$('#scene-book');b.style.left=p.x+'px';b.style.top=p.y+'px';b.style.width=232/viewW*width+'px';b.style.height=126/viewH*height+'px';}
function animate(){
 background.material.uniforms.time.value=clock;
 // The room and its furnishings never translate or rotate. Only cooking tools move.
 spoon.position.x=895+Math.sin(clock*.75)*13;spoon.position.y=473+Math.cos(clock*.75)*3;spoon.rotation.z=Math.sin(clock*.75)*.12;
 whisk.position.x=796+Math.sin(clock*1.38)*8;whisk.position.y=783+Math.cos(clock*1.38)*2;whisk.rotation.z=-.11+Math.sin(clock*1.38+.5)*.13;whisk.scale.x=.93+Math.sin(clock*1.38)*.065;
 soupRipple.material.uniforms.time.value=clock;batterRipple.material.uniforms.time.value=clock*.65;
 for(const f of flames){const breath=.95+Math.sin(clock*2.7+f.x)*.05+Math.sin(clock*6.1)*.023;f.halo.material.uniforms.opacity.value=.1*breath;f.outer.scale.set(1+Math.sin(clock*3.3+f.x)*.06,breath,1);f.outer.position.x=f.x+Math.sin(clock*2.4+f.x)*.65;f.core.scale.y=breath;}
 lights.forEach(l=>l.mesh.material.uniforms.opacity.value=l.base*(.96+Math.sin(clock*l.speed)*.09+Math.sin(clock*1.41)*.02));
 props.filter(p=>['pan','lamp'].includes(p.kind)).forEach((p,i)=>p.mesh.material.color.setRGB(.85+Math.sin(clock*.42+i)*.008,.76+Math.sin(clock*.42+i)*.006,.62+Math.sin(clock*.42+i)*.005));
 for(const s of steam){const phase=(s.phase+clock*.075)%1;const x=s.x+Math.sin(s.seed)*s.spread+Math.sin(phase*6+s.seed)*12;const y=s.y-phase*s.rise;s.mesh.position.set(x,y,22);s.mesh.scale.set(.28+phase*.73,.25+phase*.95,1);s.mesh.rotation.z=Math.sin(phase*5+s.seed)*.26;s.mesh.material.uniforms.opacity.value=Math.sin(phase*Math.PI)*s.opacity;}
 for(const b of bubbles){const phase=(b.phase+clock*.17)%1;b.mesh.position.set(895+b.x,516+b.y,14);b.mesh.scale.setScalar(.2+phase*.9);b.mesh.material.uniforms.opacity.value=Math.sin(phase*Math.PI)*.17;}
 for(const f of flour){const phase=(f.phase+clock*.14)%1;f.mesh.position.set(796+Math.sin(f.seed)*phase*38,823-Math.sin(phase*Math.PI)*32+phase*8,21);f.mesh.material.opacity=Math.sin(phase*Math.PI)*.14*(.5+.5*Math.sin(clock*.5)**2);}
 const a=dust.mesh.geometry.attributes.position;dust.seeds.forEach((s,i)=>a.setXYZ(i,s.x+Math.sin(clock*.055+i)*10,(s.y-clock*s.s*1.8%H+H)%H,23));a.needsUpdate=true;
}
function frame(now){requestAnimationFrame(frame);if(document.hidden)return;const dt=Math.min((now-lastTime)/1000,.05);lastTime=now;if(!paused&&!$('#book-dialog').open)clock+=dt;animate();renderer.render(scene,camera)}
setLanguage('ru');
init().catch(error=>{console.error('Kitchen initialization failed',error);$('#loading').classList.add('done');const p=document.createElement('p');p.className='error-note';p.textContent=t('error');$('#stage').append(p);$('#canvas-host').style.display='none';$('#scene-book').hidden=true});
