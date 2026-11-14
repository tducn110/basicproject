use crate::model::{GameStatus, Player};
use crate::pattern::{count_patterns, PatternCounts};
use crate::state::GameState;

pub const MATE_SCORE: i32 = 10_000_000;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct EvalWeights {
    pub five_or_more: i32,
    pub open_four: i32,
    pub closed_four: i32,
    pub open_three: i32,
    pub closed_three: i32,
    pub open_two: i32,
    pub closed_two: i32,
    /// Multiplier applied to the opponent's pattern score.
    pub defense_num: i32,
    pub defense_den: i32,
}

impl Default for EvalWeights {
    fn default() -> Self {
        Self {
            five_or_more: 1_000_000,
            open_four: 100_000,
            closed_four: 20_000,
            open_three: 5_000,
            closed_three: 500,
            open_two: 100,
            closed_two: 10,
            defense_num: 1,
            defense_den: 1,
        }
    }
}

#[inline]
fn score_counts(counts: PatternCounts, weights: EvalWeights) -> i32 {
    counts.five_or_more as i32 * weights.five_or_more
        + counts.open_four as i32 * weights.open_four
        + counts.closed_four as i32 * weights.closed_four
        + counts.open_three as i32 * weights.open_three
        + counts.closed_three as i32 * weights.closed_three
        + counts.open_two as i32 * weights.open_two
        + counts.closed_two as i32 * weights.closed_two
}

pub fn evaluate(state: &GameState, perspective: Player, weights: EvalWeights) -> i32 {
    match state.status() {
        GameStatus::Won(player) if player == perspective => return MATE_SCORE,
        GameStatus::Won(_) => return -MATE_SCORE,
        GameStatus::Draw => return 0,
        GameStatus::Playing => {}
    }

    let attack = score_counts(count_patterns(state, perspective), weights);
    let defense_raw = score_counts(count_patterns(state, perspective.opponent()), weights);
    let defense = if weights.defense_den == 0 {
        defense_raw
    } else {
        defense_raw.saturating_mul(weights.defense_num) / weights.defense_den
    };

    // Leave a margin below MATE_SCORE so terminal states always dominate.
    (attack - defense).clamp(-MATE_SCORE + 1, MATE_SCORE - 1)
}
