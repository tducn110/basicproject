use crate::model::{Move, BOARD_CELLS, BOARD_SIZE};
use crate::state::GameState;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct CandidateConfig {
    /// Chebyshev radius around any occupied cell.
    pub radius: u8,
    /// Optional hard cap after deterministic row-major generation.
    pub max_candidates: Option<usize>,
}

impl Default for CandidateConfig {
    fn default() -> Self {
        Self {
            radius: 2,
            max_candidates: None,
        }
    }
}

pub fn generate_candidates(state: &GameState, config: CandidateConfig) -> Vec<Move> {
    if state.move_count() == 0 {
        return vec![Move::new(BOARD_SIZE / 2, BOARD_SIZE / 2).unwrap()];
    }

    let radius = config.radius as isize;
    let mut marked = [false; BOARD_CELLS];

    for index in 0..BOARD_CELLS {
        if state.board()[index] == 0 {
            continue;
        }
        let row = index / BOARD_SIZE;
        let col = index % BOARD_SIZE;

        for dr in -radius..=radius {
            for dc in -radius..=radius {
                if dr == 0 && dc == 0 {
                    continue;
                }
                let nr = row as isize + dr;
                let nc = col as isize + dc;
                if nr < 0 || nc < 0 || nr >= BOARD_SIZE as isize || nc >= BOARD_SIZE as isize {
                    continue;
                }
                let nidx = nr as usize * BOARD_SIZE + nc as usize;
                if state.board()[nidx] == 0 {
                    marked[nidx] = true;
                }
            }
        }
    }

    let mut moves = Vec::new();
    for (index, &is_candidate) in marked.iter().enumerate() {
        if is_candidate {
            moves.push(Move::from_index(index).unwrap());
        }
    }

    if let Some(limit) = config.max_candidates {
        moves.truncate(limit);
    }
    moves
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{Player, RuleConfig};

    #[test]
    fn empty_board_returns_center() {
        let state = GameState::new(RuleConfig::freestyle());
        assert_eq!(generate_candidates(&state, CandidateConfig::default()).len(), 1);
        assert_eq!(generate_candidates(&state, CandidateConfig::default())[0].row(), 7);
    }

    #[test]
    fn candidates_are_empty_and_near_stones() {
        let mut state = GameState::new(RuleConfig::freestyle());
        state.set_cell_for_fixture(7, 7, Player::X).unwrap();
        let moves = generate_candidates(&state, CandidateConfig { radius: 1, max_candidates: None });
        assert_eq!(moves.len(), 8);
        assert!(moves.iter().all(|mv| state.is_empty(*mv)));
    }
}
