(()=>{'use strict';
const $=id=>document.getElementById(id),C={A:'#d4fa75',B:'#83c7ff'};
const S={n:{A:0,B:0},max:11,running:false,raf:0,last:0,speed:1,balls:{A:[],B:[]},totals:{A:0,B:0},life:{A:100,B:100},pulse:{A:0,B:0},a:[],b:[],gravity:900,bounce:.58,friction:.985};
const LIMIT=90,R=4.2,EVENTS_PER_FRAME=4;
const fmt=x=>Number.isFinite(x)?(x<1e6?Math.floor(x).toLocaleString('es-AR'):x.toExponential(2)):'∞';
function ev(src,n){
 let s=src.replace(/[×·]/g,'*').replace(/\s/g,'').toLowerCase();
 const t=s.match(/(?:\d*\.\d+|\d+\.?\d*|[a-z]+|[()+\-*/^!])/g)||[];
 if(t.join('')!==s||!t.length)throw Error('Expresión no válida.');
 let p=0,E=x=>t[p]===x?(p++,true):false;
 const starts=()=>t[p]!==undefined&&(/^(?:\d|\.)/.test(t[p])||['n','x','pi','e','('].includes(t[p]));
 function atom(){if(E('(')){let v=expr();if(!E(')'))throw Error('Falta cerrar paréntesis.');return v}
  let z=t[p++];if(z==='n'||z==='x')return n;if(z==='pi')return Math.PI;if(z==='e')return Math.E;
  if(/^(?:\d|\.)/.test(z||''))return Number(z);throw Error('Usá n, números y operaciones.')}
 function post(){let v=atom();while(E('!')){if(!Number.isInteger(v)||v<0||v>170)throw Error('Factorial fuera de rango.');let a=1;for(let j=2;j<=v;j++)a*=j;v=a}return v}
 function unary(){if(E('+'))return unary();if(E('-'))return-unary();return power()}
 function power(){let v=post();if(E('^'))v=Math.pow(v,unary());return v}
 function term(){let v=unary();while(true){if(E('*'))v*=unary();else if(E('/'))v/=unary();else if(starts())v*=unary();else break}return v}
 function expr(){let v=term();while(true){if(E('+'))v+=term();else if(E('-'))v-=term();else break}return v}
 let v=expr();if(p!==t.length||!Number.isFinite(v)||v<0)throw Error('Resultado inválido: debe ser finito y no negativo.');
 return Math.min(1e12,Math.floor(v));
}
function pretty(s){let q={'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','-':'⁻'};return s.replace(/\^(-?[\w]+)/g,(_,v)=>[...v].map(c=>q[c]||c).join('')).replaceAll('*',' · ').replaceAll('×',' · ')}
function labels(){for(let k of ['A','B']){$('laneName'+k).textContent=$('name'+k).value||'Pista '+k;$('formula'+k).textContent=(k==='A'?'f(n) = ':'g(n) = ')+pretty($('f'+k).value)}}
function valid(){let ok=true;for(let k of ['A','B'])try{ev($('f'+k).value,S.max);$('err'+k).textContent=''}catch(e){$('err'+k).textContent=e.message;ok=false}return ok}
function size(k){let c=$('canvas'+k),r=c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);if(!r.width||!r.height)return null;if(c.width!==Math.round(r.width*d)||c.height!==Math.round(r.height*d)){c.width=Math.round(r.width*d);c.height=Math.round(r.height*d)}let x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);return{x,w:r.width,h:r.height}}
function spawn(k,b,num){let a=S.balls[k],w=$('canvas'+k).clientWidth||320,h=$('canvas'+k).clientHeight||250,count=Math.min(num,Math.max(0,LIMIT-a.length));for(let j=0;j<count;j++){let q=Math.random()*Math.PI*2,d=12+Math.random()*23,v=65+Math.random()*105;a.push({x:Math.max(14,Math.min(w-14,b.x+Math.cos(q)*d)),y:Math.max(14,Math.min(h-14,b.y+Math.sin(q)*d)),vx:Math.cos(q)*v+(Math.random()-.5)*30,vy:Math.sin(q)*v+(Math.random()-.5)*30,r:R})}}
function event(k,b){if(S.n[k]>=S.max)return;S.n[k]++;let born=ev($('f'+k).value,S.n[k]);S.totals[k]=Math.min(1e15,S.totals[k]+born);(k==='A'?S.a:S.b).push(S.totals[k]);spawn(k,b,born);S.life[k]=Math.max(0,S.life[k]*Math.exp(-0.0001*born));S.pulse[k]=1;if(S.n.A>=S.max&&S.n.B>=S.max)S.running=false}
function collide(k,b,w,h,budget){let hit=false;
 // Columnas abiertas arriba: paredes laterales y piso inferior, sin techo ni marco cerrado.
 if(b.x<b.r+2){b.x=b.r+2;b.vx=Math.abs(b.vx)*S.bounce;hit=true}
 else if(b.x>w-b.r-2){b.x=w-b.r-2;b.vx=-Math.abs(b.vx)*S.bounce;hit=true}
 if(b.y>h-b.r-2){b.y=h-b.r-2;b.vy=-Math.abs(b.vy)*S.bounce;hit=true}
 if(hit&&budget.left>0&&S.n[k]<S.max){budget.left--;event(k,b)}
}
function sim(k,dt){let c=$('canvas'+k),w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;let steps=Math.max(1,Math.ceil(dt*120)),d=dt/steps,budget={left:EVENTS_PER_FRAME};for(let z=0;z<steps;z++){let a=S.balls[k],len=a.length;for(let i=0;i<len;i++){let b=a[i];b.vy=Math.min(1500,b.vy+S.gravity*d);let drag=Math.pow(S.friction,d*60);b.vx*=drag;b.vy*=Math.pow(S.friction,d*12);b.x+=b.vx*d;b.y+=b.vy*d;collide(k,b,w,h,budget);if(!budget.left&&S.n[k]>=S.max)break}}}
function draw(k){let o=size(k);if(!o)return;let{x,w,h}=o,c=C[k];x.clearRect(0,0,w,h);x.fillStyle='#05080d';x.fillRect(0,0,w,h);
 // Sin caja cerrada: solo laterales discretos y una base horizontal como en la referencia.
 let life=S.life[k]/100,pulse=S.pulse[k]||0;S.pulse[k]=Math.max(0,pulse-0.045);let rr=Math.round(190+(212-190)*life),gg=Math.round(70+(160-70)*life),bb=Math.round(75+(250-75)*life);x.strokeStyle='rgba('+rr+','+gg+','+bb+','+(0.48+life*.42+pulse*.1)+')';x.lineWidth=1.15+pulse*.8;x.beginPath();x.moveTo(1,0);x.lineTo(1,h);x.moveTo(w-1,0);x.lineTo(w-1,h);x.stroke();
 x.strokeStyle='rgba(190,205,220,'+(0.45+life*.45)+')';x.lineWidth=1.2+pulse*.5;x.beginPath();x.moveTo(0,h-2);x.lineTo(w,h-2);x.stroke();
 for(let b of S.balls[k]){x.save();x.shadowColor=c;x.shadowBlur=6;let q=x.createRadialGradient(b.x-2,b.y-2,.2,b.x,b.y,R*1.5);q.addColorStop(0,'white');q.addColorStop(.2,c);q.addColorStop(1,k==='A'?'#637d30':'#245d8c');x.fillStyle=q;x.beginPath();x.arc(b.x,b.y,R,0,Math.PI*2);x.fill();x.restore()}
 x.fillStyle='#c1cede';x.font='10px monospace';x.fillText('VIDA DE PARED '+(S.life[k]).toFixed(1)+'%',10,16);x.fillStyle='#253342';x.fillRect(10,23,w-20,3);x.fillStyle=life>.5?'#a7d66b':life>.2?'#e6b65d':'#e66b73';x.fillRect(10,23,(w-20)*life,3);x.fillStyle='#c1cede';x.fillText(S.balls[k].length+' visibles · '+fmt(S.totals[k])+' nacidas',10,h-13)}
function render(){for(let k of ['A','B']){$('count'+k).textContent=fmt(S.totals[k]);$('at'+k).textContent=S.n[k]+' / '+S.max;$('final'+k).textContent='NACIDAS: '+fmt(S.totals[k]);draw(k)}
 $('progressLabel').textContent='A '+S.n.A+'/'+S.max+' · B '+S.n.B+'/'+S.max+' REBOTES';let a=S.totals.A,b=S.totals.B;$('leader').textContent=!(S.n.A||S.n.B)?'—':a===b?'Empate':a>b?'Pista A':'Pista B';$('diff').textContent=(S.n.A||S.n.B)?fmt(Math.abs(a-b)):'—';$('ratio').textContent=(S.n.A||S.n.B)?fmt(Math.max(a,b)/Math.max(1,Math.min(a,b)))+'×':'—';$('winner').textContent=!(S.n.A||S.n.B)?'Esperando el primer rebote.':(S.n.A>=S.max&&S.n.B>=S.max)?'Simulación completada.':a===b?'Crecimiento acumulado igualado.':(a>b?$('nameA').value:$('nameB').value)+' lleva la ventaja.';
 let tb=$('history');tb.replaceChildren();if(!(S.n.A||S.n.B)){let tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=4;td.textContent='Los datos aparecen con los rebotes.';tr.append(td);tb.append(tr)}else for(let i=0;i<Math.max(S.n.A,S.n.B);i++){let tr=document.createElement('tr'),av=S.a[i]||0,bv=S.b[i]||0;[i+1,fmt(av),fmt(bv),av===bv?'Empate':av>bv?'Pista A':'Pista B'].forEach(v=>{let td=document.createElement('td');td.textContent=v;tr.append(td)});tb.append(tr)}}
function status(){let done=S.n.A>=S.max&&S.n.B>=S.max;$('status').textContent=done?'FINALIZADA':S.running?'EN CURSO':(S.n.A||S.n.B)?'EN PAUSA':'LISTA';$('play').textContent=done?'↻ Repetir':S.running?'Ⅱ Pausar':(S.n.A||S.n.B)?'▶ Reanudar':'▶ Iniciar simulación';$('speedToggle').textContent=S.running?'Ⅱ Pausar':'▶ Reanudar'}
function frame(t){if(!S.raf)return;if(!S.last)S.last=t;let dt=Math.min(.025,(t-S.last)/1000)*S.speed;S.last=t;if(S.running){sim('A',dt);sim('B',dt);draw('A');draw('B')}if(S.running)S.raf=requestAnimationFrame(frame);else{S.raf=0;S.last=0;status();render()}}
function wake(){if(!S.raf){S.last=0;S.raf=requestAnimationFrame(frame)}}
function reset(){S.running=false;if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;S.last=0;S.n={A:0,B:0};S.totals={A:0,B:0};S.life={A:100,B:100};S.pulse={A:0,B:0};S.a=[];S.b=[];for(let k of ['A','B']){let c=$('canvas'+k),w=c.clientWidth||320,h=c.clientHeight||260;S.balls[k]=[{x:w/2,y:h/2,vx:135,vy:110,r:R}]}render();status()}
function show(){if(!valid()){$('validation').textContent='● REVISÁ LAS FUNCIONES';return}S.max=+$('walls').value;labels();$('setupScreen').classList.add('hidden');$('raceScreen').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'});requestAnimationFrame(reset)}
function step(){if(S.n.A>=S.max&&S.n.B>=S.max)return;for(let k of ['A','B']){let a=S.balls[k],b=a[Math.floor(Math.random()*a.length)]||{x:150,y:120};event(k,b)}render();status()}
function speed(){S.speed=+$('speed').value;$('speedOut').textContent=S.speed.toFixed(2).replace('.',',')+'×'}
function physics(){S.gravity=+$('gravity').value;S.bounce=+$('bounce').value;S.friction=+$('friction').value;$('gravityOut').textContent=S.gravity;$('bounceOut').textContent=S.bounce.toFixed(2).replace('.',',');$('frictionOut').textContent=S.friction.toFixed(3).replace('.',',');$('physicsReadout').textContent='FÍSICA ACTIVA · GRAVEDAD '+S.gravity+' · REBOTE '+S.bounce.toFixed(2).replace('.',',')+' · FRICCIÓN '+S.friction.toFixed(3)}
$('walls').oninput=()=>{$('wallNum').textContent=$('walls').value;$('wallHint').textContent=$('walls').value};$('launch').onclick=show;$('back').onclick=()=>{$('raceScreen').classList.add('hidden');$('setupScreen').classList.remove('hidden');S.running=false;if(S.raf)cancelAnimationFrame(S.raf);S.raf=0};$('play').onclick=()=>{if(S.n.A>=S.max&&S.n.B>=S.max)reset();S.running=!S.running;status();if(S.running)wake()};$('step').onclick=step;$('restart').onclick=reset;$('speed').oninput=speed;$('speedToggle').onclick=()=>$('play').click();['gravity','bounce','friction'].forEach(id=>$(id).addEventListener('input',physics));['fA','fB','nameA','nameB'].forEach(id=>$(id).addEventListener('input',()=>{labels();$('validation').textContent=valid()?'● FUNCIONES VÁLIDAS':'● REVISÁ LAS FUNCIONES'}));
document.querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{$(b.dataset.f).value=b.dataset.v;labels();valid()});
$('csv').onclick=()=>{if(!(S.n.A||S.n.B))return;let rows=[['Rebote','A acumulado','B acumulado']];for(let i=0;i<Math.max(S.n.A,S.n.B);i++)rows.push([i+1,S.a[i]||0,S.b[i]||0]);let blob=new Blob(['\ufeff'+rows.map(r=>r.join(';')).join('\n')],{type:'text/csv'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='function-race.csv';a.click();URL.revokeObjectURL(u)};
$('help').onclick=()=>$('dialog').showModal();$('close').onclick=()=>$('dialog').close();window.addEventListener('resize',()=>{draw('A');draw('B')});S.max=+$('walls').value;speed();labels();physics();reset();
})();