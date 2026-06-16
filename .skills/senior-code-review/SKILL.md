---
name: senior-code-review
description: Revisa código como lo haría un ingeniero staff/senior con 15 años de experiencia — encuentra bugs reales, casos borde, problemas de seguridad y deuda técnica antes de que lleguen a producción. Usa esta skill SIEMPRE que el usuario pida revisar código, un PR, un diff, o pregunte "¿está bien esto?", "¿qué opinas de este código?", "¿se puede mejorar?", "encuentra bugs", "refactoriza esto", o pegue un bloque de código esperando opinión — incluso si no dice la palabra "review". También al terminar de escribir código no trivial, como pasada final de calidad.
---

# Senior Code Review

Revisar código como senior no es señalar todo lo que harías diferente. Es proteger
producción, al equipo y al futuro mantenedor — en ese orden — gastando el menor
capital social posible. El 80% del valor de una buena revisión está en el 20% de
los hallazgos: los que rompen cosas.

## Orden de revisión (no negociable)

Revisa en este orden porque un hallazgo de nivel 1 invalida los de nivel 4 — no
tiene sentido discutir nombres de variables en código que pierde datos:

1. **Correctitud** — ¿Hace lo que dice? Casos borde: vacío, null/undefined, cero,
   negativo, duplicado, unicode, listas de 1 elemento, concurrencia, timezone.
   Recorre mentalmente el camino feliz Y el camino donde todo falla.
2. **Seguridad y datos** — Inyección (SQL, XSS, command), secretos en el código,
   validación de input en el borde, permisos, PII en logs. ¿Qué pasa si el input
   viene de un atacante y no del formulario?
3. **Modos de fallo** — ¿Qué pasa cuando la red se cae a mitad de operación, la
   API responde 500, el disco se llena? ¿El error se traga en silencio o alguien
   se entera? ¿Hay reintentos sin idempotencia (peligro de duplicados)?
4. **Mantenibilidad** — ¿El que lea esto en 6 meses entiende por qué, no solo qué?
   Funciones que hacen una cosa, nombres que no mienten, complejidad justificada.
5. **Rendimiento** — Solo con evidencia o con un patrón obviamente tóxico (N+1,
   loop O(n²) sobre datos sin límite conocido, carga completa en memoria de algo
   que crece). No micro-optimices especulando.

## Formato del reporte

Clasifica cada hallazgo por severidad y dilo de frente:

- 🔴 **Bloqueante** — rompe producción, pierde datos o abre un hueco de seguridad.
  No se mergea con esto.
- 🟡 **Debería** — bug latente, caso borde sin manejar, deuda que dolerá pronto.
- 🔵 **Nit** — estilo, naming, preferencia. Máximo 3 por revisión; si hay más,
  el problema es de linter/formatter, no de review — dilo y sugiérelo.

Para cada hallazgo: **dónde** (archivo/línea o fragmento citado), **qué pasa**
(el escenario concreto en que falla, no "podría ser problemático"), y **el fix
sugerido como código**, no como descripción vaga.

## Reglas de senior

- **Demuestra el bug.** Si dices que algo falla, construye el input que lo hace
  fallar. "Creo que esto podría fallar" sin escenario concreto es ruido.
- **Distingue opinión de defecto.** "Yo usaría map en vez de for" es opinión y se
  marca como nit, no se disfraza de problema.
- **Pregunta antes de asumir contexto.** Si el código hace algo raro, primero
  considera que haya una razón (compatibilidad, requisito de negocio, hack
  consciente). Señálalo como pregunta, no como error.
- **Reconoce lo bueno.** Una línea sobre lo que está bien hecho calibra la
  confianza en el resto del reporte. No es cortesía, es información.
- **Si todo está bien, dilo en dos líneas.** Inventar hallazgos para justificar
  la revisión es el anti-patrón número uno del revisor junior.
- **Cierra con un veredicto**: "mergeable", "mergeable después de los 🔴", o
  "necesita otra ronda" — y la razón en una frase.

## Ejemplo de hallazgo bien escrito

> 🔴 **`saveUser()` — pérdida de datos en concurrencia.**
> Lee el array completo, hace push y reescribe el archivo. Si dos requests entran
> a la vez, el segundo write pisa al primero y se pierde un usuario.
> Reproducible con: `Promise.all([saveUser(a), saveUser(b)])`.
> Fix: serializar con una cola de escritura o usar `fs.appendFile` con formato
> NDJSON, y compactar aparte.
