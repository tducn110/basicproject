use caro_core::{best_move, Board, Move, Player, SearchConfig, AREA, SIZE};

fn put(board: &mut Board, row: u8, col: u8, player: Player) {
    board.place(Move::new(row, col), player).unwrap();
}
fn config(depth: u8, alpha_beta: bool) -> SearchConfig {
    SearchConfig {
        depth,
        radius: 2,
        max_candidates: 12,
        alpha_beta,
    }
}
#[test]
fn empty_board_is_center_candidate() {
    let board = Board::new();
    assert_eq!(board.candidates(2), vec![Move::new(7, 7)]);
    assert_eq!(best_move(&board, Player::X, config(2, true)).best_move, Some(Move::new(7, 7)));
}
#[test]
fn invalid_board_bytes_are_rejected() {
    assert!(Board::from_cells(&[0; AREA - 1]).is_err());
    let mut cells = [0; AREA];
    cells[0] = 3;
    assert!(Board::from_cells(&cells).is_err());
}
#[test]
fn make_unmake_restores_exact_state() {
    let mut board = Board::new();
    let initial = board.clone();
    put(&mut board, 7, 7, Player::X);
    assert_eq!(board.occupied(), 1);
    assert!(board.place(Move::new(7, 7), Player::O).is_err());
    assert!(board.place(Move::new(15, 0), Player::O).is_err());
    board.undo(Move::new(7, 7)).unwrap();
    assert_eq!(board, initial);
    assert!(board.undo(Move::new(7, 7)).is_err());
}
#[test]
fn four_axes_and_overline_win() {
    let directions: [(i32, i32); 4] = [(0, 1), (1, 0), (1, 1), (1, -1)];
    for (dr, dc) in directions {
        let mut board = Board::new();
        for step in 0..5 {
            let row = (7 + step * dr) as u8;
            let col = (7 + step * dc) as u8;
            put(&mut board, row, col, Player::X);
        }
        assert!(board.is_win_from(Move::new(7, 7), Player::X));
        assert!(board.has_any_win());
    }
    let mut overline = Board::new();
    for col in 0..6 {
        put(&mut overline, 0, col, Player::O);
    }
    assert!(overline.is_win_from(Move::new(0, 3), Player::O));
}
#[test]
fn interrupted_line_is_not_a_win() {
    let mut board = Board::new();
    for col in [1, 2, 4, 5, 6] {
        put(&mut board, 7, col, Player::X);
    }
    put(&mut board, 7, 3, Player::O);
    assert!(!board.is_win_from(Move::new(7, 2), Player::X));
    assert!(!board.has_any_win());
}
#[test]
fn candidates_are_unique_empty_and_in_bounds() {
    let mut board = Board::new();
    put(&mut board, 0, 0, Player::X);
    put(&mut board, 7, 7, Player::O);
    let moves = board.candidates(2);
    let mut seen = [false; AREA];
    for mv in moves {
        assert!((mv.row as usize) < SIZE && (mv.col as usize) < SIZE);
        assert_eq!(board.get(i32::from(mv.row), i32::from(mv.col)), Some(0));
        assert!(!seen[mv.index()]);
        seen[mv.index()] = true;
    }
    assert!(seen[1]); // (0,1) neighbor of (0,0)
    assert!(seen[7 * SIZE + 9]); // distance two from (7,7)
}
#[test]
fn tactical_immediate_win_has_priority() {
    let mut board = Board::new();
    for col in 3..7 {
        put(&mut board, 7, col, Player::X);
    }
    put(&mut board, 6, 6, Player::O);
    let result = best_move(&board, Player::X, config(2, true));
    assert_eq!(result.best_move, Some(Move::new(7, 2)));
    assert_eq!(result.score, caro_core::MATE - 1);
}
#[test]
fn tactical_block_is_prioritized_when_no_own_win() {
    let mut board = Board::new();
    for col in 3..7 {
        put(&mut board, 7, col, Player::O);
    }
    // Block one end, so the other is a forced defensive move.
    put(&mut board, 7, 2, Player::X);
    let result = best_move(&board, Player::X, config(2, true));
    assert_eq!(result.best_move, Some(Move::new(7, 7)));
}
#[test]
fn static_evaluation_is_zero_sum_and_deterministic() {
    let mut board = Board::new();
    put(&mut board, 7, 7, Player::X);
    put(&mut board, 7, 8, Player::X);
    put(&mut board, 8, 7, Player::O);
    assert_eq!(board.evaluate(Player::X), -board.evaluate(Player::O));
    assert_eq!(board.evaluate(Player::X), board.evaluate(Player::X));
}
#[test]
fn minimax_and_alpha_beta_return_same_score_on_small_fixture() {
    let mut board = Board::new();
    put(&mut board, 7, 7, Player::X);
    put(&mut board, 7, 8, Player::O);
    put(&mut board, 8, 7, Player::X);
    let plain = best_move(&board, Player::O, config(2, false));
    let pruned = best_move(&board, Player::O, config(2, true));
    assert_eq!(plain.score, pruned.score);
    assert_eq!(plain.best_move, pruned.best_move);
    assert_eq!(board.occupied(), 3);
}
