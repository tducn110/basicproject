# Evidence and scope — Caro AI Weeks 03–07

Requested deliverable: one editable Canva presentation, fully in English, covering Weeks 3, 4, 5, 6 and 7, actual progress, per-move processing, every relevant scan, data structures, algorithms and recursion. Prepared on 21 October 2026.

## Authority

- Application checkout: `/home/pro/Downloads/vnuk/basicProject/10_caro`, HEAD `c1e7447532e4c5ff5590f2c5562dd21cd0acf7b9`. The external `intern/onprogress/10_caro` path resolves to this checkout. Existing unrelated App, i18n, Wink and lockfile changes were preserved.
- Native reference: `/home/pro/Downloads/vnuk/basicProject/caro-core-reference`. This is a separate native Rust library, not the generated application Wasm package.
- Week reports: `/home/pro/Downloads/vnuk/basicProject/Week3` through `/home/pro/Downloads/vnuk/basicProject/Week7`. Current source takes precedence where report prose conflicts.
- Frozen experiment: `/home/pro/Downloads/vnuk/basicProject/research/week_05_09/results`, recorded 17 October 2026. The 26 recorded source hashes match the inspected current files. Experiment results were read, not rerun for presentation timing.

## Source map for the original 32-slide content inventory

The final presentation consolidates the same scope into 26 slides. The original inventory is retained as a detailed content companion; it is not the final page count.

| Slides | Responsibility | Evidence |
| --- | --- | --- |
| 3–10 | Application input, state, rules and worker lifecycle | `10_caro/src/app/GameController.ts`; `src/game/core/GameState.ts`, `MoveRules.ts`, `WinRules.ts`, `BoardBounds.ts`; `src/board/spatial/CoordinateTransform.ts`; `src/board/input/BoardInputController.ts`; `src/game/ai/AIController.ts`, `TacticalMoveResolver.ts`; `src/game/wasm/GomokuWasmEngine.ts`, `worker.ts` |
| 11–15 | Pattern scanner, weights, baseline bots and Wasm boundary | `caro-core-reference/src/pattern.rs`, `evaluator.rs`, `bot/random.rs`, `bot/rule_based.rs`, `bot/heuristic.rs`, `lib.rs`; `Cargo.toml`; Week 04 report |
| 16–20 | Minimax recurrence, terminal conditions and undo | `caro-core-reference/src/search/minimax.rs`, `src/state.rs`, `src/model.rs`; Week 05 report |
| 21–25 | Alpha-Beta, measured nodes and TT hazard | `caro-core-reference/src/search/alpha_beta.rs`, `transposition.rs`, `optimized.rs`; `src/zobrist.rs`; `results/search_summary.csv`, `cache_scope_probe.json` |
| 26–29 | Spatial candidates, marking, caps and geometry | `caro-core-reference/src/movegen.rs`; `results/candidates.csv`, `cap_loss.json`; Week 07 report |
| 30–32 | DSA mapping, evidence summary and references | Above source plus `results/verification.json`, `provenance.json` |

## Final 26-slide mapping

| Final slides | Scope |
| --- | --- |
| 1–2 | Cover, five-week scope, current app versus native reference |
| 3–9 | Week 03 move lifecycle, DSA, coordinate transform, win scan/example, Worker and progress |
| 10–13 | Week 04 pattern scan, weight table and formula, baseline bots, migration gates |
| 14–16 | Week 05 recursive pseudocode, numeric Minimax example, UndoToken, utility and progress |
| 17–19 | Week 06 Alpha-Beta example, measured node chart, cache contract and progress |
| 20–23 | Week 07 candidate radius, marking pipeline, full cap-loss fixture and geometry/progress |
| 24–26 | Per-scan DSA mapping, verified progress and next steps, references |

The final deterministic artifact is built from `final_slides.json` and `Caro_AI_Weeks_03_07_Final_26_Slides.md`. Earlier Canva-generated drafts stopped at 27 and 22 pages respectively and do not satisfy the requested complete scope. The completed import is the final deliverable.

## Final delivery

- Canva design: `DAHYob_y_LQ`, title **Caro AI — Weeks 03–07 | Complete English Progress Report**.
- Editable Canva link: https://www.canva.com/d/e2I4gKL0ZEQEXEg
- View link: https://www.canva.com/d/ejt-ZGl6v75vKaI
- PowerPoint: `Caro_AI_Weeks_03_07_Complete.pptx`; PDF: `Caro_AI_Weeks_03_07_Complete.pdf`.
- Verified 26 native Canva pages. All 26 titles and every nonempty source-content line were found in the final Canva rich-text readback, with no missing titles or lines.
- The imported native chart initially changed category labels to numeric indices. The final file uses editable bars and explicit text labels; Minimax, Alpha-Beta, 48,842 and 10,939 were visually verified in Canva on 21 October 2026. Other pages were unchanged from the inspected 26-page render.

## Verification performed in this task

- `cargo test --manifest-path caro-core-reference/Cargo.toml --locked`: passed 6 unit tests and 3 integration tests, 0 failures, on 21 October 2026.
- Frontend test command for the four existing relevant test files was blocked with `vitest: not found`; dependencies were absent. No dependency installation or frontend source changes were made.
- The stored native experiment reports 112 Minimax/Alpha-Beta score-and-move comparisons, 112 ordering-score comparisons, 208 cold-TT score comparisons, 551 root restorations, 48 candidate sets, and 3,998 forward plus 3,998 undo hash checks. These wider-package counts are not five weeks of new integration or tournament evidence.
- Exact chart pair: `search_summary.csv` rows 52–53, clustered fixture, all legal, depth 2, ordering false: Minimax 48,842 nodes, Alpha-Beta 10,939 nodes, same score 0 and move (6,7). Reduction = 77.6032857%, rounded 77.60%.
- Candidate cap fixture: radius 1, 20 candidates before cap, cap 6 drops (7,2) and (7,7); depth-1 score 9,999,999 versus 99,990.
- TT probe: after changed root, reused score 19,800 versus fresh 0. This hazard remains open.

## Interpretation boundaries

Frontend current rule is Freestyle >=5. Native reference weights and state encoding differ from the application. Directional win checking, tactical scanning, pattern counting and candidate generation use loops; recursive lookahead belongs to Minimax/Alpha-Beta. Constructed scan and tree examples are labelled explanatory. Stored native data does not prove current browser/Worker/device performance or the provenance and algorithm identity of the vendored Wasm binary. Historical unsupported 60 FPS, 15.3x speedup, beta=1.15 calibration and complete migration claims are omitted.

## Style and source links

Canva account searches returned no Brand Templates and no Caro presentation. Existing academic template styles were researched at https://www.canva.com/presentations/templates/research/ and https://www.canva.com/templates/s/defense/. The request uses a fresh generated design inspired by those styles; no existing Brand Template is claimed as applied.

Theory reference: https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html

Data structure reference: https://doc.rust-lang.org/std/collections/index.html

Application repository: https://github.com/tducn110/caro
