use crate::model::{Move, Player, BOARD_SIZE};
use crate::state::GameState;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RuleConfig {
    pub target: u8,
    pub overline_wins: bool,
    pub blocked_both_ends_disqualifies: bool,
    pub edge_counts_as_blocked: bool,
}

impl RuleConfig {
    /// Freestyle Gomoku-like profile: five or more contiguous stones wins.
    pub const fn freestyle() -> Self {
        Self {
            target: 5,
            overline_wins: true,
            blocked_both_ends_disqualifies: false,
            edge_counts_as_blocked: false,
        }
    }

    /// Exact-five profile: a run longer than five is not itself a winning run.
    pub const fn exact_five() -> Self {
        Self {
            target: 5,
            overline_wins: false,
            blocked_both_ends_disqualifies: false,
            edge_counts_as_blocked: false,
        }
    }

    /// Project-configurable Caro-style blocked-ends profile.
    ///
    /// This is intentionally not labelled an "official Vietnamese rule".
    /// The project must lock the exact rule contract before production use.
    pub const fn blocked_ends(overline_wins: bool, edge_counts_as_blocked: bool) -> Self {
        Self {
            target: 5,
            overline_wins,
            blocked_both_ends_disqualifies: true,
            edge_counts_as_blocked,
        }
    }
}

impl Default for RuleConfig {
    fn default() -> Self {
        Self::freestyle()
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct LineInfo {
    pub run_length: u8,
    pub blocked_ends: u8,
}

const AXES: [(isize, isize); 4] = [(0, 1), (1, 0), (1, 1), (1, -1)];

#[inline]
fn in_bounds(row: isize, col: isize) -> bool {
    row >= 0 && col >= 0 && row < BOARD_SIZE as isize && col < BOARD_SIZE as isize
}

fn cell_at(state: &GameState, row: isize, col: isize) -> Option<i8> {
    if !in_bounds(row, col) {
        return None;
    }
    let index = row as usize * BOARD_SIZE + col as usize;
    Some(state.board()[index])
}

fn side_blocked(
    state: &GameState,
    row: isize,
    col: isize,
    player: Player,
    config: RuleConfig,
) -> bool {
    match cell_at(state, row, col) {
        Some(0) => false,
        Some(value) if value == player.cell_value() => false,
        Some(_) => true,
        None => config.edge_counts_as_blocked,
    }
}

pub fn scan_axis(
    state: &GameState,
    origin: Move,
    player: Player,
    dr: isize,
    dc: isize,
) -> LineInfo {
    let origin_row = origin.row() as isize;
    let origin_col = origin.col() as isize;
    let target = player.cell_value();

    let mut neg = 0u8;
    let mut row = origin_row - dr;
    let mut col = origin_col - dc;
    while cell_at(state, row, col) == Some(target) {
        neg = neg.saturating_add(1);
        row -= dr;
        col -= dc;
    }
    let neg_end = (row, col);

    let mut pos = 0u8;
    row = origin_row + dr;
    col = origin_col + dc;
    while cell_at(state, row, col) == Some(target) {
        pos = pos.saturating_add(1);
        row += dr;
        col += dc;
    }
    let pos_end = (row, col);

    let config = state.rules();
    let mut blocked = 0u8;
    if side_blocked(state, neg_end.0, neg_end.1, player, config) {
        blocked += 1;
    }
    if side_blocked(state, pos_end.0, pos_end.1, player, config) {
        blocked += 1;
    }

    LineInfo {
        run_length: 1u8.saturating_add(neg).saturating_add(pos),
        blocked_ends: blocked,
    }
}

#[inline]
pub fn line_is_win(info: LineInfo, config: RuleConfig) -> bool {
    let length_ok = if config.overline_wins {
        info.run_length >= config.target
    } else {
        info.run_length == config.target
    };

    length_ok
        && !(config.blocked_both_ends_disqualifies && info.blocked_ends == 2)
}

pub fn is_winning_move(state: &GameState, mv: Move, player: Player) -> bool {
    if state.board()[mv.as_index()] != player.cell_value() {
        return false;
    }

    AXES.into_iter().any(|(dr, dc)| {
        let info = scan_axis(state, mv, player, dr, dc);
        line_is_win(info, state.rules())
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::GameState;

    #[test]
    fn exact_five_rejects_overline() {
        let mut state = GameState::new(RuleConfig::exact_five());
        for col in 0..6 {
            state.set_cell_for_fixture(7, col, Player::X).unwrap();
        }
        let mv = Move::new(7, 3).unwrap();
        assert!(!is_winning_move(&state, mv, Player::X));
    }

    #[test]
    fn freestyle_accepts_overline() {
        let mut state = GameState::new(RuleConfig::freestyle());
        for col in 0..6 {
            state.set_cell_for_fixture(7, col, Player::X).unwrap();
        }
        let mv = Move::new(7, 3).unwrap();
        assert!(is_winning_move(&state, mv, Player::X));
    }
}
