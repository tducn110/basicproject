# Week 02 Research Report

## Core Engine State, Move Transactions, Rules, and Correctness Evidence

### Document control

- Project: Caro AI Research Program
- Reporting mode: Retrospective evidence reconstruction
- Evidence snapshot: 18 September 2026
- Status: Source architecture and Rust engine test suites verified (9/9 tests passed in caro-core-reference; 19/19 passed in gomoku-main/engine)

## 1. Research question and scope

**TQ-W02-01.** What state ownership and move-transaction rules are required for a finite 15 by 15 Caro/Gomoku core whose correctness can be tested independently of the web UI?

The scope is the engine boundary: board representation, legal moves, turn/state updates, win and draw checks, undo discipline, and metrics contracts. The report does not claim device, browser, audio, or visual acceptance. It also does not claim that a reference Rust crate is the byte-for-byte source of the production WASM binary.

## 2. Method

The evidence procedure is source-first. The report maps each correctness claim to the source file that owns it, then records the verification command that was actually run. Core behavior is decomposed as:

`input cell -> bounds and occupancy validation -> legal move commit -> history/state update -> win or draw evaluation -> turn update -> snapshot/output`.

The core design must ensure that a rejected move does not mutate the board, an accepted move changes exactly one cell and one history entry, an undo restores the previous state, and a terminal state prevents further legal moves. These are invariants to test, not assumptions created by UI behavior.

## 3. Observed implementation evidence

| ID | Evidence class | Observation | Source location | Meaning |
| --- | --- | --- | --- | --- |
| W2-A1 | [A] | `GameState` owns a private board map, history, occupied bounds, move commit, and reset. | `10_caro/src/game/core/GameState.ts` | The current web-side state owner is explicit. |
| W2-A2 | [A] | `validateMove` rejects out-of-bounds and occupied cells. | `10_caro/src/game/core/MoveRules.ts` | Legal-move validation is separated from rendering. |
| W2-A3 | [A] | `GameController` calls the move transaction, finishes win/draw/turn state, and produces snapshots. | `10_caro/src/app/GameController.ts` | The application controller owns round progression and state publication. |
| W2-A4 | [A] | The Rust reference uses a fixed `i8` board of `BOARD_CELLS`, stores side-to-move, move count, last move, status, and rule configuration. | `caro-core-reference/src/state.rs` | A headless core representation is available for direct rule/search work. |
| W2-A5 | [A] | `RuleConfig` parameterizes overline and blocked-end semantics; unit cases include exact-five rejection of an overline and freestyle acceptance. | `caro-core-reference/src/rules.rs` | Rule behavior can be made testable rather than hard-coded. |
| W2-A6 | [A] | Search metrics define nodes visited, leaf evaluations, cutoffs, candidate counts, TT hits, and completed depth. | `caro-core-reference/src/metrics.rs` | The reference metrics model is suitable for later experiment instrumentation. |

## 4. Correctness analysis

The current TypeScript state and the Rust reference use different internal representations: a sparse keyed map in `GameState` versus a fixed flat numeric array in the reference core. Neither representation is automatically better for every task. A sparse map can support a rendering-oriented state and occupied-bounds tracking; a fixed array provides direct index arithmetic and predictable cloning/mutation behavior for search. The report therefore treats representation as a design choice with measurable consequences, not as proof of superiority.

The reference core’s `play` method records the previous state in an `UndoToken`, updates the board and move count, evaluates a winning move, and either sets terminal status or swaps the player. This is a suitable transaction pattern for search because `undo` restores the values needed to explore another branch. The observed web controller uses a separate app-level transaction path. The two paths must not be assumed identical without a contract-level comparison.

## 5. Verification result

**[A] Executed TypeScript verification.** In `/home/pro/Downloads/intern/onprogress/10_caro`, `pnpm test` completed with 5 test files and 18 tests passing (100%). `pnpm typecheck` passed cleanly, and `pnpm build` produced the production bundle including `gomoku_engine_bg-Du90GCPD.wasm` in 508ms.

**[A] Executed Rust verification.** Rust toolchain (Rustc/Cargo 1.98.1) was verified and executed directly:
1. `caro-core-reference` (`/home/pro/Downloads/vnuk/basicProject/caro-core-reference`): `cargo test` executed with **9 tests passing** (6 unit tests covering candidate move generation, center fallback, open-three pattern detection, exact-five rejection of overline, freestyle acceptance of overline, incremental Zobrist hashing; plus 3 integration tests covering immediate win selection, non-mutation of search root state, and Alpha-Beta equivalence with Minimax value and move).
2. `gomoku-engine` (`/home/pro/Downloads/intern/onprogress/gomoku-main/engine`): `cargo test --lib` executed with **19 tests passing** (covering board bounds, placement, four-direction wins, board full draw, static heuristic evaluation, center bonus, and AI tactical blocks and wins).

## 6. Experimental setup for future core tests

The core test suite should use fixed fixtures rather than only interactive UI actions. Each fixture should define a board, player to move, selected rule profile, operation, and expected status. Required cases include invalid coordinates, occupied cells, legal turn alternation, four line directions, exact five, overline, blocked ends, full-board draw, reset, and undo. The same fixtures should feed tactical-bot and search tests to prevent rule drift.

## 7. Limitations

- The passing TypeScript and Rust tests verify algorithm, rule, and search unit/integration behavior in headless execution; they do not substitute for real browser interaction, visual layout, audio, or physical-device verification.
- The binary provenance between `gomoku-main/engine` and the vendored `10_caro/src/game/wasm/engine/gomoku_engine_bg.wasm` module was confirmed by structure and exported API contracts, but wasm-pack generates target-specific glue code.
- Source inspection establishes ownership and implementation intent; it does not establish timing of work during the original calendar week.

## 8. Decision and next evidence

**[D] Recommendation.** Treat the rule configuration and undoable core state as the authoritative research surface. Add a fixture manifest that can be consumed by TypeScript integration tests and Rust core tests. Before publishing performance claims, record the runtime, engine revision/build hash, rule profile, fixture ID, and metric definitions alongside each result.

