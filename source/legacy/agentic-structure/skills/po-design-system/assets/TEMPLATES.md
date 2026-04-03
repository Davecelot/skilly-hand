# Issue Templates — ScannLab Design System

Reference templates for each issue type. Select based on the decision tree in [SKILL.md](../SKILL.md).

---

## 📌 Nuevo Desarrollo / Mejora Continua

```markdown
## TL;DR
[Resumen ejecutivo en 1–2 oraciones. Qué se hace y por qué.]

---

## User Story
Como **[rol]**, quiero **[acción]** para **[beneficio/objetivo]**.

---

## Dependencias
- `SCNLAB-XXX` — [descripción breve]
- Sin dependencias conocidas. *(eliminar si hay dependencias)*

---

## Artefactos / Referencias
- [Diseño en Figma](URL)
- [Storybook — componente actual](URL)
- [PR relacionado](URL)

---

## Lifecycle
Versión objetivo: **vX.X.X** — `SCNLAB.LC.[Proposal|Experimental|Stable]`

---

## Roadmap / Goals
*(opcional)* Vinculado al objetivo: [nombre del objetivo o OKR].

---

## Stakeholders
- @nombre — Product Owner
- @nombre — Tech Lead
- @nombre — UX Designer

---

## Alcance

**✅ Incluye:**
- [qué entra en este issue]

**🚫 No incluye:**
- [qué queda explícitamente fuera]

---

## DoR (Definition of Ready)

### UX
- [ ] Diseños aprobados en Figma con todas las variantes y estados
- [ ] Tokens definidos y documentados

### DEV
- [ ] Especificaciones de props y API del componente definidas
- [ ] Criterios de aceptación revisados y validados

---

## DoD (Definition of Done)

### UX
- [ ] Componente documentado en Figma con annotations
- [ ] Assets exportados y organizados en el UIkit

### DEV
- [ ] Implementación en código con todas las variantes
- [ ] Unit tests y/o visual regression tests
- [ ] Story en Storybook con controles y documentación
- [ ] PR revisado y aprobado

### QA
- [ ] Testing funcional completado
- [ ] Accesibilidad validada (WCAG 2.1 AA)

---

## Criterios de aceptación
1. **Dado** [contexto], **cuando** [acción], **entonces** [resultado esperado].
2. **Dado** [contexto], **cuando** [acción], **entonces** [resultado esperado].
```

---

## 🐛 Error / Incidente

```markdown
## TL;DR
[Descripción breve del bug: qué falla, dónde y cuál es el impacto.]

---

## User Story
Como **[usuario/rol afectado]**, espero que **[comportamiento correcto]** para **[razón/impacto en el flujo]**.

---

## Prioridad de corrección
**[Crítica | Alta | Media | Baja]** — [justificación en una oración]

---

## Actual vs. Esperado

| | Descripción |
|---|---|
| **🔴 Comportamiento actual** | [Qué pasa hoy] |
| **✅ Comportamiento esperado** | [Qué debería pasar] |

---

## Pasos para reproducir
1. [Primer paso]
2. [Segundo paso]
3. [Resultado observado]

**Entorno:**
- Versión del Design System: vX.X.X
- Browser / Plataforma: [Chrome 120 / iOS 17 / etc.]
- Storybook: [URL o versión]

---

## Dependencias
- Sin dependencias conocidas. *(o listar issues relacionados)*

---

## Artefactos / Referencias
- [Screenshot / video del bug](URL)
- [Componente en Storybook](URL)
- [Issue relacionado](URL)

---

## Criterios de aceptación
1. **Dado** [contexto del bug], **cuando** [se aplica el fix], **entonces** [el comportamiento correcto ocurre].
2. **Dado** el escenario corregido, **cuando** se ejecutan los tests de regresión, **entonces** todos pasan sin errores.

---

## Subtareas
*(Incluir solo si hay 3+ findings — Complex Issue Package pattern)*
- [ ] SUB-1 — [Acción concisa] ([Finding ID])
- [ ] SUB-2 — [Acción concisa] ([Finding ID])

---

## DoD (Definition of Done)
- [ ] Fix implementado y validado en código
- [ ] Visual regression test actualizado
- [ ] Storybook actualizado si aplica
- [ ] PR revisado y mergeado
- [ ] No se introducen breaking changes (o se documentan si los hay)
```

---

## 🔭 PoC / Setup

```markdown
## TL;DR
[Qué se explora/configura y cuál es la hipótesis o necesidad.]

---

## User Story
Como **[rol]**, quiero **[explorar/configurar]** para **[aprendizaje o habilitación esperada]**.

---

## Lifecycle
Estado: `SCNLAB.LC.[Proposal|Experimental]` — Este issue **no implica** publicación en producción.

---

## Artefactos / Referencias
- [Documento de investigación / brief](URL)
- [Referencias externas o benchmarks](URL)

---

## Alcance

**✅ Incluye:**
- [qué se explorará / configurará]

**🚫 No incluye:**
- [qué no entra en esta iteración]

---

## Stakeholders
- @nombre — Responsable
- @nombre — Consultado

---

## DoD (Definition of Done)
- [ ] Hallazgos documentados y compartidos con el equipo
- [ ] Decisión tomada: continuar / descartar / escalar
- [ ] Artefactos generados archivados en la referencia correspondiente
```

---

## 🗺️ Epic

```markdown
## TL;DR
[Descripción de la iniciativa. Qué se busca lograr a nivel macro.]

---

## Roadmap / Goals
Vinculado al objetivo estratégico: **[nombre del goal o OKR]**

---

## User Story
Como **[rol principal]**, quiero **[iniciativa]** para **[impacto de negocio o producto]**.

---

## Alcance

**✅ Incluye:**
- [Líneas de trabajo o features que comprende esta epic]

**🚫 No incluye:**
- [Qué queda fuera de esta epic]

---

## Stakeholders
- @nombre — Sponsor / Decisor
- @nombre — Tech Lead
- @nombre — UX Lead

---

## Dependencias
- [Otras epics o iniciativas relacionadas]

---

## Artefactos / Referencias
- [Roadmap o planning doc](URL)
- [Brief o strategy doc](URL)
```

---

## ✅ BAU

```markdown
## TL;DR
[Descripción breve de la tarea administrativa o reunión.]

---

## Stakeholders
- @nombre — Organizador/Responsable
- @nombre — Participantes relevantes
```

---

## 🔗 Sub-task (Complex Issue Package)

Used inside a parent issue when the **Complex Issue Package** pattern is active.
Each sub-task is a short, standalone block — not a full template.

```markdown
## SUB-N — [Título con verbo accionable] ([Finding ID(s)])

[2–4 oraciones explicando qué cambiar, cuál es el estado actual y cuál es el estado correcto.
Incluir valores específicos cuando se conocen. No repetir la tabla Actual vs. Esperado del padre — referenciarla.]

**Referencia:** Issue principal [SCNLAB-XXX], criterio(s) [Finding IDs] del [fecha/evento].
**Dependencia:** [Si aplica — qué debe verificarse o completarse antes de iniciar esta subtarea.]

**Criterio de aceptación:**
- [Condición verificable y acotada — una o dos líneas máximo.]
```

**Rules:**

- Titles must use actionable verbs: "Corregir", "Reemplazar", "Alinear", "Reescribir" — not noun labels.
- Finding IDs must be preserved verbatim from the source material.
- If two findings belong to the same file/PR, merge them into one sub-task and list both IDs.
- Each sub-task inherits context from the parent — keep descriptions concise.
