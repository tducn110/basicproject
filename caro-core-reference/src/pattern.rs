use crate::model::{Move, Player, BOARD_SIZE};
use crate::state::GameState;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Direction {
    Horizontal,
    Vertical,
    Diagonal,
    AntiDiagonal,
}

impl Direction {
    #[inline]
    const fn delta(self) -> (isize, isize) {
        match self {
            Self::Horizontal => (0, 1),
            Self::Vertical => (1, 0),
            Self::Diagonal => (1, 1),
            Self::AntiDiagonal => (1, -1),
        }
    }
}

pub const DIRECTIONS: [Direction; 4] = [
    Direction::Horizontal,
    Direction::Vertical,
    Direction::Diagonal,
    Direction::AntiDiagonal,
];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Pattern {
    pub player: Player,
    pub direction: Direction,
    pub start: Move,
    pub run_length: u8,
    pub open_ends: u8,
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct PatternCounts {
    pub five_or_more: u32,
    pub open_four: u32,
    pub closed_four: u32,
    pub open_three: u32,
    pub closed_three: u32,
    pub open_two: u32,
    pub closed_two: u32,
}

#[inline]
fn in_bounds(row: isize, col: isize) -> bool {
    row >= 0 && col >= 0 && row < BOARD_SIZE as isize && col < BOARD_SIZE as isize
}

#[inline]
fn value_at(state: &GameState, row: isize, col: isize) -> Option<i8> {
    if !in_bounds(row, col) {
        return None;
    }
    Some(state.board()[row as usize * BOARD_SIZE + col as usize])
}

pub fn detect_runs(state: &GameState, player: Player) -> Vec<Pattern> {
    let target = player.cell_value();
    let mut out = Vec::new();

    for row in 0..BOARD_SIZE {
        for col in 0..BOARD_SIZE {
            if state.board()[row * BOARD_SIZE + col] != target {
                continue;
            }

            for direction in DIRECTIONS {
                let (dr, dc) = direction.delta();
                let prev_row = row as isize - dr;
                let prev_col = col as isize - dc;

                // Only emit a maximal run once, from its first stone.
                if value_at(state, prev_row, prev_col) == Some(target) {
                    continue;
                }

                let mut length = 1u8;
                let mut next_row = row as isize + dr;
                let mut next_col = col as isize + dc;
                while value_at(state, next_row, next_col) == Some(target) {
                    length = length.saturating_add(1);
                    next_row += dr;
                    next_col += dc;
                }

                // Ignore isolated single stones in the pattern taxonomy.
                if length < 2 {
                    continue;
                }

                let mut open_ends = 0u8;
                if value_at(state, prev_row, prev_col) == Some(0) {
                    open_ends += 1;
                }
                if value_at(state, next_row, next_col) == Some(0) {
                    open_ends += 1;
                }

                out.push(Pattern {
                    player,
                    direction,
                    start: Move::new(row, col).expect("loop coordinates are in bounds"),
                    run_length: length,
                    open_ends,
                });
            }
        }
    }

    out
}

pub fn count_patterns(state: &GameState, player: Player) -> PatternCounts {
    let mut counts = PatternCounts::default();

    for pattern in detect_runs(state, player) {
        match (pattern.run_length, pattern.open_ends) {
            (5.., _) => counts.five_or_more += 1,
            (4, 2) => counts.open_four += 1,
            (4, 1) => counts.closed_four += 1,
            (3, 2) => counts.open_three += 1,
            (3, 1) => counts.closed_three += 1,
            (2, 2) => counts.open_two += 1,
            (2, 1) => counts.closed_two += 1,
            _ => {}
        }
    }

    counts
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::rules::RuleConfig;

    #[test]
    fn detects_open_three_once() {
        let mut state = GameState::new(RuleConfig::freestyle());
        for col in 4..=6 {
            state.set_cell_for_fixture(7, col, Player::X).unwrap();
        }
        let counts = count_patterns(&state, Player::X);
        assert_eq!(counts.open_three, 1);
    }
}
