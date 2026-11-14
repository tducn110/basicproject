pub const BOARD_SIZE: usize = 15;
pub const BOARD_CELLS: usize = BOARD_SIZE * BOARD_SIZE;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(i8)]
pub enum Player {
    X = 1,
    O = -1,
}

impl Player {
    #[inline]
    pub const fn opponent(self) -> Self {
        match self {
            Self::X => Self::O,
            Self::O => Self::X,
        }
    }

    #[inline]
    pub const fn cell_value(self) -> i8 {
        self as i8
    }

    #[inline]
    pub const fn piece_index(self) -> usize {
        match self {
            Self::X => 0,
            Self::O => 1,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct Move {
    pub index: u16,
}

impl Move {
    #[inline]
    pub const fn new(row: usize, col: usize) -> Option<Self> {
        if row < BOARD_SIZE && col < BOARD_SIZE {
            Some(Self {
                index: (row * BOARD_SIZE + col) as u16,
            })
        } else {
            None
        }
    }

    #[inline]
    pub const fn from_index(index: usize) -> Option<Self> {
        if index < BOARD_CELLS {
            Some(Self { index: index as u16 })
        } else {
            None
        }
    }

    #[inline]
    pub const fn row(self) -> usize {
        self.index as usize / BOARD_SIZE
    }

    #[inline]
    pub const fn col(self) -> usize {
        self.index as usize % BOARD_SIZE
    }

    #[inline]
    pub const fn as_index(self) -> usize {
        self.index as usize
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GameStatus {
    Playing,
    Won(Player),
    Draw,
}
