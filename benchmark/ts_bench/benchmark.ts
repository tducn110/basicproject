/**
 * TypeScript Benchmark Runner for Caro Search Engine
 * Implements the exact same board representation, candidate generation,
 * pattern scoring, and Alpha-Beta search as the Rust reference engine.
 */

const BOARD_SIZE = 15;
const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE;
const MATE_SCORE = 10_000_000;

enum Player {
  None = 0,
  X = 1,
  O = -1,
}

interface PatternCounts {
  five_or_more: number;
  open_four: number;
  closed_four: number;
  open_three: number;
  closed_three: number;
  open_two: number;
  closed_two: number;
}

interface SearchStats {
  nodes_visited: number;
  leaf_evaluations: number;
  cutoffs: number;
  candidate_moves_generated: number;
}

interface SearchResult {
  best_move: number;
  score: number;
  stats: SearchStats;
}

class GameState {
  board: Int8Array;
  to_move: Player;
  move_count: number;
  last_move: number;

  constructor() {
    this.board = new Int8Array(BOARD_CELLS);
    this.to_move = Player.X;
    this.move_count = 0;
    this.last_move = -1;
  }

  setCell(row: number, col: number, player: Player) {
    const idx = row * BOARD_SIZE + col;
    if (this.board[idx] === 0 && player !== Player.None) {
      this.move_count++;
    } else if (this.board[idx] !== 0 && player === Player.None) {
      this.move_count--;
    }
    this.board[idx] = player;
  }

  play(idx: number): { prev_to_move: Player; prev_last_move: number } {
    const prev_to_move = this.to_move;
    const prev_last_move = this.last_move;
    this.board[idx] = this.to_move;
    this.move_count++;
    this.last_move = idx;
    this.to_move = this.to_move === Player.X ? Player.O : Player.X;
    return { prev_to_move, prev_last_move };
  }

  undo(idx: number, token: { prev_to_move: Player; prev_last_move: number }) {
    this.board[idx] = Player.None;
    this.move_count--;
    this.to_move = token.prev_to_move;
    this.last_move = token.prev_last_move;
  }

  checkWinAt(idx: number): boolean {
    if (idx < 0) return false;
    const r = Math.floor(idx / BOARD_SIZE);
    const c = idx % BOARD_SIZE;
    const p = this.board[idx];
    if (p === Player.None) return false;

    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of dirs) {
      let count = 1;
      // positive direction
      for (let s = 1; s < 5; s++) {
        const nr = r + dr * s;
        const nc = c + dc * s;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (this.board[nr * BOARD_SIZE + nc] === p) count++;
        else break;
      }
      // negative direction
      for (let s = 1; s < 5; s++) {
        const nr = r - dr * s;
        const nc = c - dc * s;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
        if (this.board[nr * BOARD_SIZE + nc] === p) count++;
        else break;
      }
      if (count >= 5) return true;
    }
    return false;
  }
}

function countPatterns(state: GameState, player: Player): PatternCounts {
  const counts: PatternCounts = {
    five_or_more: 0,
    open_four: 0,
    closed_four: 0,
    open_three: 0,
    closed_three: 0,
    open_two: 0,
    closed_two: 0,
  };

  const board = state.board;
  const dirs = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dr, dc] of dirs) {
    const visited = new Uint8Array(BOARD_CELLS);

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const idx = r * BOARD_SIZE + c;
        if (board[idx] !== player || visited[idx]) continue;

        // Check if this is the start of a run in this direction
        const prevR = r - dr;
        const prevC = c - dc;
        if (
          prevR >= 0 &&
          prevR < BOARD_SIZE &&
          prevC >= 0 &&
          prevC < BOARD_SIZE &&
          board[prevR * BOARD_SIZE + prevC] === player
        ) {
          continue;
        }

        // Count contiguous run length
        let len = 0;
        let currR = r;
        let currC = c;
        while (
          currR >= 0 &&
          currR < BOARD_SIZE &&
          currC >= 0 &&
          currC < BOARD_SIZE &&
          board[currR * BOARD_SIZE + currC] === player
        ) {
          visited[currR * BOARD_SIZE + currC] = 1;
          len++;
          currR += dr;
          currC += dc;
        }

        // Determine open ends
        let openEnds = 0;
        if (
          prevR >= 0 &&
          prevR < BOARD_SIZE &&
          prevC >= 0 &&
          prevC < BOARD_SIZE &&
          board[prevR * BOARD_SIZE + prevC] === Player.None
        ) {
          openEnds++;
        }
        if (
          currR >= 0 &&
          currR < BOARD_SIZE &&
          currC >= 0 &&
          currC < BOARD_SIZE &&
          board[currR * BOARD_SIZE + currC] === Player.None
        ) {
          openEnds++;
        }

        if (len >= 5) counts.five_or_more++;
        else if (len === 4) {
          if (openEnds === 2) counts.open_four++;
          else if (openEnds === 1) counts.closed_four++;
        } else if (len === 3) {
          if (openEnds === 2) counts.open_three++;
          else if (openEnds === 1) counts.closed_three++;
        } else if (len === 2) {
          if (openEnds === 2) counts.open_two++;
          else if (openEnds === 1) counts.closed_two++;
        }
      }
    }
  }

  return counts;
}

function scoreCounts(c: PatternCounts): number {
  return (
    c.five_or_more * 1_000_000 +
    c.open_four * 100_000 +
    c.closed_four * 20_000 +
    c.open_three * 5_000 +
    c.closed_three * 500 +
    c.open_two * 100 +
    c.closed_two * 10
  );
}

function evaluate(state: GameState, perspective: Player): number {
  if (state.last_move >= 0 && state.checkWinAt(state.last_move)) {
    const winner = state.board[state.last_move];
    return winner === perspective ? MATE_SCORE : -MATE_SCORE;
  }

  const opp = perspective === Player.X ? Player.O : Player.X;
  const attack = scoreCounts(countPatterns(state, perspective));
  const defense = scoreCounts(countPatterns(state, opp));
  const raw = attack - defense;

  if (raw >= MATE_SCORE) return MATE_SCORE - 1;
  if (raw <= -MATE_SCORE) return -MATE_SCORE + 1;
  return raw;
}

function generateCandidates(state: GameState, radius: number = 2): number[] {
  if (state.move_count === 0) {
    return [Math.floor(BOARD_SIZE / 2) * BOARD_SIZE + Math.floor(BOARD_SIZE / 2)];
  }

  const marked = new Uint8Array(BOARD_CELLS);
  const board = state.board;

  for (let idx = 0; idx < BOARD_CELLS; idx++) {
    if (board[idx] === 0) continue;
    const r = Math.floor(idx / BOARD_SIZE);
    const c = idx % BOARD_SIZE;

    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;
        const nidx = nr * BOARD_SIZE + nc;
        if (board[nidx] === 0) {
          marked[nidx] = 1;
        }
      }
    }
  }

  const moves: number[] = [];
  for (let idx = 0; idx < BOARD_CELLS; idx++) {
    if (marked[idx]) moves.push(idx);
  }
  return moves;
}

function alphaBetaValue(
  state: GameState,
  depth: number,
  root: Player,
  ply: number,
  alpha: number,
  beta: number,
  stats: SearchStats
): number {
  stats.nodes_visited++;

  if (state.last_move >= 0 && state.checkWinAt(state.last_move)) {
    stats.leaf_evaluations++;
    const winner = state.board[state.last_move];
    return winner === root ? MATE_SCORE - ply : -MATE_SCORE + ply;
  }

  if (depth === 0) {
    stats.leaf_evaluations++;
    return evaluate(state, root);
  }

  const maximizing = state.to_move === root;
  const moves = generateCandidates(state, 2);
  stats.candidate_moves_generated += moves.length;

  if (moves.length === 0) {
    stats.leaf_evaluations++;
    return evaluate(state, root);
  }

  if (maximizing) {
    let best = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const token = state.play(mv);
      const child = alphaBetaValue(state, depth - 1, root, ply + 1, alpha, beta, stats);
      state.undo(mv, token);

      if (child > best) best = child;
      if (best > alpha) alpha = best;
      if (alpha >= beta) {
        stats.cutoffs++;
        break;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < moves.length; i++) {
      const mv = moves[i];
      const token = state.play(mv);
      const child = alphaBetaValue(state, depth - 1, root, ply + 1, alpha, beta, stats);
      state.undo(mv, token);

      if (child < best) best = child;
      if (best < beta) beta = best;
      if (alpha >= beta) {
        stats.cutoffs++;
        break;
      }
    }
    return best;
  }
}

function searchAlphaBeta(state: GameState, depth: number): SearchResult {
  const root = state.to_move;
  const stats: SearchStats = {
    nodes_visited: 1,
    leaf_evaluations: 0,
    cutoffs: 0,
    candidate_moves_generated: 0,
  };

  const moves = generateCandidates(state, 2);
  stats.candidate_moves_generated += moves.length;

  let bestMove = moves[0] ?? -1;
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  for (let i = 0; i < moves.length; i++) {
    const mv = moves[i];
    const token = state.play(mv);
    const score = alphaBetaValue(state, depth - 1, root, 1, alpha, beta, stats);
    state.undo(mv, token);

    if (score > bestScore) {
      bestScore = score;
      bestMove = mv;
    }
    if (bestScore > alpha) {
      alpha = bestScore;
    }
  }

  return { best_move: bestMove, score: bestScore, stats };
}

function createTacticalFixture(): GameState {
  const state = new GameState();
  for (let col = 3; col <= 6; col++) {
    state.setCell(7, col, Player.X);
  }
  state.setCell(5, 5, Player.O);
  state.setCell(5, 6, Player.O);
  state.to_move = Player.X;
  return state;
}

function createMidgameFixture(): GameState {
  const state = new GameState();
  state.setCell(7, 7, Player.X);
  state.setCell(7, 8, Player.X);
  state.setCell(8, 7, Player.X);
  state.setCell(6, 9, Player.X);

  state.setCell(6, 7, Player.O);
  state.setCell(6, 8, Player.O);
  state.setCell(8, 8, Player.O);
  state.setCell(9, 7, Player.O);
  state.to_move = Player.X;
  return state;
}

function benchAlphaBeta(name: string, factory: () => GameState, maxDepth: number) {
  const results = [];

  for (let depth = 1; depth <= maxDepth; depth++) {
    // Warmup
    const warmState = factory();
    searchAlphaBeta(warmState, depth);

    const iterations = depth === 1 ? 50 : depth === 2 ? 20 : depth === 3 ? 5 : 2;

    const start = performance.now();
    let totalNodes = 0;
    let totalCutoffs = 0;
    let lastScore = 0;

    for (let i = 0; i < iterations; i++) {
      const state = factory();
      const res = searchAlphaBeta(state, depth);
      totalNodes += res.stats.nodes_visited;
      totalCutoffs += res.stats.cutoffs;
      lastScore = res.score;
    }

    const elapsed = performance.now() - start;
    const avgTimeMs = elapsed / iterations;
    const avgNodes = Math.round(totalNodes / iterations);
    const avgCutoffs = Math.round(totalCutoffs / iterations);
    const knps = avgTimeMs > 0 ? Number(((avgNodes / avgTimeMs)).toFixed(2)) : 0;

    results.push({
      engine: "TypeScript",
      fixture: name,
      depth,
      time_ms: Number(avgTimeMs.toFixed(4)),
      nodes: avgNodes,
      cutoffs: avgCutoffs,
      knps,
      score: lastScore,
    });
  }

  console.log(JSON.stringify(results, null, 2));
}

const fixture = process.argv[2] ?? "midgame";
if (fixture === "tactical") {
  benchAlphaBeta("tactical", createTacticalFixture, 4);
} else {
  benchAlphaBeta("midgame", createMidgameFixture, 4);
}
