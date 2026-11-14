# Chapters 3–5 review, 12 November 2026

The complete assigned range, original Google Docs paragraph starts 77967–137529, was read against the current application, presentation, local native sources and archived raw results. This includes 286 paragraphs (273 nonempty), 123 table cells, 34 chapter/section headings, eight figure captions and five table captions. All subsections listed below were reviewed; unchanged text and data were retained when supported. The separate `patches_ch3_5.json` contains exact old/new paragraph replacements and evidence pointers. It does not mutate Google Docs or source code.

## Source identity and environment

- Canonical application/reporting source: `/home/pro/Downloads/basicproject`, Git commit `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc`. Existing untracked report files were left unchanged. The tested application is its `CaroGame` package.
- Current native engine source: `/home/pro/Downloads/vnuk/basicProject/gomoku-main/engine`. This directory is a local source tree without its own Git metadata. All 11 engine manifest entries, including source files, test, example harness, Cargo manifest and lockfile, match the archived 23 October SHA-256 records.
- Reference source: `/home/pro/Downloads/vnuk/basicProject/caro-core-reference`; reference harness: `/home/pro/Downloads/vnuk/basicProject/research/week_05_09`. All 25 reference/harness manifest entries match the archived 17 October SHA-256 records.
- Full hash evidence: `source_hash_comparison.json` (36/36 exact matches). Canonical repository availability and local source availability remain different facts: not all complete native trees are tracked in the canonical repository.
- Current application WASM SHA-256: `1ff854e6493b39727d07cfcf69b0af06e349a748249d85d688741a4f85017989`, identical to the archived parity/Worker record.
- Current execution environment: Linux `7.0.0-43-generic`, x86_64, glibc 2.43; Node `22.23.3`, npm `10.9.9`, rustc `1.93.1`, cargo `1.93.1`. Historical records use their own stated toolchains and dates; historical timing tables were not replaced by current durations.

## Executed checks

| Check | Actual result | Evidence |
|---|---|---|
| Canonical CaroGame `npm test` | PASS: nine test files, 59 tests | `logs/app-test.log` |
| Canonical CaroGame `npm run typecheck` | PASS: TypeScript `--noEmit` | `logs/app-typecheck.log` |
| Canonical CaroGame Vite production build | PASS: Vite 8.3.1; output isolated under `app-build/` | `logs/app-build.log` |
| Current native engine `cargo test --locked --offline` | PASS: 38 unit + seven integration tests | `logs/engine-test.log` |
| Local reference `cargo test --locked --offline` | PASS: six unit + three integration tests | `logs/reference-test.log` |
| Native current-engine release evidence harness | PASS: 816 measurement rows, 408 Minimax/Alpha-Beta comparisons, 408 ordering comparisons, 820 restorations, 84 candidate configurations, 12 tactical-completion checks, 225 native address-offset checks | `logs/engine-harness.log`, `engine-rerun/engine_verification.json` |
| Native reference release harness | PASS: 546 search/assertion calls, 551 restorations, 112 Minimax/Alpha-Beta comparisons, 112 ordering comparisons, 208 cold-table comparisons, 3,998 forward and 3,998 reverse hash checks | `logs/reference-harness.log`, `reference-rerun/verification.json` |
| Archived versus current rerun CSV comparison | PASS: zero discrepancies across every non-timing field in 816 engine rows + 544 reference rows | `rerun_comparison.json` |
| Presentation isolated `npm ci --ignore-scripts` and production build | PASS: locked installation of52packages, TypeScript check and Vite8.3.5 build; source copied under `present-validation`, output under `present-build` | `logs/present-npm-ci.log`, `logs/present-build-isolated.log` |

The native integration file named `tests/wasm.rs` uses native `#[test]` and was executed for the native target. Its filename does not make the run a browser/WASM test. The application Vitest suite does load the existing generated binary in Node for the parity tests. No current native-to-WASM rebuild identity claim is made.

Build warnings were the existing use of `__dirname` in Vite configuration and a JavaScript chunk above 500 kB. The outside-root output-directory warning reflects the deliberate isolated review output. The emitted WASM is 111.58 kB (34.14 kB gzip); this is asset size, not a hydration-latency measurement.

The first direct presentation build could not start because the canonical `present` checkout has no installed `node_modules` (`tsc: not found`). An isolated locked installation in `present-validation` then succeeded using `npm ci --ignore-scripts --registry=https://registry.npmjs.org`. Its TypeScript check and Vite8.3.5 production build passed. The final result is recorded in `logs/present-npm-ci.log` and `logs/present-build-isolated.log`. The canonical source is unchanged. Its only production-build warning was the JavaScript chunk above500kB, apart from the deliberately outside-root output path.

## Findings and disposition

| ID | Finding | Correction / remaining action |
|---|---|---|
| SYS-01 | The report claimed integer validation before every possible board entry, but `isBoardCell` checks bounds only. Direct fractional input can pass while the normal pointer path floors coordinates and the returned-WASM path validates integers. | Corrected the route-specific account in 3.1/3.4. Direct-call hardening is assigned to Chapter 6; no claim of a code fix. |
| SYS-02 | `GameController.playCell` calls `startRound` before domain cell validation. An invalid initial direct call can change internal phase/round without notifying the cached snapshot. | The exact order is retained in 4.2. Atomic rejected-input behavior is a remaining code improvement in Chapter 6. |
| SYS-03 | Worker execution was said to preserve responsive rendering and deterministic cancellation across all six tiers. This confuses architecture with a measured performance guarantee, and Easy/Normal are baseline policies. | Replaced with actual Worker isolation, transport cancellation and turn-validity responsibilities. |
| SYS-04 | Node parity, mocked lifecycle tests and selected real-browser interactions were called end-to-end verification of all asynchronous guards. | Separate each environment and assertion. The controller compares a captured turn token, pause, roundId, phase, mode and player; transport correlation belongs to the Worker envelope id and Worker object identity. |
| SYS-05 | The gesture recognizer compares each pointer event with the previous position, rather than measuring total distance from initial press. | State this actual behavior in 3.7. Cumulative-drag refinement goes to Chapter 6. |
| SYS-06 | A main-thread/Pixi callback arrow could be read as a direct scene-to-controller call. | Prose now specifies `CaroScene.onCellClick` → React-supplied callback → `GameController.playCell`, matching the actual `App`/`CaroGameCanvas` wiring and Figure 3.1. |
| SYS-07 | Pyodide loading prose implied broad recovery. `getPyodide` can leave loading state set after a missing-script throw and does not reject queued concurrent callbacks on initialization failure. | The implementation chapter describes successful loading/execution mechanics. Recovery work is consolidated in Chapter 6. |
| DATA-01 | 408/112 comparison-pair counts include repeated configurations, not distinct positions. | Clarified in 3.1 and 5.2/5.4. Original raw counts retained. |
| DATA-02 | 820 restoration assertions were promoted into a universal statement about every root/call. | Scope the claim to the corpus and report the current matching rerun. |
| DATA-03 | Worker times below 4 ms were called engine-only search time and generalized across tiers. | Preserve actual per-fixture times and `worker-hydrate-and-search` scope, which includes construction, hydration, `ai_move` and cleanup, excluding module loading/message delivery. |
| DATA-04 | G5 UI feedback/Undo observations were called proof of every pointer conversion and exact two-ply state rollback. | Browser output is described exactly. Explicit two-ply board assertions are attributed to controller/component tests using test doubles. |
| DATA-05 | A 111.58/34.14 kB asset was said to enable fast hydration. | Remove the latency inference. Add current actual tests/build checks with exact environment. |
| DATA-06 | Equal node/score/cutoff values on one historical fixture were called complete Rust/TypeScript algorithmic parity. | Describe agreement on the recorded runs; keep broader equivalence separate. |
| DATA-07 | Native Rust/Node ratios were presented as a general compiling-Rust computational advantage applicable to the game. | Keep the measured 17.4–24.4 ratios for those two harnesses and separate application WASM. |
| DATA-08 | Week 4 mean candidate reduction and seven pattern PASS rows were combined into a single broad tactical/branching guarantee. | Separate count arithmetic from the seven dataset fixture statuses. |
| PROV-01 | The draft repeated that missing historical sources prevented reproduction even though complete matching local engine/reference sources are now available. | Record successful hash-matched local reruns. Keep public repository completeness as a distinct remaining publication task. |
| STYLE-01 | Frequent “the report therefore,” “does not automatically prove,” “a useful future experiment,” anti-fabrication instructions and repeated verification caveats make the main chapters read like an assistant audit. | Replace with direct academic description. Keep methodological scopes where required to interpret data; move remediation and broader unexecuted validation into final limits/future work. |
| STYLE-02 | Some result paragraphs append a repeated, stronger conclusion after an already cautious explanation. | Remove the duplicate/generalized conclusion and keep the paired value, numerical result and finite setting. |

No percentages, node counts, leaves, cutoffs, times or rows in Tables 5.1–5.3 required a numeric cell change. The mistakes were scope and interpretation rather than the copied cell values. Source captions and figure data links were inspected. Figure pixel/render review belongs to the root agent, who inspected all report figures.

## Full subsection coverage

| Section | Source/data checked | Disposition |
|---|---|---|
| 3.1 Actors, use cases and requirements | App, GameController, AI service, Wink adapter; all F01–F09 table cells | Correct integer-path and evidence-scope claims; remove audit voice; preserve the complete nine-requirement table. |
| 3.2 Nonfunctional requirements | Worker, controller cancellation, difficulty dispatch | Remove guaranteed frame responsiveness and universal cancellation. |
| 3.3 Architecture and ownership | App callbacks, CaroGameCanvas, GameController snapshot/cache, core state, Worker | Align event arrow; retain cached-snapshot and ownership mechanisms. |
| 3.4 State/history/legal transitions | sparse Map GameState, MoveRules, playMove, four-axis rule, finishMove | Preserve 15×15, row/col mapping, win-before-draw. Direct-call input gap moved to final limits. |
| 3.5 Match phases | MatchController methods, controller reset/mode/difficulty/Undo/pause | All four phases and round-id transitions checked; remove hypothetical counterfactuals. |
| 3.6 Asynchronous protocol | AIController requestId, Worker envelope id, pending map, captured turn token and roundId | Preserve distinct scopes; do not claim direct requestId comparison at commit. |
| 3.7 Coordinates and gestures | CELL_SIZE=56, camera inverse/floor, event threshold=6, Pixi pointer handlers, fit logic | Worked coordinates −2→−1 and 420→7 correct; per-event threshold stated exactly. |
| 3.8 Result contract and telemetry | executeSearch result schema, counters, finally/free, tactical route | Preserve strict schema, null score/tactical zero counters and elapsed scopes. |
| 3.9 Verification scenarios | All S01–S10 table cells; controller, Worker, core, scene tests | Complete scenario table retained with source-derived expected outcomes. |
| 4.1 Toolchain/organization | Canonical package and lockfiles, source folder imports | Correct lockfile statement; retain React19/Pixi7.4 architecture. |
| 4.2 Move processing | playCell/finishMove, domain operation, Undo, MatchController | Exact ordering/one- or two-ply Undo preserved. |
| 4.3 AI/Worker/hydration | tactical branch, generated package, adapter, worker initialization, free | Hard+ tactical branch and Easy/Normal Rust dispatch verified; no unsupported rebuild identity claim. |
| 4.4 Rendering/React synchronization | grid/stone/highlight layers, snapshot effect, ResizeObserver, scene/application teardown | Exact owners stated, including observer disposal. |
| 4.5 Presentation site | present/App, InteractiveCaroBoard, caroEngine, figure registry | Keep educational utility implementation separate from game Worker. |
| 4.6 Pyodide runner | getPyodide, executePythonCode, PythonVisualizer | Actual stdout/stderr/load-package/run mechanics; failure recovery deferred. |
| 4.6.1 Scanner | Entire embedded Python detect_patterns program | Horizontal five-count taxonomy and NumPy fallback described correctly. |
| 4.6.2 Heuristic | Entire evaluate_position, weights and factor 1.2 | 94,000 and −7,000 calculations correct; separate supplied feature counts from engine scan. |
| 4.6.3 Chebyshev | Entire radius-two script and five-stone set | 36 unique candidates /220 empties and 83.64% correct. |
| 4.6.4 Statistics snippet | Embedded42.24µs versus raw251.26µs dataset | State discrepancy and actual arithmetic, remove no-frame-drop inference. |
| 4.7 Traceability/limits | controller-domain-render and request-worker-Rust-response paths | Retain responsible modules and move publication work to final section. |
| 5.1 Questions/provenance | canonical SHA, both archive provenance files, current manifest/rerun comparison | Preserve dates; add actual hash-matched November rerun; original timings retained. |
| 5.2 Current engine | raw816 rows,272 summary rows, verification JSON, native source/harness | All totals/counters checked; clarify repeats and finite corpus. |
| 5.3 WASM/browser | eight291-ply parity fixtures, G4 JSON, G5 JSON, actual tests | Separate Node binary parity, real Worker and synthetic UI evidence. |
| 5.3.1 Local validation | historical27Oct record plus current test/typecheck/build logs | Add current59-tests result without pretending historical browser observations were re-executed. |
| 5.4 Reference matrix | full harness, raw544 rows,224 summaries,546 assertions/551 restorations | Source hashes and rerun now established locally; distinguish public tracked completeness. |
| 5.4.1 Paired example | clustered/all_legal/depth2 summaries and timer code | Table48,842/10,939/2,164 nodes and all times correct; ranking overhead retained. |
| 5.4.2 Candidate policy | cap_loss JSON, reference candidate source, modified-engine soft-cap code |20→6 cap omission and9,999,999→99,990 correct; different implementations remain distinct. |
| 5.4.3 Hash/TT/budget | full reference hash/TT/iterative code and all three probe JSONs |3,998+3,998 checks,12-byte entry,0→19,800 warm-root discrepancy,40 completed-iteration-only nodes all retained accurately. |
| 5.5 Historical comparisons | benchmark raw JSON, Rust/TS harnesses, battle JSON | All table numeric cells correct; limit parity/speed/strength claims to dataset. |
| 5.6 Presentation evidence | scanner, heuristic, candidate and empirical snippets; registry | Replace repeated criticism with correct example scope and data-value selection. |
| 5.7 Validity/provenance | experiment controls, timing scopes, local source/package identities | Finite fixtures, nonrandomized repeats, no CPU isolation and host/device boundaries preserved; public-source gap accurate after rerun. |

## Numeric reconciliation

- Table 5.1: all rows return64 at (x6,y6); nodes73/47/26; leaves64/38/17; cutoffs0/7/7; medians56,635/41,723/31,167ns. Node reductions35.62%,64.38%,44.68% and Minimax-to-ordered median reduction44.97% are correct.
- Table 5.2: all return0 at (row6,col7); nodes48,842/10,939/2,164; leaves48,620/10,717/1,942; cutoffs0/218/220; medians69,252/16,442/68,457µs. Natural Alpha-Beta reduction77.60%, median ratio4.21 correct. Ordered48,841 ranking evaluations explain why node reduction does not imply faster execution.
- Table 5.3: depths1–4 nodes45/609/16,184/496,790, cutoffs0/39/454/16,350 and corresponding raw times all match JSON. Time ratios do not measure the application WASM.
- Node parity: eight history fixtures total291plies; additional invalid/profile/seeded/terminal results are separate entries in the18-result array.
- Native engine816rows and reference544rows were replayed with zero non-timing discrepancies; timing variation is expected across the compiler/kernel/environment difference and original table times remain historical observations.

## Humanization and boundaries

The humanizer skill was read and applied as a writing-pattern edit: remove filler, fake emphasis, assistant instructions, repeated caveats and unsupported concluding claims; retain measured values and necessary methodological scope. This is an editorial inspection, not a reliable authorship detector or a guarantee about a detector score. No personal experience, participant feedback or experimental result was invented.

No game/engine/presentation source, generated binary, archived CSV/JSON result or Git ref was changed. Build targets, fresh harness outputs, isolated presentation installation, logs and review artifacts are confined to `review_2026_11_12`.
