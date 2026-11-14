use crate::evaluator::{evaluate, MATE_SCORE};
use crate::metrics::{SearchResult, SearchStats};
use crate::model::{GameStatus, Player};
use crate::state::GameState;
use crate::zobrist::Zobrist;

use super::ordering::order_moves;
use super::transposition::{Bound, TTEntry, TranspositionTable};
use super::{generate_moves, SearchConfig};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SearchAbort {
    NodeBudgetExhausted,
}

#[inline]
fn terminal_score(status: GameStatus, root: Player, ply: u16) -> Option<i32> {
    match status {
        GameStatus::Won(player) if player == root => Some(MATE_SCORE - ply as i32),
        GameStatus::Won(_) => Some(-MATE_SCORE + ply as i32),
        GameStatus::Draw => Some(0),
        GameStatus::Playing => None,
    }
}

#[inline]
fn consume_node(stats: &mut SearchStats, remaining: &mut Option<u64>) -> Result<(), SearchAbort> {
    if let Some(left) = remaining.as_mut() {
        if *left == 0 {
            return Err(SearchAbort::NodeBudgetExhausted);
        }
        *left -= 1;
    }
    stats.nodes_visited += 1;
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn value(
    state: &mut GameState,
    depth: u8,
    root: Player,
    ply: u16,
    config: SearchConfig,
    stats: &mut SearchStats,
    mut alpha: i32,
    mut beta: i32,
    hash: u64,
    zobrist: &Zobrist,
    tt: &mut TranspositionTable,
    remaining_nodes: &mut Option<u64>,
) -> Result<i32, SearchAbort> {
    consume_node(stats, remaining_nodes)?;

    if let Some(score) = terminal_score(state.status(), root, ply) {
        stats.leaf_evaluations += 1;
        return Ok(score);
    }
    if depth == 0 {
        stats.leaf_evaluations += 1;
        return Ok(evaluate(state, root, config.weights));
    }

    let alpha_original = alpha;
    let beta_original = beta;
    let mut preferred = None;

    stats.tt_lookups += 1;
    if let Some(entry) = tt.get(hash) {
        preferred = entry.best_move;
        if entry.depth >= depth {
            stats.tt_hits += 1;
            match entry.bound {
                Bound::Exact => return Ok(entry.score),
                Bound::Lower => alpha = alpha.max(entry.score),
                Bound::Upper => beta = beta.min(entry.score),
            }
            if alpha >= beta {
                return Ok(entry.score);
            }
        }
    }

    let maximizing = state.to_move() == root;
    let mut moves = generate_moves(state, config.move_mode);
    stats.candidate_moves_generated += moves.len() as u64;
    if moves.is_empty() {
        stats.leaf_evaluations += 1;
        return Ok(evaluate(state, root, config.weights));
    }

    if config.use_move_ordering || preferred.is_some() {
        order_moves(
            state,
            &mut moves,
            root,
            config.weights,
            stats,
            preferred,
        );
    }

    let mut best_move = None;
    let mut best = if maximizing { i32::MIN } else { i32::MAX };

    for (i, mv) in moves.iter().copied().enumerate() {
        let mover = state.to_move();
        let Ok(undo) = state.play(mv) else {
            continue;
        };
        let side_changed = undo.previous_to_move() != state.to_move();
        let child_hash = zobrist.after_play(hash, mv, mover, side_changed);
        let child = value(
            state,
            depth - 1,
            root,
            ply + 1,
            config,
            stats,
            alpha,
            beta,
            child_hash,
            zobrist,
            tt,
            remaining_nodes,
        );
        state.undo(undo);
        let child = child?;

        if maximizing {
            if best_move.is_none() || child > best {
                best = child;
                best_move = Some(mv);
            }
            alpha = alpha.max(best);
        } else {
            if best_move.is_none() || child < best {
                best = child;
                best_move = Some(mv);
            }
            beta = beta.min(best);
        }

        if alpha >= beta {
            stats.cutoffs += 1;
            stats.skipped_siblings += (moves.len() - i - 1) as u64;
            break;
        }
    }

    let bound = if best <= alpha_original {
        Bound::Upper
    } else if best >= beta_original {
        Bound::Lower
    } else {
        Bound::Exact
    };
    tt.store(
        hash,
        TTEntry {
            depth,
            score: best,
            bound,
            best_move,
        },
    );

    Ok(best)
}

pub fn search_optimized_alpha_beta(
    state: &mut GameState,
    config: SearchConfig,
    zobrist: &Zobrist,
    tt: &mut TranspositionTable,
    node_budget: Option<u64>,
) -> Result<SearchResult, SearchAbort> {
    let root = state.to_move();
    let mut stats = SearchStats::default();
    let mut remaining = node_budget;
    consume_node(&mut stats, &mut remaining)?;

    if let Some(score) = terminal_score(state.status(), root, 0) {
        stats.leaf_evaluations = 1;
        return Ok(SearchResult { best_move: None, score, stats });
    }
    if config.depth == 0 {
        stats.leaf_evaluations = 1;
        return Ok(SearchResult {
            best_move: None,
            score: evaluate(state, root, config.weights),
            stats,
        });
    }

    let root_hash = zobrist.hash(state);
    let mut moves = generate_moves(state, config.move_mode);
    stats.candidate_moves_generated += moves.len() as u64;
    if moves.is_empty() {
        stats.leaf_evaluations = 1;
        return Ok(SearchResult {
            best_move: None,
            score: evaluate(state, root, config.weights),
            stats,
        });
    }

    let preferred = tt.get(root_hash).and_then(|entry| entry.best_move);
    if config.use_move_ordering || preferred.is_some() {
        order_moves(
            state,
            &mut moves,
            root,
            config.weights,
            &mut stats,
            preferred,
        );
    }

    let mut best_move = None;
    let mut best_score = i32::MIN;
    let mut alpha = i32::MIN;
    let beta = i32::MAX;

    for (i, mv) in moves.iter().copied().enumerate() {
        let mover = state.to_move();
        let undo = match state.play(mv) {
            Ok(undo) => undo,
            Err(_) => continue,
        };
        let child_hash = zobrist.after_play(
            root_hash,
            mv,
            mover,
            undo.previous_to_move() != state.to_move(),
        );
        let score = value(
            state,
            config.depth - 1,
            root,
            1,
            config,
            &mut stats,
            alpha,
            beta,
            child_hash,
            zobrist,
            tt,
            &mut remaining,
        );
        state.undo(undo);
        let score = score?;

        if best_move.is_none() || score > best_score {
            best_move = Some(mv);
            best_score = score;
        }
        alpha = alpha.max(best_score);
        if alpha >= beta {
            stats.cutoffs += 1;
            stats.skipped_siblings += (moves.len() - i - 1) as u64;
            break;
        }
    }

    stats.completed_depth = config.depth;
    tt.store(
        root_hash,
        TTEntry {
            depth: config.depth,
            score: best_score,
            bound: Bound::Exact,
            best_move,
        },
    );

    Ok(SearchResult {
        best_move,
        score: best_score,
        stats,
    })
}
