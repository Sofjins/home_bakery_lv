// A leaf is a set of narrow, independently hinged pieces of the same printed
// sheet. Lighting belongs to the faces: a filter on a 3D ancestor flattens them.
export function turnLeaf(sheet, frontPage, backPage, forward, complete) {
 const count=18, width=sheet.clientWidth, height=sheet.clientHeight, step=width/count;
 const strips=[];
 for(let i=0;i<count;i++){
  const strip=document.createElement('div');strip.className='leaf-strip';strip.inert=true;
  strip.style.width=(step+.65)+'px';
  const faces=[];
  for(const [side,source,index] of [['front',frontPage,i],['back',backPage,count-1-i]]){
   const face=document.createElement('div');face.className='leaf-side leaf-'+side;
   const print=source.cloneNode(true);print.removeAttribute('id');
   print.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
   print.classList.add('leaf-print');
   Object.assign(print.style,{width:width+'px',height:height+'px',left:-index*step+'px'});
   const shade=document.createElement('div');shade.className='leaf-shade';
   face.append(print,shade);strip.append(face);faces.push(face);
  }
  sheet.append(strip);strips.push({strip,faces});
 }
 let frameId,done=false;
 const animation=sheet.animate([{},{}],{duration:1250,fill:'forwards'});
 function draw(){
  if(done)return;
  const raw=Math.min(1,Math.max(0,(animation.currentTime||0)/1250));
  const ease=raw*raw*(3-2*raw), progress=forward?ease:1-ease;
  const base=progress*Math.PI, curl=Math.sin(progress*Math.PI)*.62;
  let x=0,z=0;
  strips.forEach(({strip,faces},i)=>{
   const u=(i+.5)/count;
   const angle=base+curl*(u*2-1);
   strip.style.transform=`translate3d(${x}px,0,${z}px) rotateY(${-angle}rad)`;
   const facingFront=Math.cos(angle)>=0;
   // Explicit face selection also protects against browser compositor flattening.
   faces[0].style.visibility=facingFront?'visible':'hidden';
   faces[1].style.visibility=facingFront?'hidden':'visible';
   const shade=.04+.19*Math.sin(angle)**2;
   faces.forEach(face=>face.lastElementChild.style.opacity=String(shade));
   x+=Math.cos(angle)*step;z+=Math.sin(angle)*step;
  });
  sheet.style.setProperty('--cast-shadow',String(Math.sin(raw*Math.PI)*.28));
  frameId=requestAnimationFrame(draw);
 }
 function finish(){if(done)return;done=true;cancelAnimationFrame(frameId);animation.cancel();sheet.replaceChildren();complete();}
 animation.finished.then(finish,()=>{});draw();
 return {finish};
}
