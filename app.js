(()=>{'use strict';
const $=id=>document.getElementById(id),COL={A:'#c9f36b',B:'#70baff'};
const S={n:0,max:11,a:[],b:[],running:false,raf:0,last:0,elapsed:0,speed:850,animStart:0,animating:false,balls:{A:[],B:[]}};
const fmt=x=>Number.isFinite(x)?(x<1e6?Math.round(x).toLocaleString('es-AR'):x.toExponential(2)):'∞';
function evaluate(source,n){
 const s=source.replace(/\s+/g,'').toLowerCase();const tokens=s.match(/(?:\d*\.\d+|\d+\.?\d*|[a-z]+|[()+\-*/^!])/g)||[];
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
function pretty(s){return s.replace(/\*/g,' · ').replace(/\^([\w]+)/g,'$1').replace(/n3/g,'n³').replace(/n2/g,'n²')}
function names(){for(const k of ['A','B']){$('laneName'+k).textContent=$('name'+k).value.trim()||'Pista '+k;$('formula'+k).textContent=(k==='A'?'f(n) = ':'g(n) = ')+pretty($('f'+k).value)}}
function validate(){let good=true;for(const k of ['A','B']){try{evaluate($('f'+k).value,S.max);$('err'+k).textContent=''}catch(e){$('err'+k).textContent=e.message;good=false}}return good}
function makeBalls(k,value,now){const c=$('canvas'+k),w=c.clientWidth||320;const count=Math.min(112,Math.max(0,Math.ceil(value)));const cols=Math.max(8,Math.floor((w-48)/13));const arr=[];for(let i=0;i<count;i++){const row=Math.floor(i/cols),col=i%cols,per=Math.min(cols,count-row*cols);const x=(w-(per-1)*13)/2+col*13;const y=now-16-row*12;arr.push({x,y,r:5.1,delay:Math.min(i*5,420),seed:(i*17+count*13)%31})}return arr}
function draw(k,progress=1){const c=$('canvas'+k),rect=c.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;if(!w||!h)return;if(c.width!==Math.round(w*d)||c.height!==Math.round(h*d)){c.width=Math.round(w*d);c.height=Math.round(h*d)}const ctx=c.getContext('2d');ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
 const color=COL[k],now=h-28,left=23,right=w-23,wallTop=25,wallBottom=h-26,gap=(wallBottom-wallTop)/S.max;
 // chamber rails and calibrated wall marks
 const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#0b1521');bg.addColorStop(1,'#101b29');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#26384a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(left,14);ctx.lineTo(left,now+2);ctx.moveTo(right,14);ctx.lineTo(right,now+2);ctx.stroke();
 for(let j=1;j<=S.max;j++){const y=wallTop+(j-1)*gap;ctx.strokeStyle=j<=S.n?color+'8c':'#263648';ctx.lineWidth=j===S.n?1.6:1;ctx.beginPath();ctx.moveTo(left+3,y);ctx.lineTo(right-3,y);ctx.stroke();ctx.fillStyle=j<=S.n?'#c4d1df':'#65768a';ctx.font='8px "DM Mono",monospace';ctx.textAlign='left';ctx.fillText(String(j).padStart(2,'0'),5,y+3);if(j<=S.n){ctx.fillStyle=color;ctx.beginPath();ctx.arc(right-3,y,2,0,Math.PI*2);ctx.fill()}}
 // floor
 ctx.fillStyle='#34465a';ctx.fillRect(left,now+4,right-left,2);
 const balls=S.balls[k]||[];ctx.save();ctx.shadowColor=color;ctx.shadowBlur=7;
 for(let i=0;i<balls.length;i++){const b=balls[i],t=Math.max(0,Math.min(1,(progress*900-b.delay)/360)),ease=1-Math.pow(1-t,3),x=b.x,y=-12+(b.y+12)*ease;ctx.globalAlpha=.35+.65*ease;
 const grad=ctx.createRadialGradient(x-2,y-2,0,x,y,b.r*1.7);grad.addColorStop(0,'#ffffff');grad.addColorStop(.18,color);grad.addColorStop(1,k==='A'?'#789b31':'#286ca7');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,b.r,0,Math.PI*2);ctx.fill();
 ctx.shadowBlur=0;ctx.fillStyle='#ffffffaa';ctx.beginPath();ctx.arc(x-1.8,y-2,1.25,0,Math.PI*2);ctx.fill();ctx.shadowBlur=7;
 }
 ctx.restore();ctx.textAlign='center';ctx.fillStyle='#7f91a6';ctx.font='8px "DM Mono",monospace';ctx.fillText('n = '+S.n+'  /  '+S.max,w/2,h-7);ctx.textAlign='left';
}
function values(k){const a=k==='A'?S.a:S.b;return a.length?a[a.length-1]:0}
function render(){const a=values('A'),b=values('B');for(const k of ['A','B']){$('count'+k).textContent=fmt(values(k));$('at'+k).textContent=(S.n||'—')+' / '+S.max;$('final'+k).textContent='VALOR: '+fmt(values(k));$('progressLabel').textContent=S.n+' / '+S.max+' PAREDES';draw(k,S.animating?0:1)}
 const leader=a===b?'Empate':a>b?'Pista A':'Pista B';$('leader').textContent=S.n?leader:'—';$('diff').textContent=S.n?fmt(Math.abs(a-b)):'—';$('ratio').textContent=S.n?fmt(Math.max(a,b)/Math.max(1,Math.min(a,b)))+'×':'—';
 $('winner').textContent=!S.n?'Todavía no se cruzó la primera pared.':S.n===S.max?(a===b?'¡Empate!':(a>b?$('nameA').value:$('nameB').value)+' termina adelante con '+fmt(Math.max(a,b))+' pelotas.'):(a===b?'Las dos pistas están empatadas.':(a>b?$('nameA').value:$('nameB').value)+' va adelante.');
 const body=$('history');body.replaceChildren();if(!S.n){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='La tabla se completa durante la carrera.';tr.append(td);body.append(tr)}else for(let i=0;i<S.n;i++){const tr=document.createElement('tr'),leader=S.a[i]===S.b[i]?'Empate':S.a[i]>S.b[i]?'Pista A':'Pista B';[i+1,fmt(S.a[i]),fmt(S.b[i]),leader].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td)});body.append(tr)}
}
function updateBalls(){for(const k of ['A','B'])S.balls[k]=makeBalls(k,values(k),$('canvas'+k).clientHeight||330)}
function step(){if(S.n>=S.max)return false;const n=S.n+1;try{S.a.push(evaluate($('fA').value,n));S.b.push(evaluate($('fB').value,n))}catch(e){return false}S.n=n;updateBalls();S.animating=true;S.animStart=performance.now();render();$('status').textContent='EN CURSO';return true}
function pause(){S.running=false;cancelAnimationFrame(S.raf);$('play').textContent=S.n===S.max?'↻ Repetir':'▶ Reanudar';if(S.n===S.max)$('status').textContent='FINALIZADA';else if(S.n)$('status').textContent='EN PAUSA';}
function tick(t){if(!S.running)return;if(!S.last)S.last=t;const dt=t-S.last;S.last=t;S.elapsed+=dt;let p=Math.min(1,(t-S.animStart)/900);if(S.animating){draw('A',p);draw('B',p);if(p>=1)S.animating=false}if(S.elapsed>=S.speed){S.elapsed=0;if(!step()){pause();return}}S.raf=requestAnimationFrame(tick)}
function start(){if(!validate())return;if(S.n===S.max)resetRace();if(S.running){pause();return}S.running=true;S.last=0;S.elapsed=0;$('play').textContent='Ⅱ Pausar';$('status').textContent='EN CURSO';S.raf=requestAnimationFrame(tick)}
function resetRace(){pause();S.n=0;S.a=[];S.b=[];S.balls={A:[],B:[]};render();$('status').textContent='LISTA';$('play').textContent='▶ Iniciar'}
function setupReset(){S.max=+$('walls').value;$('wallNum').textContent=S.max;$('wallHint').textContent=S.max;names();resetRace();draw('A');draw('B')}
function showRace(){if(!validate()){$('validation').textContent='● REVISÁ LAS FUNCIONES';return}S.max=+$('walls').value;names();$('setupScreen').classList.add('hidden');$('raceScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});resetRace();requestAnimationFrame(()=>{draw('A');draw('B')})}
function showSetup() {pause();$('raceScreen').classList.add('hidden');$('setupScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
$('walls').oninput=()=>{$('wallNum').textContent=$('walls').value;$('wallHint').textContent=$('walls').value};
$('launch').onclick=showRace;$('back').onclick=showSetup;$('play').onclick=start;$('step').onclick=()=>{if(S.running)pause();if(S.n<S.max){step();if(S.n===S.max)pause();else $('play').textContent='▶ Reanudar'}};
$('restart').onclick=resetRace;$('speed').onchange=()=>S.speed=+$('speed').value;

['fA','fB','nameA','nameB'].forEach(id=>$(id).addEventListener('input',()=>{names();if(validate())$('validation').textContent='● FUNCIONES VÁLIDAS';else $('validation').textContent='● REVISÁ LAS FUNCIONES'}));
document.querySelectorAll('[data-f]').forEach(btn=>btn.onclick=()=>{$(btn.dataset.f).value=btn.dataset.v;names();validate();$('validation').textContent='● FUNCIONES VÁLIDAS'});
$('csv').onclick=()=>{if(!S.n)return;const rows=[['Pared','Pista A','Pista B','Ventaja']];for(let i=0;i<S.n;i++)rows.push([i+1,S.a[i],S.b[i],S.a[i]===S.b[i]?'Empate':S.a[i]>S.b[i]?'Pista A':'Pista B']);const blob=new Blob(['\ufeff'+rows.map(r=>r.join(';')).join('\n')],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='function-race.csv';a.click();URL.revokeObjectURL(url)};
$('help').onclick=()=>$('dialog').showModal();$('close').onclick=()=>$('dialog').close();window.addEventListener('resize',()=>{draw('A');draw('B')});
$('walls').value=11;S.max=11;names();$('wallNum').textContent='11';$('wallHint').textContent='11';render();
})();