use std::time::Instant;
use caro_core_reference::movegen::CandidateConfig;
use caro_core_reference::search::alpha_beta::search_alpha_beta;
use caro_core_reference::search::{MoveMode, SearchConfig};
use caro_core_reference::{EvalWeights, GameState, Player, RuleConfig};

fn create_tactical_fixture() -> GameState {
    let mut state = GameState::new(RuleConfig::freestyle());
    for col in 3..=6 {
        state.set_cell_for_fixture(7, col, Player::X).unwrap();
    }
    state.set_cell_for_fixture(5, 5, Player::O).unwrap();
    state.set_cell_for_fixture(5, 6, Player::O).unwrap();
    state.set_to_move_for_fixture(Player::X);
    state
}

fn create_midgame_fixture() -> GameState {
    let mut state = GameState::new(RuleConfig::freestyle());
    // X stones
    state.set_cell_for_fixture(7, 7, Player::X).unwrap();
    state.set_cell_for_fixture(7, 8, Player::X).unwrap();
    state.set_cell_for_fixture(8, 7, Player::X).unwrap();
    state.set_cell_for_fixture(6, 9, Player::X).unwrap();
    // O stones
    state.set_cell_for_fixture(6, 7, Player::O).unwrap();
    state.set_cell_for_fixture(6, 8, Player::O).unwrap();
    state.set_cell_for_fixture(8, 8, Player::O).unwrap();
    state.set_cell_for_fixture(9, 7, Player::O).unwrap();
    state.set_to_move_for_fixture(Player::X);
    state
}

fn bench_alpha_beta(name: &str, state_factory: fn() -> GameState, max_depth: u8) {
    println!("[");
    let mut first = true;
    for depth in 1..=max_depth {
        let config = SearchConfig {
            depth,
            move_mode: MoveMode::Candidates(CandidateConfig::default()),
            use_move_ordering: false,
            weights: EvalWeights::default(),
        };

        // Warmup
        let mut s_warm = state_factory();
        let res_warm = search_alpha_beta(&mut s_warm, config);

        // Iteration count adjusted to depth
        let iterations = match depth {
            1 => 100,
            2 => 50,
            3 => 20,
            4 => 5,
            _ => 1,
        };

        let start = Instant::now();
        let mut total_nodes = 0;
        let mut total_cutoffs = 0;
        let mut last_score = 0;

        for _ in 0..iterations {
            let mut s = state_factory();
            let res = search_alpha_beta(&mut s, config);
            total_nodes += res.stats.nodes_visited;
            total_cutoffs += res.stats.cutoffs;
            last_score = res.score;
        }

        let elapsed = start.elapsed();
        let avg_time_ms = elapsed.as_secs_f64() * 1000.0 / (iterations as f64);
        let avg_nodes = total_nodes / iterations;
        let avg_cutoffs = total_cutoffs / iterations;
        let knps = if avg_time_ms > 0.0 {
            (avg_nodes as f64) / avg_time_ms
        } else {
            0.0
        };

        if !first {
            println!(",");
        }
        first = false;

        print!(
            "  {{\"engine\": \"Rust\", \"fixture\": \"{}\", \"depth\": {}, \"time_ms\": {:.4}, \"nodes\": {}, \"cutoffs\": {}, \"knps\": {:.2}, \"score\": {}}}",
            name, depth, avg_time_ms, avg_nodes, avg_cutoffs, knps, last_score
        );
    }
    println!("\n]");
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let fixture_type = if args.len() > 1 {
        args[1].as_str()
    } else {
        "midgame"
    };

    if fixture_type == "tactical" {
        bench_alpha_beta("tactical", create_tactical_fixture, 4);
    } else {
        bench_alpha_beta("midgame", create_midgame_fixture, 4);
    }
}
