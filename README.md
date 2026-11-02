# Function Race

Carrera de funciones: ¿gana la que tiene **más pelotas** o la que tiene **más poder por impacto**?

Cada corredor intenta romper una secuencia de paredes. La idea central es comparar tres funciones matemáticas que dependen del número de pared:

- **Cantidad de pelotas**: cuántas pelotas intenta tener el corredor.
- **Poder**: cuánta vida quita cada impacto de una pelota.
- **Vida de la pared**: cuánto daño necesita recibir la pared para romperse.

La simulación evalúa esas tres funciones usando el mismo valor de **n**, que representa el número de la pared actual.

## 1. Qué significa n

**n es el número de la pared que el corredor está intentando romper.**

- La primera pared corresponde a `n = 1`.
- Cuando se rompe, el corredor pasa a la segunda: `n = 2`.
- Después pasa a `n = 3`, y así sucesivamente.
- El valor de `n` aumenta únicamente cuando se rompe una pared; no aumenta con cada rebote.

Por eso, si configurás una función como `n^2`, sus valores serán:

| Pared | n | Resultado de n² |
|---:|---:|---:|
| 1 | 1 | 1 |
| 2 | 2 | 4 |
| 3 | 3 | 9 |
| 4 | 4 | 16 |
| 5 | 5 | 25 |

**Importante:** las funciones no se evalúan usando el número de pelota ni el número de rebote. Las tres se evalúan con el número de pared actual.

## 2. Qué hace cada ajuste

### Ajustes generales

| Ajuste | Qué modifica |
|---|---|
| **Preset** | Carga una configuración de ejemplo con paredes, velocidad y corredores ya definidos. |
| **Cantidad de paredes** | Define cuántas paredes debe romper cada corredor para terminar. Se pueden elegir entre 1 y 100. |
| **Velocidad de la simulación** | Acelera o ralentiza el avance de la simulación. ×1 es la velocidad normal; ×2 avanza al doble; ×0.5, a la mitad. No cambia los valores matemáticos de las funciones. |
| **Agregar corredor** | Añade otro participante para comparar funciones. Se permiten hasta 4 corredores. |

### Vida de cada pared

Esta función determina cuánta resistencia tiene cada pared según su número.

Por ejemplo, si configurás la vida como `10*n`:

- Pared 1: 10 de vida.
- Pared 2: 20 de vida.
- Pared 3: 30 de vida.
- Pared 4: 40 de vida.

La vida es **compartida por todas las pelotas de ese corredor**: no existe una pared distinta para cada pelota. Todos sus impactos dañan la misma pared actual.

Cuando una pared se rompe, el corredor pasa a la siguiente y la vida se vuelve a calcular con el nuevo valor de `n`.

### Cantidad de pelotas

Define cuántas pelotas intenta mantener el corredor en la pared actual.

Ejemplo: con `n^2` como cantidad:

- En la pared 1, el objetivo es 1 pelota.
- En la pared 2, el objetivo es 4.
- En la pared 3, el objetivo es 9.
- En la pared 4, el objetivo es 16.

La simulación comienza con hasta 2 pelotas. Después, **cada impacto válido contra la pared genera 2 pelotas nuevas**, hasta alcanzar el objetivo que indica la función. Las pelotas nuevas empiezan a moverse en la siguiente actualización de la simulación.

La cantidad objetivo se vuelve a calcular al pasar a cada pared. Si el nuevo objetivo es mayor, los impactos generan las pelotas que faltan; si es menor, el excedente se retira gradualmente.

**Límite visual:** se muestran como máximo 300 pelotas por corredor. Si la función pide más de 300, las pelotas visibles representan grupos de pelotas matemáticas y el daño se escala para aproximar el total representado.

### Poder

Es el daño que produce **cada impacto individual** contra la pared actual. No es el daño total por segundo ni se divide entre las pelotas.

Ejemplo: si el poder es 5, cada impacto quita 5 puntos de vida. Si impactan 10 pelotas, cada una aplica sus 5 puntos: el daño total depende de cuántos impactos ocurran.

Si configurás el poder como `2^n`:

- Pared 1: cada impacto quita 2.
- Pared 2: cada impacto quita 4.
- Pared 3: cada impacto quita 8.
- Pared 4: cada impacto quita 16.

Al romper una pared, el poder se recalcula para la siguiente. Si un impacto produce más daño del que le quedaba a la pared, el daño sobrante se aplica a la pared siguiente.

**En síntesis:** la cantidad determina cuántas pelotas intenta tener el corredor; el poder determina cuánto daño hace cada impacto; la vida determina cuánto daño necesita la pared para romperse.

## 3. Tipos de función disponibles

En cada editor podés elegir un tipo de función y modificar sus parámetros. El gráfico muestra cómo se comporta entre la primera pared y la última configurada.

| Tipo | Forma | Parámetros | Ejemplo |
|---|---|---|---|
| **Constante** | `c` | Valor | `5`: siempre vale 5. |
| **Lineal** | `a*n + b` | `a` y `b` | `2*n+3`: aumenta 2 por pared. |
| **Potencia** | `a*n^p` | `a` y exponente `p` | `n^3`: crecimiento cúbico. |
| **Exponencial** | `a*b^n` | `a` y base `b` | `2^n`: duplica su valor por pared. |
| **Factorial** | `a*n!` | `a` | `n!`: 1, 2, 6, 24, 120… |
| **Logarítmica** | `a*log₂(n+1)` | `a` | Crece cada vez más lentamente. |
| **Raíz** | `a*√n` | `a` | Crecimiento más lento que el lineal. |
| **Fórmula propia** | La expresión que escribas | Expresión libre | `n^2+3*n`. |

Los parámetros `a`, `b`, `c` y `p` son números que podés cambiar. Por ejemplo, en una exponencial `a*b^n`, `a` multiplica el resultado y `b` es la base que se eleva a `n`.

## 4. Cómo escribir una fórmula propia

Podés escribir expresiones matemáticas usando:

- **Variable:** `n`.
- **Operadores:** `+`, `-`, `*`, `/`, `%` y `^` (potencia).
- **Agrupación:** paréntesis `()`.
- **Funciones:** `sqrt`, `log`, `log2`, `exp`, `sin`, `cos`, `abs`, `min`, `max`, `floor`, `ceil`.
- **Factorial:** `fact(n)`.
- **Constantes:** `PI` y `E`.

Ejemplos:

| Fórmula | Qué representa |
|---|---|
| `3*n+2` | Una función lineal. |
| `n^2+5` | Una función cuadrática con un término constante. |
| `2^n` | Una función exponencial de base 2. |
| `n^3+2^n` | La suma de una potencia y una exponencial. |
| `sqrt(n)*10` | Diez veces la raíz de n. |
| `fact(n)` | El factorial de n. |
| `max(n^2,2^n)` | El mayor valor entre ambas expresiones. |

Usá el punto para los decimales, por ejemplo `1.5*n`. El símbolo `^` representa una potencia: `n^2` es n al cuadrado.

Los resultados negativos se limitan a cero. La vida de una pared tiene un mínimo de 1. Si una fórmula no se puede interpretar, el editor muestra un error y no permite aplicar esa configuración.

## 5. Cómo se calcula el resultado de una carrera

En cada pared sucede lo siguiente:

1. Se calcula la vida de la pared usando la función de vida y el valor actual de `n`.
2. Se calcula el objetivo de pelotas usando la función de cantidad.
3. Se calcula el poder de cada impacto usando la función de poder.
4. Las pelotas rebotan y chocan entre sí. Cada impacto válido contra la pared aplica el poder vigente y genera hasta 2 descendientes, si todavía faltan pelotas para alcanzar el objetivo.
5. Cuando la vida llega a cero, la pared se rompe. El corredor avanza, aumenta `n` y se recalculan las tres funciones.

Una forma útil de pensar el daño es:

`daño total = cantidad de impactos × poder por impacto`

La cantidad de pelotas influye en cuántos impactos pueden producirse, pero no garantiza por sí sola que el corredor gane: también importan el poder, la vida de las paredes y el comportamiento de los rebotes.

Cada corredor tiene su propia secuencia de paredes y su propia vida compartida entre sus pelotas. Los corredores compiten en paralelo.

## 6. Ejemplo: n³ contra 2ⁿ

El preset **n³ vs 2ⁿ (el clásico)** compara:

- Corredor «Más pelotas»: cantidad `n^3`, poder constante `1`.
- Corredor «Más poder»: cantidad constante `1`, poder `2^n`.
- Vida de pared: `2*n^3`.

| n | Pelotas del primero | Poder del primero | Pelotas del segundo | Poder del segundo |
|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 1 | 2 |
| 2 | 8 | 1 | 1 | 4 |
| 3 | 27 | 1 | 1 | 8 |
| 4 | 64 | 1 | 1 | 16 |
| 5 | 125 | 1 | 1 | 32 |

La comparación muestra dos estrategias distintas: aumentar la cantidad de impactos posibles o aumentar el daño de cada impacto.

## 7. Controles durante la carrera

- **Iniciar:** comienza la simulación.
- **Reiniciar:** vuelve al principio con la configuración aplicada.
- **Pausa:** detiene o reanuda la simulación.
- **Sonido:** activa o desactiva los efectos de audio.
- **Ajustes:** abre el editor. Si la carrera estaba en marcha, queda pausada.
- **Aplicar y correr:** valida y aplica la configuración, guarda el enlace y comienza una nueva carrera.
- **Copiar link:** copia un enlace con la configuración actual para compartirla o volver a cargarla.

Los ajustes aplicados quedan codificados en el fragmento de la URL (`#hash`). Al abrir ese enlace, se recuperan las paredes, la velocidad y los corredores configurados.

## 8. Presets incluidos

- **n³ vs 2ⁿ (el clásico):** compara crecimiento cúbico de cantidad contra crecimiento exponencial de poder.
- **Polinomios: n, n², n³:** compara tres ritmos de crecimiento polinómico con el mismo poder.
- **Explosión: 2ⁿ vs n! vs n⁵:** compara crecimiento exponencial, factorial y potencia de grado cinco.
- **Irracionales: πⁿ vs eⁿ:** usa π, e y √2 como bases de crecimiento exponencial.
- **El número áureo: φⁿ vs πⁿ:** compara la potencia del número áureo (φ), π y e.
- **Exponentes irracionales: n^π vs n^e:** mantiene la base variable y compara exponentes irracionales, incluido φ.
- **Ritmo irregular: oscilaciones:** enfrenta una función que alterna su poder con funciones lineales y cuadráticas.

Los presets con constantes usan las expresiones `PI`, `E` y `(1+sqrt(5))/2` para representar π, e y el número áureo φ. No son valores redondeados: se evalúan con la precisión numérica de JavaScript.

Los presets son puntos de partida: podés modificarlos y crear tus propias comparaciones.

## 9. Cómo se ve y reglas de la simulación

- Las pelotas chocan entre sí mediante choques elásticos y rebotan contra los límites del carril.
- La vida de la pared es compartida por todas las pelotas de un mismo corredor.
- Cada impacto válido aplica el poder vigente; el poder no se reparte entre las pelotas.
- Cada impacto válido genera hasta 2 pelotas nuevas mientras no se haya alcanzado el objetivo de cantidad.
- Si el daño supera la vida restante, el sobrante puede continuar dañando la pared siguiente.
- Al terminar un corredor, ya no genera nuevas pelotas.
- La cantidad visible está limitada a 300 esferas por corredor.

## 10. Ejecutar y publicar

Es un solo `index.html`, sin proceso de compilación ni dependencias externas. Se puede abrir directamente en un navegador o publicar en GitHub Pages.

Para publicar manualmente: repositorio → **Settings → Pages → Deploy from a branch → main / (root)**.

La URL de este proyecto es: https://pritagoras.github.io/function-race/
