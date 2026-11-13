pub mod ai;
pub mod board;
pub mod candidates;
pub mod eval;
pub mod search;

use ai::Difficulty;
use board::{Board, Cell, SIZE};
use serde::Serialize;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Game {
    board: Board,
    current_player: Cell,
    winner: Option<Cell>,
    move_history: Vec<(usize, usize)>,
}

#[derive(Serialize)]
pub struct MoveResult {
    pub x: usize,
    pub y: usize,
    pub winner: Option<String>,
    pub score: i32,
    pub strategy: &'static str,
    pub difficulty: &'static str,
    pub stats: search::SearchStats,
}

#[wasm_bindgen]
impl Game {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            board: Board::new(),
            current_player: Cell::Black,
            winner: None,
            move_history: Vec::new(),
        }
    }

    pub fn play_move(&mut self, x: usize, y: usize) -> bool {
        if self.winner.is_some() {
            return false;
        }
        if self.board.place(x, y, self.current_player).is_err() {
            return false;
        }
        self.move_history.push((x, y));
        if self.board.check_winner_at(x, y).is_some() {
            self.winner = Some(self.current_player);
        }
        self.current_player = self.current_player.opponent();
        true
    }

    /// difficulty: 0=easy, 1=normal, 2=hard, 3=expert, 4=master, 5=veryhard.
    pub fn ai_move(&mut self, difficulty: u8) -> JsValue {
        #[cfg(target_arch = "wasm32")]
        let seed = (js_sys::Math::random() * (u32::MAX as f64 + 1.0)) as u32;
        #[cfg(not(target_arch = "wasm32"))]
        let seed = 0;
        self.ai_move_seeded(difficulty, seed)
    }

    /// Additive deterministic boundary for native/JS/WASM fixture parity.
    pub fn ai_move_seeded(&mut self, difficulty: u8, seed: u32) -> JsValue {
        match self.compute_ai_move(Difficulty::from_id(difficulty), seed as u64) {
            Some(result) => serde_wasm_bindgen::to_value(&result).unwrap(),
            None => JsValue::NULL,
        }
    }

    pub fn get_board(&self) -> JsValue {
        let mut flat = Vec::with_capacity(SIZE * SIZE);
        for y in 0..SIZE {
            for x in 0..SIZE {
                flat.push(match self.board.get(x, y) {
                    Cell::Empty => 0u8,
                    Cell::Black => 1,
                    Cell::White => 2,
                });
            }
        }
        serde_wasm_bindgen::to_value(&flat).unwrap()
    }

    pub fn get_winner(&self) -> JsValue {
        match self.winner {
            Some(Cell::Black) => JsValue::from_str("black"),
            Some(Cell::White) => JsValue::from_str("white"),
            _ => JsValue::NULL,
        }
    }

    pub fn is_draw(&self) -> bool {
        self.winner.is_none() && self.board.is_full()
    }

    pub fn undo(&mut self) -> bool {
        if let Some((x, y)) = self.move_history.pop() {
            let undone = self.board.undo(x, y);
            debug_assert!(undone);
            self.winner = None;
            self.current_player = self.current_player.opponent();
            true
        } else {
            false
        }
    }

    pub fn reset(&mut self) {
        self.board = Board::new();
        self.current_player = Cell::Black;
        self.winner = None;
        self.move_history.clear();
    }

    pub fn current_player(&self) -> String {
        match self.current_player {
            Cell::Black => "black".to_string(),
            Cell::White => "white".to_string(),
            Cell::Empty => "none".to_string(),
        }
    }

    pub fn move_count(&self) -> usize {
        self.move_history.len()
    }
}

impl Game {
    /// Native transaction entry point, independent of JS serialization.
    pub fn compute_ai_move(&mut self, difficulty: Difficulty, seed: u64) -> Option<MoveResult> {
        if self.winner.is_some() || self.board.is_full() { return None; }
        let decision = ai::choose_move(&self.board, self.current_player, difficulty, seed);
        let (x, y) = decision.result.best_move?;
        self.board.place(x, y, self.current_player).ok()?;
        self.move_history.push((x, y));
        self.winner = self.board.check_winner_at(x, y);
        let winner = self.winner.map(|cell| match cell {
            Cell::Black => "black".to_string(), Cell::White => "white".to_string(),
            Cell::Empty => unreachable!(),
        });
        self.current_player = self.current_player.opponent();
        Some(MoveResult {
            x, y, winner, score: decision.result.score,
            strategy: decision.strategy, difficulty: decision.difficulty.label(),
            stats: decision.result.stats,
        })
    }
}

impl Default for Game {
    fn default() -> Self { Self::new() }
}
