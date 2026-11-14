use crate::evaluator::{evaluate, EvalWeights};
use crate::model::Move;
use crate::movegen::{generate_candidates, CandidateConfig};
use crate::state::GameState;

pub fn choose_heuristic_move(
    state: &mut GameState,
    weights: EvalWeights,
    candidates: CandidateConfig,
) -> Option<Move> {
    let root = state.to_move();
    let moves = generate_candidates(state, candidates);
    let mut best: Option<(Move, i32)> = None;

    for mv in moves {
        let Ok(undo) = state.play(mv) else {
            continue;
        };
        let score = evaluate(state, root, weights);
        state.undo(undo);

        if best.map_or(true, |(_, current)| score > current) {
            best = Some((mv, score));
        }
    }

    best.map(|(mv, _)| mv)
}
