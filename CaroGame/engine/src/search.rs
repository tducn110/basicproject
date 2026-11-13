//! Fixed-depth Minimax and Alpha-Beta over exactly the same candidate policy.
//! One owned board is made/unmade; no raw pointers or per-child board clones.
use crate::board::{Board, Cell, SIZE};
use crate::candidates::{select_candidates, CandidatePolicy, Move};
use crate::eval::{evaluate, terminal_utility};
use serde::Serialize;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum SearchAlgorithm { Minimax, AlphaBeta }

#[derive(Clone, Copy, Debug)]
pub struct SearchConfig {
    pub depth: usize,
    pub algorithm: SearchAlgorithm,
    pub candidates: CandidatePolicy,
}

impl Default for SearchConfig {
    fn default() -> Self {
        Self { depth: 2, algorithm: SearchAlgorithm::AlphaBeta, candidates: CandidatePolicy::default() }
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize)]
pub struct SearchStats {
    /// Positions visited, including root and terminal/horizon leaves. Baselines
    /// also count their postselection evaluations: Random has root + one chosen
    /// position (2), although completed_depth is 0 because it has no lookahead.
    pub nodes_visited: u64,
    /// Terminal/horizon position evaluations; excludes candidate rank work.
    pub leaf_evaluations: u64,
    /// Actual Alpha-Beta cutoff events; always zero for plain Minimax.
    pub cutoffs: u64,
    /// Lightweight rank/tactical assessments, including pre-cap selection.
    pub ordering_evaluations: u64,
    /// Legal neighborhood entries assessed before soft capping, across nodes.
    pub candidate_moves_generated: u64,
    pub completed_depth: usize,
}

#[derive(Clone, Debug, Serialize)]
pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub stats: SearchStats,
}

struct SearchContext {
    root: Cell,
    config: SearchConfig,
    stats: SearchStats,
}

impl SearchContext {
    fn moves(&mut self, board: &Board, player: Cell) -> Vec<Move> {
        let candidates = select_candidates(board, player, self.config.candidates);
        self.stats.candidate_moves_generated += candidates.generated as u64;
        self.stats.ordering_evaluations += candidates.rank_evaluations as u64;
        candidates.moves
    }

    fn value(
        &mut self, board: &mut Board, player: Cell, last: Move,
        depth: usize, ply: usize, mut alpha: i32, mut beta: i32,
    ) -> i32 {
        self.stats.nodes_visited += 1;
        if let Some(score) = terminal_utility(
            board.check_winner_at(last.0, last.1), board.is_full(), self.root, ply,
        ) {
            self.stats.leaf_evaluations += 1;
            return score;
        }
        if depth == 0 {
            self.stats.leaf_evaluations += 1;
            return evaluate(board, self.root);
        }
        let moves = self.moves(board, player);
        if moves.is_empty() {
            self.stats.leaf_evaluations += 1;
            return 0;
        }
        let maximizing = player == self.root;
        let mut best = if maximizing { i32::MIN } else { i32::MAX };
        for (x, y) in moves {
            board.place(x, y, player).expect("candidate must be a legal empty cell");
            let score = self.value(board, player.opponent(), (x, y), depth - 1, ply + 1, alpha, beta);
            let undone = board.undo(x, y);
            debug_assert!(undone);
            if maximizing { best = best.max(score); alpha = alpha.max(best); }
            else { best = best.min(score); beta = beta.min(best); }
            if self.config.algorithm == SearchAlgorithm::AlphaBeta && alpha >= beta {
                self.stats.cutoffs += 1;
                break;
            }
        }
        best
    }

    fn run(&mut self, board: &mut Board) -> SearchResult {
        self.stats.nodes_visited = 1;
        let terminal = terminal_utility(board.check_winner(), board.is_full(), self.root, 0);
        if self.root == Cell::Empty || terminal.is_some() || self.config.depth == 0 {
            self.stats.leaf_evaluations = 1;
            return SearchResult {
                best_move: None,
                score: terminal.unwrap_or_else(|| if self.root == Cell::Empty { 0 } else { evaluate(board, self.root) }),
                stats: self.stats,
            };
        }
        let depth = self.config.depth.min(SIZE * SIZE - board.move_count());
        let moves = self.moves(board, self.root);
        let mut best_move = None;
        let mut best_score = i32::MIN;
        let mut alpha = i32::MIN;
        for (x, y) in moves {
            board.place(x, y, self.root).expect("candidate must be a legal empty cell");
            let score = self.value(board, self.root.opponent(), (x, y), depth - 1, 1, alpha, i32::MAX);
            let undone = board.undo(x, y);
            debug_assert!(undone);
            if best_move.is_none() || score > best_score {
                best_move = Some((x, y));
                best_score = score;
            }
            if self.config.algorithm == SearchAlgorithm::AlphaBeta { alpha = alpha.max(best_score); }
        }
        self.stats.completed_depth = depth;
        SearchResult { best_move, score: if best_move.is_some() { best_score } else { 0 }, stats: self.stats }
    }
}

/// Borrow a board for one search and restore every field before returning.
/// The caller can verify restoration directly in release evidence runs.
pub fn search_in_place(board: &mut Board, player: Cell, config: SearchConfig) -> SearchResult {
    let mut context = SearchContext { root: player, config, stats: SearchStats::default() };
    context.run(board)
}

/// Application entry point: exactly one root clone, followed by make/unmake.
pub fn search(board: &Board, player: Cell, config: SearchConfig) -> SearchResult {
    let mut owned = board.clone();
    let result = search_in_place(&mut owned, player, config);
    debug_assert_eq!(&owned, board, "search must restore its working board");
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::eval::{HEURISTIC_LIMIT, MATE_SCORE};

    fn fixture() -> Board {
        let mut board = Board::new();
        for (x, y, p) in [(7, 7, Cell::Black), (8, 7, Cell::White), (7, 8, Cell::Black), (8, 8, Cell::White)] {
            board.place(x, y, p).unwrap();
        }
        board
    }

    #[test]
    fn plain_minimax_and_alpha_beta_agree_and_restore_root() {
        for player in [Cell::Black, Cell::White] {
            for depth in 1..=3 {
                for ordered in [false, true] {
                    let original = fixture();
                    let policy = CandidatePolicy { max_candidates: Some(6), move_ordering: ordered, ..CandidatePolicy::default() };
                    let mut mm_board = original.clone();
                    let mut ab_board = original.clone();
                    let mm = search_in_place(&mut mm_board, player, SearchConfig { depth, algorithm: SearchAlgorithm::Minimax, candidates: policy });
                    let ab = search_in_place(&mut ab_board, player, SearchConfig { depth, algorithm: SearchAlgorithm::AlphaBeta, candidates: policy });
                    assert_eq!((mm.score, mm.best_move), (ab.score, ab.best_move));
                    assert_eq!(mm.stats.cutoffs, 0);
                    assert!(ab.stats.nodes_visited <= mm.stats.nodes_visited);
                    assert_eq!(mm_board, original);
                    assert_eq!(ab_board, original);
                }
            }
        }
    }

    #[test]
    fn traversal_order_preserves_value_with_the_same_selected_tree() {
        for depth in 1..=3 {
            let config = SearchConfig { depth, candidates: CandidatePolicy { max_candidates: Some(8), ..CandidatePolicy::default() }, ..SearchConfig::default() };
            let ordered = search(&fixture(), Cell::Black, config);
            let natural = search(&fixture(), Cell::Black, SearchConfig {
                candidates: CandidatePolicy { move_ordering: false, ..config.candidates }, ..config
            });
            assert_eq!(ordered.score, natural.score);
        }
    }

    #[test]
    fn terminal_win_and_full_draw_return_no_move() {
        let mut won = Board::new();
        for x in 0..5 { won.place(x, 0, Cell::Black).unwrap(); }
        let result = search(&won, Cell::White, SearchConfig::default());
        assert_eq!(result.best_move, None);
        assert_eq!(result.score, -MATE_SCORE);
        let mut draw = Board::new();
        for y in 0..SIZE { for x in 0..SIZE {
            draw.place(x, y, if (x + 2 * y) % 4 < 2 { Cell::Black } else { Cell::White }).unwrap();
        }}
        let result = search(&draw, Cell::Black, SearchConfig::default());
        assert_eq!(result.best_move, None);
        assert_eq!(result.score, 0);
        assert_eq!(result.stats.nodes_visited, 1);
    }

    #[test]
    fn immediate_win_and_single_forced_block_survive_cap_one() {
        for player in [Cell::Black, Cell::White] {
            let mut board = Board::new();
            for x in 0..4 { board.place(x, 0, Cell::Black).unwrap(); }
            let result = search(&board, player, SearchConfig {
                depth: 2, candidates: CandidatePolicy { max_candidates: Some(1), ..CandidatePolicy::default() }, ..SearchConfig::default()
            });
            assert_eq!(result.best_move, Some((4, 0)));
            if player == Cell::Black { assert!(result.score > HEURISTIC_LIMIT); }
        }
    }

    #[test]
    fn zero_depth_and_invalid_player_are_total() {
        let board = fixture();
        assert_eq!(search(&board, Cell::Black, SearchConfig { depth: 0, ..SearchConfig::default() }).best_move, None);
        assert_eq!(search(&board, Cell::Empty, SearchConfig::default()).best_move, None);
    }

    #[test]
    fn seeded_positions_preserve_minimax_equivalence_and_restoration() {
        let mut seed = 20261023u64;
        for _ in 0..16 {
            let mut original = Board::new();
            for ply in 0..8 {
                seed = seed.wrapping_mul(6364136223846793005).wrapping_add(1);
                let legal = original.legal_moves();
                let mv = legal[(seed % legal.len() as u64) as usize];
                original.place(mv.0, mv.1, if ply % 2 == 0 { Cell::Black } else { Cell::White }).unwrap();
            }
            let config = SearchConfig {
                depth: 3, candidates: CandidatePolicy { max_candidates: Some(5), ..CandidatePolicy::default() },
                ..SearchConfig::default()
            };
            let mut mm_board = original.clone(); let mut ab_board = original.clone();
            let mm = search_in_place(&mut mm_board, Cell::Black, SearchConfig { algorithm: SearchAlgorithm::Minimax, ..config });
            let ab = search_in_place(&mut ab_board, Cell::Black, config);
            assert_eq!((mm.score, mm.best_move), (ab.score, ab.best_move));
            assert_eq!(mm_board, original); assert_eq!(ab_board, original);
        }
    }
}
