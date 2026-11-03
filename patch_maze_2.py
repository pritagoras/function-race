#!/usr/bin/env python3
"""Etapa 2 del revamp de function-race: mejoras funcionales en maze.html.

Agrega:
  - Slider "Atajos": derriba paredes para crear ciclos, así los algoritmos
    dejan de encontrar siempre el mismo camino y se nota la diferencia.
  - Semilla en el link (#semilla-tamaño-atajos) y botón "Copiar link".
  - Corrección de DFS: ya no "mejora" su camino con relajaciones tipo Dijkstra.
  - El selector "Comparación" ahora tilda y deshabilita los algoritmos.

Uso (desde la carpeta del repo):
    python3 patch_maze_2.py             # parchea ./maze.html
    python3 patch_maze_2.py ruta.html   # parchea otro archivo
Hace una copia en maze.html.bak2. Cada parche es un reemplazo exacto:
si el texto no se encuentra, se saltea y se avisa.
"""
import shutil
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "maze.html"

SEED_BLOCK = r"""function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let seed=(Math.random()*4294967296)>>>0,rnd=mulberry32(seed);
function readHash(){const m=/^#(\d+)-(\d+)-(\d+)$/.exec(location.hash);if(!m)return;seed=(+m[1])>>>0;$('#size').value=m[2];$('#loops').value=m[3]}
function newSeed(){seed=(Math.random()*4294967296)>>>0}
function carveLoops(){
 const pct=(+$('#loops').value)/100;if(!(pct>0))return;
 const cand=[];
 for(let y=1;y<rows-1;y+=2)for(let x=1;x<cols-1;x+=2)for(const d of [1,2]){
  const nx=x+dirs[d][0]*2,ny=y+dirs[d][1]*2;
  if(nx<cols-1&&ny<rows-1&&grid[idx(x+dirs[d][0],y+dirs[d][1])].walls[d])cand.push([x,y,d]);
 }
 const n=Math.round(cand.length*pct);
 for(let i=0;i<n;i++){
  const j=i+Math.floor(rnd()*(cand.length-i));[cand[i],cand[j]]=[cand[j],cand[i]];
  const [x,y,d]=cand[i],cur=idx(x,y),mid=idx(x+dirs[d][0],y+dirs[d][1]),nxt=idx(x+dirs[d][0]*2,y+dirs[d][1]*2);
  grid[cur].walls[d]=false;grid[mid].walls[d]=false;grid[mid].walls[(d+2)%4]=false;grid[nxt].walls[(d+2)%4]=false;
 }
}
function syncAlgos(){
 const m=$('#algoMode').value;
 document.querySelectorAll('.algo input').forEach(c=>{const ok=m==='all'||(m==='informed'?c.value==='astar':c.value!=='astar');c.checked=ok;c.disabled=!ok});
}
function makeMaze(){rnd=mulberry32(seed);"""

AFTER_GENERATION = r"""carveLoops();start=idx(1,1);goal=idx(cols-2,rows-2);
 $('#loopsOut').textContent=$('#loops').value+'%';
 try{history.replaceState(null,'','#'+seed+'-'+cols+'-'+$('#loops').value)}catch(e){}
 resetSolvers();"""

CONTROLS = r"""$('#regen').addEventListener('click',()=>{newSeed();makeMaze()});
$('#loops').addEventListener('input',()=>{$('#loopsOut').textContent=$('#loops').value+'%'});
$('#loops').addEventListener('change',makeMaze);
$('#share').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);$('#status').textContent='Link copiado: abre este mismo laberinto con estos ajustes.'}catch(e){$('#status').textContent='Copiá el link desde la barra de direcciones.'}});"""

ALGO_LISTENERS = r"""$('#algoMode').addEventListener('change',()=>{syncAlgos();resetSolvers();draw()});
document.querySelectorAll('.algo input').forEach(e=>e.addEventListener('change',()=>{resetSolvers();draw()}));"""

PATCHES = [
    (
        "UI: slider de atajos",
        '<input id="speed" type="range" min="1" max="10" value="1"></div>',
        '<input id="speed" type="range" min="1" max="10" value="1"></div>\n'
        ' <div class="field"><label for="loops">Atajos (ciclos) <output id="loopsOut">0%</output></label>'
        '<input id="loops" type="range" min="0" max="30" step="5" value="0"></div>',
    ),
    (
        "UI: botón Copiar link",
        '<button class="btn" id="regen">Nuevo laberinto</button></div>',
        '<button class="btn" id="regen">Nuevo laberinto</button><button class="btn" id="share">Copiar link</button></div>',
    ),
    (
        "CSS: opacidad de algoritmos deshabilitados",
        "@media(max-width:850px){",
        ".algo:has(input:disabled){opacity:.4}\n@media(max-width:850px){",
    ),
    (
        "Motor: generador con semilla, atajos y sincronización de algoritmos",
        "function makeMaze(){",
        SEED_BLOCK,
    ),
    (
        "Motor: el laberinto usa el generador con semilla",
        "Math.floor(Math.random()*opts.length)",
        "Math.floor(rnd()*opts.length)",
    ),
    (
        "Motor: aplicar atajos y guardar la semilla en el link",
        "start=idx(1,1);goal=idx(cols-2,rows-2);resetSolvers();",
        AFTER_GENERATION,
    ),
    (
        "DFS: solo fija el padre en el primer descubrimiento (sin relajación)",
        "if(nd<s.dist[nb]){",
        "if(nd<s.dist[nb]&&(s.type!=='dfs'||s.prev[nb]===-1)){",
    ),
    (
        "Controles: nuevo laberinto con semilla nueva, atajos y copiar link",
        "$('#regen').addEventListener('click',makeMaze);",
        CONTROLS,
    ),
    (
        "Comparación: el selector sincroniza los checkboxes",
        "document.querySelectorAll('.algo input,#algoMode').forEach(e=>e.addEventListener('change',()=>{resetSolvers();draw()}));",
        ALGO_LISTENERS,
    ),
    (
        "Arranque: leer semilla, tamaño y atajos del link",
        "addEventListener('resize',resize);makeMaze();resize();",
        "addEventListener('resize',resize);readHash();makeMaze();resize();",
    ),
    (
        "Texto explicativo: aclarar el efecto de los atajos",
        "gracias a su heurística Manhattan.",
        "gracias a su heurística Manhattan. Con 0 % de atajos el laberinto tiene un único camino y los cuatro lo encuentran igual; subí los atajos para que DFS tome rutas más largas.",
    ),
]

with open(path, encoding="utf-8") as f:
    src = f.read()

out = src
applied = 0
for desc, old, new in PATCHES:
    if old in out:
        out = out.replace(old, new, 1)
        applied += 1
        print(f"[ok]      {desc}")
    else:
        print(f"[saltado] {desc} (no encontré el texto exacto)")

if applied:
    shutil.copyfile(path, path + ".bak2")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(out)
print(f"\n{applied}/{len(PATCHES)} parches aplicados en {path}")
