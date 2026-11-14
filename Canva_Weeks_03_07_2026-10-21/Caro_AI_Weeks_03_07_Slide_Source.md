# Caro AI — Weeks 03–07

English Canva presentation source. Authored 21 October 2026. Native experiment snapshot: 17 October 2026.

## 01. Caro AI — Weeks 03–07

Progress Report · Data Structures, Algorithms and Recursive Search
From a playable 15 × 15 board to verified native search experiments.
Source review: 21 October 2026 · Experiment snapshot: 17 October 2026.

Visual: Large editable Gomoku board crop with black and white stones. Highlight one new stone and four scan axes. Academic cover, no fictional names.

Source: Weekly reports and reviewed sources.

## 02. Five weeks, one technical story

Week 03 — Web interface, input and game lifecycle.
Week 04 — Pattern scanning, heuristics and baseline bots.
Week 05 — Recursive Minimax and reversible simulation.
Week 06 — Alpha-Beta pruning and cache correctness.
Week 07 — Spatial candidates and tactical coverage.
Week labels follow the reports; they do not establish implementation dates.

Visual: Five-step horizontal timeline with a small board, pattern, tree, pruned tree and neighborhood icon.

Source: Weekly reports and reviewed sources.

## 03. Two implementations, two evidence boundaries

Current application: React + PixiJS → GameController → tactical guard → Worker → existing Gomoku Wasm package.
Research reference: caro-core-reference, a separate native Rust library containing the algorithms evaluated here.
Reference results do not prove the shipped Wasm binary uses identical algorithms or weights.

Visual: Two clearly separated editable flow diagrams, labelled CURRENT APPLICATION and NATIVE REFERENCE. No arrow implying reference already integrated.

Source: Weekly reports and reviewed sources.

## 04. Week 03 | What happens after one tap?

1 Convert screen pixels to a board cell.
2 Check pause, round, turn and AI-thinking gates.
3 Reject occupied or out-of-bounds cells.
4 Commit the stone and append history.
5 Check win first, then draw, otherwise switch player.
6 Publish a snapshot to React and PixiJS.
This move transaction is iterative.

Visual: Six-step flow around a small Gomoku board; separate state update from UI feedback.

Source: GameController.ts · PlayMove.ts · MoveRules.ts

## 05. Which data structures own the move?

Live TypeScript board — Map<string, Player>, keyed by row,col.
Move history — Move[], preserving turn order.
Change subscribers — Set of listeners.
Input and round phases — finite state machines.
Native reference board — [i8; 225], indexed by row × 15 + column.
These are different representations. They require an explicit adapter contract before integration.

Visual: Clean comparison table, live application versus native reference. Show row 7, col 8 maps to index 113.

Source: GameState.ts · state.rs · model.rs

## 06. Pixels become coordinates before rules run

column = floor((screenX − cameraX) / zoom / 56)
row = floor((screenY − cameraY) / zoom / 56)
Input states distinguish a tap from a camera drag.
BoardBounds then enforces rows and columns 0–14.
Coordinate conventions must be normalized: UI (row, column), Rust API (x, y).

Visual: Editable camera-to-grid diagram. Highlight one square and labelled coordinates; no screenshot presented as runtime evidence.

Source: CoordinateTransform.ts · BoardInputController.ts · BoardBounds.ts

## 07. The win scan uses four axes

Directions: (0,1), (1,0), (1,1), (1,−1).
For each axis: L = 1 + forward matches + backward matches.
Current Freestyle rule: win when any L ≥ 5.
The live scanner checks at most four neighbors per ray: 4 × 2 × 4 = 32 neighbor probes.
Loops perform the scan; recursion is unnecessary here.

Visual: A clear Gomoku grid with horizontal, vertical and two diagonal arrows through the last stone.

Source: WinRules.ts::evaluate / collect

## 08. Worked scan | Why the last move is enough

Place X at (7,5).
Matching X stones: (7,3), (7,4), (7,6), (7,7).
Horizontal count: 1 + 2 left + 2 right = 5 → WIN.
Only lines crossing the new stone can become newly winning after a legal nonterminal state.
Blocked endpoints do not invalidate this Freestyle win.

Visual: Exact board row with X at columns 3,4,5,6,7, new stone at 5 in orange ring; label the 2+1+2 counts. Constructed explanation, not a recorded match.

Source: WinRules.ts · analytical example

## 09. An AI turn starts with a tactical guard

Scan empty cells for an immediate own win; otherwise find an immediate opponent win to block.
If neither exists, send move history to the Worker.
The Worker replays history into Rust Game and calls ai_move(difficulty).
Map (x,y) to (row=y,column=x), reject stale results, revalidate, then commit.
One selected block cannot resolve every double threat.

Visual: Decision flow: WIN? → BLOCK? → WORKER SEARCH → VALIDATE → COMMIT.

Source: AIController.ts · TacticalMoveResolver.ts · worker.ts

## 10. Week 03 progress | Playable structure is present

Source reviewed: 15 × 15 board; React/PixiJS responsibilities; tap/drag handling; move gates; round transitions; Worker request IDs and stale-result protection.
Cancellation terminates and recreates the Worker.
Pending runtime evidence: browser interaction, device latency and frame rate.
Frontend test rerun was blocked by missing Vitest dependencies; older FPS claims are not reused.

Visual: Two-column progress table: SOURCE REVIEWED and STILL TO VERIFY. Include small lifecycle diagram.

Source: CaroGameCanvas.tsx · CaroScene.ts · GomokuWasmEngine.ts

## 11. Week 04 | A heuristic scan counts patterns

The reference scans board cells for one player across four axes.
Start only where the preceding cell is not the same player.
Walk the maximal contiguous run; count empty endpoints.
For runs of at least two stones, emit one Pattern record, then increment PatternCounts.
First-stone ownership prevents recounting the same run along one axis.

Visual: Show .XXX. with one accepted start and two crossed-out duplicate starts; show Pattern fields length=3, open_ends=2.

Source: pattern.rs::detect_runs / count_patterns

## 12. Reference pattern weights are explicit

Five or more — 1,000,000
Open four .XXXX. — 100,000
Closed four OXXXX. — 20,000
Open three .XXX. — 5,000
Closed three OXXX. — 500
Open two .XX. — 100
Closed two OXX. — 10
An out-of-board endpoint is not open. Broken threats such as XX.XX need gap-aware detection.

Visual: Readable seven-row table with editable stone patterns, labelled NATIVE REFERENCE DEFAULTS. Do not substitute the different game-engine weights.

Source: evaluator.rs::EvalWeights · pattern.rs

## 13. A score estimates a position; rules decide a win

Reference nonterminal score: E(s) = Attack − Defense, with β = 1.
Example: one own open three and one opponent closed three gives 5,000 − 500 = 4,500, if no other counted patterns exist.
Terminal status is checked separately.
The game engine has different weights and a signed center term.
β = 1.15 is a proposed experiment, not a calibrated result.

Visual: Equation and one simple constructed pattern example; large 4,500 result. Label it analytical, not measured.

Source: evaluator.rs · gomoku-main/engine/src/eval.rs

## 14. Three baselines isolate algorithm behavior

Random: enumerate all legal moves; choose using seeded SplitMix64.
Rule-based: try own win → block opponent win → heuristic fallback.
Heuristic: for each generated candidate, play → evaluate → undo; keep the first maximum.
The heuristic baseline is greedy one-ply evaluation. It does not recursively inspect opponent replies.

Visual: Three parallel algorithm strips with a small stone-position example, no invented win-rate chart.

Source: bot/random.rs · bot/rule_based.rs · bot/heuristic.rs

## 15. Week 04 progress | Evaluation exists; migration needs proof

Present in the native reference: contiguous patterns, default weights, terminal handling and reproducible baselines.
The reference crate is rlib-only and has no wasm-bindgen exports.
Existing game Wasm and the native reference are separate artifacts.
Pending: shared TS/Rust fixtures, adapter verification, broken-threat tests and controlled browser benchmarks.
No TS-to-Wasm speedup is claimed.

Visual: Build boundary: native reference → proposed adapter → generated Wasm → Worker verification. Mark the last three gates pending.

Source: Cargo.toml · lib.rs · Week 04 report

## 16. Week 05 | Minimax alternates MAX and MIN

All scores stay in the root player's perspective.
Root-player turn: choose the maximum child value.
Opponent turn: choose the minimum child value.
Terminal state: return win/loss/draw utility.
At depth 0: return the heuristic.
One ply is one simulated move; depth 2 includes our move and an opponent reply.

Visual: Small editable MAX→MIN→leaf tree, with depth labels 2,1,0.

Source: search/minimax.rs::value

## 17. The recursive step is play → recurse → undo

SEARCH(state, depth):
  if terminal: return terminal score
  if depth = 0: return heuristic
  moves = generate configured moves
  if moves empty: return heuristic
  for each move:
    token = play(move)
    child = SEARCH(state, depth − 1)
    undo(token)
  return MAX or MIN of child values

Visual: Large monospace pseudocode, editable text. Side labels: base case, smaller subproblem, state restoration.

Source: search/minimax.rs::value · explanatory pseudocode

## 18. Worked recursion | Protect against the best reply

Illustrative tree, not an engine measurement.
Move A allows replies scored 8 and 2: A = min(8,2) = 2.
Move B allows replies scored 5 and 4: B = min(5,4) = 4.
Root chooses max(2,4) = 4, therefore B.
Choosing the largest leaf alone would ignore the opponent's choice.

Visual: Exact tree MAX root; MIN A children 8,2; MIN B children 5,4. Highlight B→4, show 2 and 4 propagated upward.

Source: minimax.rs · analytical example

## 19. Undo keeps sibling searches independent

UndoToken saves the move, previous player, status, last move and move count.
play writes the cell, updates count and checks terminal status.
undo clears that cell and restores all saved fields.
Every sibling must start from the same parent position.
Recorded corpus: 551 root-state restoration checks passed.

Visual: Three board states PARENT → CHILD A → RESTORED PARENT → CHILD B. A compact UndoToken record diagram.

Source: state.rs::play / undo · verification.json

## 20. Week 05 progress | Correctness before deeper search

Present: depth-limited Minimax, terminal-first stopping, root perspective and deterministic tie handling.
Search win utility: M − ply; loss: −M + ply; draw: 0. M = 10,000,000.
For uniform branching b and depth d, node traversal grows as O(b^d).
112 recorded Minimax/Alpha-Beta pairs matched score and move on the same configured tree.
Candidate restriction changes the tree.

Visual: Small branching tree and a restrained evidence callout 112 matching pairs. Explain b and d on the slide.

Source: minimax.rs · Week 05 · verification.json

## 21. Week 06 | Alpha-Beta carries bounds through recursion

Alpha tracks a MAX alternative already available.
Beta tracks a MIN alternative already available.
At MAX: update alpha. At MIN: update beta.
Undo the move, update the bound, then skip remaining siblings when alpha ≥ beta.
The same finite tree keeps its Minimax value; fewer branches may be visited.

Visual: Pseudocode inset with alpha=max(alpha,best), beta=min(beta,best), cutoff alpha≥beta; bounds shown on tree edges.

Source: search/alpha_beta.rs::value

## 22. Worked cutoff | A losing alternative needs no detail

Constructed tree: MAX has two MIN children.
Left leaves 9 and 6 → left value 6; alpha becomes 6.
Right sees 5 → right value is at most 5; beta becomes 5.
Because alpha 6 ≥ beta 5, skip the final right leaf 3.
Root remains 6. Full traversal: 7 nodes; pruned traversal: 6.

Visual: Exact tree leaves left 9,6 and right 5,3; last leaf 3 greyed and crossed. Label illustrative, not benchmark.

Source: Alpha-Beta recurrence · analytical example

## 23. Measured pruning | Same answer, fewer nodes

Clustered fixture · all legal moves · depth 2 · natural order.
Minimax: 48,842 nodes.
Alpha-Beta: 10,939 nodes.
Node reduction: 77.60%.
Both: score 0; move (6,7).
Native Rust release results, 17 October 2026. This is one controlled configuration, not browser performance.

Visual: Editable two-bar chart with exact values, baseline axis starting at zero. Small same-score/same-move annotation.

Source: search_summary.csv rows 52–53 · provenance.json

## 24. Caching adds a search-context contract

Reference TT: HashMap<u64, TTEntry>.
Each entry stores depth, score, Exact/Lower/Upper bound and best move.
A Zobrist key identifies board pieces and side to move.
Recorded hazard after changing root player: reused table score 19,800; fresh table score 0.
Use a fresh compatible table until cache context is repaired and verified.

Visual: Small TT record plus side-by-side reused/fresh results. Mark root-perspective mismatch, no fixed 8 MB cache claim.

Source: transposition.rs · zobrist.rs · cache_scope_probe.json

## 25. Week 06 progress | Pruning verified within its scope

Present: recursive bound updates, cutoffs and cache-bound types.
Recorded: 112 Minimax/Alpha-Beta matching pairs; 208 cold-table score comparisons passed in the wider experiment package.
The cross-root cache hazard remains open.
Fewer nodes do not automatically mean lower elapsed time: move ordering and cache operations add work.
No claim of perfect play or shipped-Wasm equivalence.

Visual: Evidence and remaining obligations as a compact table; keep 112 and 208 clearly labelled distinct comparison counts.

Source: Week 06 · verification.json · cache_scope_probe.json

## 26. Week 07 | Nearby empty cells become candidates

Chebyshev distance: d∞ = max(|Δrow|, |Δcolumn|).
Keep empty cells within radius R of at least one stone.
Reference defaults: R = 2; no cap.
With one center stone: 224 legal cells, 24 radius-2 candidates.
Empty board special case: center (7,7).
Spatial filtering reduces branching without proving every excluded move irrelevant.

Visual: Editable 7×7 crop around center stone; tint the 5×5 radius-2 square except occupied center, label 24.

Source: movegen.rs::generate_candidates · candidates.csv

## 27. The candidate scan uses marking and a vector

1 Scan the flat board for occupied cells.
2 Visit each square neighborhood.
3 Reject occupied and out-of-board cells.
4 Mark [bool;225] to deduplicate overlaps.
5 Scan marks row-major into Vec<Move>.
6 Apply optional truncation, then optional move ordering.
Generation changes membership; ordering changes sequence.

Visual: Two nearby stones with overlapping neighborhoods, one Boolean mark per cell, then arrow to a sorted-by-index move vector.

Source: movegen.rs:21–64 · search/mod.rs

## 28. A candidate cap can delete a winning move

Recorded win fixture: radius 1 produces 20 candidates.
Cap 6 retains the first six in row-major order.
Both winning endpoints (7,2) and (7,7) disappear.
Depth-1 score changes: 9,999,999 → 99,990.
Sorting the surviving moves cannot recover a deleted move.
Tactical preservation must be tested before adding a cap.

Visual: Exact board with X at (7,3),(7,4),(7,5),(7,6) and O at (5,5),(5,6), using zero-based (row,column). Highlight omitted winning endpoints (7,2),(7,7) and the six first row-major candidates near the O stones. Include all six existing stones so the cap-loss mechanism is faithful.

Source: cap_loss.json · win fixture; native reference

## 29. Week 07 progress | Geometry verified, coverage remains open

Recorded: 48 geometry configurations passed uniqueness, emptiness and radius checks.
Source review confirms deterministic row-major output; edge and cap examples are recorded.
One center stone: R1=8, R2=24, R3=48.
One corner stone: R1=3, R2=8, R3=15.
Candidate time: O(N² + kR²), using O(N²) marking/output space.
N=board width; k=occupied cells. Cap applies after generation.

Visual: Readable center-versus-corner table plus two small grid diagrams.

Source: candidates.csv · movegen.rs · Week 07

## 30. Every scan has a different purpose

Win check — last move, four bounded axes; iterative.
Tactical guard — empty-cell enumeration plus hypothetical win checks; iterative.
Pattern evaluation — whole-board maximal-run scan; iterative, O(N²) per player.
Candidate generation — neighborhood marking; iterative, O(N²+kR²).
Minimax/Alpha-Beta — depth-first recursion over generated moves, with make/undo.
The call stack is O(d); retained move vectors also consume memory.

Visual: Five-row mapping table: purpose, DSA, algorithm, trigger. Do not describe all scans as recursive.

Source: WinRules.ts · TacticalMoveResolver.ts · pattern.rs · movegen.rs · search

## 31. Progress is supported by bounded evidence

Today: 6 unit + 3 integration reference tests passed.
Stored 17 October package: 20 fixture positions; 112 Minimax/Alpha-Beta pairs; 551 root restorations; 48 candidate sets.
Current 26-file source hashes match that package.
Next: preserve tactical moves, repair TT context, add broken-threat fixtures, verify the adapter/Worker in browsers, then measure latency and playing strength.
Frontend runtime remains unverified.

Visual: Compact five-week completion matrix labelled SOURCE / NATIVE VERIFIED / PENDING, plus 3 ordered next priorities. No fake percentages.

Source: verification.json · provenance.json · current cargo test

## 32. Sources and interpretation

Implementation: tducn110/caro, reviewed checkout c1e7447; core GameState, WinRules, GameController, AIController and Worker.
Research: Week3–Week7 reports; caro-core-reference; research/week_05_09/results.
Theory: UC Berkeley CS188, Minimax and Alpha-Beta.
Data structures: official Rust collections documentation.
Results are native reference evidence, not device, browser, tournament or production acceptance.

Visual: Clean source appendix with readable hyperlinks and the two snapshot dates. End with small Gomoku board motif.

Source: https://github.com/tducn110/caro · https://inst.eecs.berkeley.edu/~cs188/textbook/games/minimax.html · https://doc.rust-lang.org/std/collections/index.html

