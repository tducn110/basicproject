# Week 04 Bot Baseline Ladder Diagram

```mermaid
flowchart LR
    R[Random baseline\nseed + legal moves] --> RB[Rule-based tactics\nwin then block]
    RB --> H[One-ply heuristic\npattern weights]
    H --> AB[Iterative deepening\nAlpha-Beta]
    AB --> O[Move ordering and\ntransposition cache]
    O --> TS[Selective threat search]
    F[Shared rule profile + fixtures] --> R
    F --> RB
    F --> H
    F --> AB
    M[Measured search stats] --> AB
    M --> O
```

**Interpretation.** Each stronger policy must be compared against a fixed baseline on the same rule profile and fixtures. Search optimizations require measured statistics; they are not inferred from code complexity.

