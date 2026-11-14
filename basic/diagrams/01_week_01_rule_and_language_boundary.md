# Week 01 Rule and Language Boundary Diagram

```mermaid
flowchart LR
    R[Selected rule contract] --> W[Winner detector]
    R --> T[Tactical threat definitions]
    R --> E[Pattern evaluator]
    B[15 by 15 board state] --> W
    B --> T
    B --> E
    T --> C[Candidate generation]
    E --> S[Search policy]
    C --> S
    U[TypeScript browser layer] --> X[Worker and WASM interface]
    X --> S
```

**Interpretation.** Rule semantics are upstream of both evaluation and search. TypeScript owns browser-facing integration; the worker/WASM interface is a separate execution boundary. This diagram describes the intended evidence model and does not prove a benchmark result.

