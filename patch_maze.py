#!/usr/bin/env python3
"""Etapa 1 del revamp de function-race: correcciones puntuales en maze.html.

Uso (desde la carpeta del repo):
    python3 patch_maze.py             # parchea ./maze.html
    python3 patch_maze.py ruta.html   # parchea otro archivo

Hace una copia en maze.html.bak y avisa qué parches se aplicaron.
Cada parche es un reemplazo exacto: si el texto no se encuentra, se saltea.
"""
import shutil
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "maze.html"

SYNC = "function syncPause(){$('#pause').textContent=paused?'▶ Continuar':'Ⅱ Pausar'}\n"

PATCHES = [
    (
        "Etiqueta del tamaño: ahora muestra las filas reales (impares) y regenera al soltar el slider",
        "$('#size').addEventListener('input',()=>$('#sizeOut').textContent=$('#size').value+' × '+Math.max(9,Math.floor($('#size').value*.68)));",
        "$('#size').addEventListener('input',()=>{let r=Math.max(9,Math.floor($('#size').value*.68));if(r%2===0)r--;$('#sizeOut').textContent=$('#size').value+' × '+r});\n"
        "$('#size').addEventListener('change',makeMaze);",
    ),
    (
        "Pausa: función única para sincronizar el texto del botón",
        "function resetSolvers(){running=false;paused=false;",
        SYNC + "function resetSolvers(){running=false;paused=false;syncPause();",
    ),
    (
        "Pausa: el botón ya no arranca la simulación si no había nada corriendo",
        "$('#pause').addEventListener('click',()=>{paused=!paused;running=!paused;$('#pause').textContent=paused?'▶ Continuar':'Ⅱ Pausar'});",
        "$('#pause').addEventListener('click',()=>{if(!paused&&(!running||!solvers.length||solvers.every(s=>s.done)))return;paused=!paused;running=!paused;syncPause()});",
    ),
    (
        "Ejecutar: restablece el texto del botón Pausar",
        "running=true;paused=false;last=0;acc=0;",
        "running=true;paused=false;syncPause();last=0;acc=0;",
    ),
    (
        "Paso a paso: deja el estado en pausa y el botón coherente",
        "$('#step').addEventListener('click',()=>{running=false;paused=true;if(!solvers.length||solvers.every(s=>s.done))resetSolvers();tick();",
        "$('#step').addEventListener('click',()=>{if(!solvers.length||solvers.every(s=>s.done))resetSolvers();running=false;paused=true;syncPause();tick();",
    ),
    (
        "Rendimiento: actualizar el panel de resultados ~8 veces por segundo, no en cada frame",
        "renderResults();draw()}requestAnimationFrame(frame)}",
        "if(t-(frame.r||0)>120||!running){renderResults();frame.r=t}draw()}requestAnimationFrame(frame)}",
    ),
    (
        "Leyenda: el color de visitado depende del algoritmo",
        '<i class="dot" style="background:#314457"></i>Visitado</span>',
        '<i class="dot" style="background:#4aa3ff"></i>Visitado (color del algoritmo)</span>',
    ),
    (
        "Leyenda: el camino se dibuja como cuadro interior",
        '<i class="dot" style="background:#fff"></i>Camino</span>',
        '<i class="dot" style="background:#fff"></i>Camino (cuadro interior)</span>',
    ),
    (
        "Accesibilidad: etiqueta para el canvas",
        '<canvas id="maze"></canvas>',
        '<canvas id="maze" role="img" aria-label="Laberinto con cuatro algoritmos de búsqueda explorando en paralelo"></canvas>',
    ),
    (
        "Mobile: usar svh en lugar de vh para el alto del canvas",
        "height:min(70vh,760px)",
        "height:min(70svh,760px)",
    ),
    (
        "Código muerto: variable order sin uso",
        "const order=['bfs','dfs','dijkstra','astar'];",
        "",
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
    shutil.copyfile(path, path + ".bak")
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(out)
print(f"\n{applied}/{len(PATCHES)} parches aplicados en {path}")
