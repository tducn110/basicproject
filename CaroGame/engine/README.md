# Canonical Rust engine

This directory contains the Rust source used to generate the application package
in `../src/game/wasm/engine/`. It was migrated unchanged from the reporting
workspace's `gomoku-main/engine`; the reporting copy is historical after migration.

From `CaroGame/`, with the stable Rust toolchain, `wasm32-unknown-unknown` target,
and wasm-pack available:

```sh
PATH="$HOME/.cargo/bin:$PATH" cargo test --manifest-path engine/Cargo.toml --locked --offline
npm run build:wasm
npm test
npm run typecheck
npm run build
```

The locked offline build requires the Cargo dependencies to be available locally.
For a fresh development environment, fetch them once with
`cargo fetch --manifest-path engine/Cargo.toml --locked` before the offline build.
The normal Vite build uses the checked-in generated package and does not require
Rust. `build:wasm` rebuilds the package and records source/output hashes and tool
versions in `src/game/wasm/engine/provenance.json`. The manifest has no timestamp or
absolute path so an unchanged build does not create metadata-only churn.

The six report profiles are Easy (Random, depth 0), Normal (RuleBased, depth 1),
Hard (alpha-beta, depth 2), Very Hard (3), Expert (4), and Master (5). Stable numeric
IDs are 0, 1, 2, 5, 3, 4 respectively. Search caps for the four alpha-beta profiles
are 15, 12, 10, 8; all immediate winning completions and opponent winning
completions survive those soft caps. Names are configuration labels; no tournament
or monotonic strength calibration is implied.
