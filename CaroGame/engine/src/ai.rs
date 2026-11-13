//! Difficulty selects a concrete strategy. Names are configuration labels,
//! not calibrated strength rankings or browser performance guarantees.
use crate::board::{Board, Cell};
use crate::candidates::{select_candidates, CandidatePolicy, Move};
use crate::eval::{evaluate, terminal_utility};
use crate::search::{search, SearchAlgorithm, SearchConfig, SearchResult, SearchStats};

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Difficulty { Easy, Normal, Hard, VeryHard, Expert, Master }

impl Difficulty {
    /// Preserve legacy IDs; append the new VeryHard level at 5.
    pub fn from_id(id: u8) -> Self {
        match id { 0 => Self::Easy, 2 => Self::Hard, 3 => Self::Expert,
            4 => Self::Master, 5 => Self::VeryHard, _ => Self::Normal }
    }
    pub fn id(self) -> u8 {
        match self { Self::Easy => 0, Self::Normal => 1, Self::Hard => 2,
            Self::VeryHard => 5, Self::Expert => 3, Self::Master => 4 }
    }
    pub fn label(self) -> &'static str {
        match self { Self::Easy => "easy", Self::Normal => "normal", Self::Hard => "hard",
            Self::VeryHard => "veryhard", Self::Expert => "expert", Self::Master => "master" }
    }
    pub fn strategy(self) -> &'static str {
        match self { Self::Easy => "random", Self::Normal => "rule_based", _ => "alpha_beta" }
    }
    pub fn depth(self) -> usize {
        match self { Self::Easy => 0, Self::Normal => 1, Self::Hard => 2,
            Self::VeryHard => 3, Self::Expert => 4, Self::Master => 5 }
    }
    pub fn max_candidates(self) -> Option<usize> {
        match self { Self::Easy | Self::Normal => None, Self::Hard => Some(15),
            Self::VeryHard => Some(12), Self::Expert => Some(10), Self::Master => Some(8) }
    }
    pub fn search_config(self) -> SearchConfig {
        SearchConfig {
            depth: self.depth(), algorithm: SearchAlgorithm::AlphaBeta,
            candidates: CandidatePolicy { radius: 2, max_candidates: self.max_candidates(), move_ordering: true },
        }
    }
}

#[derive(Clone, Debug)]
pub struct MoveDecision {
    pub result: SearchResult,
    pub strategy: &'static str,
    pub difficulty: Difficulty,
}

/// SplitMix64 gives deterministic, platform-identical baseline fixtures.
/// This game PRNG has no cryptographic purpose.
fn seeded_u64(mut seed: u64) -> u64 {
    seed = seed.wrapping_add(0x9E3779B97F4A7C15);
    seed = (seed ^ (seed >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
    seed = (seed ^ (seed >> 27)).wrapping_mul(0x94D049BB133111EB);
    seed ^ (seed >> 31)
}

fn evaluated_move(board: &mut Board, player: Cell, mv: Move, stats: &mut SearchStats) -> i32 {
    board.place(mv.0, mv.1, player).expect("baseline move must be legal");
    stats.nodes_visited += 1;
    stats.leaf_evaluations += 1;
    let score = terminal_utility(board.check_winner_at(mv.0, mv.1), board.is_full(), player, 1)
        .unwrap_or_else(|| evaluate(board, player));
    let undone = board.undo(mv.0, mv.1);
    debug_assert!(undone);
    score
}

fn baseline(board: &Board, player: Cell, difficulty: Difficulty, seed: u64) -> SearchResult {
    let mut stats = SearchStats { nodes_visited: 1, ..SearchStats::default() };
    let terminal = terminal_utility(board.check_winner(), board.is_full(), player, 0);
    if player == Cell::Empty || terminal.is_some() {
        stats.leaf_evaluations = 1;
        return SearchResult { best_move: None, score: terminal.unwrap_or(0), stats };
    }
    let mut owned = board.clone();
    if difficulty == Difficulty::Easy {
        let moves = board.legal_moves();
        stats.candidate_moves_generated = moves.len() as u64;
        let best_move = moves.get((seeded_u64(seed) % moves.len() as u64) as usize).copied();
        let score = best_move.map(|mv| evaluated_move(&mut owned, player, mv, &mut stats)).unwrap_or(0);
        debug_assert_eq!(&owned, board);
        return SearchResult { best_move, score, stats };
    }
    let candidates = select_candidates(board, player, CandidatePolicy::default());
    stats.candidate_moves_generated = candidates.generated as u64;
    stats.ordering_evaluations = candidates.rank_evaluations as u64;
    stats.completed_depth = 1;
    // Win before blocking. One block cannot solve multiple simultaneous threats.
    if let Some(mv) = candidates.immediate_win.or(candidates.immediate_block) {
        let score = evaluated_move(&mut owned, player, mv, &mut stats);
        debug_assert_eq!(&owned, board);
        return SearchResult { best_move: Some(mv), score, stats };
    }
    let mut best_move = None;
    let mut best_score = i32::MIN;
    for mv in candidates.moves {
        let score = evaluated_move(&mut owned, player, mv, &mut stats);
        if best_move.is_none() || score > best_score { best_move = Some(mv); best_score = score; }
    }
    debug_assert_eq!(&owned, board);
    SearchResult { best_move, score: if best_move.is_some() { best_score } else { 0 }, stats }
}

pub fn choose_move(board: &Board, player: Cell, difficulty: Difficulty, seed: u64) -> MoveDecision {
    let result = match difficulty {
        Difficulty::Easy | Difficulty::Normal => baseline(board, player, difficulty, seed),
        _ => search(board, player, difficulty.search_config()),
    };
    MoveDecision { result, strategy: difficulty.strategy(), difficulty }
}

/// A deterministic convenience wrapper. Randomness is injected via choose_move
/// or the WASM ai_move_seeded boundary.
pub fn best_move(board: &Board, player: Cell, difficulty: Difficulty) -> Option<Move> {
    choose_move(board, player, difficulty, 0).result.best_move
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn all_six_difficulties_have_stable_ids_and_explicit_strategies() {
        for (id, level, depth, cap) in [
            (0, Difficulty::Easy, 0, None), (1, Difficulty::Normal, 1, None),
            (2, Difficulty::Hard, 2, Some(15)), (5, Difficulty::VeryHard, 3, Some(12)),
            (3, Difficulty::Expert, 4, Some(10)), (4, Difficulty::Master, 5, Some(8)),
        ] {
            assert_eq!(Difficulty::from_id(id), level); assert_eq!(level.id(), id);
            assert_eq!(level.depth(), depth); assert_eq!(level.max_candidates(), cap);
        }
        assert_eq!(Difficulty::Easy.strategy(), "random");
        assert_eq!(Difficulty::Normal.strategy(), "rule_based");
    }
    #[test]
    fn random_is_seeded_legal_and_is_not_a_noisy_minimax() {
        let mut board = Board::new(); board.place(7, 7, Cell::Black).unwrap();
        let a = choose_move(&board, Cell::White, Difficulty::Easy, 42);
        let b = choose_move(&board, Cell::White, Difficulty::Easy, 42);
        assert_eq!(a.result.best_move, b.result.best_move);
        let mv = a.result.best_move.unwrap();
        assert_eq!(board.get_checked(mv.0, mv.1), Some(Cell::Empty));
        assert_eq!(a.result.stats.completed_depth, 0);
        assert_eq!(a.result.stats.candidate_moves_generated, 224);
        assert_eq!(a.result.stats.ordering_evaluations, 0);
        let moves: std::collections::HashSet<_> = (0..20).map(|seed| choose_move(&board, Cell::White, Difficulty::Easy, seed).result.best_move).collect();
        assert!(moves.len() > 1);
    }
    #[test]
    fn rule_based_completes_gap_and_blocks_single_opponent_win() {
        let mut broken = Board::new();
        for x in [3, 4, 6, 7] { broken.place(x, 7, Cell::White).unwrap(); }
        assert_eq!(best_move(&broken, Cell::White, Difficulty::Normal), Some((5, 7)));
        let mut threat = Board::new();
        for x in 0..4 { threat.place(x, 0, Cell::Black).unwrap(); }
        assert_eq!(best_move(&threat, Cell::White, Difficulty::Normal), Some((4, 0)));
    }
    #[test]
    fn rule_based_prefers_own_win_over_blocking_an_opponent_win() {
        let mut board = Board::new();
        for x in 0..4 { board.place(x, 0, Cell::Black).unwrap(); board.place(x, 14, Cell::White).unwrap(); }
        assert_eq!(best_move(&board, Cell::White, Difficulty::Normal), Some((4, 14)));
    }
    #[test]
    fn empty_board_search_and_rule_based_choose_center() {
        for level in [Difficulty::Normal, Difficulty::Hard] {
            assert_eq!(best_move(&Board::new(), Cell::Black, level), Some((7, 7)));
        }
    }
    #[test]
    fn all_strategies_return_none_when_game_has_ended() {
        let mut board = Board::new();
        for x in 0..5 { board.place(x, 0, Cell::Black).unwrap(); }
        for id in 0..=5 { assert_eq!(best_move(&board, Cell::White, Difficulty::from_id(id)), None); }
    }
}
