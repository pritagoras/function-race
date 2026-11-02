# Function Race

Carrera de funciones: ¿gana la que tiene **más pelotas** (n³) o la que tiene **más poder** (2ⁿ)?

Cada corredor tiene que romper una fila de paredes. En la pared `n`:

- **Pelotas** = ecuación en `n`
- **Poder** = daño por pelota, ecuación en `n`
- **Vida de la pared** = ecuación en `n` (compartida)

Daño por segundo = pelotas × poder. Gana quien rompe todas las paredes primero.

## Cómo se ve

- Las pelotas **chocan entre sí** (choques elásticos) y contra la pared actual.
- Cada golpe contra la pared **suelta pelotas nuevas** hasta llegar a la cantidad que dice la ecuación (tope visual de 300). Al llegar se muestra **MAX** y dejan de multiplicarse.
- La **vida de la pared baja con cada impacto**: una pelota grande pega fuerte y de a poco, muchas pelotas la desgastan en ráfagas.
- El daño es real: cada golpe quita el **poder** de la pared actual. Con poder 1, una pared de 100 de vida necesita 100 golpes.

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
