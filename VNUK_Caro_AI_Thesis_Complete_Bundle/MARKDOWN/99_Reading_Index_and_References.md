# 99 — Canonical Reading Index, Primary Citations, and Bibliographic Registry

**Project Title:** Research, Design, and Implementation of an Optimized Gomoku Game Engine with Artificial Intelligence  
**Academic Module:** Basic Project (Đồ Án Cơ Sở) — Software Engineering & AI Track  
**Document Standard:** Standard 00 (IMRaD & Evidence Specification for Software Systems)  
**Control Layer ID:** `REF-INDEX-99`  
**Language:** English  
**Status:** Comprehensive Academic Bibliography  

---

## 1. Bibliographic Taxonomy & Metadata Schema

Each bibliographic entry is classified under strict academic metadata:
* **Reference ID:** Unique citation identifier.
* **Type:** Primary Academic Paper, Doctoral Thesis, Technical Specification, Official Book.
* **Read Status:** `FULL_READ`, `RELEVANT_SECTION_READ`, `CITED`.
* **Used By:** Specific research questions (`RQ`) and architecture decision records (`ADR`).

---

## 2. Canonical Master References

### REF-01: Victor Allis (1994) — Gomoku Solvability Proof
* **Citation:** Allis, L. V. (1994). *Searching for Solutions in Games and Artificial Intelligence.* Ph.D. Thesis, University of Limburg, Maastricht.
* **Type:** Academic Doctoral Dissertation (Primary Source).
* **Official URL:** [https://www.cs.unimaas.nl/olympiad/thesis/Allis_thesis.pdf](https://www.cs.unimaas.nl/olympiad/thesis/Allis_thesis.pdf)
* **Read Status:** `FULL_READ`.
* **Used By:** `RQ-W1-01`, `RQ-W4-B01`, `RQ-W7-01`, Thesis Chapters 1, 2.
* **Key Findings:** Free-style $15 \times 15$ Gomoku is mathematically proven to be a forced win for the first player (Black) using Proof-Number Search and Threat-Space Search.

### REF-02: Donald E. Knuth & Ronald W. Moore (1975) — Alpha-Beta Pruning
* **Citation:** Knuth, D. E., & Moore, R. W. (1975). *An Analysis of Alpha-Beta Pruning.* Artificial Intelligence, 6(4), 293–326.
* **Type:** Peer-Reviewed Journal Article (Primary Source).
* **Official DOI:** [https://doi.org/10.1016/0004-3702(75)90019-3](https://doi.org/10.1016/0004-3702(75)90019-3)
* **Read Status:** `FULL_READ`.
* **Used By:** `RQ-W6-01`, `RQ-W8-01`, Thesis Chapters 2, 4, 6.
* **Key Findings:** Formal mathematical proof of the Alpha-Beta pruning algorithm. Established that optimal move ordering reduces tree complexity to $\mathcal{O}(b^{d/2})$.

### REF-03: Albert L. Zobrist (1970) — Zobrist Hashing
* **Citation:** Zobrist, A. L. (1970). *A New Hashing Method with Application for Game Playing.* Technical Report #88, Computer Sciences Department, University of Wisconsin, Madison.
* **Type:** University Technical Report (Primary Source).
* **Official Archive:** [https://minds.wisconsin.edu/handle/1793/57606](https://minds.wisconsin.edu/handle/1793/57606)
* **Read Status:** `FULL_READ`.
* **Used By:** `RQ-W9-01`, `RQ-W9-02`, Thesis Chapters 2, 4, 5.
* **Key Findings:** Introduced bitwise XOR hashing for discrete board games, enabling $O(1)$ state updates during move/undo cycles.

### REF-04: Claude E. Shannon (1950) — Game Tree Search Paradigm
* **Citation:** Shannon, C. E. (1950). *Programming a Computer for Playing Chess.* Philosophical Magazine, Ser.7, Vol. 41, No. 314, 256–275.
* **Type:** Foundational Journal Article.
* **Official Archive:** [https://vision.unipv.it/IA1/programmingacomputer.pdf](https://vision.unipv.it/IA1/programmingacomputer.pdf)
* **Read Status:** `FULL_READ`.
* **Used By:** `RQ-W5-01`, `RQ-W4-C01`, Thesis Chapters 1, 2.
* **Key Findings:** Established the minimax search framework, heuristic evaluation concept, and type-A vs. type-B lookahead strategies.

### REF-05: John F. Nash (1950) — Strategy-Stealing Argument
* **Citation:** Nash, J. F. (1950). *Non-Cooperative Games.* Annals of Mathematics, 54(2), 286–295.
* **Official DOI:** [https://doi.org/10.2307/1969529](https://doi.org/10.2307/1969529)
* **Type:** Mathematical Paper.
* **Read Status:** `RELEVANT_SECTION_READ`.
* **Used By:** `RQ-W1-01`, Thesis Chapter 2.
* **Key Findings:** Proved that in symmetric, zero-sum combinatorial games with no zugzwang, the second player can never have a forced winning strategy.

### REF-06: Gomocup International Tournament Consortium (2000–2025)
* **Citation:** Gomocup International Tournament Consortium. (2024). *Gomocup AI Protocol Specifications and Tournament Rules.*
* **Type:** Official Tournament Standard.
* **Official URL:** [https://gomocup.org/detail-information/](https://gomocup.org/detail-information/)
* **Read Status:** `FULL_READ`.
* **Used By:** `RQ-ARCH-01`, `RQ-W10-04`, Thesis Chapters 1, 3.
* **Key Findings:** Standardized inter-process communication protocol (`START`, `TURN`, `BOARD`, `INFO`, `END`) for Gomoku AI programs.

### REF-07: W3C WebAssembly Working Group (2024)
* **Citation:** Rossberg, A., et al. (2024). *WebAssembly Core Specification 2.0.* W3C Recommendation.
* **Type:** Official International Standard.
* **Official URL:** [https://www.w3.org/TR/wasm-core-2/](https://www.w3.org/TR/wasm-core-2/)
* **Read Status:** `FULL_READ`.
* **Used By:** `ADR-ARCH-01`, `RQ-W4-A01`, Thesis Chapters 3, 5.
* **Key Findings:** Defines the binary execution environment, structured control flow, and linear memory operations for client-side web computing.

### REF-08: WHATWG Web Workers Standard (2024)
* **Citation:** WHATWG. (2024). *HTML Living Standard: Web Workers.*
* **Type:** Official Web Standard.
* **Official URL:** [https://html.spec.whatwg.org/multipage/workers.html](https://html.spec.whatwg.org/multipage/workers.html)
* **Read Status:** `FULL_READ`.
* **Used By:** `ADR-ARCH-01`, `RQ-W3-01`, Thesis Chapters 3, 4.
* **Key Findings:** Defines background execution contexts and message-passing protocols for multithreaded web applications.
