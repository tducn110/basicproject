# Chapter 2 review — 12 November 2026

Scope: all 390 paragraphs with start indexes 13978 ≤ start < 77967 in the Google Docs export `paragraphs.json`, including every narrative paragraph, formula, pseudocode line, the 12 figure captions/source lines, and Table 2.1. The Chapter 3 heading at 77967 was excluded. All 32 headings were preserved. Native document formatting, image pixels, page layout and TOC generation are owned by the root agent; this pass reviews textual/algorithmic semantics.

Deliverables: `patches_ch2.json` contains 74 exact paragraph replacements in the requested schema. `extra_reference_53.json` contains the additional verified source entry for the legacy evaluator. `ch2_after.txt` is the assembled chapter after those replacements; `build_ch2_patches.py` reproduces the patch file from the immutable initial paragraphs.

## Source identity and ownership

- Canonical Git checkout: `/home/pro/Downloads/basicproject`, branch `main`, HEAD `7e1e2d51321a4e6b2e26493c34f0a485d4de39cc`. Initial untracked entries: `Bao_cao_do_an_co_so_Caro_Nguyen_Tam_Duc.docx`, `Mau bao cao do an co so.docx`, `deep-research-report.md`, `report_caro_2026/`. No tracked changes observed. No code edited by this reviewer.
- Older app checkout: `/home/pro/Downloads/vnuk/basicProject/10_caro`, branch `main`, HEAD `744f8871c75665548e31d1a73bb0773aebbe66eb`, initially clean. Eleven relevant frontend/core/legacy-bot files were compared byte for byte with canonical CaroGame and are identical.
- `/home/pro/Downloads/vnuk/basicProject/gomoku-main` has no Git repository metadata; its current Rust `engine/src/{board,eval,candidates,search,ai}.rs` match the five hashes in the 23 October provenance snapshot. That hash match establishes source identity, not source-to-binary build provenance.
- `/home/pro/Downloads/vnuk/basicProject` itself is a reporting workspace, not a Git root.
- Modified Rust algorithm owners: `board.rs` (cell/count mutation, four-axis wins, neighborhoods), `candidates.rs` (tactical assessment, membership and ordering), `eval.rs` (contiguous runs, heuristic clamp, mate-distance utility), `search.rs` (shared fixed-depth minimax/alpha-beta), `ai.rs` (six strategies/configurations), `lib.rs` (committed Game moves/history).
- Current app owners: `GameState.ts` is a Map plus history, not the Rust matrix. `AIController.ts` selects frontend tactical check vs ordinary WASM request. `TacticalMoveResolver.ts` scans legal cells for a win then a block. `executeSearch.ts` hydrates, calls, validates and frees Rust Game. `GomokuWasmEngine.ts` owns Worker lifetime and envelope IDs. `app/GameController.ts` owns turn-token/round/phase/mode/pause/player acceptance.
- Legacy TypeScript owners: `game/bot/board.ts` maintains sentinel cells, two hash halves and line counts; `game/bot/eval.ts` defines mask categories/table/weights; `game/bot/search.ts` defines forcing generation, quiescence, negamax alpha-beta, TT and iterative deepening.
- Separate reference owners inspected: `caro-core-reference/src/state.rs`, `movegen.rs`, `zobrist.rs`, `search/{optimized,iterative,transposition}.rs`, plus `research/week_05_09/README.md` and results. This engine's hard row-major cap, root-relative TT scores and node-budget counters differ from the modified engine and legacy bot.
- Old archived `baseline_engine/src/ai.rs` contains five tiers, noise and depths 1/2/4/6/8. It cannot be cited as the source of the six-tier Random/RuleBased/AlphaBeta dispatch. Its evaluator has the stated run weights but not the modified clamp/terminal utility hierarchy.

## Findings corrected

1. **CH2-01 — implementation identity.** Paragraphs originally combined baseline code, source excerpts and the vendored binary into one active-engine claim. Replacements distinguish inspected source, adapter contracts and binary execution. Advanced TS features stay with the legacy implementation.
2. **CH2-02 — board storage/performance.** Corrected frontend Map vs Rust matrix. Removed zero-per-node-allocation and L1-cache claims: candidate generation allocates vectors. The 225-byte cell array is distinguished from the full Board struct and its counter/padding.
3. **CH2-03 — apply/undo exits.** Generic try/finally pseudocode is identified as explanatory. Rust fixed-depth search has no supported deadline-abort mechanism; legacy TS handles its sentinel using finally. The O(1) claim applies to cell/count/hash updates, not the O(N) legacy line recount.
4. **CH2-04 — restoration evidence.** 820 checks are bounded archived native checks including repeated configurations, not a proof of every possible search. The source citation is engine_verification [43].
5. **CH2-05 — win complexity.** Kept the correct 32-neighbor maximum at K=5; removed the false exact 900-check comparison and unmeasured major-speedup statement. Valid-board and unfinished-parent assumptions remain explicit.
6. **CH2-06 — random policy.** Seeded modulo selection is pseudorandom but not exactly uniform for arbitrary list lengths. Easy is correctly assigned to modified Rust, and its postselection evaluation is distinguished from move choice.
7. **CH2-07 — evaluator.** Removed an unsupported exponential-weight/double-three/dominance narrative. Half-open vs open two is a factor of four, not ten. Clamp interval is inclusive [−H,H]. Checked singleton 14, adjacent pair 227, H=99,999,774 and mate-score inequalities.
8. **CH2-08 — spatial pruning.** Removed the inconsistent 8–36 / 72.39%–83.64% comparison. Kept verifiable examples: center radius1→8, center radius2→24, corner radius2→8. The cost formula and radius-membership proof remain.
9. **CH2-09 — soft cap.** Size is min(|C|,max(c,|T|)), not a hard cap c. Tactical retention applies to assessed members of the raw set. Reference cap_loss is a separate historical hard-cap example.
10. **CH2-10 — ordering/benchmarks.** Removed unscoped benchmark ranges and “maximizes cutoffs”. Ranking changes traversal; capping changes the tree. Results belong in Chapter 5 with their own source/platform/counter definitions.
11. **CH2-11 — recurrence/pseudocode.** Added root ply q to U and V because mate utility depends on root distance. WIN_AT's player component is passed into terminal utility, rather than its display tuple. Corrected old-baseline algorithm labels to modified source [6].
12. **CH2-12 — pruning proof.** Corrected wording in the 3/5 versus 2/9 example. 408 engine and 112 reference comparison totals include repeat/configuration pairs. Ideal uniform-tree leaf count is given precisely for odd/even depths.
13. **CH2-13 — iterative budgets.** Identified TS deadline checks at node1 and every32, fallback depth0, reference node budget and omission of aborted-iteration work, and modified fixed-depth configuration as separate semantics.
14. **CH2-14 — TT soundness.** Depth/bound/move-legality checks alone do not guarantee context compatibility or collision freedom. Deeper-cache acceptance is not automatically strict depth-horizon equivalence. Kept the concrete reference warm-root failure 0 vs19,800 with its correct owner; no browser defect is inferred.
15. **CH2-15 — legacy classifier.** Added the actual eval.ts reference [53]; board.ts is its caller. XX_XX in a five-cell segment is FOUR. Corrected Algorithm2.16 ownership and O(f^q) quiescence's f=1 edge case.
16. **CH2-16 — difficulty table.** Normal radius2 was missing; “uniform” and “up to15” were wrong. Rewrote every interpretation cell consistently. Replaced false 8^5 total-node bound with 32,768 leaves /37,449 nodes for a hypothetical uniform tree. Removed unsupported latency bound, 2,000–5,000-node estimate, smooth-skill progression and unlimited tactical guarantees.
17. **CH2-17 — asynchronous ownership.** Controller does not directly verify requestId on commit. Actual checks are turnToken, roundId, pause state, phase, mode and current player; Worker routing uses its own envelope ID and Worker identity. Timing includes hydration/search/free and excludes loading/message delivery. Citations now use [27], [26], [2] respectively.
18. **CH2-18 — academic voice.** Removed repetitive “Why … used”, “Benefits and trade-offs”, assurance language and redundant proof sentences. Replaced them with concrete mechanisms. Preserved formal English, examples, definitions, source distinctions and actual negative results. This is editorial humanization, with no AI-detector percentage or claim about authorship.

## Complete coverage by subsection

| Subsection | Review result |
|---|---|
| 2.1 Scope, evidence, notation | Source contexts, coordinates, ply, transition and generated/legal move distinction checked; source identity and voice corrected. |
| 2.2.1 Matrix, index conversion, state ownership | 112/224 indices, Rust repr and Map/history ownership checked; allocation/cache claims corrected. |
| 2.2.2 Apply and undo | All Algorithm2.1 lines, update count, rejected inputs, restoration induction, worked trace, costs and archived restore count checked. |
| 2.3 Freestyle win detection | All Algorithm2.2 lines, axes, overlines, bounded collection, imported-root precondition, proof, worked lines, costs checked. |
| 2.4.1 Random baseline | Algorithm2.3 seed/list/terminal checks, modulo, reproducibility, no-zero-modulo, costs checked. |
| 2.4.2 Immediate tactics and one-ply heuristic | Algorithm2.4 ordering, restore, single vs double threat example, generated membership and TS prepass owner checked. |
| 2.5.1 Evaluation of nonterminal positions | Formula, maximal runs, every Algorithm2.5 line, weights, center term, worked14/227 and contiguous-vs-gapped distinction checked. |
| 2.5.2 Terminal states and hierarchy | Algorithm2.6 M/q/H arithmetic, inclusive clamp, early win/delayed loss, winner-before-draw checked. |
| 2.6.1 Spatial neighborhood | Algorithm2.7, seen invariant, border examples, fallback, invalid player/full board, generation complexity checked. |
| 2.6.2 Tactical preservation and membership | Algorithm2.8 lexicographic prefix, max(cap,1,tactical), cardinality, order-off membership, cap_loss provenance checked. |
| 2.7 Ordering versus selection | Algorithm2.9 membership invariant, scores10/50/30, ordering assumptions, node-vs-time interpretation checked. |
| 2.8.1 Minimax recurrence and contract | q-dependent recurrence, every Algorithm2.10 line, terminal/horizon/no-move cases, root initial validation checked. |
| 2.8.2 Proof, example, complexity | Induction, finite-tree contract, 3/5 vs2/9 trace, node/stack/list/board costs checked. |
| 2.9.1 Bounds and pseudocode | Every Algorithm2.11 line, alpha/beta update, restoration-before-break, fail-soft bound interpretation and cutoff counter checked. |
| 2.9.2 Cutoff and correctness boundary | Worked cutoff, same-tree assumptions, finite pair totals, worst and ideal leaf growth checked. |
| 2.10 Iterative deepening and budgets | Algorithm2.12 completion replacement, fallback/abort, finally restoration, deadline vs node-budget semantics checked. |
| 2.11.1 Hash definition and update | Algorithm2.13 full/update hash, 4-bit1010 XOR0110 example, two32-bit halves, side transitions, collisions and costs checked. |
| 2.12.1 Stored values | Algorithm2.14 PROBE/STORE, upper/lower/exact directions, [3,8] example, depth reuse and context requirements checked. |
| 2.12.2 Reuse context | Actual native cache probe, root-relative mate score, fixed-array vsHashMap, capacity/memory boundaries checked. |
| 2.13 Quiescence | Every Algorithm2.15 line matches legacy routine; sign/window, standPat, limit5, forcing categories, fail-hard example and f=1 edge checked. |
| 2.14 Bitmask patterns and line counts | Every Algorithm2.16 line checked against actual eval.ts, completion categories, XX_XX example, incremental four-line update, fixedMAX_LEN15 checked. |
| 2.15 Difficulty and request path | All cells of Table2.1 checked; six IDs, depths, radii, caps, tactical skip, hydration, elapsed scope and stale guard ownership corrected. |
| 2.16 Synthesis | Removed implication that legacy optimizations are active Rust features; condensed source-grounded chapter synthesis. |

## Figure/caption handoff

Text reviewed for all Figures2.1–2.12. Caption-source corrections required at source paragraphs 19301 (2.1: logical Rust indexing, not frontend Map), 22285 (2.2: modified undo), 30777 (2.4: modified priorities), 35028 (2.5: actual eval weights [15]), 55343 (2.10: legacy search[11]), 63999 (2.12: legacy search[11]). Other figure captions retained after textual semantic review. Root must check image pixels and render separately; no new image was generated here.

## Checks actually executed by this reviewer

- Full indexed read: 390 chapter paragraphs; 16 level2 sections, 15 level3 sections, one chapter heading, 16 algorithm labels, 12 figure captions, one six-row difficulty table.
- Exact old-text lookup and patch validation: all74 replacements match initial complete paragraphs excluding terminal newline; no new paragraph contains a newline; no replacement crosses the chapter boundary; headings preserved.
- Evidence-path existence: all absolute source/record paths in patch evidence exist.
- Byte comparison: 11 relevant canonical app files match the older 10_caro checkout.
- Provenance hash comparison: five current Rust source files match the archived snapshot hashes.
- Arithmetic/enumeration: row-major112/224; evaluator14 and227; 8^5=32,768 leaves, sum_i=0..5 8^i=37,449 nodes; neighborhood8/24/8. Examined terminal H/M arithmetic directly.
- New reference53: Git tracks eval.ts at exact canonical commit; `git show` SHA256 is 1b8b1d0401518e5cb2c49641930389bffc3b658795e6fce40491f5251c0bd3f3, matching local source; pinned GitHub URL opened successfully and shows actual MAX_LEN, pattern constants and classifier.
- Primary material consulted: Rust Reference Type Layout; Knuth/Moore publisher DOI metadata/abstract and author-hosted primary search paper for minimal-tree formula; Wisconsin Zobrist report catalogue/metadata. Several direct PDF fetches timed out; no claim is made that those failing fetches read the full PDFs.

The cooperating system/results reviewer reports current app59 tests/9files, typecheck/build, current native Rust38unit+7integration and reference6unit+3integration passed. Those were executed by that reviewer, not this subagent; use its exact logs as the evidence and retain the distinction that native tests/wasm.rs is not a WASM-target execution. Rerun experiment matrices are owned by that reviewer.

## Completion boundary

Chapter2 text/source review and patch preparation complete. Google Docs has not been mutated by this subagent. Root must apply these changes, append reference53, remap citations if required, check native readback, inspect all image pixels, and verify formatting/TOC/render. Acceptance remains with the user. No code, branches, commits, pushes, deployment or memory changes were made.
