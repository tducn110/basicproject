# Canonical Rust/WASM migration verification

Implementation handoff: 13/11/2026, after explicit user authorization to complete the six report tiers, rebuild Rust/WASM, migrate source and run the web app. This supersedes the earlier read-only boundary for the implementation work recorded here; the original diagnosis remains historical evidence.

**Result:** The current six-tier algorithm already matched the reviewed report. The Rust source is now included inside the canonical app checkout, and a fresh locked/offline WASM build from that source reproduced the existing current application binary byte-for-byte. No difficulty, search cap, evaluator or gameplay algorithm was changed.

## Ownership and changed artifacts

Canonical app: `/home/pro/Downloads/basicproject/CaroGame` under Git HEAD `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc` (no commit or push performed).

- `engine/`: migrated 11 source/manifests/tests/example files from `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine`, excluding `target/`. All 11 copied files are byte-identical to their reporting-workspace originals; see `ENGINE_MIGRATION_SOURCE_PARITY.json`. The original source copy was left unchanged.
- `engine/README.md`: identifies the canonical ownership, six profiles, native check and WASM rebuild commands.
- `scripts/build-wasm.mjs`: builds the in-repo engine with `wasm-pack build engine --target web --release --no-opt --out-dir <temporary> -- --locked --offline`, copies the five generated runtime files, and writes deterministic provenance with no timestamp or absolute filesystem path.
- `package.json`: adds `npm run build:wasm`; the normal Vite build continues to consume the checked-in generated package.
- `src/game/wasm/engine/provenance.json`: records source hashes, generated output hashes/byte lengths, release flags and tool versions from the fresh build.
- `tests/game/wasm-runtime.test.ts`: adds six real-WASM test cases, each exercising both a unique immediate winning gap and a unique opponent winning gap. Easy retains its Random policy and is required to return a legal move, not a tactical guarantee; the other five profiles must take the unique completion. Reported depth comes from Rust telemetry through the actual adapter.

No `present/` files were edited by this implementation owner. Presentation integration/browser checks belong to the runtime agent, and deployment/Google Docs belong to the root agent.

## Verified report contract

| UI tier | Numeric ID | Rust policy | Configured depth | Candidate soft cap |
|---|---:|---|---:|---:|
| Easy | 0 | Random | 0 | none |
| Normal | 1 | RuleBased | 1 | none |
| Hard | 2 | alpha-beta minimax | 2 | 15 |
| Very Hard | 5 | alpha-beta minimax | 3 | 12 |
| Expert | 3 | alpha-beta minimax | 4 | 10 |
| Master | 4 | alpha-beta minimax | 5 | 8 |

Source owner: `engine/src/ai.rs::Difficulty`, aligned with `src/game/wasm/contracts.ts`. The historical 4/6/8 Hard/Expert/Master depths were not reinstated because they do not match the reviewed current report. Names remain configuration labels, with no unmeasured strength ranking added.

## Executed checks

| Check | Result and boundary |
|---|---|
| `PATH=/home/pro/.cargo/bin:$PATH cargo test --manifest-path engine/Cargo.toml --locked --offline` | PASS: 38 native unit + 7 native integration tests; 0 failures. These are native checks, including the tests in `tests/wasm.rs`, not a browser claim. |
| `npm run build:wasm` | PASS: actual fresh Rust→wasm32→wasm-bindgen web package build, from canonical `CaroGame/engine`, 13/11/2026 local. |
| `CARO_WASM_EVIDENCE_PATH=.../WASM_REBUILD_RUNTIME_EVIDENCE.json npm test -- tests/game/wasm-runtime.test.ts tests/game/wasm-contract.test.ts` | PASS: 2 files, 28 tests, including six paired tactical cases on the freshly rebuilt real binary. Vitest start 00:07:39 local, duration449ms. |
| Source-copy byte comparison | PASS: all 11 migrated files identical. |
| Generated package comparison with previous canonical package | PASS: all five generated files unchanged in Git; the WASM SHA-256 is identical. |
| `node --check scripts/build-wasm.mjs` | PASS. |
| `git diff --check -- CaroGame` | PASS. Global `git diff --check` finds existing unrelated whitespace in dirty presentation files; these were preserved. |

Toolchain: rustc1.98.1 (`48a229cea`), cargo1.98.1 (`797e8a9bc`), wasm-pack0.15.0. Release: opt-level`z`, LTO enabled, wasm-opt disabled. These flags identify the build and do not establish a speed advantage.

Rebuilt WASM: `src/game/wasm/engine/gomoku_engine_bg.wasm`, 111,582 bytes, SHA-256 `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`. JS hash `9c0ace9191774fba1d6119ecf4c1a0f6d9cb6237196e640f78528387be7caae3`. Full file hashes are in the generated provenance manifest.

## Handoff and limits

This source/build/actual-binary subtask is CREATED and VERIFIED for the checks above. User acceptance is not claimed. Runtime agent was notified that the generated package and source changes were ready after the focused tests at 00:07:39 local; it owns full frontend tests, typecheck, Vite build and browser checks. Root owns publishing the desired artifact and reconciling the report/deployment evidence.

This rebuild does not by itself update `https://10-caro.vercel.app`. The earlier live evidence proved that URL served the old four-button frontend and old48,549-byte WASM. That deployment must be checked again after the root's publishing work. No tournament, exact losing-position replay, strength improvement, physical-device acceptance or production readiness is inferred from the migration or finite checks.

Independent review follow-up: build script now reads rustc/cargo versions with cwd=engine, so the recorded compiler follows engine/rust-toolchain.toml. The rebuild was repeated after this correction; all runtime files and 16 hashes remain unchanged.
