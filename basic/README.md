# Caro AI Weekly Research Evidence Package

This folder contains four English weekly research reports reconstructed from the current project evidence. Each week is represented by:

- a research-formatted Markdown source in `markdown/`;
- a System Design template-based DOCX report at this folder's root;
- a Mermaid source diagram in `diagrams/`; and
- a native Google Sheet with the same claim register and traceability structure.

## Evidence convention

- **[A] Source evidence**: inspected source files or commands executed during this reconstruction.
- **[B] Authoritative external evidence**: official rules, documentation, or primary academic literature.
- **[C] Inference**: a conclusion drawn from stated evidence.
- **[D] Recommendation**: a proposed next action, not a claim about current behavior.

## Important boundary

The materials describe the **current evidence snapshot**, not an invented historical diary. A test/build result is reported only when executed in this reconstruction. The direct Rust source in `gomoku-main` is inspectable, but a build-provenance link from that source tree to the vendored `10_caro` WASM binary has not been established.

## Report inventory

| Week | Research focus | Main boundary |
| --- | --- | --- |
| 01 | Rules, state space, board representation, and language boundary | “Caro” terminology must be fixed before search claims are made. |
| 02 | Core state, rules, move transaction, and correctness evidence | Core correctness is distinct from UI/runtime acceptance. |
| 03 | Website integration and UI-to-WASM lifecycle | TypeScript coordinates browser integration; Rust/WASM is a separate execution boundary. |
| 04 | Random, rule-based, pattern, and heuristic baselines | Runtime strategic search and inspectable reference algorithms must not be conflated. |

