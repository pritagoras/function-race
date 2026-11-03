#!/usr/bin/env python3
"""Etapa 2 del revamp de function-race: semilla reproducible + "Correr N veces".

Agrega a index.html:
  - Semilla: la misma semilla repite la misma carrera (guardada en el link).
  - Paso de simulación fijo (1/60 s): sin esto la semilla no alcanza, porque
    el resultado dependería de los FPS del dispositivo.
  - "Correr N veces": simula N carreras sin dibujar, con semillas distintas,
    y cuenta victorias y tiempo medio de cada corredor.

Uso (desde la carpeta del repo, con index.html ya parcheado o no):
    python3 patch_index_2.py             # parchea ./index.html
    python3 patch_index_2.py ruta.html   # parchea otro archivo
Hace una copia en index.html.bak2. Cada parche es un reemplazo exacto:
si el texto no se encuentra, se saltea y se avisa.

Limitación conocida: la física depende del tamaño del carril, así que una
semilla repite exactamente la misma carrera solo en la misma pantalla.
"Correr N veces" evita eso usando un tablero virtual fijo de 1000x700.
"""
import shutil
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"

RNG_BLOCK = r"""const rand = (a, b) => a + Math.random() * (b - a);
/* --- semilla y paso fijo (aleatoriedad que afecta la física usa srand/rng; la cosmética usa rand) --- */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rng = mulberry32(1), HEADLESS = false, batching = false, batchCancel = false, stepAcc = 0;
const STEP = 1 / 60;
const srand = (a, b) => a + rng() * (b - a);
const newSeed = () => (Math.random() * 4294967296) >>> 0;"""

SEED_UI = r"""<div class="section"><div class="section-title">⑤ Semilla y repeticiones</div>
<p class="section-sub">La misma semilla repite la misma carrera en la misma pantalla. «Correr N veces» simula N carreras con semillas distintas, sin dibujar y en un tablero virtual fijo, y cuenta quién gana. Puede tardar si hay muchas pelotas: probá primero con pocas repeticiones.</p>
<div class="params"><label>Semilla<input id="seed" type="number" inputmode="numeric" min="1" step="1"></label><label>Repeticiones<input id="runsN" type="number" inputmode="numeric" min="1" max="100" value="10"></label></div>
<div class="btns"><button class="small" id="newSeed" type="button">🎲 Nueva semilla</button><button class="small" id="runBatch" type="button">Correr N veces</button></div>
<div id="batchOut" class="hint" style="white-space:pre-wrap"></div></div>
<p id="err" class="err"></p>"""

BATCH_JS = r"""/* ============================ semilla y repeticiones ============================ */
$('#newSeed').addEventListener('click', () => { $('#seed').value = newSeed(); });
$('#runBatch').addEventListener('click', runBatch);
async function runBatch() {
  if (batching) { batchCancel = true; return; }
  readPanel();
  const n = clamp(parseInt($('#runsN').value, 10) || 10, 1, 100), out = $('#batchOut'), btn = $('#runBatch');
  try { build(clone(D)); } catch (e) { $('#err').textContent = '⚠ ' + e.message; return; }
  const base = D.seed || newSeed(), names = D.racers.map(r => r.name), wins = names.map(() => 0), tsum = names.map(() => 0);
  let noWin = 0, ran = 0;
  const sv = { W, H, snd: soundOn };
  batching = true; batchCancel = false; HEADLESS = true; soundOn = false; W = 1000; H = 700;
  btn.textContent = 'Cancelar'; $('#apply').disabled = true;
  const cancelled = () => batchCancel;
  try {
    for (let i = 0; i < n && !batchCancel; i++) {
      const cfg = clone(D); cfg.seed = ((base + i * 7919) >>> 0) || 1;
      build(cfg); S.state = 'running';
      let t0 = performance.now();
      while (S.state === 'running' && !S.winner && S.clock < 240 && !batchCancel) {
        update(STEP);
        if (performance.now() - t0 > 14) {
          out.textContent = 'Carrera ' + (i + 1) + ' de ' + n + ' · ' + S.clock.toFixed(0) + ' s simulados…';
          await new Promise(res => setTimeout(res, 0)); t0 = performance.now();
        }
      }
      if (batchCancel) break;
      ran++;
      if (S.winner) { wins[S.winner.idx]++; tsum[S.winner.idx] += S.winner.doneT; } else noWin++;
    }
  } finally {
    HEADLESS = false; soundOn = sv.snd; W = sv.W; H = sv.H; batching = false;
    $('#apply').disabled = false; btn.textContent = 'Correr N veces';
    try { build(clone(D)); } catch (e) { /* se mantiene la carrera anterior */ }
  }
  const pct = v => ran ? Math.round(100 * v / ran) : 0;
  out.textContent = (cancelled() ? 'Cancelado tras ' : '') + ran + ' carreras · semilla base ' + base + ' · tablero virtual 1000×700\n' +
    names.map((nm, i) => nm + ': ' + wins[i] + ' victorias (' + pct(wins[i]) + '%)' + (wins[i] ? ' · tiempo medio ' + (tsum[i] / wins[i]).toFixed(1) + ' s' : '')).join('\n') +
    (noWin ? '\nSin ganador (límite de tiempo): ' + noWin : '');
}

/* ============================ arranque ============================ */"""

FRAME_STEP = (
    "if (S.racers.length && !batching) { stepAcc += dt; let k = 0; "
    "while (stepAcc >= STEP && k < 4) { update(STEP); stepAcc -= STEP; k++; } "
    "if (k === 4) stepAcc = 0; draw(); }"
)

PATCHES = [
    (
        "Núcleo: generador con semilla, paso fijo y bandera de modo sin dibujo",
        "const rand = (a, b) => a + Math.random() * (b - a);",
        RNG_BLOCK,
    ),
    (
        "Física: ángulo y velocidad de pelotas nuevas con srand",
        "const a = up ? -Math.PI / 2 + rand(-0.9, 0.9) : rand(0, Math.PI * 2), sp = rand(300, 380);",
        "const a = up ? -Math.PI / 2 + srand(-0.9, 0.9) : srand(0, Math.PI * 2), sp = srand(300, 380);",
    ),
    (
        "Física: variación de radio de cada pelota con rng",
        "k: Math.random(), r: 4",
        "k: rng(), r: 4",
    ),
    (
        "Física: desvío en el rebote con srand",
        "b.vx += rand(-25, 25);",
        "b.vx += srand(-25, 25);",
    ),
    (
        "Física: separación de pelotas superpuestas con srand",
        "if (d < 1e-4) { dx = rand(-1, 1); dy = rand(-1, 1);",
        "if (d < 1e-4) { dx = srand(-1, 1); dy = srand(-1, 1);",
    ),
    (
        "Física: posición de las pelotas iniciales con srand",
        "spawnBall(r, rand(x0 + 10, x1 - 10), rand(top + 10, Math.max(top + 11, floor - 40)), false);",
        "spawnBall(r, srand(x0 + 10, x1 - 10), srand(top + 10, Math.max(top + 11, floor - 40)), false);",
    ),
    (
        "Física: posición de nacimiento de respaldo con srand",
        "const sx = hh ? hh.x : rand(x0 + 10, x1 - 10);",
        "const sx = hh ? hh.x : srand(x0 + 10, x1 - 10);",
    ),
    (
        "Sonido: el tono de impacto ya no consume la secuencia aleatoria de la física",
        "tone(rand(520, 820) + r.idx * 110",
        "tone(520 + Math.random() * 300 + r.idx * 110",
    ),
    (
        "Sonido y vibración: silenciar en el modo sin dibujo (rebotes)",
        "function sfxBreak(r) {",
        "function sfxBreak(r) { if (HEADLESS) return;",
    ),
    (
        "Sonido: silenciar la fanfarria en el modo sin dibujo",
        "function sfxWin() {",
        "function sfxWin() { if (HEADLESS) return;",
    ),
    (
        "Config: la semilla viaja en el link",
        "const out = { walls:",
        "const out = { seed: (Number(c.seed) >>> 0) || 0, walls:",
    ),
    (
        "Build: fijar la semilla de la carrera y reflejarla en la configuración",
        "S.cfg = cfg; S.N = cfg.walls;",
        "S.cfg = cfg; S.seed = cfg.seed ? cfg.seed >>> 0 : newSeed(); cfg.seed = S.seed; if (!HEADLESS) D.seed = S.seed; S.N = cfg.walls;",
    ),
    (
        "Reinicio: reiniciar la secuencia aleatoria con la semilla",
        "S.state = 'idle'; S.clock = 0; S.winner = null;",
        "rng = mulberry32(S.seed || 1); S.state = 'idle'; S.clock = 0; S.winner = null;",
    ),
    (
        "Bucle: paso de simulación fijo (resultado independiente de los FPS)",
        "if (S.racers.length) { update(dt); draw(); }",
        FRAME_STEP,
    ),
    (
        "Panel: sección de semilla y repeticiones",
        '<p id="err" class="err"></p>',
        SEED_UI,
    ),
    (
        "Panel: mostrar la semilla actual",
        "$('#spd').value = D.speed;",
        "$('#seed').value = D.seed || ''; $('#spd').value = D.speed;",
    ),
    (
        "Panel: leer la semilla al aplicar",
        "D.speed = clamp(parseFloat($('#spd').value) || 1, 0.5, 5);",
        "D.speed = clamp(parseFloat($('#spd').value) || 1, 0.5, 5);\nD.seed = (parseInt($('#seed').value, 10) >>> 0) || 0;",
    ),
    (
        "Copiar link: incluir siempre una semilla",
        "try { compile(specExpr(D.hp)); D.racers.forEach",
        "if (!D.seed) { D.seed = newSeed(); $('#seed').value = D.seed; } try { compile(specExpr(D.hp)); D.racers.forEach",
    ),
    (
        "Repeticiones: modo sin dibujo y conteo de victorias",
        "/* ============================ arranque ============================ */",
        BATCH_JS,
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
if applied != len(PATCHES):
    print("Atención: si se saltó algún parche de 'Física' o 'Bucle', la semilla no será 100% reproducible.")
