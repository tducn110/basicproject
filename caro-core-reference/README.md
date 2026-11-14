# Caro Core Reference (Rust)

Status: **[D] Reference Implementation** for the Basic Project research log.
It is not `[A] Source Evidence` until it is integrated into the real repository,
compiled with the project toolchain, and passes the project's fixture/parity suite.

## Ownership

- Rust: board/state/rules, pattern detection, evaluator, baseline bots, Minimax,
  Alpha-Beta, candidate generation, move ordering, iterative deepening,
  transposition table, Zobrist hashing, search instrumentation.
- React/TypeScript: UI, interaction, application orchestration, visualization,
  experiment controls and the coarse-grained Wasm adapter.

## Core principle

The same Rust core should be consumed by both the web product and the headless
experiment runner. This prevents the demo implementation and the research
implementation from silently diverging.

## Verification gates

1. Lock RuleConfig semantics and fixture corpus.
2. `cargo test` for native core correctness.
3. Differential tests against any real historical TypeScript baseline only if
   such a baseline exists in repository evidence.
4. Wasm build + browser integration tests.
5. Controlled benchmark before any "Rust is faster" claim.

## Important limitation of this reference

The current pattern detector classifies **maximal contiguous runs** by run length
and open ends. Broken patterns such as `XX_XX` or more advanced Gomoku threat
semantics need an additional window/threat detector before this evaluator can be
claimed to model the full tactical pattern space.
