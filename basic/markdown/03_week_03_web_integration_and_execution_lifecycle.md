# Week 03 Research Report

## Web UI Integration, Player Interaction, and the TypeScript to WASM Lifecycle

### Document control

- Project: Caro AI Research Program
- Reporting mode: Retrospective evidence reconstruction
- Evidence snapshot: 18 September 2026
- Status: Integration path verified from source; browser/device acceptance not performed

## 1. Research question and scope

**TQ-W03-01.** How does a player action travel through the web application, state controller, tactical layer, worker, and WASM engine without allowing stale AI results to corrupt a round?

This report covers UI-to-engine integration, Player-vs-Player and Player-vs-AI lifecycle ownership, reset/new-game behavior, cancellation, and WASM message boundaries. It does not evaluate visual quality, accessibility, network deployment, or end-user response time on a physical device.

## 2. Background

WebAssembly is useful here as a language/runtime boundary, not as an automatic correctness or performance proof. The `wasm-bindgen` guidance demonstrates loading WASM inside a Web Worker and communicating asynchronously through messages [B1]. In a game application, that boundary must include a clear state-reconstruction contract and stale-result protection because an AI response may arrive after a player resets the round, changes difficulty, pauses, or begins a different game.

## 3. Observed runtime flow

`player input -> GameController.playCell -> playMove -> GameState + WinRule -> MatchController -> AIController -> TacticalMoveResolver -> GomokuWasmEngine -> worker -> WASM Game.ai_move -> guarded GameController commit -> snapshot -> renderer`.

| ID | Evidence class | Observation | Source location | Consequence |
| --- | --- | --- | --- | --- |
| W3-A1 | [A] | `GameController` owns state, match controller, current player, pause flag, turn token, AI-thinking state, snapshots, reset/new-game, and AI completion guards. | `10_caro/src/app/GameController.ts` | It is the application lifecycle owner. |
| W3-A2 | [A] | AI input first checks immediate win/block via `findForcedTacticalMove`; strategic search is delegated to `GomokuWasmEngine` when no tactical result is found. | `10_caro/src/game/ai/AIController.ts` | Tactical and strategic paths are distinct. |
| W3-A3 | [A] | The worker hydrates a `Game` from move history, calls `game.ai_move`, frees it, and posts a move result. | `10_caro/src/game/wasm/worker.ts` | Move history is the visible TS-to-WASM state-transfer contract. |
| W3-A4 | [A] | The worker reports elapsed time but assigns static mapped depth and `nodes: 0`. | `10_caro/src/game/wasm/worker.ts`; `src/game/wasm/contracts.ts` | Current wrapper telemetry cannot prove actual completed depth or searched nodes. |
| W3-A5 | [A] | Pending AI work is invalidated on reset/mode/difficulty changes and when paused; response commit checks token, round ID, phase, mode, and turn. | `10_caro/src/app/GameController.ts` | The controller prevents stale result commitment under observed conditions. |

## 4. TypeScript and Rust/WASM responsibility analysis

**[A] Source evidence.** The TypeScript layer declares public difficulty names, interaction state, move history, worker messages, and rendering snapshots. The WASM worker has a narrow bridge: initialize engine, hydrate from history, request `ai_move`, convert coordinates, and return a result.

**[C] Inference.** This division is appropriate for keeping browser lifecycle and UI concerns in TypeScript while isolating compute-oriented game search behind an explicit compiled interface. It should be described as a maintainability and integration boundary; no runtime benchmark in this evidence package establishes a speedup.

The worker contract is also a research boundary. If the final report discusses metrics such as nodes, pruned nodes, TT hits, or completed depth, they must originate inside the engine and cross this boundary as measured values. A TypeScript static mapping is an intended budget/label, not a measurement of what the compiled engine completed.

## 5. Test and reproducibility evidence

The project’s executed TypeScript test suite passed 18 tests across 5 files, and `pnpm typecheck` succeeded. These checks support the current TypeScript modules under the executed environment. They do not prove that the user interface was visually correct in a browser, that a worker executed on a target device, or that the WASM internals ran the algorithm described by a separate source tree.

For reproduction, an AI request record should include `roundId`, `requestId`, difficulty, move history, rule profile, WASM build identifier, returned move, elapsed time, actual completed depth, nodes, and cancellation reason. The last three fields are incomplete in the current visible worker telemetry.

## 6. Limitations

- No browser, mobile, or real WASM runtime session was run in this evidence pass.
- The `nodes` field is statically zero in the observed worker response; it cannot support node-count comparisons.
- The visible depth field is a static mapping, not engine-reported completed depth.
- The production provenance of the vendored WASM binary relative to the sibling Rust source tree is not established.

## 7. Decision and next evidence

**[D] Recommendation.** Keep TypeScript responsible for round lifecycle, UI state, cancellation, and result validity. Make Rust/WASM responsible for one explicit search interface that returns real `SearchStats`. Add a reproducible worker-level test harness with fixed histories and record whether an AI result was returned, cancelled, rejected as stale, or committed.

## References

- [B1] wasm-bindgen Guide. “Wasm in Web Worker.” https://wasm-bindgen.github.io/wasm-bindgen/examples/wasm-in-web-worker.html

