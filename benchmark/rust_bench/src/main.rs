use caro_core::{best_move, Board, Move, Player, SearchConfig};
use std::time::Instant;

fn fixture(name: &str) -> Board {
    let mut board = Board::new();
    let placements: &[(u8, u8, Player)] = if name == "tactical" {
        &[
            (7, 3, Player::X), (7, 4, Player::X),
            (7, 5, Player::X), (7, 6, Player::X),
            (5, 5, Player::O), (5, 6, Player::O),
        ]
    } else {
        &[
            (7, 7, Player::X), (7, 8, Player::X),
            (8, 7, Player::X), (6, 9, Player::X),
            (6, 7, Player::O), (6, 8, Player::O),
            (8, 8, Player::O), (9, 7, Player::O),
        ]
    };
    for &(row, col, player) in placements {
        board.place(Move::new(row, col), player).unwrap();
    }
    board
}
fn main() {
    let name = std::env::args().nth(1).unwrap_or_else(|| "midgame".to_owned());
    let board = fixture(&name);
    println!("[");
    for depth in 1..=4 {
        let cfg = SearchConfig {
            depth,
            ..SearchConfig::default()
        };
        let _warmup = best_move(&board, Player::X, cfg);
        let iterations = match depth {
            1 => 100,
            2 => 50,
            3 => 20,
            _ => 5,
        };
        let mut samples = Vec::with_capacity(iterations);
        let mut last = best_move(&board, Player::X, cfg);
        for _ in 0..iterations {
            let start = Instant::now();
            last = best_move(&board, Player::X, cfg);
            samples.push(start.elapsed().as_secs_f64() * 1000.0);
        }
        samples.sort_by(|a, b| a.total_cmp(b));
        let median = if iterations % 2 == 0 {
            (samples[iterations / 2 - 1] + samples[iterations / 2]) / 2.0
        } else {
            samples[iterations / 2]
        };
        let mean = samples.iter().sum::<f64>() / iterations as f64;
        let comma = if depth < 4 { "," } else { "" };
        println!(
            "  {{\"engine\":\"RustNativeNewCore\",\"fixture\":\"{}\",\"depth\":{},\"time_ms\":{:.5},\"median_ms\":{:.5},\"iterations\":{},\"nodes\":{},\"cutoffs\":{},\"score\":{}}}{}",
            name, depth, mean, median, iterations, last.stats.nodes_visited,
            last.stats.cutoffs, last.score, comma
        );
    }
    println!("]");
}
