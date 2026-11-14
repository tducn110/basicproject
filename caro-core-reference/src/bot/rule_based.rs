use crate::bot::heuristic::choose_heuristic_move;
use crate::evaluator::EvalWeights;
use crate::model::{GameStatus, Move};
use crate::movegen::{generate_candidates, CandidateConfig};
use crate::state::GameState;

pub fn choose_rule_based_move(
    state: &mut GameState,
    weights: EvalWeights,
    candidates: CandidateConfig,
) -> Option<Move> {
    let me = state.to_move();
    let moves = generate_candidates(state, candidates);

    // 1. Win immediately if possible.
    for &mv in &moves {
        let Ok(undo) = state.play(mv) else {
            continue;
        };
        let wins = state.status() == GameStatus::Won(me);
        state.undo(undo);
        if wins {
            return Some(mv);
        }
    }

    // 2. Block an opponent move that would win immediately.
    // Build the same board with opponent to move, then test each candidate.
    let opponent = me.opponent();
    let original_to_move = state.to_move();
    state.set_to_move_for_fixture(opponent);
    let mut block = None;
    for &mv in &moves {
        let Ok(undo) = state.play(mv) else {
            continue;
        };
        let wins = state.status() == GameStatus::Won(opponent);
        state.undo(undo);
        if wins {
            block = Some(mv);
            break;
        }
    }
    state.set_to_move_for_fixture(original_to_move);

    if block.is_some() {
        return block;
    }

    // 3. Deterministic one-ply heuristic fallback.
    choose_heuristic_move(state, weights, candidates)
}
