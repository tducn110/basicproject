# Week 02 Core Move Transaction Diagram

```mermaid
flowchart LR
    I[Input cell] --> V{Bounds and occupancy valid?}
    V -- No --> R[Reject without mutation]
    V -- Yes --> C[Commit one move]
    C --> H[Append history and update state]
    H --> W{Winning move?}
    W -- Yes --> F[Set winner and terminal phase]
    W -- No --> D{Board full?}
    D -- Yes --> G[Set draw]
    D -- No --> N[Switch active player]
    C -. Undo token .-> U[Restore prior search state]
```

**Interpretation.** The diagram distinguishes validation, mutation, terminal evaluation, turn progression, and undo. Test fixtures should target these transitions independently of the UI.

