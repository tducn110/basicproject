use std::collections::HashMap;

use crate::model::Move;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Bound {
    Exact,
    Lower,
    Upper,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TTEntry {
    pub depth: u8,
    pub score: i32,
    pub bound: Bound,
    pub best_move: Option<Move>,
}

#[derive(Debug, Default)]
pub struct TranspositionTable {
    entries: HashMap<u64, TTEntry>,
}

impl TranspositionTable {
    pub fn with_capacity(capacity: usize) -> Self {
        Self {
            entries: HashMap::with_capacity(capacity),
        }
    }

    #[inline]
    pub fn get(&self, key: u64) -> Option<TTEntry> {
        self.entries.get(&key).copied()
    }

    pub fn store(&mut self, key: u64, entry: TTEntry) {
        match self.entries.get(&key) {
            Some(old) if old.depth > entry.depth => {}
            _ => {
                self.entries.insert(key, entry);
            }
        }
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }
}
