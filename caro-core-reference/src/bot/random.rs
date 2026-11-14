use crate::model::Move;
use crate::state::GameState;

/// Small deterministic PRNG used only to keep the Random baseline reproducible
/// without introducing a dependency into the reference crate.
#[derive(Debug, Clone, Copy)]
pub struct SplitMix64 {
    state: u64,
}

impl SplitMix64 {
    pub const fn new(seed: u64) -> Self {
        Self { state: seed }
    }

    pub fn next_u64(&mut self) -> u64 {
        self.state = self.state.wrapping_add(0x9E3779B97F4A7C15);
        let mut z = self.state;
        z = (z ^ (z >> 30)).wrapping_mul(0xBF58476D1CE4E5B9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94D049BB133111EB);
        z ^ (z >> 31)
    }
}

pub fn choose_random_move(state: &GameState, seed: u64) -> Option<Move> {
    let moves = state.legal_moves();
    if moves.is_empty() {
        return None;
    }
    let mut rng = SplitMix64::new(seed);
    let index = (rng.next_u64() as usize) % moves.len();
    Some(moves[index])
}
