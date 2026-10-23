use std::fs::File;
use std::io::Write;
use std::time::Instant;

use caro_core_reference::bot::random::choose_random_move;
use caro_core_reference::bot::rule_based::choose_rule_based_move;
use caro_core_reference::evaluator::EvalWeights;
use caro_core_reference::model::{GameStatus, Player, BOARD_CELLS};
use caro_core_reference::movegen::{generate_candidates, CandidateConfig};
use caro_core_reference::pattern::{count_patterns, PatternCounts};
use caro_core_reference::rules::RuleConfig;
use caro_core_reference::state::GameState;

#[derive(Debug, Default)]
struct MatchStats {
    rule_based_wins: usize,
    random_wins: usize,
    draws: usize,
    total_plies: usize,
    rule_based_move_count: usize,
    total_rule_based_time_us: u128,
    total_candidates_evaluated: usize,
    total_empty_cells_at_evaluation: usize,
    opening_candidates: Vec<usize>,
    midgame_candidates: Vec<usize>,
    endgame_candidates: Vec<usize>,
}

fn play_single_game(
    rule_based_player: Player,
    game_index: usize,
    weights: EvalWeights,
    candidate_config: CandidateConfig,
    stats: &mut MatchStats,
) {
    let mut state = GameState::new(RuleConfig::freestyle());
    let mut ply = 0;

    while state.status() == GameStatus::Playing && ply < BOARD_CELLS {
        let current_player = state.to_move();
        let empty_cells = BOARD_CELLS - state.move_count() as usize;

        let mv = if current_player == rule_based_player {
            let start = Instant::now();
            let cands = generate_candidates(&state, candidate_config);
            let cand_count = cands.len();

            let chosen = choose_rule_based_move(&mut state, weights, candidate_config);
            let elapsed = start.elapsed();

            stats.rule_based_move_count += 1;
            stats.total_rule_based_time_us += elapsed.as_micros();
            stats.total_candidates_evaluated += cand_count;
            stats.total_empty_cells_at_evaluation += empty_cells;

            if state.move_count() <= 6 {
                stats.opening_candidates.push(cand_count);
            } else if state.move_count() <= 20 {
                stats.midgame_candidates.push(cand_count);
            } else {
                stats.endgame_candidates.push(cand_count);
            }

            chosen
        } else {
            // Random bot with deterministic seed
            let seed = (game_index as u64)
                .wrapping_mul(1000)
                .wrapping_add(ply as u64)
                .wrapping_add(1337);
            choose_random_move(&state, seed)
        };

        match mv {
            Some(m) => {
                state.play(m).expect("valid legal move");
                ply += 1;
            }
            None => break,
        }
    }

    stats.total_plies += ply;

    match state.status() {
        GameStatus::Won(winner) => {
            if winner == rule_based_player {
                stats.rule_based_wins += 1;
            } else {
                stats.random_wins += 1;
            }
        }
        GameStatus::Draw => {
            stats.draws += 1;
        }
        GameStatus::Playing => {
            stats.draws += 1;
        }
    }
}

fn test_pattern_detection_fixtures() -> Vec<(&'static str, bool, PatternCounts)> {
    let mut results = Vec::new();

    // 1. Five in a row: 7, 3..=7
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        for c in 3..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.five_or_more == 1;
        results.push(("five_in_a_row", pass, counts));
    }

    // 2. Open four: . X X X X . at row 7, col 4..=7 (col 3 and 8 are empty)
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        for c in 4..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.open_four == 1 && counts.closed_four == 0;
        results.push(("open_four", pass, counts));
    }

    // 3. Closed four: O X X X X . at row 7, col 4..=7, O at col 3, col 8 empty
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        s.set_cell_for_fixture(7, 3, Player::O).unwrap();
        for c in 4..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.closed_four == 1 && counts.open_four == 0;
        results.push(("closed_four", pass, counts));
    }

    // 4. Open three: . X X X . at row 7, col 5..=7 (col 4 and 8 empty)
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        for c in 5..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.open_three == 1 && counts.closed_three == 0;
        results.push(("open_three", pass, counts));
    }

    // 5. Closed three: O X X X . at row 7, col 5..=7, O at col 4, col 8 empty
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        s.set_cell_for_fixture(7, 4, Player::O).unwrap();
        for c in 5..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.closed_three == 1 && counts.open_three == 0;
        results.push(("closed_three", pass, counts));
    }

    // 6. Open two: . X X . at row 7, col 6..=7 (col 5 and 8 empty)
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        for c in 6..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.open_two == 1 && counts.closed_two == 0;
        results.push(("open_two", pass, counts));
    }

    // 7. Closed two: O X X . at row 7, col 6..=7, O at col 5, col 8 empty
    {
        let mut s = GameState::new(RuleConfig::freestyle());
        s.set_cell_for_fixture(7, 5, Player::O).unwrap();
        for c in 6..=7 {
            s.set_cell_for_fixture(7, c, Player::X).unwrap();
        }
        let counts = count_patterns(&s, Player::X);
        let pass = counts.closed_two == 1 && counts.open_two == 0;
        results.push(("closed_two", pass, counts));
    }

    results
}

fn main() {
    println!("=== THỰC NGHIỆM TUẦN 4: PATTERN DETECTION, HEURISTIC VÀ RULE-BASED BOT TRÊN RUST ===");

    // Step 1: Verify Pattern Detection Fixtures
    println!("\n[1/4] Kiểm tra tính đúng đắn của 7 mẫu hình thế cờ chuẩn (Pattern Detection Fixtures)...");
    let pattern_tests = test_pattern_detection_fixtures();
    let mut all_patterns_pass = true;
    for (name, pass, counts) in &pattern_tests {
        println!(
            "  - Pattern {:<15}: {} (five: {}, open4: {}, closed4: {}, open3: {}, closed3: {}, open2: {}, closed2: {})",
            name,
            if *pass { "PASS [OK]" } else { "FAIL [X]" },
            counts.five_or_more,
            counts.open_four,
            counts.closed_four,
            counts.open_three,
            counts.closed_three,
            counts.open_two,
            counts.closed_two
        );
        if !*pass {
            all_patterns_pass = false;
        }
    }
    assert!(all_patterns_pass, "Tất cả test pattern detection phải pass!");

    // Step 2: 100 Games Bot-vs-Bot: Rule-Based Bot vs Random Bot
    println!("\n[2/4] Chạy 100 ván đối đầu thực nghiệm Bot-vs-Bot: Rule-Based Bot vs Random Bot...");
    let weights = EvalWeights::default();
    let candidate_config = CandidateConfig {
        radius: 2,
        max_candidates: None,
    };

    let mut stats = MatchStats::default();
    let start_all = Instant::now();

    // 50 games: Rule-Based as X (Tiên thủ)
    for g in 1..=50 {
        play_single_game(Player::X, g, weights, candidate_config, &mut stats);
    }
    // 50 games: Rule-Based as O (Hậu thủ)
    for g in 51..=100 {
        play_single_game(Player::O, g, weights, candidate_config, &mut stats);
    }

    let elapsed_all = start_all.elapsed();

    let win_rate = (stats.rule_based_wins as f64 / 100.0) * 100.0;
    let avg_plies = stats.total_plies as f64 / 100.0;
    let avg_time_us = if stats.rule_based_move_count > 0 {
        stats.total_rule_based_time_us as f64 / stats.rule_based_move_count as f64
    } else {
        0.0
    };
    let avg_cands = if stats.rule_based_move_count > 0 {
        stats.total_candidates_evaluated as f64 / stats.rule_based_move_count as f64
    } else {
        0.0
    };
    let avg_empty = if stats.rule_based_move_count > 0 {
        stats.total_empty_cells_at_evaluation as f64 / stats.rule_based_move_count as f64
    } else {
        0.0
    };
    let pruning_ratio = if avg_empty > 0.0 {
        (1.0 - (avg_cands / avg_empty)) * 100.0
    } else {
        0.0
    };

    let avg_opening_cands = if !stats.opening_candidates.is_empty() {
        stats.opening_candidates.iter().sum::<usize>() as f64
            / stats.opening_candidates.len() as f64
    } else {
        0.0
    };
    let avg_midgame_cands = if !stats.midgame_candidates.is_empty() {
        stats.midgame_candidates.iter().sum::<usize>() as f64
            / stats.midgame_candidates.len() as f64
    } else {
        0.0
    };
    let avg_endgame_cands = if !stats.endgame_candidates.is_empty() {
        stats.endgame_candidates.iter().sum::<usize>() as f64
            / stats.endgame_candidates.len() as f64
    } else {
        0.0
    };

    println!("\n=== KẾT QUẢ THỰC NGHIỆM ĐỐI ĐẦU 100 VÁN (BOT-VS-BOT) ===");
    println!("  - Tổng số ván đấu: 100 (50 ván Tiên X, 50 ván Hậu O)");
    println!("  - Rule-Based Bot thắng: {}/100 ván ({:.1}%)", stats.rule_based_wins, win_rate);
    println!("  - Random Bot thắng:     {}/100 ván ({:.1}%)", stats.random_wins, (stats.random_wins as f64));
    println!("  - Hòa cờ:               {}/100 ván ({:.1}%)", stats.draws, (stats.draws as f64));
    println!("  - Số nước đi trung bình/ván: {:.1} plies", avg_plies);
    println!("  - Tổng thời gian thực thi:   {:.3} ms ({:.4} giây cho 100 ván!)", elapsed_all.as_secs_f64() * 1000.0, elapsed_all.as_secs_f64());
    println!("  - Thời gian ra quyết định trung bình của Rule-Based Bot: {:.2} µs/nước đi ({:.4} ms)", avg_time_us, avg_time_us / 1000.0);

    println!("\n=== HIỆU QUẢ CẮT GIẢM KHÔNG GIAN CỦA CHEBYSHEV CANDIDATE GENERATOR (r <= 2) ===");
    println!("  - Số ô trống trung bình bàn cờ: {:.1} ô", avg_empty);
    println!("  - Số candidate sinh ra trung bình: {:.1} ô", avg_cands);
    println!("  - Tỷ lệ giảm không gian tìm kiếm: {:.1}%", pruning_ratio);
    println!("  - Candidate giai đoạn Khai cuộc (move 1-6):  {:.1} ô", avg_opening_cands);
    println!("  - Candidate giai đoạn Trung cuộc (move 7-20): {:.1} ô", avg_midgame_cands);
    println!("  - Candidate giai đoạn Tàn cuộc (> 20 moves):  {:.1} ô", avg_endgame_cands);

    // Step 3: Export JSON Data for Reports & Plots
    let json_output = format!(
        r#"{{
  "metadata": {{
    "experiment": "Week 4 Rule-Based vs Random Bot & Pattern Detection",
    "engine": "Rust (Native)",
    "compiler": "rustc 1.98.1",
    "board_size": 15,
    "total_games": 100
  }},
  "pattern_fixtures": [
    {{"pattern": "five_in_a_row", "status": "PASS"}},
    {{"pattern": "open_four", "status": "PASS"}},
    {{"pattern": "closed_four", "status": "PASS"}},
    {{"pattern": "open_three", "status": "PASS"}},
    {{"pattern": "closed_three", "status": "PASS"}},
    {{"pattern": "open_two", "status": "PASS"}},
    {{"pattern": "closed_two", "status": "PASS"}}
  ],
  "match_results": {{
    "rule_based_wins": {},
    "random_wins": {},
    "draws": {},
    "win_rate_percent": {:.2},
    "avg_plies_per_game": {:.2},
    "total_time_ms": {:.4},
    "avg_time_per_move_us": {:.2},
    "avg_time_per_move_ms": {:.4}
  }},
  "candidate_generation": {{
    "avg_empty_cells": {:.2},
    "avg_candidate_count": {:.2},
    "search_space_reduction_percent": {:.2},
    "opening_avg_candidates": {:.2},
    "midgame_avg_candidates": {:.2},
    "endgame_avg_candidates": {:.2}
  }}
}}"#,
        stats.rule_based_wins,
        stats.random_wins,
        stats.draws,
        win_rate,
        avg_plies,
        elapsed_all.as_secs_f64() * 1000.0,
        avg_time_us,
        avg_time_us / 1000.0,
        avg_empty,
        avg_cands,
        pruning_ratio,
        avg_opening_cands,
        avg_midgame_cands,
        avg_endgame_cands
    );

    let output_path = "benchmark/results/week4_bot_battle.json";
    let mut file = File::create(output_path).expect("Failed to create week4_bot_battle.json");
    file.write_all(json_output.as_bytes()).expect("Failed to write JSON");
    println!("\n[4/4] Dữ liệu thực nghiệm đã được ghi thành công vào: {}", output_path);
}
