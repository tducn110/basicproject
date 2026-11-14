use crate::board::{Board, Cell, SIZE};

pub const MATE_SCORE: i32 = 100_000_000;
/// Reserve the entire possible 225-ply game below the weakest mate score.
pub const HEURISTIC_LIMIT: i32 = MATE_SCORE - (SIZE * SIZE) as i32 - 1;

pub fn terminal_utility(winner: Option<Cell>, full: bool, player: Cell, ply: usize) -> Option<i32> {
    match winner {
        Some(winner) if winner == player => Some(MATE_SCORE - ply.min(SIZE * SIZE) as i32),
        Some(_) => Some(-MATE_SCORE + ply.min(SIZE * SIZE) as i32),
        None if full => Some(0),
        None => None,
    }
}

/// Pattern scores calibrated from Week 11 self-play optimization
pub const SCORE_FIVE: i32 = 10_000_000;
pub const SCORE_OPEN_FOUR: i32 = 100_000;
pub const SCORE_HALF_FOUR: i32 = 10_000;
pub const SCORE_OPEN_THREE: i32 = 6_500;
pub const SCORE_HALF_THREE: i32 = 1_000;
pub const SCORE_OPEN_TWO: i32 = 500;
pub const SCORE_HALF_TWO: i32 = 100;
pub const SCORE_BROKEN_FOUR: i32 = 8_000;
pub const SCORE_BROKEN_THREE: i32 = 4_500;
pub const SCORE_SINGLE: i32 = 10;
pub const CENTER_GAMMA: i32 = 10;

/// Defense multiplier beta = 1.15 (CFG-OPTIMAL)
pub const DEFENSE_MULTIPLIER_NUMERATOR: i32 = 115;
pub const DEFENSE_MULTIPLIER_DENOMINATOR: i32 = 100;

fn evaluate_line_pattern(
    board: &Board,
    x: usize,
    y: usize,
    dx: i32,
    dy: i32,
    cell: Cell,
) -> i32 {
    let mut count = 0usize;
    let mut nx = x as i32;
    let mut ny = y as i32;

    while nx >= 0 && nx < SIZE as i32 && ny >= 0 && ny < SIZE as i32 {
        if board.get(nx as usize, ny as usize) != cell {
            break;
        }
        count += 1;
        nx += dx;
        ny += dy;
    }

    let mut empty_back = 0usize;
    let mut bx = x as i32 - dx;
    let mut by = y as i32 - dy;
    while bx >= 0 && bx < SIZE as i32 && by >= 0 && by < SIZE as i32 && empty_back < 5 {
        if board.get(bx as usize, by as usize) != Cell::Empty {
            break;
        }
        empty_back += 1;
        bx -= dx;
        by -= dy;
    }

    let mut empty_fwd = 0usize;
    let mut fx = nx;
    let mut fy = ny;
    while fx >= 0 && fx < SIZE as i32 && fy >= 0 && fy < SIZE as i32 && empty_fwd < 5 {
        if board.get(fx as usize, fy as usize) != Cell::Empty {
            break;
        }
        empty_fwd += 1;
        fx += dx;
        fy += dy;
    }

    let total_span = empty_back + count + empty_fwd;

    // RULE 1: Available Span Verification (Chống dồn góc/mép)
    // If total contiguous span is less than 5, this line can NEVER reach five-in-a-row!
    let mut pattern_score = if total_span < 5 {
        0
    } else {
        let open_ends = (if empty_back > 0 { 1 } else { 0 }) + (if empty_fwd > 0 { 1 } else { 0 });
        match count {
            5.. => SCORE_FIVE,
            4 => match open_ends {
                2 => SCORE_OPEN_FOUR,
                1 => SCORE_HALF_FOUR,
                _ => 0,
            },
            3 => match open_ends {
                2 => SCORE_OPEN_THREE,
                1 => SCORE_HALF_THREE,
                _ => 0,
            },
            2 => match open_ends {
                2 => SCORE_OPEN_TWO,
                1 => SCORE_HALF_TWO,
                _ => 0,
            },
            1 => SCORE_SINGLE,
            _ => 0,
        }
    };

    // RULE 2: Gapped / Broken Pattern Scanning (Chống đánh tách lẻ, e.g. X . X X hoặc X X . X X)
    if count < 4 && empty_fwd >= 1 {
        let gap_x = nx + dx;
        let gap_y = ny + dy;
        let mut post_count = 0usize;
        let mut gx = gap_x;
        let mut gy = gap_y;
        while gx >= 0 && gx < SIZE as i32 && gy >= 0 && gy < SIZE as i32 {
            if board.get(gx as usize, gy as usize) != cell {
                break;
            }
            post_count += 1;
            gx += dx;
            gy += dy;
        }

        if post_count > 0 {
            let threat = count + post_count;
            let gapped_span = total_span + post_count;
            if threat >= 3 && gapped_span >= 5 {
                let gapped_score = if threat >= 4 {
                    SCORE_BROKEN_FOUR
                } else {
                    SCORE_BROKEN_THREE
                };
                pattern_score = pattern_score.max(gapped_score);
            }
        }
    }

    pattern_score
}

pub fn evaluate(board: &Board, player: Cell) -> i32 {
    if player == Cell::Empty {
        return 0;
    }
    let opponent = player.opponent();
    let mut score_own = 0i32;
    let mut score_opp = 0i32;

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

                let ps = evaluate_line_pattern(board, x, y, dx, dy, cell);

                if cell == player {
                    score_own += ps;
                } else if cell == opponent {
                    score_opp += ps;
                }
            }

            // Spatial Chebyshev Center Proximity Kernel:
            // C(x, y) = max(0, 7 - max(|x - 7|, |y - 7|)) * CENTER_GAMMA
            let center_dist = (x as i32 - 7).abs().max((y as i32 - 7).abs());
            let bonus = (7 - center_dist).max(0) * CENTER_GAMMA;

            if cell == player {
                score_own += bonus;
            } else if cell == opponent {
                score_opp += bonus;
            }
        }
    }

    let score = score_own - (score_opp * DEFENSE_MULTIPLIER_NUMERATOR) / DEFENSE_MULTIPLIER_DENOMINATOR;
    score.clamp(-HEURISTIC_LIMIT, HEURISTIC_LIMIT)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board::{Board, Cell};

    #[test]
    fn test_empty_board_score_zero() {
        let board = Board::new();
        assert_eq!(evaluate(&board, Cell::Black), 0);
    }

    #[test]
    fn test_center_bonus() {
        let mut board = Board::new();
        board.place(7, 7, Cell::Black).unwrap();
        let score = evaluate(&board, Cell::Black);
        assert!(score > 0);
    }

    #[test]
    fn test_three_in_row_scores_higher_than_two() {
        let mut board2 = Board::new();
        board2.place(7, 7, Cell::Black).unwrap();
        board2.place(8, 7, Cell::Black).unwrap();

        let mut board3 = Board::new();
        board3.place(7, 7, Cell::Black).unwrap();
        board3.place(8, 7, Cell::Black).unwrap();
        board3.place(9, 7, Cell::Black).unwrap();

        let score2 = evaluate(&board2, Cell::Black);
        let score3 = evaluate(&board3, Cell::Black);
        assert!(score3 > score2, "three({score3}) should beat two({score2})");
    }

    #[test]
    fn test_opponent_stones_negative() {
        let mut board = Board::new();
        board.place(7, 7, Cell::White).unwrap();
        board.place(8, 7, Cell::White).unwrap();
        board.place(9, 7, Cell::White).unwrap();
        let score = evaluate(&board, Cell::Black);
        assert!(score < 0);
    }

    #[test]
    fn every_mate_utility_dominates_every_allowed_heuristic() {
        for ply in 0..=SIZE * SIZE {
            assert!(terminal_utility(Some(Cell::Black), false, Cell::Black, ply).unwrap() > HEURISTIC_LIMIT);
            assert!(terminal_utility(Some(Cell::White), false, Cell::Black, ply).unwrap() < -HEURISTIC_LIMIT);
        }
        assert_eq!(terminal_utility(None, true, Cell::Black, 225), Some(0));
        assert_eq!(terminal_utility(None, false, Cell::Black, 0), None);
    }

    #[test]
    fn test_available_span_verification_nullifies_dead_ends() {
        // Place 3 stones trapped in the corner: (0,0), (1,0), (2,0) blocked at (3,0) by White
        let mut board = Board::new();
        board.place(0, 0, Cell::Black).unwrap();
        board.place(1, 0, Cell::Black).unwrap();
        board.place(2, 0, Cell::Black).unwrap();
        board.place(3, 0, Cell::White).unwrap();

        // Horizontal line for Black from (0,0) has count=3, empty_back=0, empty_fwd=0 -> span=3 < 5
        let eval_horiz = evaluate_line_pattern(&board, 0, 0, 1, 0, Cell::Black);
        assert_eq!(eval_horiz, 0, "Span < 5 must yield 0 score (dead line)");
    }

    #[test]
    fn test_gapped_pattern_detection_scores_split_threats() {
        // Test Gapped 3: Black at (7, 5), gap at (7, 6), Black at (7, 7) and (7, 8) -> X . X X
        let mut board = Board::new();
        board.place(5, 7, Cell::Black).unwrap();
        board.place(7, 7, Cell::Black).unwrap();
        board.place(8, 7, Cell::Black).unwrap();

        let eval_gapped_3 = evaluate_line_pattern(&board, 5, 7, 1, 0, Cell::Black);
        assert!(eval_gapped_3 >= SCORE_BROKEN_THREE, "Gapped 3 (X . X X) must be awarded SCORE_BROKEN_THREE ({eval_gapped_3})");

        // Test Gapped 4: Black at (4, 7), (5, 7), gap at (6, 7), Black at (7, 7), (8, 7) -> X X . X X
        let mut board4 = Board::new();
        board4.place(4, 7, Cell::Black).unwrap();
        board4.place(5, 7, Cell::Black).unwrap();
        board4.place(7, 7, Cell::Black).unwrap();
        board4.place(8, 7, Cell::Black).unwrap();

        let eval_gapped_4 = evaluate_line_pattern(&board4, 4, 7, 1, 0, Cell::Black);
        assert!(eval_gapped_4 >= SCORE_BROKEN_FOUR, "Gapped 4 (X X . X X) must be awarded SCORE_BROKEN_FOUR ({eval_gapped_4})");
    }

    #[test]
    fn test_defense_multiplier_penalizes_opponent_threats() {
        // Position where Black has open 3 vs White having identical open 3
        let mut board_b = Board::new();
        for x in 6..=8 { board_b.place(x, 7, Cell::Black).unwrap(); }

        let mut board_w = Board::new();
        for x in 6..=8 { board_w.place(x, 7, Cell::White).unwrap(); }

        let score_b = evaluate(&board_b, Cell::Black);
        let score_w = evaluate(&board_w, Cell::Black);

        // Due to beta = 1.15, opponent open 3 penalty |score_w| must exceed own open 3 gain score_b
        assert!(score_b > 0);
        assert!(score_w < 0);
        assert!(score_w.abs() > score_b, "Opponent threat must be penalized with beta > 1.0 (own={score_b}, opp={score_w})");
    }
}
