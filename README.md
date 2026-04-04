# equilibrium

```
      ╭──────────────────────────────────────────╮
      │                                          │
      │   equilibrium · ammonia synthesis lab   │
      │                                          │
      ╰──────────────────────────────────────────╯
```

A small **interactive demo** of reversible ammonia formation: tweak **heat**, watch **temperature**, **composition**, and **Q vs K**; scroll **mole histories** in the charts. The UI is plain **DOM + a tiny `h()` JSX layer** (no React), built with **Bun**.

---

## High-level components

```
        ┌─────────────────────────────────────────────────────┐
        │                   equilibrium app                  │
        │  (index.ts · store · src/ui · styles.css)         │
        └─────────────────────────┬───────────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           │                      │                      │
           ▼                      ▼                      ▼
   ┌───────────────┐      ┌───────────────┐      ┌───────────────┐
   │  simulation   │      │     store     │      │   Chart.js    │
   │     library     │      │  (Conditions, │      │  (history     │
   │ ammonia-reac…   │      │   history)    │      │   plots)      │
   └───────────────┘      └───────────────┘      └───────────────┘
```

**On screen**, that becomes two columns:

```
   ╭─────────────────────────╮     ╭─────────────────────────╮
   │  #reactor               │     │  #controls              │
   │  · intro + Q≈K banner   │     │  · heater slider        │
   │  · snapshot (T, moles)  │     │  · time / heat / T      │
   │  · simulator (t, Δt)    │     │  · moles vs time charts │
   │  · reactor state        │     │                         │
   ╰─────────────────────────╯     ╰─────────────────────────╯
```

---

## Data flow (one tick)

```
      requestAnimationFrame
               │
               │  dt (wall clock)
               ▼
        ┌──────────────┐
        │  dispatch    │
        │   STEP       │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐      integrate      ┌──────────────────┐
        │    store     │ ◄────────────────── │  simulation pkg  │
        │ Conditions + │                     │  reactor + clock │
        │ history[]    │                     └──────────────────┘
        └──────┬───────┘
               │
               │  notify subscribers
               ▼
   ┌───────────┴───────────┬────────────────────┐
   │                       │                    │
   ▼                       ▼                    ▼
 reactor column      simulator column     controls + charts
 (readouts)          (integrator)        (metrics + Chart.js)
```

Users move the **heater** → **`SET_HEATER`** updates controls → same **subscribe** path refreshes labels and feeds the next **STEP**.

---

## Quick start

```bash
bun install
bun build ./index.html --outdir=dist
bun test
```

Mount point: **`#root`** in `index.html`. Import aliases live in **`package.json`** (`#src/*`, `#ui/*`, `#simulation/*`, `#tests/*`) with matching **`tsconfig.json`** paths.

---

## Project layout (cheat sheet)

| Path | What lives there |
|------|------------------|
| `ammonia-reaction-simulation/` | Physics, integration, diagnostics (`Conditions`, …) |
| `src/store.ts`, `src/state.ts` | App store, actions, simulation history for charts |
| `src/ui/reactor/`, `simulator/`, `controls/`, `charts/`, `shell/`, `core/` | Views (`view/`) + wiring (`logic/`), feature `index.ts` + `bind*Panel` |
| `styles.css` | `#reactor` → `reactor-*`, `#controls` → `ctrl-*` |

---

### 
