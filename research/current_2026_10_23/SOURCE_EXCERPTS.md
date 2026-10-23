# Source excerpts — exact current source

Generated 2026-10-23T04:54:54.930244+00:00; source hashes identify local edits, not a new commit. Range is an evidence locator. Code is extracted without rewriting.

## W1/W2 — pub fn get_checked

Source: [gomoku-main/engine/src/board.rs](../../gomoku-main/engine/src/board.rs) lines 41–43; SHA256 35d64b2e80041342a673da2f9cf8b4e5457c331f873e4230cdec7efd439a13fe.

~~~rust
pub fn get_checked(&self, x: usize, y: usize) -> Option<Cell> {
        self.cells.get(y).and_then(|row| row.get(x)).copied()
    }
~~~

## W2 — pub fn place

Source: [gomoku-main/engine/src/board.rs](../../gomoku-main/engine/src/board.rs) lines 45–58; SHA256 35d64b2e80041342a673da2f9cf8b4e5457c331f873e4230cdec7efd439a13fe.

~~~rust
pub fn place(&mut self, x: usize, y: usize, stone: Cell) -> Result<(), &'static str> {
        if x >= SIZE || y >= SIZE {
            return Err("out of bounds");
        }
        if stone == Cell::Empty {
            return Err("cannot place an empty cell");
        }
        if self.cells[y][x] != Cell::Empty {
            return Err("cell occupied");
        }
        self.cells[y][x] = stone;
        self.move_count += 1;
        Ok(())
    }
~~~

## W2 — pub fn undo

Source: [gomoku-main/engine/src/board.rs](../../gomoku-main/engine/src/board.rs) lines 62–69; SHA256 35d64b2e80041342a673da2f9cf8b4e5457c331f873e4230cdec7efd439a13fe.

~~~rust
pub fn undo(&mut self, x: usize, y: usize) -> bool {
        if self.get_checked(x, y).is_none_or(|cell| cell == Cell::Empty) {
            return false;
        }
        self.cells[y][x] = Cell::Empty;
        self.move_count -= 1;
        true
    }
~~~

## W2 — pub fn check_winner_at

Source: [gomoku-main/engine/src/board.rs](../../gomoku-main/engine/src/board.rs) lines 81–93; SHA256 35d64b2e80041342a673da2f9cf8b4e5457c331f873e4230cdec7efd439a13fe.

~~~rust
pub fn check_winner_at(&self, x: usize, y: usize) -> Option<Cell> {
        let cell = self.get_checked(x, y)?;
        if cell == Cell::Empty {
            return None;
        }
        let directions: [(i32, i32); 4] = [(1, 0), (0, 1), (1, 1), (1, -1)];
        for &(dx, dy) in &directions {
            if self.count_line_through(x, y, dx, dy, cell) >= 5 {
                return Some(cell);
            }
        }
        None
    }
~~~

## W4 — pub fn terminal_utility

Source: [gomoku-main/engine/src/eval.rs](../../gomoku-main/engine/src/eval.rs) lines 7–14; SHA256 eec5757ca15216c782820588c2e7fc250fa7fe5e34a4737dee740063534f0d15.

~~~rust
pub fn terminal_utility(winner: Option<Cell>, full: bool, player: Cell, ply: usize) -> Option<i32> {
    match winner {
        Some(winner) if winner == player => Some(MATE_SCORE - ply.min(SIZE * SIZE) as i32),
        Some(_) => Some(-MATE_SCORE + ply.min(SIZE * SIZE) as i32),
        None if full => Some(0),
        None => None,
    }
}
~~~

## W4 — pub fn evaluate

Source: [gomoku-main/engine/src/eval.rs](../../gomoku-main/engine/src/eval.rs) lines 38–81; SHA256 eec5757ca15216c782820588c2e7fc250fa7fe5e34a4737dee740063534f0d15.

~~~rust
pub fn evaluate(board: &Board, player: Cell) -> i32 {
    let opponent = player.opponent();
    let mut score = 0i32;

    let directions: [(i32, i32); 4] = [(1, 0), (0, 1), (1, 1), (1, -1)];

    for y in 0..SIZE {
        for x in 0..SIZE {
            let cell = board.get(x, y);
            if cell == Cell::Empty {
                continue;
            }

            for &(dx, dy) in &directions {
                let px = x as i32 - dx;
                let py = y as i32 - dy;
                if px >= 0 && px < SIZE as i32 && py >= 0 && py < SIZE as i32 {
                    if board.get(px as usize, py as usize) == cell {
                        continue;
                    }
                }

                let (count, open_ends) = count_line(board, x, y, dx, dy, cell);
                let ps = pattern_score(count, open_ends);

                if cell == player {
                    score += ps;
                } else if cell == opponent {
                    score -= ps;
                }
            }

            if cell == player {
                let center_dist = ((x as i32 - 7).abs() + (y as i32 - 7).abs()) as i32;
                score += (14 - center_dist).max(0);
            } else if cell == opponent {
                let center_dist = ((x as i32 - 7).abs() + (y as i32 - 7).abs()) as i32;
                score -= (14 - center_dist).max(0);
            }
        }
    }

    score.clamp(-HEURISTIC_LIMIT, HEURISTIC_LIMIT)
}
~~~

## W5/W6 — fn value(

Source: [gomoku-main/engine/src/search.rs](../../gomoku-main/engine/src/search.rs) lines 62–97; SHA256 3bea1e8366054a78b7ce4165319b3beb6fbd24144d6504201e26d25a1fbba1dd.

~~~rust
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
~~~

## W5 — pub fn search(

Source: [gomoku-main/engine/src/search.rs](../../gomoku-main/engine/src/search.rs) lines 139–144; SHA256 3bea1e8366054a78b7ce4165319b3beb6fbd24144d6504201e26d25a1fbba1dd.

~~~rust
pub fn search(board: &Board, player: Cell, config: SearchConfig) -> SearchResult {
    let mut owned = board.clone();
    let result = search_in_place(&mut owned, player, config);
    debug_assert_eq!(&owned, board, "search must restore its working board");
    result
}
~~~

## W7 — pub fn select_candidates

Source: [gomoku-main/engine/src/candidates.rs](../../gomoku-main/engine/src/candidates.rs) lines 79–110; SHA256 9a83974ad61d8bcae016561f1db35ebb45a8b826c3ee8ec524cd12277ff776ea.

~~~rust
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
~~~

## W4/W7 — pub fn choose_move

Source: [gomoku-main/engine/src/ai.rs](../../gomoku-main/engine/src/ai.rs) lines 107–113; SHA256 4e118d28036c321c9dd9835b92428a11340aa0220a8a9fcf34b1072d1433ba62.

~~~rust
pub fn choose_move(board: &Board, player: Cell, difficulty: Difficulty, seed: u64) -> MoveDecision {
    let result = match difficulty {
        Difficulty::Easy | Difficulty::Normal => baseline(board, player, difficulty, seed),
        _ => search(board, player, difficulty.search_config()),
    };
    MoveDecision { result, strategy: difficulty.strategy(), difficulty }
}
~~~

## W4/W7 — fn baseline(

Source: [gomoku-main/engine/src/ai.rs](../../gomoku-main/engine/src/ai.rs) lines 71–105; SHA256 4e118d28036c321c9dd9835b92428a11340aa0220a8a9fcf34b1072d1433ba62.

~~~rust
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
~~~

## W3/W4 — pub fn compute_ai_move

Source: [gomoku-main/engine/src/lib.rs](../../gomoku-main/engine/src/lib.rs) lines 135–152; SHA256 916d8e8d61587c24cbd3ba06d95577a10d07c31c18f77aa2c691a4301685d539.

~~~rust
pub fn compute_ai_move(&mut self, difficulty: Difficulty, seed: u64) -> Option<MoveResult> {
        if self.winner.is_some() || self.board.is_full() { return None; }
        let decision = ai::choose_move(&self.board, self.current_player, difficulty, seed);
        let (x, y) = decision.result.best_move?;
        self.board.place(x, y, self.current_player).ok()?;
        self.move_history.push((x, y));
        self.winner = self.board.check_winner_at(x, y);
        let winner = self.winner.map(|cell| match cell {
            Cell::Black => "black".to_string(), Cell::White => "white".to_string(),
            Cell::Empty => unreachable!(),
        });
        self.current_player = self.current_player.opponent();
        Some(MoveResult {
            x, y, winner, score: decision.result.score,
            strategy: decision.strategy, difficulty: decision.difficulty.label(),
            stats: decision.result.stats,
        })
    }
~~~

## W3 — export function executeWasmSearch

Source: [10_caro/src/game/wasm/executeSearch.ts](../../10_caro/src/game/wasm/executeSearch.ts) lines 29–69; SHA256 0d747f78597af665512db77938ed607291d55cf15ebfe76a3437d10cbb08daf5.

~~~typescript
export function executeWasmSearch(
  request: WasmAIRequest,
  Game: new () => WasmGame,
  now: () => number = () => performance.now(),
): WasmAIResult {
  if (!BOT_DIFFICULTIES.includes(request.difficulty)) throw new Error("Unsupported AI difficulty")
  const startedAt = now()
  const game = new Game()
  let move: RustMoveResult | null
  try {
    for (const item of request.history) {
      if (!game.play_move(item.cell.col, item.cell.row)) {
        throw new Error(`Unable to hydrate Gomoku engine at move ${item.index}`)
      }
    }
    move = readMoveResult(game.ai_move(WASM_DIFFICULTIES[request.difficulty]), request.difficulty)
  } finally {
    game.free()
  }
  const elapsedMs = now() - startedAt
  return {
    requestId: request.requestId,
    roundId: request.roundId,
    difficulty: request.difficulty,
    move: move ? { row: move.y, col: move.x } : null,
    stats: {
      depth: move?.stats.completed_depth ?? null,
      nodes: move?.stats.nodes_visited ?? null,
      cutoffs: move?.stats.cutoffs ?? null,
      leafEvaluations: move?.stats.leaf_evaluations ?? null,
      orderingEvaluations: move?.stats.ordering_evaluations ?? null,
      candidateMovesGenerated: move?.stats.candidate_moves_generated ?? null,
      score: move?.score ?? null,
      strategy: move?.strategy ?? (request.difficulty === "easy" ? "random" : request.difficulty === "normal" ? "rule_based" : "alpha_beta"),
      source: "rust",
      elapsedMs,
      elapsedScope: "worker-hydrate-and-search",
      reason: move ? "completed" : "no-move",
    },
  }
}
~~~

## W3 — undo():

Source: [10_caro/src/app/GameController.ts](../../10_caro/src/app/GameController.ts) lines 118–130; SHA256 4badda99a492e4488497b216844e5538e6bab531ec47f5151ac3ec089acd7d2f.

~~~typescript
  undo(): boolean {
    if (this.paused || this.state.moveCount === 0) return false
    const match = this.match.snapshot()
    const last = this.state.lastMove!
    const count = match.mode === "ai" && last.player === "O" ? 2 : 1
    this.invalidateAiTurn()
    this.clearSearchFeedback()
    for (let index = 0; index < count; index++) this.state.undoLast()
    this.currentPlayer = this.state.lastMove?.player === "X" ? "O" : "X"
    this.match.resumeAfterUndo(this.state.moveCount > 0)
    this.notify()
    return true
  }
~~~

## W3 — private fitBoardToViewport

Source: [10_caro/src/pixi/CaroScene.ts](../../10_caro/src/pixi/CaroScene.ts) lines 124–136; SHA256 eb0af9e5adb25052574c9b99c82d6decb67c018c3b62284f468259ef7a5d916d.

~~~typescript
  private fitBoardToViewport(viewport: ViewportSize): void {
    const boardPixels = BOARD_SIZE * CELL_SIZE
    const padding = viewport.width < 500 ? 10 : BOARD_PADDING
    const availableWidth = Math.max(1, viewport.width - padding * 2)
    const availableHeight = Math.max(1, viewport.height - padding * 2)
    const zoom = Math.min(availableWidth / boardPixels, availableHeight / boardPixels)
    this.camera.setZoom(zoom)
    this.camera.panTo(
      (viewport.width - boardPixels * zoom) / 2,
      (viewport.height - boardPixels * zoom) / 2,
    )
    this.lastFittedViewport = { ...viewport }
  }
~~~
