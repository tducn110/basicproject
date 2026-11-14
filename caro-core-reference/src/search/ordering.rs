use std::cmp::Ordering;

use crate::evaluator::{evaluate, EvalWeights, MATE_SCORE};
use crate::metrics::SearchStats;
use crate::model::{GameStatus, Move, Player};
use crate::state::GameState;

pub fn order_moves(
    state: &mut GameState,
    moves: &mut [Move],
    root: Player,
    weights: EvalWeights,
    stats: &mut SearchStats,
    preferred: Option<Move>,
) {
    let mover = state.to_move();
    let mut scored = Vec::with_capacity(moves.len());

    for &mv in moves.iter() {
        let score = if Some(mv) == preferred {
            i32::MAX
        } else {
            let Ok(undo) = state.play(mv) else {
                scored.push((mv, i32::MIN));
                continue;
            };
            stats.ordering_evaluations += 1;
            let score = match state.status() {
                GameStatus::Won(player) if player == mover => MATE_SCORE,
                _ => evaluate(state, root, weights),
            };
            state.undo(undo);
            score
        };
        scored.push((mv, score));
    }

    scored.sort_by(|(move_a, score_a), (move_b, score_b)| {
        score_b
            .cmp(score_a)
            .then_with(|| move_a.as_index().cmp(&move_b.as_index()))
            .then(Ordering::Equal)
    });

    for (slot, (mv, _)) in moves.iter_mut().zip(scored.into_iter()) {
        *slot = mv;
    }
}
