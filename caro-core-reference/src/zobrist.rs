use crate::bot::random::SplitMix64;
use crate::model::{Move, Player, BOARD_CELLS};
use crate::state::GameState;

#[derive(Debug, Clone)]
pub struct Zobrist {
    piece_keys: [[u64; 2]; BOARD_CELLS],
    side_to_move_key: u64,
}

impl Zobrist {
    pub fn new(seed: u64) -> Self {
        let mut rng = SplitMix64::new(seed);
        let mut piece_keys = [[0u64; 2]; BOARD_CELLS];
        for keys in &mut piece_keys {
            keys[0] = rng.next_u64();
            keys[1] = rng.next_u64();
        }
        Self {
            piece_keys,
            side_to_move_key: rng.next_u64(),
        }
    }

    pub fn hash(&self, state: &GameState) -> u64 {
        let mut hash = 0u64;
        for (index, &cell) in state.board().iter().enumerate() {
            let player = match cell {
                1 => Some(Player::X),
                -1 => Some(Player::O),
                _ => None,
            };
            if let Some(player) = player {
                hash ^= self.piece_keys[index][player.piece_index()];
            }
        }
        if state.to_move() == Player::O {
            hash ^= self.side_to_move_key;
        }
        hash
    }

    /// Incremental hash update after a legal move.
    /// `side_changed` must match the actual GameState transition. A terminal move
    /// can leave `to_move` unchanged, in which case no side key is toggled.
    pub fn after_play(
        &self,
        previous_hash: u64,
        mv: Move,
        mover: Player,
        side_changed: bool,
    ) -> u64 {
        let mut hash = previous_hash ^ self.piece_keys[mv.as_index()][mover.piece_index()];
        if side_changed {
            hash ^= self.side_to_move_key;
        }
        hash
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::RuleConfig;

    #[test]
    fn incremental_hash_matches_full_recompute() {
        let zobrist = Zobrist::new(1234);
        let mut state = GameState::new(RuleConfig::freestyle());
        let hash0 = zobrist.hash(&state);
        let mv = Move::new(7, 7).unwrap();
        let mover = state.to_move();
        let undo = state.play(mv).unwrap();
        let hash1 = zobrist.after_play(hash0, mv, mover, undo.previous_to_move() != state.to_move());
        assert_eq!(hash1, zobrist.hash(&state));
    }
}
