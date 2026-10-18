//! Freestyle Gomoku (five or more wins), 15x15, deterministic Rust engine.
//! The mathematical specification is in docs/MATHEMATICAL_FOUNDATIONS_RUST.md.
//! This is a new implementation, not an assertion of parity with the old TS benchmark.

pub const SIZE: usize = 15;
pub const AREA: usize = SIZE * SIZE;
pub const WIN: usize = 5;
pub const MATE: i32 = 10_000_000;
const INF: i32 = 20_000_000;
const DIRS: [(i32, i32); 4] = [(0, 1), (1, 0), (1, 1), (1, -1)];

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u8)]
pub enum Player {
    X = 1,
    O = 2,
}
impl Player {
    pub const fn other(self) -> Self {
        match self {
            Self::X => Self::O,
            Self::O => Self::X,
        }
    }
    pub const fn byte(self) -> u8 {
        self as u8
    }
}
impl TryFrom<u8> for Player {
    type Error = &'static str;
    fn try_from(value: u8) -> Result<Self, Self::Error> {
        match value {
            1 => Ok(Self::X),
            2 => Ok(Self::O),
            _ => Err("player must be 1 (X) or 2 (O)"),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Move {
    pub row: u8,
    pub col: u8,
}
impl Move {
    pub const fn new(row: u8, col: u8) -> Self {
        Self { row, col }
    }
    pub const fn index(self) -> usize {
        self.row as usize * SIZE + self.col as usize
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Board {
    cells: [u8; AREA],
    occupied: usize,
}
impl Default for Board {
    fn default() -> Self {
        Self::new()
    }
}
impl Board {
    pub const fn new() -> Self {
        Self {
            cells: [0; AREA],
            occupied: 0,
        }
    }
    pub fn from_cells(cells: &[u8]) -> Result<Self, String> {
        if cells.len() != AREA {
            return Err(format!("expected {AREA} cells, got {}", cells.len()));
        }
        let mut result = Self::new();
        for (i, &value) in cells.iter().enumerate() {
            if value > 2 {
                return Err(format!("invalid cell value {value} at index {i}"));
            }
            result.cells[i] = value;
            if value != 0 {
                result.occupied += 1;
            }
        }
        Ok(result)
    }
    pub fn as_cells(&self) -> &[u8; AREA] {
        &self.cells
    }
    pub fn occupied(&self) -> usize {
        self.occupied
    }
    pub fn is_full(&self) -> bool {
        self.occupied == AREA
    }
    pub fn get(&self, row: i32, col: i32) -> Option<u8> {
        if row < 0 || col < 0 || row >= SIZE as i32 || col >= SIZE as i32 {
            None
        } else {
            Some(self.cells[row as usize * SIZE + col as usize])
        }
    }
    pub fn place(&mut self, mv: Move, player: Player) -> Result<(), &'static str> {
        if mv.row as usize >= SIZE || mv.col as usize >= SIZE {
            return Err("move outside board");
        }
        if self.cells[mv.index()] != 0 {
            return Err("cell already occupied");
        }
        self.cells[mv.index()] = player.byte();
        self.occupied += 1;
        Ok(())
    }
    pub fn undo(&mut self, mv: Move) -> Result<(), &'static str> {
        if mv.row as usize >= SIZE || mv.col as usize >= SIZE {
            return Err("move outside board");
        }
        if self.cells[mv.index()] == 0 {
            return Err("cannot undo an empty cell");
        }
        self.cells[mv.index()] = 0;
        self.occupied -= 1;
        Ok(())
    }
    fn ray(&self, mv: Move, player: Player, dr: i32, dc: i32) -> (usize, bool) {
        let mut r = mv.row as i32 + dr;
        let mut c = mv.col as i32 + dc;
        let mut length = 0;
        while length < WIN - 1 && self.get(r, c) == Some(player.byte()) {
            length += 1;
            r += dr;
            c += dc;
        }
        (length, self.get(r, c) == Some(0))
    }
    /// At most 4 axes x 2 rays x 4 neighboring stones = 32 comparisons.
    /// Correct for freestyle rules when the previous board was non-terminal.
    pub fn is_win_from(&self, mv: Move, player: Player) -> bool {
        if self.get(mv.row as i32, mv.col as i32) != Some(player.byte()) {
            return false;
        }
        DIRS.iter().any(|&(dr, dc)| {
            let (forward, _) = self.ray(mv, player, dr, dc);
            let (backward, _) = self.ray(mv, player, -dr, -dc);
            1 + forward + backward >= WIN
        })
    }
    pub fn has_any_win(&self) -> bool {
        for row in 0..SIZE {
            for col in 0..SIZE {
                let mv = Move::new(row as u8, col as u8);
                let player = match Player::try_from(self.cells[mv.index()]) {
                    Ok(player) => player,
                    Err(_) => continue,
                };
                if self.is_win_from(mv, player) {
                    return true;
                }
            }
        }
        false
    }
    /// Candidate cells within Chebyshev distance <= radius from an existing stone.
    /// Every legal cell is still a legal move; this set is only a search heuristic.
    pub fn candidates(&self, radius: u8) -> Vec<Move> {
        if self.occupied == 0 {
            return vec![Move::new((SIZE / 2) as u8, (SIZE / 2) as u8)];
        }
        let r = i32::from(radius.max(1));
        let mut mask = [false; AREA];
        for row in 0..SIZE {
            for col in 0..SIZE {
                if self.cells[row * SIZE + col] == 0 {
                    continue;
                }
                for dr in -r..=r {
                    for dc in -r..=r {
                        let nr = row as i32 + dr;
                        let nc = col as i32 + dc;
                        if let Some(0) = self.get(nr, nc) {
                            mask[nr as usize * SIZE + nc as usize] = true;
                        }
                    }
                }
            }
        }
        mask.iter()
            .enumerate()
            .filter_map(|(i, marked)| {
                marked.then_some(Move::new((i / SIZE) as u8, (i % SIZE) as u8))
            })
            .collect()
    }
    fn projected_priority(&self, mv: Move, player: Player) -> (i64, bool) {
        let mut score = 0_i64;
        let mut immediate_win = false;
        for &(dr, dc) in &DIRS {
            let (a, open_a) = self.ray(mv, player, dr, dc);
            let (b, open_b) = self.ray(mv, player, -dr, -dc);
            let length = 1 + a + b;
            let open_ends = usize::from(open_a) + usize::from(open_b);
            if length >= WIN {
                immediate_win = true;
            }
            score += run_score(length, open_ends);
        }
        (score, immediate_win)
    }
    fn score_for(&self, player: Player) -> i64 {
        let mut total = 0_i64;
        for &(dr, dc) in &DIRS {
            for row in 0..SIZE {
                for col in 0..SIZE {
                    // Visit each maximal line once, starting on its boundary.
                    if self.get(row as i32 - dr, col as i32 - dc).is_some() {
                        continue;
                    }
                    let mut line = Vec::with_capacity(SIZE);
                    let mut r = row as i32;
                    let mut c = col as i32;
                    while let Some(value) = self.get(r, c) {
                        line.push(value);
                        r += dr;
                        c += dc;
                    }
                    total += score_line(&line, player.byte());
                }
            }
        }
        total
    }
    /// Antisymmetric, zero-sum static evaluation for negamax.
    pub fn evaluate(&self, perspective: Player) -> i32 {
        let difference = self.score_for(perspective) - self.score_for(perspective.other());
        difference.clamp(i64::from(-MATE + 1_000), i64::from(MATE - 1_000)) as i32
    }
}

fn run_score(length: usize, open_ends: usize) -> i64 {
    if length >= WIN {
        return 1_000_000;
    }
    match (length, open_ends) {
        (4, 2) => 100_000,
        (4, 1) => 10_000,
        (3, 2) => 3_000,
        (3, 1) => 300,
        (2, 2) => 100,
        (2, 1) => 10,
        (1, 2) => 2,
        (1, 1) => 1,
        _ => 0,
    }
}
fn score_line(line: &[u8], player: u8) -> i64 {
    let mut score = 0;
    let mut i = 0;
    while i < line.len() {
        if line[i] != player {
            i += 1;
            continue;
        }
        let start = i;
        while i < line.len() && line[i] == player {
            i += 1;
        }
        let open_ends = usize::from(start > 0 && line[start - 1] == 0)
            + usize::from(i < line.len() && line[i] == 0);
        score += run_score(i - start, open_ends);
    }
    // Non-contiguous five-cell patterns, explicitly heuristic (not a win rule).
    // Endpoints must be friendly stones; this detects X_XXX, XX_XX, XXX_X.
    for window in line.windows(WIN) {
        if window.iter().any(|&cell| cell != 0 && cell != player) {
            continue;
        }
        if window[0] != player || window[WIN - 1] != player {
            continue;
        }
        let stones = window.iter().filter(|&&cell| cell == player).count();
        if stones == 4 {
            score += 15_000;
        } else if stones == 3 {
            score += 600;
        }
    }
    score
}

#[derive(Clone, Copy, Debug)]
pub struct SearchConfig {
    pub depth: u8,
    pub radius: u8,
    /// Zero means no cap. Positive values yield a selective, not exhaustive, search.
    pub max_candidates: usize,
    pub alpha_beta: bool,
}
impl Default for SearchConfig {
    fn default() -> Self {
        Self {
            depth: 3,
            radius: 2,
            max_candidates: 12,
            alpha_beta: true,
        }
    }
}
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub struct SearchStats {
    pub nodes_visited: u64,
    pub leaves: u64,
    /// Count of beta-cutoff events, not the number of skipped children.
    pub cutoffs: u64,
    pub candidates_generated: u64,
}
#[derive(Clone, Copy, Debug)]
pub struct SearchResult {
    pub best_move: Option<Move>,
    pub score: i32,
    pub stats: SearchStats,
}
fn ranked_moves(
    board: &Board,
    player: Player,
    config: SearchConfig,
    stats: &mut SearchStats,
) -> Vec<Move> {
    let candidates = board.candidates(config.radius);
    stats.candidates_generated += candidates.len() as u64;
    let mut ranked: Vec<(Move, i64)> = candidates
        .into_iter()
        .map(|mv| {
            let (attack, wins_now) = board.projected_priority(mv, player);
            let (defense, blocks_win) = board.projected_priority(mv, player.other());
            let priority = if wins_now {
                2_000_000_000_i64
            } else if blocks_win {
                1_000_000_000_i64
            } else {
                11 * attack + 10 * defense
            };
            (mv, priority)
        })
        .collect();
    ranked.sort_by(|a, b| {
        b.1.cmp(&a.1)
            .then_with(|| a.0.row.cmp(&b.0.row))
            .then_with(|| a.0.col.cmp(&b.0.col))
    });
    if config.max_candidates > 0 {
        ranked.truncate(config.max_candidates);
    }
    ranked.into_iter().map(|(mv, _)| mv).collect()
}
fn negamax(
    board: &mut Board,
    player: Player,
    depth: u8,
    mut alpha: i32,
    beta: i32,
    ply: i32,
    config: SearchConfig,
    stats: &mut SearchStats,
    last_move: Option<(Move, Player)>,
) -> i32 {
    stats.nodes_visited += 1;
    if let Some((mv, previous_player)) = last_move {
        if board.is_win_from(mv, previous_player) {
            stats.leaves += 1;
            return -MATE + ply;
        }
    }
    if board.is_full() {
        stats.leaves += 1;
        return 0;
    }
    if depth == 0 {
        stats.leaves += 1;
        return board.evaluate(player);
    }
    let moves = ranked_moves(board, player, config, stats);
    if moves.is_empty() {
        stats.leaves += 1;
        return 0;
    }
    let mut best = -INF;
    for mv in moves {
        board.place(mv, player).expect("candidate must be legal");
        let (child_alpha, child_beta) = if config.alpha_beta {
            (-beta, -alpha)
        } else {
            (-INF, INF)
        };
        let value = -negamax(
            board,
            player.other(),
            depth - 1,
            child_alpha,
            child_beta,
            ply + 1,
            config,
            stats,
            Some((mv, player)),
        );
        board.undo(mv).expect("placed move must be reversible");
        best = best.max(value);
        if config.alpha_beta {
            alpha = alpha.max(best);
            if alpha >= beta {
                stats.cutoffs += 1;
                break;
            }
        }
    }
    best
}
/// Root search; does not mutate the supplied board.
/// Assumes legal turn parity and no previous terminal position.
pub fn best_move(board: &Board, player: Player, config: SearchConfig) -> SearchResult {
    let mut stats = SearchStats {
        nodes_visited: 1,
        ..SearchStats::default()
    };
    if board.is_full() || board.has_any_win() {
        return SearchResult {
            best_move: None,
            score: 0,
            stats,
        };
    }
    let depth = config.depth.max(1);
    let moves = ranked_moves(board, player, config, &mut stats);
    let mut working = board.clone();
    let mut chosen = None;
    let mut best = -INF;
    let mut alpha = -INF;
    for mv in moves {
        working.place(mv, player).expect("candidate must be legal");
        let (child_alpha, child_beta) = if config.alpha_beta {
            (-INF, -alpha)
        } else {
            (-INF, INF)
        };
        let score = -negamax(
            &mut working,
            player.other(),
            depth - 1,
            child_alpha,
            child_beta,
            1,
            config,
            &mut stats,
            Some((mv, player)),
        );
        working.undo(mv).expect("placed move must be reversible");
        if score > best {
            best = score;
            chosen = Some(mv);
        }
        if config.alpha_beta {
            alpha = alpha.max(best);
        }
    }
    SearchResult {
        best_move: chosen,
        score: if chosen.is_some() { best } else { 0 },
        stats,
    }
}

#[cfg(feature = "wasm")]
mod wasm_api {
    use super::*;
    use wasm_bindgen::prelude::*;

    /// Input: 225 bytes, 0 empty / 1 X / 2 O.
    /// Output: [row, col, score, nodes, cutoffs], or [-1,-1,0,nodes,cutoffs].
    /// This API is synchronous: invoke it inside a dedicated Web Worker.
    #[wasm_bindgen]
    pub fn best_move_wasm(
        cells: &[u8],
        to_move: u8,
        depth: u8,
        max_candidates: u32,
    ) -> Result<Vec<i32>, JsValue> {
        let board = Board::from_cells(cells).map_err(|err| JsValue::from_str(&err))?;
        let player = Player::try_from(to_move).map_err(JsValue::from_str)?;
        let result = best_move(
            &board,
            player,
            SearchConfig {
                depth,
                max_candidates: max_candidates as usize,
                ..SearchConfig::default()
            },
        );
        let (row, col) = result
            .best_move
            .map_or((-1, -1), |mv| (i32::from(mv.row), i32::from(mv.col)));
        Ok(vec![
            row,
            col,
            result.score,
            i32::try_from(result.stats.nodes_visited).unwrap_or(i32::MAX),
            i32::try_from(result.stats.cutoffs).unwrap_or(i32::MAX),
        ])
    }
}
