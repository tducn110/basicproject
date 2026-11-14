use crate::model::{GameStatus, Move, Player, BOARD_CELLS, BOARD_SIZE};
use crate::rules::{is_winning_move, RuleConfig};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MoveError {
    OutOfBounds,
    Occupied,
    GameAlreadyFinished,
}

#[derive(Debug, Clone, Copy)]
pub struct UndoToken {
    mv: Move,
    previous_to_move: Player,
    previous_status: GameStatus,
    previous_last_move: Option<Move>,
    previous_move_count: u16,
}

impl UndoToken {
    #[inline]
    pub(crate) const fn previous_to_move(self) -> Player {
        self.previous_to_move
    }
}

#[derive(Debug, Clone)]
pub struct GameState {
    board: [i8; BOARD_CELLS],
    to_move: Player,
    move_count: u16,
    last_move: Option<Move>,
    status: GameStatus,
    rules: RuleConfig,
}

impl GameState {
    pub fn new(rules: RuleConfig) -> Self {
        Self {
            board: [0; BOARD_CELLS],
            to_move: Player::X,
            move_count: 0,
            last_move: None,
            status: GameStatus::Playing,
            rules,
        }
    }

    #[inline]
    pub fn board(&self) -> &[i8; BOARD_CELLS] {
        &self.board
    }

    #[inline]
    pub const fn to_move(&self) -> Player {
        self.to_move
    }

    #[inline]
    pub const fn move_count(&self) -> u16 {
        self.move_count
    }

    #[inline]
    pub const fn last_move(&self) -> Option<Move> {
        self.last_move
    }

    #[inline]
    pub const fn status(&self) -> GameStatus {
        self.status
    }

    #[inline]
    pub const fn rules(&self) -> RuleConfig {
        self.rules
    }

    #[inline]
    pub fn is_empty(&self, mv: Move) -> bool {
        self.board[mv.as_index()] == 0
    }

    pub fn legal_moves(&self) -> Vec<Move> {
        if self.status != GameStatus::Playing {
            return Vec::new();
        }

        self.board
            .iter()
            .enumerate()
            .filter_map(|(index, &cell)| {
                if cell == 0 {
                    Move::from_index(index)
                } else {
                    None
                }
            })
            .collect()
    }

    pub fn play(&mut self, mv: Move) -> Result<UndoToken, MoveError> {
        if mv.as_index() >= BOARD_CELLS {
            return Err(MoveError::OutOfBounds);
        }
        if self.status != GameStatus::Playing {
            return Err(MoveError::GameAlreadyFinished);
        }
        if self.board[mv.as_index()] != 0 {
            return Err(MoveError::Occupied);
        }

        let undo = UndoToken {
            mv,
            previous_to_move: self.to_move,
            previous_status: self.status,
            previous_last_move: self.last_move,
            previous_move_count: self.move_count,
        };

        let mover = self.to_move;
        self.board[mv.as_index()] = mover.cell_value();
        self.move_count += 1;
        self.last_move = Some(mv);

        if is_winning_move(self, mv, mover) {
            self.status = GameStatus::Won(mover);
        } else if self.move_count as usize == BOARD_CELLS {
            self.status = GameStatus::Draw;
        } else {
            self.to_move = mover.opponent();
        }

        Ok(undo)
    }

    pub fn undo(&mut self, undo: UndoToken) {
        self.board[undo.mv.as_index()] = 0;
        self.to_move = undo.previous_to_move;
        self.status = undo.previous_status;
        self.last_move = undo.previous_last_move;
        self.move_count = undo.previous_move_count;
    }

    /// Fixture helper only. Production game flow should use `play`.
    pub fn set_cell_for_fixture(
        &mut self,
        row: usize,
        col: usize,
        player: Player,
    ) -> Result<(), MoveError> {
        if row >= BOARD_SIZE || col >= BOARD_SIZE {
            return Err(MoveError::OutOfBounds);
        }
        let index = row * BOARD_SIZE + col;
        if self.board[index] != 0 {
            return Err(MoveError::Occupied);
        }
        self.board[index] = player.cell_value();
        self.move_count += 1;
        Ok(())
    }

    /// Fixture helper for explicitly choosing the side to move.
    pub fn set_to_move_for_fixture(&mut self, player: Player) {
        self.to_move = player;
    }
}

impl Default for GameState {
    fn default() -> Self {
        Self::new(RuleConfig::default())
    }
}
