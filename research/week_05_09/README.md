# Weeks 05 to 09 Native Reference Experiments

Status: executed research artifacts against the existing `caro-core-reference` Rust library. These measurements do not execute the game browser, Worker, vendored WebAssembly, or the separate `gomoku-main` engine. They do not establish game strength, production parity, or a deployment result.

## Reproduce

From the project root:

```bash
python3 research/week_05_09/run.py
```

The runner uses `/home/pro/.cargo/bin/cargo` by default. Set `CARO_CARGO` to a different Cargo executable when necessary; its adjacent `rustc` executable must be available. The crate has one local path dependency and no added third party libraries. `Cargo.lock` records that dependency. The script executes:

```bash
/home/pro/.cargo/bin/cargo test --manifest-path caro-core-reference/Cargo.toml --locked
/home/pro/.cargo/bin/cargo run --release --locked --manifest-path research/week_05_09/Cargo.toml -- research/week_05_09/results
```

Rerunning replaces the files in `results/`. Preserve a dated copy first when comparing two runs. Search counters and decisions must be deterministic; timings may change. The script asserts repeated decisions and counters match before writing the summary. Search durations use native `std::time::Instant`; state cloning and TT/Zobrist construction occur before the timer. Three sequential repeats are retained for each controlled configuration; the sixteen seeded positions have one repeat. No randomized configuration order, CPU pinning, isolated host load, warmup protocol, or statistical significance test is claimed. Durations are descriptive local wall times.

## Outputs

| File | Evidence |
|---|---|
| `results/provenance.json` | Toolchain, platform, CPU, timestamps, commands, individual source SHA256 and combined source digest |
| `results/reference_tests.log` | Six unit and three integration tests passed |
| `results/experiment.log` | Actual release run output and assertion completion |
| `results/search_runs.csv` | 544 raw measurement rows with results, counters, depth, configuration and microseconds |
| `results/search_summary.csv` | 224 deterministic configurations with repeat count and median/min/max microseconds |
| `results/verification.json` | 112 MM/AB comparisons, 112 ordering comparisons, 208 cold TT comparisons, and restoration/hash checks |
| `results/candidates.csv` | 48 candidate geometry configurations at radius 0 through 3 with/without cap 6 |
| `results/cap_loss.json` | Radius 1 cap 6 excludes both immediate winning endpoints in a concrete fixture |
| `results/tt_semantics.json` | Bound storage/replacement checks, observed actual bound classes, native entry size and scope limitations |
| `results/cache_scope_probe.json` | Valid same-root warm reuse, plus a reproduced score mismatch after root player changes |
| `results/budget_abort.json` | Direct and iterative node-budget aborts restore the input state |

The combined digest covers relative paths and SHA256 of the reference source/tests/manifests plus the harness source/manifest/runner, as enumerated by `run.py`. It does not claim a Git commit or prove the source of a vendored Wasm binary. The reference library was not modified by this experiment.

## Fixtures and Controls

All coordinates are zero based on a 15 by 15 board; all search measurements use `RuleConfig::freestyle()` and default `EvalWeights`. A configured depth is ply count, including the root move. The controlled fixtures are:

- `center`: X at (7,7), O to move.
- `clustered`: X at (7,7) and (8,7), O at (7,8) and (8,8), X to move.
- `win`: X at (7,3), (7,4), (7,5), (7,6); O at (5,5), (5,6); X to move.
- `block`: the colors in `win` are reversed; X to move. The opponent has two winning endpoints, so a single endpoint block does not force survival.

The tactical fixtures are intentionally synthetic; their move counts need not be reachable by ordinary alternating play. The sixteen `seeded_00` through `seeded_15` fixtures are constructed by actual `play()` transitions from an empty board using radius 1 candidates, PRNG seed `5006070809`, and 6 through 14 initial plies. Their construction is fully specified in `src/main.rs`. Zobrist seed is `20261017`. Geometry-only fixtures also include empty, one corner stone, and two separated stones.

For each controlled fixture the matrix tests all legal and uncapped radius 1 at depths 1 and 2, radius 1 cap 12 at depths 1 through 3, and radius 1 cap 8 at depth 4. The capped depth 4 case exists to expose interior transpositions without an enormous uncapped tree. Each configuration runs Minimax, plain Alpha Beta with natural order, plain Alpha Beta with ordering, and optimized Alpha Beta both with/without requested ordering. Every optimized measurement starts with a fresh table. The existing optimized API has no switch that independently disables hashing or TT; plain Alpha Beta is the available comparison. HashMap capacity is a reservation, not a fixed memory bound.

Minimax/Alpha Beta comparisons require identical value and selected move because both use the same natural row-major order. Ordering comparisons require the same value; equivalent best moves may change with ties. Candidate versus all-legal search is a different-tree comparison and is never asserted to preserve value. TT comparisons require matching depth, weights, rule, move set and requested ordering; an available TT best-move hint can still trigger ordering internally. The current orderer ranks descending root-perspective evaluation even at minimizing nodes; the harness preserves that behavior.

## Counter Definitions and Observed Limits

`nodes` counts search recursion visits, including the root and terminal nodes. `leaf_evaluations` counts terminal/horizon evaluation visits, not ordering evaluations. `ordering_evaluations` counts additional one-ply ranking evaluations. `skipped_siblings` counts unvisited siblings at cutoff, not all hypothetical descendants. `tt_hits` counts entries usable at the requested remaining depth; divide by `tt_lookups` only when the denominator is nonzero. The root probes the TT for a move hint without incrementing lookup/hit counters, so same-root warm statistics need that qualification.

The executed matrix passed 546 counted search/assertion calls (544 CSV measurements and two cap-loss calls), 551 root restoration checks including direct cache/abort probes, 112 MM/AB pairs, 112 ordering value pairs, and 208 cold TT value pairs. The hash corpus passed 3,998 forward and 3,998 undo transitions across 100 seeded games, plus four explicitly terminal winning axes. Some random games finish before 40 plies. Bound tests roundtrip all three classes and check shallower/deeper/equal-depth replacement. Actual search entries included 48 exact, 34 lower and 170 upper bounds in the inspected fixture. These checks are bounded evidence, not a proof against all hash collisions or every possible game state.

The side key correctly distinguishes the checked board under X/O to move. Terminal winning moves leave `to_move` unchanged in `GameState`; toggling the side key unconditionally would fail the terminal probes. Hashes omit rules, evaluation weights, move-generation configuration, root perspective, and terminal metadata. Callers must keep a compatible search namespace and must not reuse these entries across unrelated contexts. In the actual scope probe, after a clustered depth 4 search, the same root returns score 0 again with 9 nodes and 8 usable hits. After playing the best move and changing the root player, a fresh table returns 0 while reusing the prior table returns 19,800. That observed mismatch is retained in `cache_scope_probe.json`; no patch to the existing reference core is included here.

The reference table uses `HashMap<u64, TTEntry>` with no fixed-size replacement slots. The native `TTEntry` measured 12 bytes on this toolchain; map keys, buckets, capacity slack and allocator overhead are additional. No 8 MB table size, exact entry budget, or browser memory claim is supported. Mate scores are root-ply relative and lack TT normalization; cross-turn reuse needs separate design and tests. The iterative aggregate omits nodes spent inside an aborted iteration; the 50-node probe reports 40 completed-iteration nodes, not total attempted work. These limitations must accompany reports that cite the outputs.
