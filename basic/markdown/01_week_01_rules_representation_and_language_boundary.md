# Week 01 Research Report

## Rules, State Space, Board Representation, and the TypeScript to Rust Boundary

### Document control

- Project: Caro AI Research Program
- Reporting mode: Retrospective evidence reconstruction
- Evidence snapshot: 18 September 2026
- Status: Completed research baseline; implementation-history timing is not asserted

## 1. Research question and scope

**TQ-W01-01.** How should the game rule, board representation, and execution-language boundary be specified so that later AI algorithm experiments evaluate one well-defined game?

The week establishes the domain model required before comparing a Random bot, heuristic selection, Minimax, or Alpha-Beta pruning. It covers rule semantics, a 15 by 15 board, state-space implications, and the role separation between the TypeScript web layer and Rust/WASM core. It does not claim a measured Rust-versus-TypeScript performance advantage, because no controlled benchmark of the two implementations was found or run.

## 2. Background and research basis

The title “Caro” is not sufficient as a formal rule specification. The official Gomocup rule description distinguishes Freestyle Gomoku, Standard Gomoku, and Caro. Under its Caro rule, a winning line is exactly five stones and must not be blocked at both ends on a 15 by 15 board. This is different from Freestyle Gomoku, where a line of five or more wins [B1].

For a board with 225 cells and three nominal cell states (empty, X, O), the unconstrained state-space upper bound is \(3^{225}\). Legal reachability, alternating turns, and terminal positions make the actual game graph smaller, but the bound is sufficient to explain why exhaustive full-width search is infeasible. The practical research problem is therefore not merely “search deeper”; it is to define legal states and threats precisely, then reduce the effective branching factor without discarding tactically necessary moves.

Alpha-Beta pruning is an exact game-tree search refinement when it preserves the minimax value. Its practical effectiveness depends on the ordering of candidate moves, which motivates treating candidate generation and move ordering as first-class experimental variables rather than presentation features [B2].

## 3. Observed system evidence

| ID | Evidence class | Observation | Source location | Consequence |
| --- | --- | --- | --- | --- |
| W1-A1 | [A] | The web project defines `BOARD_SIZE = 15` and validates both row and column against 0 through 14. | `10_caro/src/game/core/BoardBounds.ts` | The UI and game layer expose a finite 15 by 15 contract. |
| W1-A2 | [A] | `FreestyleGomokuWinRule` returns a win when `cells.length >= 5`. | `10_caro/src/game/core/WinRules.ts` | The observable TypeScript rule path uses Freestyle semantics. |
| W1-A3 | [A] | The Rust reference `RuleConfig` can represent freestyle, exact-five, and blocked-ends profiles. | `caro-core-reference/src/rules.rs` | A rule abstraction exists in the reference core, but it is not proven to be the production rule owner. |
| W1-A4 | [A] | The web package is TypeScript/React/PixiJS; the sibling Gomoku source contains Rust with `wasm-bindgen` and a `wasm-pack` build script. | `10_caro/package.json`; `gomoku-main/package.json`; `gomoku-main/engine/Cargo.toml` | Browser presentation and compiled engine are separate technical layers. |
| W1-B1 | [B] | Gomocup defines Caro as exactly five, not blocked at both ends, on 15 by 15. | Official rules [B1] | The project must name its selected rule before interpreting pattern scores or test results. |

## 4. Analysis of the language boundary

**[A] Source evidence.** TypeScript owns the browser-facing board bounds and strongly typed contracts in the examined web project. Rust source in the sibling Gomoku project exposes a `Game` through `wasm-bindgen`, and the web build is configured to compile Rust to WebAssembly.

**[C] Inference.** TypeScript is a defensible initial implementation language for a web prototype because the UI, browser events, and worker messages already live in the JavaScript runtime. Rust is a defensible core-engine language when the engine needs a compact state representation, explicit mutation/undo discipline, and a compiled WebAssembly boundary. This inference describes architectural fit, not a measured claim that Rust is faster in this project.

**[D] Reporting rule.** The report should say: “TypeScript remains the integration and presentation language; Rust/WASM is the intended computation boundary for the core engine.” It should not say: “Rust made the engine faster” until a reproducible benchmark compares the same position set, algorithm configuration, runtime, repetition rule, and machine.

## 5. Method and evidence plan

The rule contract should be selected once and then consumed by winner detection, tactical checks, pattern classification, heuristic evaluation, candidate forcing logic, fixtures, and benchmarks. The minimum rule-test matrix is: horizontal, vertical, both diagonals, exactly-five, overline, one-end blocked, two-end blocked, and board-edge cases.

For later algorithm experiments, each fixture should record: board position, side to move, rule profile, expected tactical result, candidate configuration, search depth/time limit, random seed where applicable, and the expected move set. A report may describe an intended experiment before data exists, but must label that plan as [D] Recommendation.

## 6. Limitations

- The current `10_caro` implementation visibly uses a Freestyle rule; it has not been shown to implement the official Gomocup Caro profile.
- The sibling `gomoku-main` Rust source is inspectable, but its exact binary provenance relative to the vendored `10_caro` WASM module is not established by this evidence pass.
- No controlled language-performance benchmark was found or performed.
- Rule terminology in the original proposal is broader than the currently observed TypeScript rule implementation.

## 7. Decision and next evidence

**[D] Recommendation.** Freeze a written `RuleSet` contract before presenting any bot-strength or algorithm-comparison result. Maintain one rule-oriented test suite and use it for both TypeScript integration tests and Rust-core tests. The subsequent Week 02 report then treats board mutation, legal-move validation, and terminal-state detection as evidence of core correctness under that selected contract.

## References

- [B1] Gomocup. “Detail Information.” https://gomocup.org/detail-information/
- [B2] Knuth, D. E., and R. W. Moore. “An Analysis of Alpha-Beta Pruning.” *Artificial Intelligence* 6(4), 1975. https://doi.org/10.1016/0004-3702(75)90019-3

