use caro_core_reference::search::alpha_beta::search_alpha_beta;
use caro_core_reference::search::minimax::search_minimax;
use caro_core_reference::search::{MoveMode, SearchConfig};
use caro_core_reference::{EvalWeights, GameState, Move, Player, RuleConfig};

fn tactical_fixture() -> GameState {
    let mut state = GameState::new(RuleConfig::freestyle());
    for col in 3..=6 {
        state.set_cell_for_fixture(7, col, Player::X).unwrap();
    }
    state.set_cell_for_fixture(5, 5, Player::O).unwrap();
    state.set_cell_for_fixture(5, 6, Player::O).unwrap();
    state.set_to_move_for_fixture(Player::X);
    state
}

#[test]
fn alpha_beta_matches_minimax_value_and_move() {
    let config = SearchConfig {
        depth: 2,
        move_mode: MoveMode::AllLegal,
        use_move_ordering: false,
        weights: EvalWeights::default(),
    };

    let mut a = tactical_fixture();
    let mut b = tactical_fixture();
    let minimax = search_minimax(&mut a, config);
    let alpha_beta = search_alpha_beta(&mut b, config);

    assert_eq!(minimax.score, alpha_beta.score);
    assert_eq!(minimax.best_move, alpha_beta.best_move);
}

#[test]
fn search_does_not_mutate_root_state() {
    let config = SearchConfig {
        depth: 2,
        move_mode: MoveMode::AllLegal,
        use_move_ordering: false,
        weights: EvalWeights::default(),
    };
    let mut state = tactical_fixture();
    let before_board = *state.board();
    let before_player = state.to_move();
    let before_status = state.status();
    let before_count = state.move_count();
    let before_last = state.last_move();

    let _ = search_alpha_beta(&mut state, config);

    assert_eq!(*state.board(), before_board);
    assert_eq!(state.to_move(), before_player);
    assert_eq!(state.status(), before_status);
    assert_eq!(state.move_count(), before_count);
    assert_eq!(state.last_move(), before_last);
}

#[test]
fn immediate_win_is_selected() {
    let config = SearchConfig {
        depth: 1,
        move_mode: MoveMode::AllLegal,
        use_move_ordering: false,
        weights: EvalWeights::default(),
    };
    let mut state = tactical_fixture();
    let result = search_alpha_beta(&mut state, config);
    assert_eq!(result.best_move, Move::new(7, 2));
}
