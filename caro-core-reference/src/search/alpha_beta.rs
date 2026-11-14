use crate::evaluator::{evaluate, MATE_SCORE};
use crate::metrics::{SearchResult, SearchStats};
use crate::model::{GameStatus, Move, Player};
use crate::state::GameState;

use super::ordering::order_moves;
use super::{generate_moves, SearchConfig};

#[inline]
fn terminal_score(status: GameStatus, root: Player, ply: u16) -> Option<i32> {
    match status {
        GameStatus::Won(player) if player == root => Some(MATE_SCORE - ply as i32),
        GameStatus::Won(_) => Some(-MATE_SCORE + ply as i32),
        GameStatus::Draw => Some(0),
        GameStatus::Playing => None,
    }
}

fn value(
    state: &mut GameState,
    depth: u8,
    root: Player,
    ply: u16,
    config: SearchConfig,
    stats: &mut SearchStats,
    mut alpha: i32,
    mut beta: i32,
) -> i32 {
    stats.nodes_visited += 1;

    if let Some(score) = terminal_score(state.status(), root, ply) {
        stats.leaf_evaluations += 1;
        return score;
    }
    if depth == 0 {
        stats.leaf_evaluations += 1;
        return evaluate(state, root, config.weights);
    }

    let maximizing = state.to_move() == root;
    let mut moves = generate_moves(state, config.move_mode);
    stats.candidate_moves_generated += moves.len() as u64;

    if moves.is_empty() {
        stats.leaf_evaluations += 1;
        return evaluate(state, root, config.weights);
    }

    if config.use_move_ordering {
        order_moves(state, &mut moves, root, config.weights, stats, None);
    }

    if maximizing {
        let mut best = i32::MIN;
        for (i, mv) in moves.iter().copied().enumerate() {
            let Ok(undo) = state.play(mv) else {
                continue;
            };
            let child = value(state, depth - 1, root, ply + 1, config, stats, alpha, beta);
            state.undo(undo);

            best = best.max(child);
            alpha = alpha.max(best);
            if alpha >= beta {
                stats.cutoffs += 1;
                stats.skipped_siblings += (moves.len() - i - 1) as u64;
                break;
            }
        }
        best
    } else {
        let mut best = i32::MAX;
        for (i, mv) in moves.iter().copied().enumerate() {
            let Ok(undo) = state.play(mv) else {
                continue;
            };
            let child = value(state, depth - 1, root, ply + 1, config, stats, alpha, beta);
            state.undo(undo);

            best = best.min(child);
            beta = beta.min(best);
            if alpha >= beta {
                stats.cutoffs += 1;
                stats.skipped_siblings += (moves.len() - i - 1) as u64;
                break;
            }
        }
        best
    }
}

pub fn search_alpha_beta(state: &mut GameState, config: SearchConfig) -> SearchResult {
    let root = state.to_move();
    let mut stats = SearchStats {
        nodes_visited: 1,
        ..SearchStats::default()
    };

    if let Some(score) = terminal_score(state.status(), root, 0) {
        stats.leaf_evaluations = 1;
        return SearchResult { best_move: None, score, stats };
    }
    if config.depth == 0 {
        stats.leaf_evaluations = 1;
        return SearchResult {
            best_move: None,
            score: evaluate(state, root, config.weights),
            stats,
        };
    }

    let mut moves = generate_moves(state, config.move_mode);
    stats.candidate_moves_generated += moves.len() as u64;
    if moves.is_empty() {
        stats.leaf_evaluations = 1;
        return SearchResult {
            best_move: None,
            score: evaluate(state, root, config.weights),
            stats,
        };
    }
    if config.use_move_ordering {
        order_moves(state, &mut moves, root, config.weights, &mut stats, None);
    }

    let mut best_move: Option<Move> = None;
    let mut best_score = i32::MIN;
    let mut alpha = i32::MIN;
    let beta = i32::MAX;

    for (i, mv) in moves.iter().copied().enumerate() {
        let Ok(undo) = state.play(mv) else {
            continue;
        };
        let score = value(
            state,
            config.depth.saturating_sub(1),
            root,
            1,
            config,
            &mut stats,
            alpha,
            beta,
        );
        state.undo(undo);

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
    SearchResult {
        best_move,
        score: best_score,
        stats,
    }
}
