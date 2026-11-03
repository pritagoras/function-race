#!/usr/bin/env python3
"""Etapa 1 del revamp de function-race: correcciones puntuales en index.html.

Uso (desde la carpeta del repo):
    python3 patch_index.py            # parchea ./index.html
    python3 patch_index.py ruta.html  # parchea otro archivo

Hace una copia en index.html.bak y avisa qué parches se aplicaron.
Cada parche es un reemplazo exacto: si el texto no se encuentra, se saltea.
"""
import shutil
import sys

path = sys.argv[1] if len(sys.argv) > 1 else "index.html"

PATCHES = [
    (
        "CSS roto: \\n literal que invalidaba el estilo de #bPlay",
        "}\\n #bar #bPlay {",
        "}\n#bar #bPlay {",
    ),
    (
        "Accesibilidad: permitir zoom en mobile",
        ",viewport-fit=cover,user-scalable=no",
        ",viewport-fit=cover",
    ),
    (
        "Accesibilidad: etiqueta para el canvas",
        '<canvas id="c"></canvas>',
        '<canvas id="c" role="img" aria-label="Simulación de Function Race"></canvas>',
    ),
    (
        "Hash: reemplazar escape() deprecado al leer (links viejos siguen andando)",
        "const j = decodeURIComponent(escape(atob(decodeURIComponent(location.hash.slice(1)))));",
        "const bin = atob(decodeURIComponent(location.hash.slice(1)));\n"
        "const j = new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0)));",
    ),
    (
        "Hash: reemplazar unescape() deprecado al guardar",
        "const b = btoa(unescape(encodeURIComponent(JSON.stringify(cfg))));",
        "const b = btoa(Array.from(new TextEncoder().encode(JSON.stringify(cfg)), c => String.fromCharCode(c)).join(''));",
    ),
    (
        "Código muerto: S.prevPaused",
        "S.state = 'paused'; S.prevPaused = true; }",
        "S.state = 'paused'; }",
    ),
    (
        "Código muerto: S.rate",
        "hpArr: [], rate: 1, clock: 0,",
        "hpArr: [], clock: 0,",
    ),
    (
        "Rendimiento: reutilizar buffers de la grilla de colisiones (antes se creaban en cada frame)",
        "const head = new Int32Array(cols * rows), next = new Int32Array(n);",
        "if (!r._head || r._head.length < cols * rows) r._head = new Int32Array(cols * rows);\n"
        "if (!r._next || r._next.length < n) r._next = new Int32Array(Math.max(n, 64) * 2);\n"
        "const head = r._head, next = r._next;",
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
