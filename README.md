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
- El daño total se calcula exacto, así la duración y el ganador respetan las ecuaciones.

## Qué se puede configurar (⚙ Ajustes)

- Cantidad de paredes (1–100)
- Ecuación de vida de las paredes
- Duración de la carrera (lo que tarda el ganador)
- Hasta 4 corredores, cada uno con su ecuación de pelotas y de poder
- Presets y link para compartir la configuración (queda guardada en el `#hash` de la URL)

Funciones disponibles: `+ - * / % ^ ( )`, `n`, `sqrt log log2 exp sin cos abs min max floor ceil pow`, `fact(n)`, `PI`, `E`.

## Correrlo

Es un solo `index.html`, sin build ni dependencias. Abrilo directo en el navegador o publicalo en GitHub Pages.

## Publicar en GitHub Pages

```bash
gh repo create function-race --public --source=. --push
gh api -X POST repos/:owner/function-race/pages -f "source[branch]=main" -f "source[path]=/"
```

O manualmente: repo → **Settings → Pages → Deploy from a branch → main / (root)**.
La URL queda `https://TU-USUARIO.github.io/function-race/`.
