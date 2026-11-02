(()=>{'use strict';
const $=id=>document.getElementById(id),COL={A:'#c9f36b',B:'#70baff'};
const S={n:0,max:11,a:[],b:[],running:false,raf:0,last:0,elapsed:0,speed:850,physicsActive:false,settle:0,balls:{A:[],B:[]},gravity:900,bounce:.58,friction:.985,targets:{A:[],B:[]}};
const MAX_BALLS=110,RADIUS=4.25,STEP=1/120;
const fmt=x=>Number.isFinite(x)?(x<1e6?Math.round(x).toLocaleString('es-AR'):x.toExponential(2)):'∞';
function evaluate(source,n){
 const s=source.replace(/\s+/g,'').toLowerCase(),tokens=s.match(/(?:\d*\.\d+|\d+\.?\d*|[a-z]+|[()+\-*/^!])/g)||[];
 if(tokens.join('')!==s||!tokens.length)throw Error('Revisá la expresión: contiene caracteres no válidos.');
 let p=0,peek=()=>tokens[p],eat=x=>peek()===x?(p++,true):false;
 function primary(){if(eat('+'))return unary();if(eat('-'))return-unary();if(eat('(')){let v=expr();if(!eat(')'))throw Error('Falta cerrar un paréntesis.');return v}
 const t=tokens[p++];if(t==='n'||t==='x')return n;if(t==='pi')return Math.PI;if(t==='e')return Math.E;if(/^\d/.test(t||''))return Number(t);throw Error('Usá n, números y operaciones válidas.')}
 function postfix(){let v=primary();while(eat('!')){if(!Number.isInteger(v)||v<0||v>170)throw Error('El factorial requiere un entero entre 0 y 170.');let z=1;for(let j=2;j<=v;j++)z*=j;v=z}return v}
 function power(){let v=postfix();if(eat('^'))v=Math.pow(v,unary());return v}
 function unary(){if(eat('+'))return unary();if(eat('-'))return-unary();return power()}
 function term(){let v=unary();while(peek()==='*'||peek()==='/'){let op=tokens[p++],w=unary();v=op==='*'?v*w:v/w}return v}
 function expr(){let v=term();while(peek()==='+'||peek()==='-'){let op=tokens[p++],w=term();v=op==='+'?v+w:v-w}return v}
 const v=expr();if(p!==tokens.length)throw Error('Revisá los operadores y paréntesis.');if(!Number.isFinite(v)||v<0)throw Error('El resultado debe ser finito y no negativo.');return Math.min(v,1e15)
}
function pretty(s){const sup={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','-':'⁻'};return s.replaceAll('*',' · ').replace(/\^(-?[\w]+)/g,(_,e)=>Array.from(e).map(ch=>sup[ch]||ch).join(''))}
function names(){for(const k of ['A','B']){$('laneName'+k).textContent=$('name'+k).value.trim()||'Pista '+k;$('formula'+k).textContent=(k==='A'?'f(n) = ':'g(n) = ')+pretty($('f'+k).value)}}
function validate(){let good=true;for(const k of ['A','B']){try{evaluate($('f'+k).value,S.max);$('err'+k).textContent=''}catch(e){$('err'+k).textContent=e.message;good=false}}return good}
function canvasSize(k){const c=$('canvas'+k),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(!r.width||!r.height)return null;if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);return{c,ctx,w:r.width,h:r.height}}
function geometry(w,h){const top=18,bottom=h-13,gap=(bottom-top)/S.max,pegs=[];for(let i=1;i<=S.max;i++){const y=top+(i-.5)*gap,x=(i%2? w*.37:w*.63);pegs.push({x,y,r:5.1});if(gap>23)pegs.push({x:w-x,y:y+gap*.28,r:3.8})}return{left:13,right:w-13,floor:h-13,top,pegs,gap}}
function targetFor(k,n){const vals=S.targets[k],v=vals[n-1]||0,max=vals[vals.length-1]||1;return Math.min(MAX_BALLS,Math.max(0,Math.round(MAX_BALLS*Math.log1p(v)/Math.log1p(max))))}
function prepareTargets(){for(const k of ['A','B']){S.targets[k]=[];for(let n=1;n<=S.max;n++)S.targets[k].push(evaluate($('f'+k).value,n))}}
function spawn(k,target){const arr=S.balls[k],size=$('canvas'+k).clientWidth||320,add=Math.max(0,Math.min(MAX_BALLS,target)-arr.length);for(let i=0;i<add;i++){const spread=Math.max(20,size-42);arr.push({x:21+Math.random()*spread,y:-8-Math.random()*30,vx:(Math.random()-.5)*48,vy:15+Math.random()*25,r:RADIUS,m:1,spin:(Math.random()-.5)*2})}}
function collidePeg(b,p){let dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||.001,min=b.r+p.r;if(d>=min)return;const nx=dx/d,ny=dy/d,over=min-d;b.x+=nx*over;b.y+=ny*over;const vn=b.vx*nx+b.vy*ny;if(vn<0){const j=-(1+S.bounce)*vn;b.vx+=j*nx;b.vy+=j*ny;const tx=-ny,ty=nx,vt=b.vx*tx+b.vy*ty;b.vx-=vt*tx*(1-S.friction)*.42;b.vy-=vt*ty*(1-S.friction)*.42}}
function collideBalls(arr){for(let i=0;i<arr.length;i++){const a=arr[i];for(let j=i+1;j<arr.length;j++){const b=arr[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,min=a.r+b.r;if(d2>=min*min)continue;const d=Math.sqrt(d2)||.001,nx=dx/d,ny=dy/d,over=min-d;a.x-=nx*over*.5;a.y-=ny*over*.5;b.x+=nx*over*.5;b.y+=ny*over*.5;const rvx=b.vx-a.vx,rvy=b.vy-a.vy,vn=rvx*nx+rvy*ny;if(vn<0){const impulse=-(1+S.bounce)*vn*.5,ix=impulse*nx,iy=impulse*ny;a.vx-=ix;a.vy-=iy;b.vx+=ix;b.vy+=iy;const tx=-ny,ty=nx,vt=rvx*tx+rvy*ty,fr=vt*(1-S.friction)*.18;a.vx+=tx*fr;a.vy+=ty*fr;b.vx-=tx*fr;b.vy-=ty*fr}}}}
function simulateLane(k,dt){const canvas=$('canvas'+k),w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;const g=geometry(w,h),arr=S.balls[k],steps=Math.max(1,Math.ceil(dt/STEP)),sub=dt/steps;
 for(let s=0;s<steps;s++){for(const b of arr){b.vy=Math.min(1500,b.vy+S.gravity*sub);b.vx*=1-.025*sub;b.vy*=1-.003*sub;b.x+=b.vx*sub;b.y+=b.vy*sub;
 if(b.x-b.r<g.left){b.x=g.left+b.r;b.vx=Math.abs(b.vx)*S.bounce}if(b.x+b.r>g.right){b.x=g.right-b.r;b.vx=-Math.abs(b.vx)*S.bounce}
 if(b.y+b.r>g.floor){b.y=g.floor-b.r;b.vy=b.vy>40?-b.vy*S.bounce:0;b.vx*=S.friction;if(Math.abs(b.vx)<2)b.vx=0}
 for(const p of g.pegs)collidePeg(b,p);
 }collideBalls(arr);
 for(const b of arr){if(b.y>h+30){b.y=-10;b.vy=0}}
 }}
function draw(k){const o=canvasSize(k);if(!o)return;const{ctx,w,h}=o,g=geometry(w,h),color=COL[k];ctx.clearRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#0b1623');bg.addColorStop(1,'#101d2b');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 // Subtle grid and level guides
 ctx.strokeStyle='#1b2b3c';ctx.lineWidth=1;for(let y=30;y<h-20;y+=24){ctx.beginPath();ctx.moveTo(g.left+2,y);ctx.lineTo(g.right-2,y);ctx.stroke()}
 ctx.strokeStyle='#506176';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(g.left,8);ctx.lineTo(g.left,g.floor);ctx.moveTo(g.right,8);ctx.lineTo(g.right,g.floor);ctx.moveTo(g.left,g.floor);ctx.lineTo(g.right,g.floor);ctx.stroke();
 g.pegs.forEach((p,i)=>{ctx.save();ctx.shadowColor=color;ctx.shadowBlur=7;const gr=ctx.createRadialGradient(p.x-1.8,p.y-2,0,p.x,p.y,p.r*1.6);gr.addColorStop(0,'#f5f8ff');gr.addColorStop(.3,color);gr.addColorStop(1,k==='A'?'#66832d':'#286493');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.restore()});
 // Balls are rendered from their actual physical coordinates
 const balls=S.balls[k];for(const b of balls){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=6;const gr=ctx.createRadialGradient(b.x-b.r*.38,b.y-b.r*.42,.4,b.x,b.y,b.r*1.35);gr.addColorStop(0,'#ffffff');gr.addColorStop(.18,color);gr.addColorStop(1,k==='A'?'#647d2e':'#245d8c');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#ffffffbb';ctx.beginPath();ctx.arc(b.x-b.r*.34,b.y-b.r*.38,b.r*.2,0,Math.PI*2);ctx.fill();ctx.restore()}
 ctx.fillStyle='#71849a';ctx.font='8px "DM Mono",monospace';ctx.textAlign='left';ctx.fillText(balls.length+' cuerpos físicos',8,h-3)}
function values(k){const a=k==='A'?S.a:S.b;return a.length?a[a.length-1]:0}
function render(){const a=values('A'),b=values('B');for(const k of ['A','B']){$('count'+k).textContent=fmt(values(k));$('at'+k).textContent=(S.n||'—')+' / '+S.max;$('final'+k).textContent='VALOR: '+fmt(values(k));draw(k)}$('progressLabel').textContent=S.n+' / '+S.max+' PAREDES';
 const leader=a===b?'Empate':a>b?'Pista A':'Pista B';$('leader').textContent=S.n?leader:'—';$('diff').textContent=S.n?fmt(Math.abs(a-b)):'—';$('ratio').textContent=S.n?fmt(Math.max(a,b)/Math.max(1,Math.min(a,b)))+'×':'—';
 $('winner').textContent=!S.n?'Todavía no se cruzó la primera pared.':S.n===S.max?(a===b?'¡Empate!':(a>b?$('nameA').value:$('nameB').value)+' termina adelante con '+fmt(Math.max(a,b))+' pelotas.'):(a===b?'Las dos pistas están empatadas.':(a>b?$('nameA').value:$('nameB').value)+' va adelante.');
 const body=$('history');body.replaceChildren();if(!S.n){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='La tabla se completa durante la carrera.';tr.append(td);body.append(tr)}else for(let i=0;i<S.n;i++){const tr=document.createElement('tr'),lead=S.a[i]===S.b[i]?'Empate':S.a[i]>S.b[i]?'Pista A':'Pista B';[i+1,fmt(S.a[i]),fmt(S.b[i]),lead].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});body.append(tr)}
}
function updatePhysicsLabels(){S.gravity=+$('gravity').value;S.bounce=+$('bounce').value;S.friction=+$('friction').value;$('gravityOut').textContent=String(S.gravity);$('bounceOut').textContent=S.bounce.toFixed(2).replace('.',',');$('frictionOut').textContent=S.friction.toFixed(3).replace('.',',');$('physicsReadout').textContent='FÍSICA ACTIVA · GRAVEDAD '+S.gravity+' · REBOTE '+S.bounce.toFixed(2).replace('.',',')+' · FRICCIÓN '+S.friction.toFixed(3).replace('.',',')}
function updateStatus(){if(S.running){$('status').textContent='EN CURSO';$('play').textContent='Ⅱ Pausar'}else if(S.n===S.max&&S.n){$('status').textContent='FINALIZADA';$('play').textContent='↻ Repetir'}else if(S.n){$('status').textContent='EN PAUSA';$('play').textContent='▶ Reanudar'}else{$('status').textContent='LISTA';$('play').textContent='▶ Iniciar'}}
function advance(){if(S.n>=S.max)return false;const n=S.n+1;try{S.a.push(evaluate($('fA').value,n));S.b.push(evaluate($('fB').value,n))}catch(e){return false}S.n=n;for(const k of ['A','B'])spawn(k,targetFor(k,n));S.physicsActive=true;S.settle=2.3;render();updateStatus();return true}
function stop(){S.running=false;S.elapsed=0;S.settle=Math.max(S.settle,1.1);updateStatus()}
function frame(t){if(!S.raf)return;if(!S.last)S.last=t;let dt=Math.min(.032,(t-S.last)/1000);S.last=t;if(S.physicsActive){simulateLane('A',dt);simulateLane('B',dt);S.settle-=dt;if(S.settle<=0&&!S.running){S.physicsActive=false;S.settle=0}draw('A');draw('B')}
 if(S.running){S.elapsed+=dt*1000;if(S.elapsed>=S.speed){S.elapsed=0;if(!advance()){S.running=false;S.settle=2.5;updateStatus()}}}
 if(S.running||S.physicsActive){S.raf=requestAnimationFrame(frame)}else{cancelAnimationFrame(S.raf);S.raf=0;S.last=0}}
function wake(){if(!S.raf){S.last=0;S.raf=requestAnimationFrame(frame)}}
function start(){if(!validate())return;if(S.n===S.max)resetRace();if(S.running){stop();return}S.running=true;S.physicsActive=true;S.settle=2.5;updateStatus();wake()}
function resetRace(){S.running=false;S.physicsActive=false;S.settle=0;if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;S.last=0;S.elapsed=0;S.n=0;S.a=[];S.b=[];S.balls={A:[],B:[]};render();updateStatus()}
function showRace(){if(!validate()){$('validation').textContent='● REVISÁ LAS FUNCIONES';return}S.max=+$('walls').value;names();prepareTargets();$('setupScreen').classList.add('hidden');$('raceScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});resetRace();requestAnimationFrame(()=>{draw('A');draw('B')})}
function showSetup(){stop();S.physicsActive=false;if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;$('raceScreen').classList.add('hidden');$('setupScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
$('walls').oninput=()=>{$('wallNum').textContent=$('walls').value;$('wallHint').textContent=$('walls').value};
$('launch').onclick=showRace;$('back').onclick=showSetup;$('play').onclick=start;$('step').onclick=()=>{if(S.running)stop();if(S.n<S.max){advance();wake()}};
$('restart').onclick=resetRace;$('speed').onchange=()=>S.speed=+$('speed').value;
['gravity','bounce','friction'].forEach(id=>$(id).addEventListener('input',updatePhysicsLabels));
['fA','fB','nameA','nameB'].forEach(id=>$(id).addEventListener('input',()=>{names();if(validate())$('validation').textContent='● FUNCIONES VÁLIDAS';else $('validation').textContent='● REVISÁ LAS FUNCIONES'}));
document.querySelectorAll('[data-f]').forEach(btn=>btn.onclick=()=>{$(btn.dataset.f).value=btn.dataset.v;names();validate();$('validation').textContent='● FUNCIONES VÁLIDAS'});
$('csv').onclick=()=>{if(!S.n)return;const rows=[['Pared','Pista A','Pista B','Ventaja']];for(let i=0;i<S.n;i++)rows.push([i+1,S.a[i],S.b[i],S.a[i]===S.b[i]?'Empate':S.a[i]>S.b[i]?'Pista A':'Pista B']);const blob=new Blob(['\ufeff'+rows.map(r=>r.join(';')).join('\n')],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='function-race.csv';a.click();URL.revokeObjectURL(url)};
$('help').onclick=()=>$('dialog').showModal();$('close').onclick=()=>$('dialog').close();window.addEventListener('resize',()=>{draw('A');draw('B')});
$('walls').value=11;S.max=11;names();$('wallNum').textContent='11';$('wallHint').textContent='11';updatePhysicsLabels();render();
})();