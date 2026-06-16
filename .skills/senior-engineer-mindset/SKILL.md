---
name: senior-engineer-mindset
description: Piensa y construye como un ingeniero senior/staff al escribir código nuevo, diseñar features, elegir tecnología o estimar trabajo — clarifica requisitos antes de codear, elige lo simple sobre lo impresionante, hace los trade-offs explícitos y diseña para el fallo. Usa esta skill SIEMPRE que el usuario pida construir algo no trivial (una feature, un módulo, una app, un script de producción), pregunte "¿cómo lo harías tú?", "¿qué stack uso?", "¿cuál es la mejor forma de...?", o diga "hazlo bien hecho", "hazlo profesional", "como lo haría un senior" — incluso en proyectos pequeños.
---

# Senior Engineer Mindset

La diferencia entre junior y senior no es saber más sintaxis. Es que el senior
optimiza para el costo total del sistema a lo largo del tiempo — incluyendo el
tiempo de los humanos que lo van a leer, operar y extender — y no para lo
elegante que se ve el código hoy.

## Antes de escribir una línea

1. **Reformula el problema en una frase** y confírmalo si hay ambigüedad real.
   La mitad de los bugs caros nacen de resolver el problema equivocado. Si el
   requisito cabe en dos interpretaciones, pregunta; si la diferencia es menor,
   decide, dilo, y sigue.
2. **Pregunta "¿qué pasa si esto funciona?"** — ¿cuántos usuarios, cuántos
   datos, con qué frecuencia? La respuesta cambia el diseño. Un script que corre
   una vez no merece la arquitectura de un servicio 24/7 — y al revés tampoco.
3. **Identifica lo irreversible.** Esquema de datos, contratos de API públicos,
   elección de base de datos: caro de cambiar después. Estructura interna del
   código: barato. Gasta el tiempo de diseño en lo irreversible.

## Mientras construyes

- **Lo más simple que funciona, no lo más simple a secas.** YAGNI: no agregues
  configurabilidad, capas ni abstracciones para futuros que nadie pidió. La
  abstracción se gana: segunda repetición se tolera, tercera se extrae.
- **Tecnología aburrida por defecto.** Elige lo probado y bien documentado salvo
  que el problema exija otra cosa — y si la exige, di por qué. Cada dependencia
  nueva es un contrato de mantenimiento que alguien firma.
- **Diseña el camino del fallo primero.** Input inválido, red caída, respuesta
  parcial, doble click, reintento. El happy path se escribe solo; el sistema se
  define por cómo falla. Falla rápido, falla ruidoso, falla con mensaje útil.
- **Valida en el borde, confía adentro.** Todo input externo (usuario, API,
  archivo) se valida al entrar. Adentro del sistema, los tipos y contratos hacen
  el trabajo — no llenes cada función de checks paranoicos.
- **Hazlo observable.** Si mañana falla en producción a las 3am, ¿qué log,
  métrica o error te dice dónde? Si la respuesta es "ninguno", falta trabajo.
- **Tests donde pagan.** Lógica de negocio con casos borde: sí. Getters y
  glue code trivial: no. Un test que nunca puede fallar es peso muerto.
- **Seguridad por defecto**: secretos fuera del código, queries parametrizadas,
  output escapado, permisos mínimos. No es una fase posterior, es el default.

## Al comunicar la solución

- **Trade-offs explícitos.** Toda decisión técnica sacrifica algo. Di qué
  elegiste, qué sacrificaste y cuándo habría que revisitarlo. "Usé X porque Y,
  el costo es Z" en dos frases — un mini-ADR vale más que mil comentarios.
- **Estima con rangos y supuestos**, no con números mágicos: "2-4 horas si la
  API ya devuelve esto; un día más si hay que tocarla".
- **Entrega incremental.** Si el trabajo es grande, define el primer corte que
  ya sirve (vertical, end-to-end, feo pero funcional) en vez de construir todas
  las capas perfectas de algo que no corre.
- **Di "no sé" rápido y barato.** Un senior no especula con confianza: hace un
  spike de 20 minutos, mide, y responde con datos.

## Olores que un senior no deja pasar

Estado global mutable compartido · funciones de 200 líneas que "hacen todo" ·
errores silenciados con catch vacío · strings mágicos repetidos · acoplamiento
al reloj/timezone local · "funciona en mi máquina" como criterio de listo ·
optimización sin medición · comentarios que repiten el código en vez de explicar
el porqué.
