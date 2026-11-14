//! Reference Rust computational core for the Caro/Gomoku project.
//!
//! Status: design/reference implementation. It must be compiled, tested and
//! mapped to the real repository before it can be promoted to source evidence.

pub mod bot;
pub mod evaluator;
pub mod metrics;
pub mod model;
pub mod movegen;
pub mod pattern;
pub mod rules;
pub mod search;
pub mod state;
pub mod zobrist;

pub use evaluator::{evaluate, EvalWeights};
pub use metrics::{SearchResult, SearchStats};
pub use model::{GameStatus, Move, Player, BOARD_CELLS, BOARD_SIZE};
pub use movegen::{generate_candidates, CandidateConfig};
pub use rules::RuleConfig;
pub use state::{GameState, MoveError};
