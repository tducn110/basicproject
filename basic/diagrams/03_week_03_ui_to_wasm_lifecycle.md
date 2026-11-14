# Week 03 UI to WASM Lifecycle Diagram

```mermaid
flowchart LR
    UI[Board input] --> GC[GameController]
    GC --> GS[GameState and MatchController]
    GS --> TR[Tactical win or block check]
    TR -- Forced move --> GC
    TR -- No forced move --> WE[GomokuWasmEngine]
    WE --> WK[Web Worker]
    WK --> H[Hydrate Game from history]
    H --> WM[WASM ai_move]
    WM --> WK
    WK --> GC
    GC --> G{Token, round, phase, mode, turn still valid?}
    G -- Yes --> CM[Commit AI move and publish snapshot]
    G -- No --> X[Discard stale result]
```

**Interpretation.** The worker boundary is asynchronous. A returned move is not automatically valid; the controller checks round and lifecycle state before commit.

