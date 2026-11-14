# Week 04 Research Report

## Random Baseline, Rule-Based Tactics, Pattern Detection, and Heuristic Evaluation

### Document control

- Project: Caro AI Research Program
- Reporting mode: Retrospective evidence reconstruction
- Evidence snapshot: 18 September 2026
- Status: Baseline algorithms and reference search components inspected; no performance/strength experiment is asserted

## 1. Research question and scope

**TQ-W04-01.** How can Random, rule-based, pattern-aware, and heuristic move selection form an evidence-backed baseline before deeper game-tree search is compared?

The scope is a staged bot architecture: reproducible random selection, immediate tactical rules, candidate generation, pattern-based scoring, and a one-ply heuristic baseline. Minimax, Alpha-Beta, iterative deepening, transposition tables, and advanced threat-space search are treated as later comparison stages, not as measured Week 04 results.

## 2. Background

A random policy is useful only if its seed and legal-move policy are documented, because otherwise it cannot be reproduced as a baseline. A rule-based policy supplies simple tactical safety: take an immediate win and block an immediate loss. A heuristic policy ranks non-terminal alternatives using domain features, but feature weights are assumptions until calibrated or empirically evaluated.

Alpha-Beta search later makes these components more important, not less: candidate generation and move ordering determine which positions are searched first, and strong ordering affects pruning efficiency [B1]. Threat-space search is an advanced, game-specific selective technique with a historical Go-Moku research basis [B2]. It is not a substitute for a fixed rule contract and baseline tactical tests.

## 3. Observed baseline evidence

| ID | Evidence class | Observation | Source location | Meaning |
| --- | --- | --- | --- | --- |
| W4-A1 | [A] | `SplitMix64` receives an explicit seed and selects one legal move by modular index. | `caro-core-reference/src/bot/random.rs` | The reference Random policy is reproducible for a known seed/state. |
| W4-A2 | [A] | Rule-based selection checks immediate own wins, then opponent immediate wins, then a deterministic heuristic fallback. | `caro-core-reference/src/bot/rule_based.rs` | Tactical priorities are explicit and inspectable. |
| W4-A3 | [A] | The heuristic examines generated candidates, temporarily plays each move, evaluates from the root perspective, then undoes it. | `caro-core-reference/src/bot/heuristic.rs` | The fallback is a one-ply candidate comparison. |
| W4-A4 | [A] | Evaluation weighs five-or-more, open/closed four, open/closed three, and open/closed two patterns; defense is separately weighted. | `caro-core-reference/src/evaluator.rs` | The current reference heuristic follows an attack-minus-defense model. |
| W4-A5 | [A] | The runtime `AIController` uses a TypeScript immediate win/block resolver before delegating strategic selection to WASM. | `10_caro/src/game/ai/AIController.ts`; `TacticalMoveResolver.ts` | The shipped tactical pre-check is source-visible, but its rule uses `count >= 5`. |

## 4. Analysis

The reference architecture provides a clean experimental ladder:

1. Random with fixed seed and legal-move list;
2. rule-based immediate win/block;
3. one-ply heuristic on a shared candidate set;
4. deeper search using the same rule and evaluation infrastructure.

This ordering makes later comparisons meaningful. A more complex bot must be compared against a fixed baseline on identical positions and rule semantics. Faster evaluation is not equivalent to better play; tactical-solve rate and paired-game outcomes measure a different property from latency and node counts.

The current reference evaluator gives a very high score to `five_or_more`. That is compatible with a Freestyle rule but may not be compatible with exact-five or blocked-ends Caro. Therefore a pattern name, scoring table, tactical resolver, and winner detector must all depend on the same selected rule profile.

## 5. Proposed experiment protocol

For each fixed fixture, record board state, side to move, rule profile, expected tactical class, acceptable best moves, seed, candidate configuration, and time/depth budget. Compare only one change at a time:

| Variant | Baseline | Treatment | Metrics |
| --- | --- | --- | --- |
| B0 vs B1 | Random | Rule-based | tactical solve rate, invalid-move rate, reproducibility |
| B1 vs B2 | Rule-based | One-ply heuristic | tactical solve rate, evaluation calls, move quality review |
| S0 vs S1 | Candidate-limited search | + move ordering | nodes, cutoffs, elapsed time, completed depth |
| S1 vs S2 | Ordered search | + transposition table | nodes, TT probes/hits, elapsed time |

No measurements are filled into this report because the raw benchmark fixture set and outputs were not available in the present evidence snapshot.

## 6. Limitations

- Source inspection establishes that these reference algorithms exist, not that every one is the current production strategic engine.
- The runtime WASM strategic algorithm is not proven from wrapper telemetry alone.
- Pattern weights are implementation parameters, not empirical proof that a pattern has the stated strength under every rule profile.
- No head-to-head or ablation results were run for this report.

## 7. Decision and next evidence

**[D] Recommendation.** Preserve the Random, rule-based, and one-ply heuristic policies as named baselines. Build a shared tactical fixture suite before tuning search. Instrument the canonical engine to return real node, cutoff, candidate, evaluation, transposition, elapsed-time, and completed-depth fields. Only after those controls exist should the final report claim that a search optimization improved performance or playing strength.

## References

- [B1] Knuth, D. E., and R. W. Moore. “An Analysis of Alpha-Beta Pruning.” *Artificial Intelligence* 6(4), 1975. https://doi.org/10.1016/0004-3702(75)90019-3
- [B2] Allis, L. V., H. J. van den Herik, and M. P. H. Huntjens. “Go-Moku Solved by New Search Techniques.” *Computational Intelligence* 12(1), 1996. https://dblp.org/rec/journals/ci/AllisHH96.html

