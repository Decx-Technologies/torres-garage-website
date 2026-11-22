const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function vehicleProfile(v={}){
 const text=String(v.type+' '+v.name).toLowerCase(),color=String(v.color||'').toLowerCase();
 const kind=/pickup|pick.up|hilux|ranger|tacoma|amarok|f.?150|frontier|colorado|d.max/.test(text)?'pickup':/sed[aá]n|sedan|coup[eé]|hatch|civic|corolla|swift|yaris|mazda ?3/.test(text)?'sedan':'suv';
 const paint=/negro|black/.test(color)?'#323b46':/rojo|red/.test(color)?'#bd1934':/azul|blue/.test(color)?'#225f9e':/verde|green/.test(color)?'#466558':/gris|gray|grey/.test(color)?'#7c8995':/plata|silver/.test(color)?'#aeb9c4':/amarillo|yellow/.test(color)?'#d3a426':'#e1e5eb';
 return{kind,paint,label:kind==='pickup'?'camioneta':kind==='sedan'?'automóvil':'SUV',colorConfirmed:!!color};
}
export function buildVehicleMesh(profile){
 const faces=[],paint=profile.paint,glass='#17394a',black='#111923',silver='#a1afbf';
 const face=(points,color)=>faces.push({points,color});
 const box=(x,y,z,w,h,d,color)=>{const p=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];for(const ids of [[0,3,2,1],[4,5,6,7],[0,1,5,4],[3,7,6,2],[0,4,7,3],[1,2,6,5]])face(ids.map(i=>p[i]),color);};
 const suv=profile.kind==='suv',pickup=profile.kind==='pickup',roof=suv?1.9:pickup?1.84:1.65;
 box(-2.12,.49,-.85,4.24,.55,1.7,paint);box(-2.16,.48,-.87,4.32,.12,1.74,black);
 box(.8,1.04,-.82,1.26,.13,1.64,paint);
 if(pickup){box(-2.03,1.05,-.66,1.43,.035,1.32,black);box(-2.08,1.05,-.84,1.55,.21,.16,paint);box(-2.08,1.05,.68,1.55,.21,.16,paint);box(-2.08,1.05,-.83,.12,.21,1.66,paint);}
 const rear=pickup?-.58:suv?-1.78:-1.25,front=.88,topRear=pickup?-.5:suv?-1.67:-.75,topFront=.35,bottom=1.05;
 const cabin=[[rear,bottom,-.8],[front,bottom,-.8],[topFront,roof,-.65],[topRear,roof,-.65],[rear,bottom,.8],[front,bottom,.8],[topFront,roof,.65],[topRear,roof,.65]];
 face([cabin[3],cabin[7],cabin[6],cabin[2]],paint);face([cabin[1],cabin[2],cabin[6],cabin[5]],glass);face([cabin[0],cabin[4],cabin[7],cabin[3]],glass);
 face([cabin[0],cabin[3],cabin[2],cabin[1]],glass);face([cabin[4],cabin[5],cabin[6],cabin[7]],glass);
 // Pillars and door trim keep the silhouette readable from every orbit angle.
 for(const side of [-1,1]){const z=side*.805;box(rear,1.05,z-.025,.10,roof-1.05,.05,paint);if(!pickup)box(-.65,1.08,z-.026,.09,roof-1.08,.052,black);box(rear,1.04,z-.02,front-rear,.055,.04,paint);box(.49,1.08,side*.98-.06,.23,.12,.12,black);for(const x of pickup?[.1]:[-1.2,.1])box(x,.94,side*.86-.018,.19,.025,.036,silver);}
 if(suv){for(const side of [-1,1])box(-1.6,roof+.03,side*.49-.025,1.85,.065,.05,black);for(const x of [-1.3,-.1])box(x,roof+.03,-.53,.05,.06,1.06,black);}
 const wheel=(x,z)=>{const segments=20,r=.43,centerY=.48,width=.21;for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;face([[x+Math.cos(a)*r,centerY+Math.sin(a)*r,z-width/2],[x+Math.cos(b)*r,centerY+Math.sin(b)*r,z-width/2],[x+Math.cos(b)*r,centerY+Math.sin(b)*r,z+width/2],[x+Math.cos(a)*r,centerY+Math.sin(a)*r,z+width/2]],'#151b23');}for(const side of [-1,1]){const zz=z+side*(width/2+.003),points=Array.from({length:segments},(_,i)=>[x+Math.cos(i/segments*Math.PI*2)*r,centerY+Math.sin(i/segments*Math.PI*2)*r,zz]);face(points,black);face(Array.from({length:segments},(_,i)=>[x+Math.cos(i/segments*Math.PI*2)*r*.62,centerY+Math.sin(i/segments*Math.PI*2)*r*.62,zz+side*.003]),silver);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;face([[x,centerY,zz+side*.006],[x+Math.cos(a)*.23,centerY+Math.sin(a)*.23,zz+side*.006],[x+Math.cos(a+.3)*.15,centerY+Math.sin(a+.3)*.15,zz+side*.006]],'#344354');}}};
 for(const x of [-1.33,1.34])for(const z of [-.86,.86])wheel(x,z);
 box(2.125,.67,-.48,.025,.23,.96,black);for(const z of [-.68,.4]){box(2.13,.9,z,.025,.11,.28,'#d6f6ff');box(-2.15,.86,z,.025,.16,.28,'#ed2443');}box(2.15,.53,-.4,.03,.10,.8,silver);box(-2.18,.53,-.4,.03,.10,.8,silver);
 return faces;
}
const shade=(hex,n)=>{const c=parseInt(hex.slice(1),16);return`rgb(${[c>>16,(c>>8)&255,c&255].map(v=>Math.round(clamp(v*n,0,255))).join(',')})`;};
export function createVehicleMedia(vehicle,photos,node){
 const host=node('div','vehicle-media-panel'),tabs=node('div','vehicle-view-tabs'),photoButton=node('button','','Fotografías'),modelButton=node('button','','Simulación 3D'),preview=node('section','vehicle-3d-preview');preview.hidden=true;preview.setAttribute('aria-label','Simulación 3D ilustrativa del vehículo');
 for(const b of [photoButton,modelButton])b.type='button';photoButton.setAttribute('aria-pressed','true');modelButton.setAttribute('aria-pressed','false');tabs.append(photoButton,modelButton);host.append(tabs,photos,preview);
 let renderer=null;function choose(model){photos.hidden=model;preview.hidden=!model;photoButton.setAttribute('aria-pressed',String(!model));modelButton.setAttribute('aria-pressed',String(model));if(model){if(!renderer)renderer=mountViewer(preview,vehicle,node);renderer.start();}else renderer?.stop();}
 photoButton.onclick=()=>choose(false);modelButton.onclick=()=>choose(true);return host;
}
function mountViewer(section,vehicle,node){
 const profile=vehicleProfile(vehicle),mesh=buildVehicleMesh(profile),stage=node('div','vehicle-3d-stage'),canvas=node('canvas'),caption=node('p','vehicle-3d-note',`Modelo 3D ilustrativo de ${profile.label}. No es una reproducción exacta de este ${vehicle.make} ${vehicle.name}; confirma su diseño y detalles en las fotos reales.`);canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Vehículo 3D. Arrastra para girar; usa flechas para rotar y más o menos para acercar.');
 stage.append(canvas,node('span','vehicle-3d-badge','VISTA ILUSTRATIVA · 360°'));section.append(stage,node('p','vehicle-3d-hint','Arrastra para girar · Usa los controles para acercarte'),caption);const controls=node('div','vehicle-3d-controls');section.append(controls);
 let yaw=-.6,pitch=.18,zoom=1,automatic=!matchMedia('(prefers-reduced-motion: reduce)').matches,raf=0,running=false,last=0,idleUntil=0,drag=null,width=0,height=0;const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx){section.replaceChildren(node('p','','La simulación no está disponible en este navegador. Puedes ver las fotografías del vehículo.'));return{start(){},stop(){}};}
 const button=(label,fn)=>{const b=node('button','',label);b.type='button';b.onclick=fn;controls.append(b);return b;};
 const rotate=button(automatic?'Pausar giro':'Girar automáticamente',()=>{automatic=!automatic;rotate.textContent=automatic?'Pausar giro':'Girar automáticamente';rotate.setAttribute('aria-pressed',String(automatic));draw();});rotate.setAttribute('aria-pressed',String(automatic));
 const change=fn=>{idleUntil=performance.now()+3500;fn();draw();};button('Acercar +',()=>change(()=>zoom=clamp(zoom+.15,.7,1.65)));button('Alejar −',()=>change(()=>zoom=clamp(zoom-.15,.7,1.65)));button('Restablecer vista',()=>change(()=>{yaw=-.6;pitch=.18;zoom=1;}));
 const presets=node('div','vehicle-3d-presets');section.append(presets);for(const [label,angle]of [['Frente',-Math.PI/2],['Lateral',0],['Atrás',Math.PI/2]]){const b=node('button','',label);b.type='button';b.onclick=()=>change(()=>{yaw=angle;pitch=.13;});presets.append(b);}
 const transform=p=>{const [x,y,z]=p,xx=x*Math.cos(yaw)+z*Math.sin(yaw),zz=-x*Math.sin(yaw)+z*Math.cos(yaw),yy=y-.8;return[xx,yy*Math.cos(pitch)-zz*Math.sin(pitch),yy*Math.sin(pitch)+zz*Math.cos(pitch)];};
 const project=p=>{const q=transform(p),scale=Math.min(width/6.7,height/4.1)*zoom*7/(7-q[2]);return[width/2+q[0]*scale,height*.57-q[1]*scale,q[2]];};
 function draw(){if(!width||!height)return;const light=document.body.classList.contains('light');ctx.fillStyle=light?'#eef2f7':'#0b111b';ctx.fillRect(0,0,width,height);const glow=ctx.createRadialGradient(width*.5,height*.6,10,width*.5,height*.6,width*.6);glow.addColorStop(0,light?'#d4dce8':'#243449');glow.addColorStop(1,light?'#eef2f7':'#0b111b');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
 ctx.strokeStyle=light?'#bdc9d744':'#7794bc19';ctx.lineWidth=1;for(let i=-5;i<=5;i++){for(const ends of [[[i,.03,-5],[i,.03,5]],[[-5,.03,i],[5,.03,i]]]){const a=project(ends[0]),b=project(ends[1]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();}}
 const shadow=Array.from({length:40},(_,i)=>project([2.5*Math.cos(i/40*Math.PI*2),.035,1.15*Math.sin(i/40*Math.PI*2)]));ctx.fillStyle='#0000003d';ctx.beginPath();shadow.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fill();
 const sorted=mesh.map(f=>{const points=f.points.map(project),a=f.points[0],b=f.points[1],c=f.points[2],u=b.map((n,i)=>n-a[i]),v=c.map((n,i)=>n-a[i]),normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...normal)||1,intensity=.60+.40*Math.abs((normal[0]*.3+normal[1]*.85+normal[2]*.4)/length);return{points,color:shade(f.color,intensity),depth:points.reduce((n,p)=>n+p[2],0)/points.length};}).sort((a,b)=>a.depth-b.depth);
 for(const f of sorted){ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();ctx.strokeStyle=f.color;ctx.lineWidth=.55;ctx.stroke();}
 }
 function resize(){const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
 const size=new ResizeObserver(resize);size.observe(stage);
 canvas.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};idleUntil=Infinity;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;yaw+=(e.clientX-drag.x)*.012;pitch=clamp(pitch+(e.clientY-drag.y)*.007,-.12,.7);drag.x=e.clientX;drag.y=e.clientY;draw();});const release=e=>{if(drag?.id!==e.pointerId)return;drag=null;idleUntil=performance.now()+3500;};canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
 canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();change(()=>{if(e.key==='ArrowLeft')yaw-=.15;else if(e.key==='ArrowRight')yaw+=.15;else if(e.key==='ArrowUp')pitch=clamp(pitch+.08,-.12,.7);else if(e.key==='ArrowDown')pitch=clamp(pitch-.08,-.12,.7);else zoom=clamp(zoom+(e.key==='-'?-.1:.1),.7,1.65);});});
 function tick(now){raf=0;if(!running||!section.isConnected||section.hidden||!section.closest('dialog')?.open)return;if(!document.hidden&&automatic&&now>idleUntil){yaw+=Math.min((now-last)/1000,.05)*.15;draw();}last=now;raf=requestAnimationFrame(tick);}
 function start(){if(running)return;running=true;last=performance.now();resize();raf=requestAnimationFrame(tick);}function stop(){running=false;cancelAnimationFrame(raf);raf=0;}
 const dialog=section.closest('dialog');dialog?.addEventListener('close',()=>{stop();size.disconnect();},{once:true});return{start,stop};
}
