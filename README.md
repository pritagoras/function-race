# Function Race

Carrera de funciones: ¿gana la que tiene **más pelotas** (n³) o la que tiene **más poder** (2ⁿ)?

Cada corredor tiene que romper una fila de paredes. En la pared `n`:

- **Pelotas** = ecuación en `n`
- **Poder** = daño por pelota, ecuación en `n`
- **Vida de la pared** = ecuación en `n` (compartida)

Daño por segundo = pelotas × poder. Gana quien rompe todas las paredes primero.

## Cómo se ve

- Las pelotas **chocan entre sí** (choques elásticos) y contra la pared actual.
- Cada impacto válido contra la pared genera **2 pelotas nuevas**. Las descendientes también rebotan y pueden reproducirse; el proceso continúa hasta alcanzar la cantidad indicada por la función (máximo de 300 esferas visibles por corredor).
- La cantidad objetivo se recalcula al pasar a cada pared. Si disminuye, el excedente se retira gradualmente; si aumenta, los siguientes impactos generan las pelotas que faltan.
- La **vida de la pared es compartida** por todas las pelotas de ese corredor. Cada impacto resta el poder vigente de esa pared; no se reparte el poder entre las pelotas.
- Si la función matemática supera el límite visual de 300, cada esfera visible representa varias pelotas matemáticas y el daño se escala para conservar la magnitud total.

## Qué se puede configurar (⚙ Ajustes)

- Cantidad de paredes (1–100) y velocidad de la simulación (×0.5 a ×5)
- La **vida de cada pared**, la **cantidad de pelotas** y el **poder** (vida que quita cada golpe) como funciones de `n`.
  Se eligen con una interfaz: tipo de función (constante, lineal, potencia, exponencial, factorial, logarítmica, raíz o fórmula propia),
  sus números y un gráfico en vivo de cómo crece en las paredes 1…N
- Hasta 4 corredores
- Presets y link para compartir la configuración (queda guardada en el `#hash` de la URL)

En "Fórmula propia" se puede usar `+ - * / % ^ ( )`, `n`, `sqrt log log2 exp sin cos abs min max floor ceil`, `fact(n)`, `PI`, `E`.

## Correrlo

Es un solo `index.html`, sin build ni dependencias. Abrilo directo en el navegador o publicalo en GitHub Pages.

## Publicar en GitHub Pages

```bash
gh repo create function-race --public --source=. --push
gh api -X POST repos/:owner/function-race/pages -f "source[branch]=main" -f "source[path]=/"
```

O manualmente: repo → **Settings → Pages → Deploy from a branch → main / (root)**.
La URL queda `https://TU-USUARIO.github.io/function-race/`.
