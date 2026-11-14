pub mod alpha_beta;
pub mod iterative;
pub mod minimax;
pub mod optimized;
pub mod ordering;
pub mod transposition;

use crate::evaluator::EvalWeights;
use crate::model::Move;
use crate::movegen::{generate_candidates, CandidateConfig};
use crate::state::GameState;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MoveMode {
    AllLegal,
    Candidates(CandidateConfig),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SearchConfig {
    pub depth: u8,
    pub move_mode: MoveMode,
    pub use_move_ordering: bool,
    pub weights: EvalWeights,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            depth: 2,
            move_mode: MoveMode::Candidates(CandidateConfig::default()),
            use_move_ordering: false,
            weights: EvalWeights::default(),
        }
    }
}

pub(crate) fn generate_moves(state: &GameState, mode: MoveMode) -> Vec<Move> {
    match mode {
        MoveMode::AllLegal => state.legal_moves(),
        MoveMode::Candidates(config) => generate_candidates(state, config),
    }
}
