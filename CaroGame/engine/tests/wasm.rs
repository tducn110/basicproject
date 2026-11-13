use gomoku_engine::Game;
use gomoku_engine::ai::Difficulty;

#[test]
fn test_game_flow() {
    let mut game = Game::new();
    let result = game.play_move(7, 7);
    assert!(result);
    assert_eq!(game.current_player(), "white");
    assert_eq!(game.move_count(), 1);
}

#[test]
fn test_undo() {
    let mut game = Game::new();
    game.play_move(7, 7);
    assert!(game.undo());
    assert_eq!(game.move_count(), 0);
    assert_eq!(game.current_player(), "black");
}

#[test]
fn test_reset() {
    let mut game = Game::new();
    game.play_move(7, 7);
    game.reset();
    assert_eq!(game.move_count(), 0);
    assert_eq!(game.current_player(), "black");
}

#[test]
fn native_ai_metadata_and_undo_match_the_applied_transaction() {
    let mut game = Game::new();
    game.play_move(7, 7);
    let result = game.compute_ai_move(Difficulty::Normal, 42).unwrap();
    assert!(result.x < 15 && result.y < 15);
    assert_eq!(result.strategy, "rule_based");
    assert_eq!(result.difficulty, "normal");
    assert_eq!(result.stats.completed_depth, 1);
    assert!(result.stats.nodes_visited > 1);
    assert_eq!(game.move_count(), 2);
    assert!(game.undo());
    assert_eq!(game.move_count(), 1);
    assert_eq!(game.current_player(), "white");
}

#[test]
fn native_seeded_random_decisions_repeat() {
    let mut a = Game::new();
    let mut b = Game::new();
    a.play_move(7, 7); b.play_move(7, 7);
    let a = a.compute_ai_move(Difficulty::Easy, 42).unwrap();
    let b = b.compute_ai_move(Difficulty::Easy, 42).unwrap();
    assert_eq!((a.x, a.y, a.score), (b.x, b.y, b.score));
    assert_eq!(a.stats, b.stats);
}

#[test]
fn full_draw_refuses_ai_and_preserves_game_state() {
    let mut black = Vec::new(); let mut white = Vec::new();
    for y in 0..15 { for x in 0..15 {
        if (x + 2 * y) % 4 < 2 { black.push((x, y)); } else { white.push((x, y)); }
    }}
    let mut game = Game::new();
    for turn in 0..225 {
        let (x, y) = if turn % 2 == 0 { black[turn / 2] } else { white[turn / 2] };
        assert!(game.play_move(x, y));
    }
    assert!(game.is_draw());
    for id in 0..=5 { assert!(game.compute_ai_move(Difficulty::from_id(id), 42).is_none()); }
    assert_eq!(game.move_count(), 225);
    assert!(game.undo());
    assert!(!game.is_draw());
    assert_eq!(game.move_count(), 224);
}

#[test]
fn winner_blocks_later_moves_until_undo_or_reset() {
    let mut game = Game::new();
    for x in 0..4 { assert!(game.play_move(x, 0)); assert!(game.play_move(x, 2)); }
    assert!(game.play_move(4, 0));
    assert!(!game.play_move(10, 10));
    assert!(game.compute_ai_move(Difficulty::Master, 42).is_none());
    assert!(game.undo());
    assert!(game.play_move(10, 10));
    game.reset();
    assert_eq!(game.move_count(), 0);
    assert_eq!(game.current_player(), "black");
}
