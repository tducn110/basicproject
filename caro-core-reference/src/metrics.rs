use crate::model::Move;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct SearchStats {
    pub nodes_visited: u64,
    pub leaf_evaluations: u64,
    /// Number of alpha-beta cutoff events.
    pub cutoffs: u64,
    /// Number of remaining sibling moves skipped at cutoff points.
    /// This is not the number of all descendant nodes that would have existed.
    pub skipped_siblings: u64,
    pub candidate_moves_generated: u64,
    pub ordering_evaluations: u64,
    pub tt_lookups: u64,
    pub tt_hits: u64,
    pub completed_depth: u8,
}

impl SearchStats {
    pub fn merge_from(&mut self, other: SearchStats) {
        self.nodes_visited += other.nodes_visited;
        self.leaf_evaluations += other.leaf_evaluations;
        self.cutoffs += other.cutoffs;
        self.skipped_siblings += other.skipped_siblings;
        self.candidate_moves_generated += other.candidate_moves_generated;
        self.ordering_evaluations += other.ordering_evaluations;
        self.tt_lookups += other.tt_lookups;
        self.tt_hits += other.tt_hits;
        self.completed_depth = self.completed_depth.max(other.completed_depth);
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub stats: SearchStats,
}
