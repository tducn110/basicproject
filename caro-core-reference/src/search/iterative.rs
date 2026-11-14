use crate::metrics::{SearchResult, SearchStats};
use crate::state::GameState;
use crate::zobrist::Zobrist;

use super::optimized::{search_optimized_alpha_beta, SearchAbort};
use super::transposition::TranspositionTable;
use super::SearchConfig;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct IterativeResult {
    pub last_complete: Option<SearchResult>,
    pub aggregate_stats: SearchStats,
    pub budget_exhausted: bool,
}

/// Iterative deepening with a deterministic node budget.
///
/// A browser time budget should be implemented by the Wasm/runtime adapter or a
/// platform clock abstraction, then validated separately. Using a node budget in
/// the pure core keeps this reference deterministic and portable.
pub fn iterative_deepening(
    state: &mut GameState,
    mut config: SearchConfig,
    max_depth: u8,
    total_node_budget: u64,
    zobrist: &Zobrist,
) -> IterativeResult {
    let mut remaining = total_node_budget;
    let mut aggregate = SearchStats::default();
    let mut last_complete = None;
    let mut tt = TranspositionTable::with_capacity(16_384);

    for depth in 1..=max_depth {
        if remaining == 0 {
            return IterativeResult {
                last_complete,
                aggregate_stats: aggregate,
                budget_exhausted: true,
            };
        }

        config.depth = depth;
        let before = remaining;
        match search_optimized_alpha_beta(state, config, zobrist, &mut tt, Some(remaining)) {
            Ok(result) => {
                let used = result.stats.nodes_visited.min(before);
                remaining = remaining.saturating_sub(used);
                aggregate.merge_from(result.stats);
                last_complete = Some(result);
            }
            Err(SearchAbort::NodeBudgetExhausted) => {
                return IterativeResult {
                    last_complete,
                    aggregate_stats: aggregate,
                    budget_exhausted: true,
                };
            }
        }
    }

    IterativeResult {
        last_complete,
        aggregate_stats: aggregate,
        budget_exhausted: false,
    }
}
