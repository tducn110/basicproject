# Independent six-tier acceptance matrix

Read-only reviewer snapshot: 13 November 2026. This is a verification contract and source review, not a claim that the new build or runtime integration has already passed. Source inspection confirms the six-tier mapping below in canonical `CaroGame/src/game/ai/contracts.ts`, `game/wasm/contracts.ts`, `game/wasm/executeSearch.ts`, `game/ai/AIController.ts`, and the inspected modified Rust `ai.rs`, `candidates.rs`, `search.rs`. Implementation and runtime owners must attach fresh results to the exact rebuilt binary.

| Tier shown in UI | Request label | WASM ID | Rust policy | Configured depth | Radius / nominal cap | Required measured result on ongoing, non-tactical fixture with enough empty cells |
|---|---|---:|---|---:|---|---|
| Easy | easy | 0 | random | 0 | all legal cells / uncapped | Rust source, random strategy, completed_depth=0; legal move; nonzero nodes and leaf evaluations because chosen move is evaluated; zero search cutoffs and ranking evaluations |
| Normal | normal | 1 | rule_based | 1 | 2 / uncapped | Rust source, rule_based strategy, completed_depth=1; legal move and measured counters; own immediate win preferred, else immediate block, else one-ply evaluation |
| Hard | hard | 2 | alpha_beta | 2 | 2 / 15 | Rust source, alpha_beta strategy, completed_depth=2; legal move and measured counters |
| Very Hard | veryhard | 5 | alpha_beta | 3 | 2 / 12 | Rust source, alpha_beta strategy, completed_depth=3; label must remain veryhard despite nonsequential numeric ID |
| Expert | expert | 3 | alpha_beta | 4 | 2 / 10 | Rust source, alpha_beta strategy, completed_depth=4; legal move and measured counters |
| Master | master | 4 | alpha_beta | 5 | 2 / 8 | Rust source, alpha_beta strategy, completed_depth=5; legal move and measured counters |

The depth equality above applies to the specified ordinary fixture. Terminal roots return no move with null counters through the current adapter. Search depth can be limited by the remaining empty cells. For Hard through Master, a frontend immediate-tactical result legitimately bypasses WASM: source=tactical, strategy=tactical, reason=tactical, depth=0 and Rust counters=0. Easy and Normal must bypass this frontend shortcut so that their distinct Rust baselines actually run. Cap is soft: assessed immediate wins and opponent winning cells must survive even if their count exceeds the nominal cap.

| Gate | Minimum concrete evidence | Current reviewer status / important limit |
|---|---|---|
| G1 — Source mapping | One UI list of six; exact request labels and IDs above; Rust policy/depth/cap mapping agrees | Read-source VERIFIED for inspected files. This does not prove a browser loaded those files. |
| G2 — Build provenance | Canonical Rust source path; manifest/lockfile; source hashes; rustc/cargo/wasm-pack/wasm-bindgen versions; actual build command; output JS/WASM hashes; vendored destination hashes match generated outputs | Await code owner's fresh build record. A historical provenance file or byte match to an old binary is not a fresh build record. Binary difference from an old build is not automatically failure. |
| G3 — Binary and adapter | Execute actual rebuilt WASM and actual executeWasmSearch for all six profiles; assert labels, strategy, legal result, measured counters and depth; verify invalid hydration and terminal no-move | Existing test source provides these profile checks, but its existence is not a new executed result. Capture the tested binary hash in output. |
| G4 — Browser Worker | Browser actually loads rebuilt WASM; each tier produces the expected request/response identity and telemetry on a non-tactical fixture | Needed independently of Node initSync or build pass. Record URL and asset hash/revision. UI tactical shortcut must not accidentally hide missing Worker coverage. |
| G5 — UI and embedding | Six actual selector buttons; click each changes active selection and resets/cancels old work correctly; a local match accepts legal AI reply; presentation iframe points at rebuilt local app | Count and click at runtime. The old external `10-caro.vercel.app` remains a different artifact until an authorized deployment occurs. Local integration must not claim external repair. |
| G6 — Rule and tactic preservation | Immediate own win, single forced block, gap completion, multiple tactical cells exceeding cap; make/undo restoration; root terminal/full board | Reuse narrow meaningful tests and actual binary corpus; do not infer all-state correctness. Multiple simultaneous opponent winning cells can remain unsavable even if all are retained. |
| G7 — Lifecycle | Change difficulty/restart while a request is pending; stale result cannot mutate new round; Worker and Rust instances clean up | Static guards explain intended behavior; one browser exercise establishes only the observed lifecycle cases. |
| G8 — Report reconciliation | Report's current source/build identity, six-tier table and active/legacy distinction agree with delivered local artifact; historical results remain labeled by their own binary/date/platform | Update implementation location/provenance if the Rust project is migrated into canonical source. Do not relabel the older experiment totals as reruns of the new build. |

## Required reporting boundaries

1. Six named configurations are restored when UI, adapter and Rust agree and actual execution verifies them. That does not calibrate six distinct human skill levels. The change must not silently replace depth2/3/4/5 with old4/6/8 values: those values describe a different historical policy and are not required by the current report contract.
2. Higher depth is paired with a smaller cap. The tiers therefore search different selected trees; monotonic playing strength does not follow. Matching Minimax and Alpha-Beta scores on the same tree proves no ranking between tiers. Any stronger claim needs an explicitly designed match corpus or supplied tactical regression fixture.
3. Legacy TypeScript iterative deepening, TT and quiescence remain separately attributed. Rebuilding fixed-depth Rust does not add those mechanisms. Legacy SEARCH_BUDGETS has no effect on ordinary WASM requests.
4. A configured depth is an input policy; completed_depth is reported work. Easy's depth0 with nonzero node counters is consistent because the baseline evaluates its chosen move. A frontend tactical depth0 is another, separate path with zero Rust work. Null terminal counters are not zero-node completed searches.
5. worker-hydrate-and-search time includes reconstruction, Rust call and free; it excludes WASM loading and message transport. A finite measured elapsed time is not a deadline guarantee. Fixed-depth branching can vary, and the soft cap is not an absolute width bound.
6. Source, generated binary and loaded browser asset must be related by evidence. A successful cargo test alone does not verify the generated WASM package; a successful Node adapter test does not verify browser Worker loading; a local browser pass does not change the external deployment.

## Supplement recheck

The 20 algorithm-depth replacements were regenerated from the exact current-items snapshot and verified to retain every original paragraph except the deliberate NONE-bucket pseudocode correction. Arithmetic and source mechanisms remain consistent: evaluator227/−227/65; mate/heuristic separation; mask27→31; two endpoint completions for _XXXX_; 524288-byte table payload; MIN/MAX root3; explicit fail-soft versus clipped quiescence distinctions. The algorithmic supplements do not depend on changing the six-tier depths or enabling the legacy mechanisms in Rust.

The new code owner should notify this reviewer if the migrated source changes evaluator weights, candidate policy, utility constants, result schema, or failure handling; those would require updating the relevant supplements rather than only their source paths.
