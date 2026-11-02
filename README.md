# Function Race

Simulador visual de crecimiento de funciones matemáticas. Proyecto estático, sin backend, preparado para GitHub Pages.

## Publicar en GitHub Pages
1. Abrí **Settings → Pages**.
2. En **Build and deployment**, elegí **Deploy from a branch**.
3. Seleccioná `main` y `/ (root)`, guardá.
4. La web quedará publicada en `https://pritagoras.github.io/function-race/`.

## Uso
- Elegí entre 2 y 16 paredes.
- Configurá dos funciones usando `n` (o `x`), números, paréntesis y `+ - * / ^ !`.
- Iniciá la carrera o avanzá paso a paso.
- Consultá la tabla y exportá los datos como CSV.

## Notas
- La evaluación numérica está limitada a valores no negativos y finitos, con un techo de `10^15`.
- Para factorial se aceptan enteros de 0 a 170.
- La representación de pelotas es deliberadamente reducida en valores grandes: el contador numérico conserva el valor calculado.
- Google Fonts se usa como mejora visual; si no hay conexión, se aplican fuentes de respaldo.
