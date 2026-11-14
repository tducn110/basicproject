//! Legal neighborhood selection. A cap is selective search, so immediate wins
//! and every opponent winning completion are retained before applying it.
use crate::board::{Board, Cell, SIZE};

pub type Move = (usize, usize);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct CandidatePolicy {
    pub radius: usize,
    /// Soft cap: all tactical completions survive even when they exceed this.
    /// Zero is normalized to one so an ongoing position still has a move.
    pub max_candidates: Option<usize>,
    pub move_ordering: bool,
}

impl Default for CandidatePolicy {
    fn default() -> Self {
        Self { radius: 2, max_candidates: None, move_ordering: true }
    }
}

#[derive(Debug)]
pub struct CandidateSet {
    pub moves: Vec<Move>,
    /// Legal neighborhood entries assessed before capping.
    pub generated: usize,
    /// Lightweight rank assessments, including tactical classification.
    pub rank_evaluations: usize,
    pub tactical_retained: usize,
    pub immediate_win: Option<Move>,
    pub immediate_block: Option<Move>,
}

#[derive(Clone, Copy)]
struct RankedMove {
    mv: Move,
    score: i32,
    wins: bool,
    blocks_win: bool,
}

fn count_side(board: &Board, mv: Move, dx: isize, dy: isize, player: Cell) -> usize {
    let mut count = 0;
    for step in 1..5 {
        let x = mv.0 as isize + dx * step;
        let y = mv.1 as isize + dy * step;
        if x < 0 || y < 0 || x >= SIZE as isize || y >= SIZE as isize
            || board.get(x as usize, y as usize) != player {
            break;
        }
        count += 1;
    }
    count
}

fn assess(board: &Board, mv: Move, player: Cell) -> RankedMove {
    let mut ranked = RankedMove { mv, score: 0, wins: false, blocks_win: false };
    for (dx, dy) in [(1, 0), (0, 1), (1, 1), (1, -1)] {
        let own = count_side(board, mv, dx, dy, player)
            + count_side(board, mv, -dx, -dy, player);
        let opp = count_side(board, mv, dx, dy, player.opponent())
            + count_side(board, mv, -dx, -dy, player.opponent());
        ranked.wins |= own >= 4;
        ranked.blocks_win |= opp >= 4;
        ranked.score += match own { 4.. => 10_000, 3 => 1_000, 2 => 100, 1 => 10, _ => 0 };
        ranked.score += match opp { 4.. => 9_000, 3 => 900, 2 => 80, 1 => 5, _ => 0 };
    }
    let center = (SIZE / 2) as i32;
    let chebyshev = (mv.0 as i32 - center).abs().max((mv.1 as i32 - center).abs());
    ranked.score += (center - chebyshev).max(0) * 10;
    ranked
}

pub fn winning_completion(board: &Board, mv: Move, player: Cell) -> bool {
    player != Cell::Empty && board.get_checked(mv.0, mv.1) == Some(Cell::Empty)
        && assess(board, mv, player).wins
}

pub fn select_candidates(board: &Board, player: Cell, policy: CandidatePolicy) -> CandidateSet {
    let mut raw = if player == Cell::Empty || board.is_full() { Vec::new() }
        else { board.get_candidates(policy.radius) };
    // Radius zero has no neighbors. Fall back to legal moves, never an occupied
    // placeholder, so the search API remains total for this configuration.
    if raw.is_empty() && player != Cell::Empty && !board.is_full() {
        raw = board.legal_moves();
    }
    let generated = raw.len();
    let mut ranked: Vec<_> = raw.into_iter().map(|mv| assess(board, mv, player)).collect();
    ranked.sort_by(|a, b| b.wins.cmp(&a.wins)
        .then(b.blocks_win.cmp(&a.blocks_win))
        .then(b.score.cmp(&a.score))
        .then((a.mv.1 * SIZE + a.mv.0).cmp(&(b.mv.1 * SIZE + b.mv.0))));
    let tactical = ranked.iter().filter(|mv| mv.wins || mv.blocks_win).count();
    if let Some(cap) = policy.max_candidates {
        ranked.truncate(cap.max(1).max(tactical));
    }
    if !policy.move_ordering {
        ranked.sort_unstable_by_key(|mv| mv.mv.1 * SIZE + mv.mv.0);
    }
    let immediate_win = ranked.iter().find(|mv| mv.wins).map(|mv| mv.mv);
    let immediate_block = ranked.iter().find(|mv| mv.blocks_win).map(|mv| mv.mv);
    CandidateSet {
        moves: ranked.into_iter().map(|ranked| ranked.mv).collect(),
        generated,
        rank_evaluations: generated,
        tactical_retained: tactical,
        immediate_win,
        immediate_block,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn soft_cap_keeps_both_winning_ends_and_opponent_completions() {
        let mut board = Board::new();
        for x in 3..=6 { board.place(x, 7, Cell::Black).unwrap(); }
        for y in 2..=5 { board.place(12, y, Cell::White).unwrap(); }
        let selected = select_candidates(&board, Cell::Black, CandidatePolicy {
            max_candidates: Some(1), ..CandidatePolicy::default()
        });
        for mv in [(2, 7), (7, 7), (12, 1), (12, 6)] {
            assert!(selected.moves.contains(&mv), "lost tactical completion {mv:?}");
        }
        assert_eq!(selected.tactical_retained, 4);
        assert!(selected.moves.len() > 1);
    }

    #[test]
    fn broken_four_gap_is_an_immediate_completion() {
        let mut board = Board::new();
        for x in [3, 4, 6, 7] { board.place(x, 7, Cell::Black).unwrap(); }
        assert!(winning_completion(&board, (5, 7), Cell::Black));
        let selected = select_candidates(&board, Cell::White, CandidatePolicy {
            max_candidates: Some(1), ..CandidatePolicy::default()
        });
        assert!(selected.moves.contains(&(5, 7)));
    }

    #[test]
    fn ordering_changes_traversal_but_not_selected_tree() {
        let mut board = Board::new();
        for (x, y, p) in [(7, 7, Cell::Black), (8, 7, Cell::White), (7, 8, Cell::Black)] {
            board.place(x, y, p).unwrap();
        }
        let policy = CandidatePolicy { max_candidates: Some(8), ..CandidatePolicy::default() };
        let mut a = select_candidates(&board, Cell::White, policy).moves;
        let mut b = select_candidates(&board, Cell::White, CandidatePolicy { move_ordering: false, ..policy }).moves;
        a.sort_unstable(); b.sort_unstable();
        assert_eq!(a, b);
    }

    #[test]
    fn zero_radius_and_cap_still_return_a_legal_move() {
        let mut board = Board::new();
        board.place(7, 7, Cell::Black).unwrap();
        let candidates = select_candidates(&board, Cell::White, CandidatePolicy {
            radius: 0, max_candidates: Some(0), move_ordering: false,
        });
        assert_eq!(candidates.moves.len(), 1);
        assert_eq!(board.get_checked(candidates.moves[0].0, candidates.moves[0].1), Some(Cell::Empty));
    }

    #[test]
    fn candidate_tactical_recall_matches_apply_and_scan_in_all_axes() {
        for (dx, dy) in [(1isize, 0isize), (0, 1), (1, 1), (1, -1)] {
            let mut board = Board::new();
            for step in [0, 1, 3, 4] {
                board.place((3 + dx * step) as usize, (7 + dy * step) as usize, Cell::Black).unwrap();
            }
            let selected = select_candidates(&board, Cell::White, CandidatePolicy {
                max_candidates: Some(1), ..CandidatePolicy::default()
            });
            for mv in board.legal_moves() {
                let mut after = board.clone();
                after.place(mv.0, mv.1, Cell::Black).unwrap();
                if after.check_winner_at(mv.0, mv.1) == Some(Cell::Black) {
                    assert!(selected.moves.contains(&mv));
                }
            }
        }
    }
}
